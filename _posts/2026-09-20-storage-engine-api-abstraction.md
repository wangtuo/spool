---
title: "存储引擎的对外 API，为什么高度收敛成了这 5 件事"
series: 编码与存储
description: 抛开内部是 B+ 树、LSM 还是列存，所有存储引擎对外暴露的接口本质上都在回答同一个问题——调用方如何把数据存进去、取出来、改、删，并保证正确性。本文从最小完备接口集出发，逐层展开 KV、迭代器、事务、快照、持久化，并对比 LevelDB / RocksDB / LMDB / FoundationDB / InnoDB 的实现取舍。
tags: [存储, 存储引擎, KV, LSM, B+树, 事务, MVCC]
---

抛开内部是 B+ 树、LSM 还是列存，所有存储引擎对外暴露的接口**高度收敛**。

本质就是回答一个问题：**"调用方如何把数据存进去、取出来、改、删，以及保证这些操作的正确性。"**

---

## 一、最小完备接口集

把所有存储引擎的 API 抽象到最底层，核心就 **5 类操作**：

| 类别 | 操作 | 语义 |
|---|---|---|
| **单点读写** | `Get(key)` / `Put(key, value)` / `Delete(key)` | 按 key 精确读写删 |
| **范围扫描** | `Seek(key)` + `Next()` / `Prev()` | 按有序范围遍历 |
| **事务** | `Begin()` / `Commit()` / `Rollback()` | 原子性、隔离性 |
| **持久化** | `Flush()` / `Checkpoint()` / `Sync()` | 确保数据落盘 |
| **生命周期** | `Open()` / `Close()` / `CreateSnapshot()` | 管理引擎实例和版本 |

这 5 类就是存储引擎的"最小完备集"，**任何存储引擎都必须提供**（或以某种形式提供）。

少了任何一类，要么功能残缺，要么正确性无法保证。

---

## 二、逐层展开

### 1. KV 接口：最核心的抽象

不管你存的是行、文档、列，最终在存储引擎层都被抽象成 **有序 KV**：

```rust
trait StorageEngine {
    fn get(&self, key: &[u8]) -> Option<Vec<u8>>;
    fn put(&self, key: &[u8], value: &[u8]);
    fn delete(&self, key: &[u8]);
}
```

**为什么是 KV？** 因为 KV 是最简单的抽象，所有上层模型都能映射：

- 关系表：`(table_id, primary_key) → row`
- 文档：`(collection_id, doc_id) → document`
- 列存：`(column_id, row_id) → value`
- 索引：`(index_id, index_key) → primary_key`

InnoDB、RocksDB、LevelDB、LMDB、FoundationDB、HBase——全都是这个抽象。

KV 的妙处在于：它足够简单，简单到任何数据模型都能降维表达；同时又足够强，强到能支撑起整个数据库。

### 2. 有序性：扫描接口

光有 Get/Put 不够，还需要**按顺序遍历**，这是范围查询的基础：

```rust
trait Iterator {
    fn seek(&mut self, key: &[u8]);      // 定位到 >= key 的位置
    fn seek_to_first(&mut self);          // 定位到第一个
    fn seek_to_last(&mut self);           // 定位到最后一个
    fn next(&mut self) -> bool;           // 下一个
    fn prev(&mut self) -> bool;           // 上一个
    fn key(&self) -> &[u8];
    fn value(&self) -> &[u8];
    fn valid(&self) -> bool;
}
```

**有序性是存储引擎的命根子**：

- B+ 树：天然有序
- LSM：SSTable 内部有序，compaction 维持全局有序
- 跳表：天然有序
- Hash：无序，所以不能做范围查询（这是它的根本限制）

没有迭代器的存储引擎，就不支持范围查询、排序、前缀扫描。你拿到的只是一堆散落的 key-value 对，而不是一个可以"翻阅"的数据结构。

### 3. 事务接口：正确性的保障

```rust
trait Transaction {
    fn commit(&mut self) -> Result<()>;
    fn rollback(&mut self);

    fn get(&self, key: &[u8]) -> Option<Vec<u8>>;
    fn put(&mut self, key: &[u8], value: &[u8]);
    fn delete(&mut self, key: &[u8]);

    // 可选：获取快照读
    fn snapshot(&self) -> Snapshot;
}
```

事务接口提供 **ACID** 中的 A（原子）和 I（隔离）。不同引擎提供的隔离级别不同：

