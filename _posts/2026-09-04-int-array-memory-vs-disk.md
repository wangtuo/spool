---
title: "int 数组在内存里和磁盘上，为什么是两种完全不同的格式"
series: 编码与存储
description: 同一个 int32 数组，放进内存追求的是随机访问、CPU cache、SIMD 和少分支；写到磁盘追求的是压缩率、顺序 I/O、按需读取与可演进性。设计目标几乎相反，所以格式也几乎相反。本文从平坦数组讲到 varint、delta、bit packing、RLE、dictionary，再到嵌套数组的列式表达。
tags: [存储, 列式格式, arrow, parquet, 编码]
---

同一个 `int32[]`，放在内存里和写到磁盘文件里，设计目标几乎是相反的：

- **内存格式**追求随机访问、CPU cache 友好、SIMD、少分支；
- **磁盘格式**追求压缩率、顺序 I/O、按需读取与可演进性。

这导致两者的物理布局没有多少共同点。下面以 `int32[]` 为例把这件事讲透。

## 1. 内存格式：直接、定长、容易定位

### 平坦数组

最常见的内存表示就是一段连续的 32 位整数：

```c
int32_t values[] = {10, -2, 300, 42};
```

逻辑上：

```text
index:      0      1      2      3
value:     10     -2    300     42
```

内存字节布局（以常见的 little-endian 为例）：

```text
10   = 0A 00 00 00
-2   = FE FF FF FF
300  = 2C 01 00 00
42   = 2A 00 00 00
```

合在一起：

```text
0A 00 00 00  FE FF FF FF  2C 01 00 00  2A 00 00 00
```

特点用一句话概括：

```text
地址(values[i]) = base_address + i × 4
```

因此读第 `i` 个元素是 O(1)，不需要先解析前面的任何元素。

优点：

- 访问快；
- 容易向量化，一条指令加载 4/8/16 个整数；
- 很适合 hash、排序、join、聚合等计算；
- 没有解码成本。

缺点：

- 无论数值大小，每个整数固定 4 字节；
- `[0, 1, 1, 1, 1]` 也需要 20 字节；
- 不适合直接当作长期压缩存储格式。

这正是 Arrow 中 `Int32Array` 的核心思路：一个连续的 values buffer。Arrow 还会额外加一个可选的 validity bitmap：

```text
validity bitmap:  1 0 1 1
values:          10 ? 300 42
```

第二个值是否有效由 bitmap 决定——即使 values buffer 对应位置仍占着 4 字节空间。

### 变长 `int[]`：offsets + values

如果一张表的每一行都是一个整数数组，例如：

```text
row 0: [10, 20, 30]
row 1: []
row 2: [40, 50]
row 3: [60]
```

内存里通常不会存成很多独立的小数组——每个数组对象都带额外的指针、长度、分配器元数据，还会造成内存碎片。

更常见的列式布局是：

```text
offsets = [0, 3, 3, 5, 6]
values  = [10, 20, 30, 40, 50, 60]
```

解释方式：

```text
row 0 = values[offsets[0] : offsets[1]] = values[0:3] = [10,20,30]
row 1 = values[3:3] = []
row 2 = values[3:5] = [40,50]
row 3 = values[5:6] = [60]
```

有 `N` 行，就有 `N + 1` 个 offset。内存布局可理解为：

```text
[ListArray]
├── validity bitmap（可选，表示哪一行的数组是 null）
├── offsets buffer（通常 int32 或 int64）
└── child values buffer（连续 int32）
```

这里要严格区分：

```text
null  ≠  []
```

例如 `row 0: null` 和 `row 1: []`，它们的 offset 都可能是 `[0, 0]`，但 `null` 必须由 validity bitmap 表示。

这正是 Arrow / Velox 一类列式执行引擎常用的表达方式：**结构信息和实际整数值分离，整数值本身仍保持连续**。

### 内存里的压缩：通常是「可选优化」

执行引擎里的绝大多数算子更喜欢标准 `int32` 连续数组，因为：

```text
固定宽度 + 连续地址 + 少分支
```

通常比「每读一个数先解码」更快。但在某些场景下也会使用压缩或特殊表示：

- **dictionary vector**

  ```text
  dictionary = [10, 20, 30]
  ids        = [0, 2, 0, 1]
  actual     = [10, 30, 10, 20]
  ```

- **constant vector**：`length = 1,000,000, value = 7`，不需要真的存 100 万个 7。

- **RLE / sequence vector**：

  ```text
  [1,1,1,1,1,2,2,2] → (1,5), (2,3)
  ```