| 引擎 | 事务支持 | 隔离级别 |
|---|---|---|
| InnoDB | 完整 ACID | RC / RR |
| RocksDB | 单写事务（WriteBatch），无跨 key 事务 | 读自己写 |
| LMDB | 完整 ACID | SI（快照隔离） |
| FoundationDB | 完整 ACID | SI |
| LevelDB | 无（只有原子批量） | - |
| Redis | 单命令原子 / MULTI | - |

注意：**事务不是必须的**。LSM 系的 LevelDB 就没有跨 key 事务，只有 `WriteBatch`（原子批量写）。

这是设计取舍——不是做不到，而是认为"原子批量 + 单线程 compaction"在大多数场景下已经够用，引入完整事务的复杂度不值得。

### 4. 批量操作：性能接口

```rust
// 原子批量写（LevelDB/RocksDB）
fn write(&self, batch: WriteBatch);

// 批量读
fn multi_get(&self, keys: &[&[u8]]) -> Vec<Option<Vec<u8>>>;
```

批量操作是性能关键：

- 减少 IO 次数（一次 flush 多个写）
- 减少锁竞争
- LSM 的 compaction 本质就是批量合并

单条写入和批量写入的性能差距，常常是数量级的。这也是为什么实际系统中，只要能攒批，就一定会攒批。

### 5. 快照：一致性读的基础

```rust
trait Snapshot {
    fn get(&self, key: &[u8]) -> Option<Vec<u8>>;
    fn iter(&self) -> Iterator;
}
```

快照是 **MVCC 的对外抽象**：拿到一个快照，就可以基于某个时间点做一致性读，不受后续写入影响。

- InnoDB：通过 undo log 实现快照
- LMDB：CoW B-Tree，快照就是根指针
- RocksDB：通过 sequence number + SSTable 实现
- FoundationDB：MVCC + 版本号

没有快照能力的引擎，只能做"读已提交"或更弱的隔离。你每次读到的，都可能是一个正在被改写的、不一致的世界。

### 6. 持久化：崩溃恢复接口

```rust
fn flush(&self);       // 强制刷盘
fn sync(&self);        // fsync
fn checkpoint(&self);  // 创建一致性检查点
```

持久化接口让调用方控制"什么时候数据真正落到磁盘"。

- **WAL（Write-Ahead Log）** 是绝大多数引擎的崩溃恢复机制：先写日志再写数据，崩溃后重放日志
- **Checkpoint**：把内存状态一致性地刷到磁盘，之后可以截断 WAL
- **CoW 引擎**（LMDB、BoltDB）没有 WAL，靠写时复制天然崩溃安全

这也是 API 设计中最"硬"的一层——它直接和物理世界打交道，断电、掉盘、内核 buffer 回写策略，全在这里碰撞。

---

## 三、实际引擎的 API 对比

说了这么多抽象，来看几个真实引擎的 API 长什么样。

### LevelDB：最简洁的范本

```cpp
// 打开/关闭
leveldb::DB* db;
leveldb::DB::Open(options, "/path", &db);

// 单点
db->Put(write_options, "key", "value");
db->Get(read_options, "key", &value);
db->Delete(write_options, "key");

// 原子批量
leveldb::WriteBatch batch;
batch.Put("k1", "v1");
batch.Delete("k2");
db->Write(write_options, &batch);

// 迭代
leveldb::Iterator* it = db->NewIterator(read_options);
for (it->SeekToFirst(); it->Valid(); it->Next()) {
    // it->key(), it->value()
}

// 快照
leveldb::Snapshot* snapshot = db->GetSnapshot();
read_options.snapshot = snapshot;
db->ReleaseSnapshot(snapshot);

delete db;
```

LevelDB 的 API 就是存储引擎接口的**黄金标准**——极其简洁，几乎所有后来的引擎都参考它。

Jeff Dean 和 Sanjay Ghemawat 设计的这套接口，定义了现代存储引擎的"标准姿势"。

### LMDB

```c
// 打开
mdb_env_create(&env);
mdb_env_open(env, "/path", 0, 0664);

// 事务
mdb_txn_begin(env, NULL, 0, &txn);
mdb_dbi_open(txn, NULL, 0, &dbi);

// 读写
mdb_get(txn, dbi, &key, &value);
mdb_put(txn, dbi, &key, &value, 0);
mdb_del(txn, dbi, &key, NULL);

// 迭代
mdb_cursor_open(txn, dbi, &cursor);
mdb_cursor_get(cursor, &key, &value, MDB_FIRST);
while (mdb_cursor_get(cursor, &key, &value, MDB_NEXT) == 0) { ... }

// 提交
mdb_txn_commit(txn);
```

LMDB 把事务提到了最前面——因为它是 CoW B-Tree，所有读写都必须在事务里进行。这既是它的设计哲学，也是它简洁性的来源。

### RocksDB：LevelDB 的超集

RocksDB 在 LevelDB 基础上增加了：

- 列族（Column Family）：逻辑分库
- TTL
- 事务（TransactionDB）
- 多种压缩算法
- Backup / Checkpoint

本质上是在 LevelDB 的骨架上，往每个方向都"多走了一步"。API 风格完全一致，只是选项更多、开关更密。

### FoundationDB：分布式

```python
@fdb.transactional
def set_value(tr, key, value):
    tr[key] = value
    # 原子操作
    tr.add(key, b'1')

# 范围读
@fdb.transactional
def get_range(tr, start, end):
    return list(tr[start:end])
```

FoundationDB 把事务做成了**装饰器**，用起来极其优雅。你写的普通函数，套上装饰器就自动拥有了 ACID 语义——重试、冲突检测、提交，全在装饰器里。

这是分布式存储引擎 API 的天花板级设计。

### InnoDB：通过 MySQL handler API

InnoDB 不直接暴露给用户，而是通过 MySQL 的 handler API：

- `ha_innobase::index_read()` → 点查
- `ha_innobase::index_next()` → 扫描
- `ha_innobase::write_row()` → 写入
- `transaction_commit()` / `transaction_rollback()` → 事务

本质和 KV 接口一样，只是包了一层表/索引的概念。剥开 MySQL 的壳，里面还是 Get、Put、Iterate 那几件事。

---

## 四、更高层的抽象：Table 接口

KV 是存储引擎层，再往上一层是**表/关系抽象**，这是 SQL 数据库和存储引擎之间的接口：

```rust
trait TableEngine {
    // 表操作
    fn create_table(name, schema);
    fn drop_table(name);

    // 行操作
    fn insert(table, row);
    fn update(table, key, row);
    fn delete(table, key);

    // 查询
    fn scan(table, predicate) -> RowIterator;
    fn point_get(table, key) -> Option<Row>;

    // 索引
    fn create_index(table, columns, type);

    // 事务
    fn begin() -> Transaction;
}
```

InnoDB、WiredTiger、PostgreSQL 的存储引擎就是这一层。但它们内部最终还是归约到 KV + 迭代器。

这是一个反复出现的模式：**越上层的接口越贴合业务，越底层的接口越统一。** 到了存储引擎最底部，万物皆 KV。

---

## 五、接口背后的不变量

不管 API 怎么设计，存储引擎必须保证几个**不变量**。

这些不变量比 API 更本质——API 是表面，不变量是存储引擎和调用方之间的"合同"。

1. **持久性（Durability）**：commit 成功后，数据即使断电也不丢
2. **有序性**：迭代器按 key 有序返回
3. **原子性**：WriteBatch 里的操作要么全成功要么全失败
4. **隔离性**（如果支持事务）：并发事务互不干扰
5. **崩溃安全**：重启后状态一致（不丢数据、不损坏）

一个存储引擎可以没有事务、可以没有快照、甚至可以没有迭代器——但它不能违背自己承诺的不变量。违背了，就是 bug。

---

## 六、一句话总结

存储引擎对外的核心 API 抽象，收敛为 **有序 KV + 迭代器 + 事务（可选）+ 快照 + 持久化**。

不管内部是 B+ 树、LSM 还是 CoW，对外都是"按 key 存取、按范围扫描、原子批量、一致性快照、崩溃安全"这几件事。LevelDB 的 API 是这个抽象的最佳范本，几乎定义了现代存储引擎的接口标准。

理解了这套抽象，再看任何一个新的存储引擎，你都能在 5 分钟内摸清它的全部能力边界——因为它能做的事，早就被框死在这 5 类操作里了。

---

## 七、向上再走一层：索引 API 如何"寄生"在存储引擎上