- **bit-packed integer vector**：如果值都在 `0~15`，每个值只用 4 bit：

  ```text
  [1, 15, 2, 0] → 0001 1111 0010 0000
  ```

但这些编码通常在真正执行前会被 decode 成统一的扁平视图，或者由算子专门支持。

## 2. 磁盘格式：先分块，再针对分布压缩

把内存的连续 `int32` 直接写入磁盘当然可行：

```text
[length][raw int32 bytes]
```

例如 `count = 4, values = [10, -2, 300, 42]` 可以写成：

```text
04 00 00 00
0A 00 00 00 FE FF FF FF 2C 01 00 00 2A 00 00 00
```

但这种格式没有压缩、没有跳读能力、没有校验与版本管理，适合简单缓存，不适合通用分析存储。

真正的磁盘格式通常长这样：

```text
文件
├── 文件头：magic、版本、schema
├── 数据块 / row group / stripe
│   ├── 块元数据
│   ├── 编码后的整数数据
│   ├── 统计信息：min、max、null count
│   └── 校验信息（可选）
└── 文件尾索引 / footer
```

整数数据以小块（page / block）编码。块不能太小，否则元数据和寻址成本高；也不能太大，否则无法有效跳读和并行处理。

## 3. 常见整数磁盘编码

### 定长整数

最简单：每个 `int32` 固定 4 字节，`size = N × 4`。

适用场景：数值近似随机、需要频繁随机访问、压缩效果不好或 CPU 解码成本更重要。它也常常作为其他编码失效时的 fallback。

### Varint：数小则占字节少

Varint 每次用 7 bit 存数据，最高 bit 表示「后面还有没有字节」。非负数为例：

```text
0      → 00
1      → 01
127    → 7F
128    → 80 01
300    → AC 02
```

`300` 的二进制是 `1 0010 1100`，拆成每组 7 bit：

```text
00101100 = 0x2C，后面还有数据 → AC
00000010 = 0x02，最后一组     → 02
```

对于有符号整数，通常先做 ZigZag 编码，把负数映射到小的正数：

```text
0  → 0     -1 → 1     1  → 2
-2 → 3     2  → 4
```

公式：`zigzag(x) = (x << 1) ^ (x >> 31)`，然后再用 Varint。

优点：小整数非常省空间，Avro 这类记录序列化格式中很常见。

缺点：第 `i` 个元素不能直接按地址算出来，要么从前面逐个解码，要么额外建跳表/索引；分支更多，不如定长整数适合高性能扫描。

### Delta encoding：存第一个值和相邻差

适合单调递增、排序后、或相邻值差很小的数据：

```text
original: [1000, 1003, 1004, 1008, 1010]
base:     1000
deltas:   [3, 1, 4, 2]
```

delta 再配合 Varint，`3, 1, 4, 2` 每个都只用一个字节。

适合时间戳、排序后的 ID、递增序列、同一分区内局部有序的数值列。缺点是单点随机读取较麻烦，通常要从 block 起点开始解码；如果差分仍然很大，压缩效果也有限。

### Delta-of-delta：特别适合规则时间序列

```text
timestamps: [1000, 1010, 1020, 1030, 1040]
一阶 delta: [10, 10, 10, 10]
二阶 delta: [0, 0, 0]
```

可以写作 `first_value = 1000, first_delta = 10, delta_of_delta = [0, 0, 0]`。对固定采样周期的时间戳，这几乎是免费的压缩。

### Bit packing：按最大位宽紧凑存储

一个 block 的数是 `[3, 5, 1, 7, 0, 4]`，最大值是 7，只需要 3 bit：

```text
3 → 011   5 → 101   1 → 001
7 → 111   0 → 000   4 → 100
```

拼接后共 `6 × 3 = 18 bit`；如果用 `int32`，原本需要 `6 × 32 = 192 bit`。

通常和 delta 一起用：`base = 1000`，`deltas = [3, 1, 4, 2]`，最大 delta 是 4，只需 3 bit。Parquet 常见的思路就是：**按 page 看数据分布，再选择 bit packing、RLE、delta、dictionary 等方式**。

### RLE：连续值重复时非常有效

```text
[1, 1, 1, 1, 1, 2, 2, 3]
→ (value=1, count=5), (value=2, count=2), (value=3, count=1)
```

适合排序列、状态码、分区 ID、布尔值、低基数枚举。不适合 `[1, 9, 3, 7, 2, 8]` 这种每个值只出现一次的数据——RLE 反而增加开销。