只看存储引擎 API 还不够。数据库真正跑起来的时候，上面还有一层**索引 API（Index Access Method）**，它和存储引擎 API 的协作方式，才是一次 SQL 查询从文本落到磁盘的完整路径。

### 整体分层

```
┌─────────────────────────────────────┐
│          SQL Parser / Optimizer      │  解析 SQL、生成执行计划
├─────────────────────────────────────┤
│         执行器 (Executor)            │  执行计划，调用索引
├─────────────────────────────────────┤
│          索引 API (Index AM)         │  ← 索引层
│   B树 / Hash / GIN / 位图 / 向量     │
├─────────────────────────────────────┤
│       存储引擎 API (Storage Engine)  │  ← 存储层
│   有序KV + Iterator + 事务 + 快照     │
├─────────────────────────────────────┤
│             磁盘 / SSD               │
└─────────────────────────────────────┘
```

**关键认知：索引不是独立于存储引擎的，它本身就是建立在存储引擎的 KV 接口之上的。**

索引本质上就是**另一组有序 KV**，和表数据存在同一个存储引擎里。

### 以 InnoDB 为例

| 存什么 | Key | Value |
|---|---|---|
| 表数据（聚簇索引） | 主键 | 整行数据 |
| 二级索引 idx_name | (name, 主键) | 空（只需回表指针） |

```sql
CREATE TABLE users (id INT PRIMARY KEY, name VARCHAR(100), age INT);
CREATE INDEX idx_name ON users(name);

-- 存储引擎里实际存的 KV：
-- 聚簇索引: id=1 → (id=1, name='Alice', age=30)
-- 二级索引: ('Alice', 1) → (无 value，key 本身就够了)
```

**二级索引的 value 为什么是空？** 因为 key 里已经包含了主键，查到后用主键回表查聚簇索引即可。

### 以 PostgreSQL 为例（堆表）

| 存什么 | Key | Value |
|---|---|---|
| 表数据（堆） | CTID（物理位置） | 整行数据 |
| B树索引 | 索引列值 | CTID |

```
堆表:  (0,1) → (id=1, name='Alice', age=30)
索引:  'Alice' → (0,1)
```

PostgreSQL 的索引存的是 **CTID**（物理位置），不是主键。所以更新行如果不移动位置，索引不用改；但如果行移了（比如变长列更新导致放不下），所有索引的 CTID 都要更新。

---

## 八、一次查询的完整调用链

以这个 SQL 为例：

```sql
SELECT * FROM users WHERE name = 'Alice' AND age > 18;
```

假设有索引 `idx_name(name)`。

```
1. Optimizer 决策
   └─ 估算 idx_name 的 selectivity → 选择走 idx_name

2. 索引 API 调用
   └─ index.point_lookup("Alice")
      └─ 返回 RowId 列表：[(主键=1), (主键=5), ...]

3. 存储引擎 API 调用（回表）
   └─ 对每个 RowId：
      └─ storage.get(主键=1) → 拿到整行数据

4. 执行器过滤
   └─ 对每行检查 age > 18（因为索引只有 name，age 要回表后过滤）

5. 返回结果
```

**注意**：索引只负责"按 name 找到行"，`age > 18` 的条件在回表后由执行器过滤。如果有联合索引 `idx_name_age(name, age)`，索引层就能同时处理两个条件。

---

## 九、一次写入的完整调用链

```sql
INSERT INTO users (id, name, age) VALUES (1, 'Alice', 30);
```

```
1. 执行器开始事务
   └─ storage.begin()

2. 写入表数据
   └─ storage.put(主键=1, 行数据)

3. 更新所有索引
   └─ for each index on users:
       └─ index.on_insert(行数据, RowId=1)
           └─ 内部调用 storage.put(索引key, RowId)

4. 唯一性检查
   └─ 如果有唯一索引：
       └─ storage.get(索引key) → 检查是否已存在
       └─ 已存在 → 回滚，报 DuplicateKeyError

5. 提交
   └─ storage.commit()
   └─ WAL 落盘 → 数据持久
```

**关键点：表数据和所有索引的写入在同一个事务里**，要么全成功要么全失败。这是一致性的保障。

---

## 十、索引 API 和存储引擎 API 的对应关系

索引层的每个操作，最终都翻译成存储引擎的操作：

| 索引 API 操作 | 翻译成存储引擎操作 |
|---|---|
| `point_lookup(key)` | `storage.get(index_key_prefix + key)` |
| `range_scan(range)` | `storage.seek(start_key)` + 迭代 |
| `prefix_scan(prefix)` | `storage.seek(prefix)` + 迭代直到前缀不匹配 |
| `on_insert(row, row_id)` | `storage.put(index_key, row_id)` |
| `on_delete(row, row_id)` | `storage.delete(index_key)` |
| `bulk_load(rows)` | `storage.write(batch)` 批量写 |
| `full_scan()` | `storage.seek_to_first()` + 迭代 |
| `selectivity()` | 读 `storage.num_entries()` + 统计信息 |

**索引层本质上是给存储引擎的 KV 接口套了一层"语义外壳"**——把"索引列值"编码成 KV 的 key，把"RowId"编码成 value。

### 插一句：RowId 到底是什么？

说到这里有必要停下来把 RowId 讲清楚——因为它是索引和表数据之间的"桥梁"，但不同数据库的实现差异极大。

**RowId 的本质是"行的地址"**：可以是数字、结构体、甚至字符串，但它的作用只有一个——让索引能快速找到表中对应行的数据。就像 C 语言里的指针，你不关心指针的值是什么，只关心它能指向正确的内存。

不同数据库的 RowId 实现分成两大范式：

| 范式 | 代表 | RowId 内容 | 回表方式 |
|---|---|---|---|
| **物理地址** | PostgreSQL (CTID)、Oracle (ROWID)、MyISAM | 块号 + 槽位 / 文件 + 块 + 行 | 直接定位磁盘块，一次 IO |
| **逻辑地址（主键）** | InnoDB、SQLite | 主键值 | 再查一次聚簇索引 |

**PostgreSQL 的 CTID** 是个结构体 `(block_number, slot_number)`，比如 `(0,1)` 表示第 0 号数据块的第 1 个槽位。物理地址的好处是回表极快，坏处是行一旦移动（比如变长列更新放不下了），所有索引里的 CTID 都要跟着改。PostgreSQL 用 HOT（Heap-Only Tuple）优化来缓解这个问题。

**InnoDB 没有独立的 RowId**——二级索引的 value 直接存主键值。因为 InnoDB 是聚簇索引组织表，数据本身就按主键排序，用主键做"行地址"天然契合。好处是行移动了索引不用动，坏处是回表多走一次 B+ 树查找，而且主键大的话二级索引也会变大。

**Oracle 的 ROWID** 是个 18 字符的 base64 编码字符串（内部 10 字节），编码了对象号 + 文件号 + 块号 + 行号四层信息，是物理地址范式里最"全"的。

**分布式数据库**（CockroachDB、TiDB、HBase）的 RowId 还要编码分片信息，形如 `(table_id, shard_id, primary_key)`，方便路由到正确的节点。

所以 RowId 既不是纯数字也不是纯字符串——它是"能定位到一行数据的任意编码"。选哪种，取决于你的存储模型：堆表用物理地址，聚簇索引表用主键，分布式的还要加分片信息。

### 联合索引的编码方式

联合索引 `idx(name, age)` 在存储引擎里的 key 编码：

```
索引 key = name 的值 + 分隔符 + age 的值

实际存储的 KV：
  ('Alice', 30, 主键=1) → 无 value
  ('Alice', 25, 主键=5) → 无 value
  ('Bob', 40, 主键=2)   → 无 value
```

**最左前缀原则在存储引擎层的体现**：

- 查询 `name='Alice'` → seek 到 `('Alice', ...)`，顺序扫
- 查询 `name='Alice' AND age>18` → seek 到 `('Alice', 19)`，扫到 `('Alice', max)` 停止
- 查询 `age>18` → ❌ 无法用，因为 key 排序时 name 在前面，age 不是全局有序

**这就是为什么联合索引列顺序很重要——它直接决定了 KV 的排序键，而排序键决定了范围扫描的能力。**

### 索引选择性如何和存储引擎交互

优化器调索引的 `selectivity()` 时，索引层需要从存储引擎获取统计信息：

```
索引层要算 selectivity:
  └─ storage.approximate_count(index_prefix) → 估算有多少行
  └─ storage.histogram(index_column)          → 值分布直方图
  └─ storage.num_distinct(index_column)       → 基数
```

不同存储引擎提供这些统计的方式不同：