### Dictionary encoding：低基数整数

```text
values = [100, 200, 100, 500, 200, 100]

dictionary = [100, 200, 500]    // 每个 int32
ids        = [0, 1, 0, 2, 1, 0] // 最大值 2，只需 2 bit
```

适合 tag ID、region ID、状态码、枚举等重复率高但不一定连续的数据。要注意：字典编码对整数列不一定总划算——若几乎每个整数都不同，字典会额外占一份空间，还增加解码步骤。

## 4. 一个实用的块格式设计

如果要自己设计磁盘上的整数列格式，推荐按 block/page 存：

```text
Block Header
├── version
├── value_count
├── null_count
├── encoding_type
├── compressed_length
├── uncompressed_length
├── min_value
├── max_value
├── checksum
└── payload
```

例如编码 `[1000, 1003, 1004, 1008, 1010]`：

```text
encoding_type = DELTA_BITPACKED
value_count   = 5
min_value     = 1000
max_value     = 1010

payload:
  base = 1000
  bit_width = 3
  packed_deltas = [3, 1, 4, 2]
```

如果数组可空，`[10, null, 20, null, 30]` 可以加：

```text
validity bitmap = 10101
non_null_values = [10, 20, 30]
```

这样 null 不必占用一个特殊整数值，也避免和合法数据冲突。

## 5. 嵌套 `int[]` 的磁盘格式

假设每行有一个数组：

```text
row 0: [10, 20]
row 1: null
row 2: []
row 3: [30]
```

最直观的行式写法是 `[has_value][length][encoded ints]`，适合顺序逐行读取；但不适合列式分析——只想读所有元素值或只算数组长度时，也得扫描每一行的边界。

列式格式更接近 Arrow 的方式：

```text
row validity: [1, 0, 1, 1]
offsets:      [0, 2, 2, 2, 3]
values:       [10, 20, 30]
```

解释：

```text
row 0: valid, offsets[0:1] = 0:2 → [10,20]
row 1: null,  offsets[1:2] = 2:2
row 2: valid, offsets[2:3] = 2:2 → []
row 3: valid, offsets[3:4] = 2:3 → [30]
```

在 Parquet 中，嵌套数组通常不直接存 offsets，而用：

- **repetition level**：当前值是否仍属于同一个 list / 嵌套结构；
- **definition level**：这个值、list、父对象是否为 null 或缺失；
- **actual values**：摊平后的整数值。

这是为了既支持任意深度的嵌套结构，又让数据按列存放并可压缩。

## 6. 内存与磁盘之间的典型转换

常见执行路径：

```text
磁盘：压缩的 page/block
  ↓ 读入
解压 + 解码
  ↓
内存：连续 int32 values buffer
  ↓
过滤 / 聚合 / join / SIMD 计算
  ↓
结果或重新编码写回磁盘
```

例如 Parquet 中的整数列在磁盘里可能是 `dictionary + RLE/bit-packed ids + 通用压缩`，读到 DuckDB、Arrow、Velox 等执行引擎时，通常会变为或暴露为 contiguous int32 buffer——因为 **CPU 对简单、连续、定宽的数据处理最友好**。

## 7. 如何选择

| 场景 | 内存表示 | 磁盘编码 |
| --- | --- | --- |
| 通用计算列 | 连续 `int32[]` | 定长或通用压缩 |
| 时间戳 | 连续 `int64[]` | Delta / delta-of-delta + bit packing |
| 低基数 ID | dictionary vector 或 flat vector | Dictionary + bit-packed IDs |
| 连续重复状态 | flat / constant / RLE vector | RLE |
| 数值范围小 | `int32[]`，必要时 bit-packed | Bit packing |
| 嵌套数组 | offsets + values + validity | offsets 或 nested levels + 编码 values |
| 网络协议 / 行记录 | 结构体字段 | ZigZag + Varint |
| 分析型列文件 | 解码后的向量 | Parquet / ORC 的 page/stripe 编码 |

实践中很少只选一种编码。最常见的组合是：

```text
block/page
  + null bitmap
  + min/max statistics
  + delta 或 dictionary
  + bit packing / RLE
  + LZ4、ZSTD、Snappy 等通用压缩
```

最重要的原则是：**先按块统计数据分布，再选编码**。同一列的不同 page 可能适合完全不同的编码——时间戳列在某个分区是严格递增的 delta 友好数据，在另一个分区可能是大量重复值的 RLE 友好数据。格式设计的价值，恰恰在于允许每个块独立做这个选择。