- **InnoDB**：维护索引的统计信息（采样估算）
- **PostgreSQL**：ANALYZE 时采样统计，存在 `pg_statistic`
- **RocksDB**：通过 SSTable 的属性估算

**统计信息不准是优化器选错索引的最常见原因。** 所以数据库都有 `ANALYZE` 命令手动更新统计。

---

## 十一、不同索引类型如何复用同一套存储引擎

| 索引类型 | 在存储引擎里怎么存 | 翻译成的存储操作 |
|---|---|---|
| **B树** | 有序 KV | seek + 顺序迭代 |
| **Hash** | hash(key) → KV | get（不能范围） |
| **GIN 倒排** | token → [row_id1, row_id2, ...] | get(token) 拿列表，多个列表求交并集 |
| **位图** | value → bitmap | get(value) 拿 bitmap，多个 bitmap 做位运算 |
| **pg_trgm** | trigram → [row_id, ...] | 类似倒排，取并集后算相似度 |
| **向量 (HNSW)** | 图结构，节点+边 | 图遍历，不走普通 KV |

**关键洞察：除了向量索引（HNSW 等图算法），绝大多数索引类型都可以归约为有序 KV + 迭代器。** 这就是为什么一个存储引擎（如 RocksDB、InnoDB）可以支撑多种索引类型。

---

## 十二、完整的接口协作图

把以上所有内容拼起来，一次查询经过的完整路径是这样的：

```
用户
 │
 ▼
[SQL: SELECT * FROM users WHERE name='Alice' AND age > 18]
 │
 ▼
┌─────────────────────────────────┐
│          查询优化器              │
│  1. 解析谓词                     │
│  2. 枚举可用索引                  │
│  3. 调 index.selectivity() 估算   │
│  4. 生成执行计划：走 idx_name     │
└─────────────────────────────────┘
 │
 ▼
┌─────────────────────────────────┐
│          索引层 (Index)          │
│  idx_name.point_lookup('Alice')  │
│  → 内部：                        │
│    key = encode('Alice')         │
│    storage.get(key)              │
│    返回 [RowId(主键=1), ...]      │
└─────────────────────────────────┘
 │
 ▼
┌─────────────────────────────────┐
│       存储引擎层 (Storage)        │
│  storage.get(主键=1) → 行数据     │
│  （回表，每行一次 get）            │
└─────────────────────────────────┘
 │
 ▼
执行器拿到行 → 过滤 age>18 → 返回用户
```

---

## 十三、设计上的几个关键权衡

理解了两层 API 的协作关系，回头看一些经典的架构选择，就会发现它们本质上都是在"索引和数据怎么放"这个问题上做不同的取舍。

### 1. 索引存 RowId 还是存数据？

- **聚簇索引（InnoDB）**：索引 value 就是整行数据，主键查询零回表
- **二级索引**：只存主键，回表多一次但索引小

这是一个经典的空间换时间权衡。聚簇索引让主键查询极快，但二级索引的回表代价也更高。

### 2. 索引更新时机

- **同步更新**（InnoDB、PG）：写入时立即更新索引，强一致但写慢
- **异步更新**（LSM + 索引延迟）：先写数据，索引后台补，写快但可能短暂不一致
- **延迟索引（Deferred Index）**：ES 的 `refresh_interval`，写入后 1 秒才可搜

写入和查询之间的延迟，是数据库设计中最古老的权衡之一。

### 3. 索引和数据是否同引擎

- **同引擎**（InnoDB、PG）：表和索引都在同一个存储引擎，事务简单
- **分离**（Databend、一些 HTAP）：表在行存引擎，索引用别的引擎，事务协调复杂

同引擎的好处是一致性容易保证，分离的好处是各层可以选最合适的技术——但代价是事务和一致性会变得非常棘手。

---

## 十四、最后一句话

**索引 API 是存储引擎 KV 接口的"语义层"**：它把"索引列值"编码成 KV 的 key，把"RowId"编码成 value，把范围查询翻译成存储引擎的 seek + 迭代。

两层的协作模式可以浓缩成一句话：

> 优化器用索引 API 决定"找哪些行"，索引 API 用存储引擎 API 执行"找到这些行的位置"，执行器再用存储引擎 API "把这些行的数据取回来"。

索引和数据最终都以有序 KV 的形式存在同一个存储引擎里——这就是为什么理解"存储引擎 = 有序 KV"是理解整个数据库存储栈的钥匙。
