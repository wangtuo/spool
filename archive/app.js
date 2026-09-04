const resources = [
  {
    id: "creator-3blue1brown",
    name: "3Blue1Brown",
    role: "直觉",
    desc: "把抽象数学变成可视化直觉，专门解决“公式会读但脑中没有图”的问题。",
    url: "https://www.youtube.com/@3blue1brown",
    output:
      "画出 attention、embedding 和反向传播的解释图，并用自己的话讲给同事听。",
    units: [
      {
        id: "creator-3blue1brown-unit-1",
        title:
          "Essence of Linear Algebra：向量、线性变换、特征向量；只看能支持 embedding 和 attention 的章节。",
        links: [
          {
            id: "creator-3blue1brown-unit-1-link-1",
            label: "官方频道 · Essence of Linear Algebra 系列入口",
            url: "https://www.youtube.com/@3blue1brown",
          },
          {
            id: "creator-3blue1brown-unit-1-link-2",
            label: "Embedding · PyTorch 文档（补充）",
            url: "https://pytorch.org/docs/stable/generated/torch.nn.Embedding.html",
          },
        ],
      },
      {
        id: "creator-3blue1brown-unit-2",
        title: "Neural Networks：梯度下降、反向传播、神经网络如何学习。",
        links: [
          {
            id: "creator-3blue1brown-unit-2-link-1",
            label: "官方频道 · Neural Networks 系列入口",
            url: "https://www.youtube.com/@3blue1brown",
          },
          {
            id: "creator-3blue1brown-unit-2-link-2",
            label: "反向传播实现 · micrograd（补充）",
            url: "https://github.com/karpathy/micrograd",
          },
        ],
      },
      {
        id: "creator-3blue1brown-unit-3",
        title:
          "Attention/Transformer 相关视频：理解 query、key、value 的几何直觉。",
        links: [
          {
            id: "creator-3blue1brown-unit-3-link-1",
            label: "Attention Is All You Need · 原论文（补充）",
            url: "https://arxiv.org/abs/1706.03762",
          },
          {
            id: "creator-3blue1brown-unit-3-link-2",
            label: "Transformer · PyTorch 文档（补充）",
            url: "https://pytorch.org/docs/stable/generated/torch.nn.Transformer.html",
          },
        ],
      },
    ],
  },
  {
    id: "creator-statquest",
    name: "StatQuest",
    role: "统计",
    desc: "补齐交叉熵、概率、正则化、评估指标等基础概念，避免把指标当成黑盒。",
    url: "https://statquest.org/video_index.html",
    output:
      "写一页“LLM 评测指标字典”，包含定义、适用场景、误导风险和业务例子。",
    units: [
      {
        id: "creator-statquest-unit-1",
        title: "Machine Learning：linear/logistic regression、bias/variance。",
        links: [
          {
            id: "creator-statquest-unit-1-link-1",
            label: "Machine Learning 视频索引",
            url: "https://statquest.org/video_index.html",
          },
          {
            id: "creator-statquest-unit-1-link-2",
            label: "交叉熵 · PyTorch 文档",
            url: "https://pytorch.org/docs/stable/generated/torch.nn.CrossEntropyLoss.html",
          },
        ],
      },
      {
        id: "creator-statquest-unit-2",
        title: "Statistics：probability、Bayes、maximum likelihood、entropy。",
        links: [
          {
            id: "creator-statquest-unit-2-link-1",
            label: "Statistics 视频索引",
            url: "https://statquest.org/video_index.html",
          },
          {
            id: "creator-statquest-unit-2-link-2",
            label: "概率分布 · SciPy 文档",
            url: "https://docs.scipy.org/doc/scipy/reference/stats.html",
          },
        ],
      },
      {
        id: "creator-statquest-unit-3",
        title: "评估：precision、recall、ROC、calibration、confusion matrix。",
        links: [
          {
            id: "creator-statquest-unit-3-link-1",
            label: "评估指标视频索引",
            url: "https://statquest.org/video_index.html",
          },
          {
            id: "creator-statquest-unit-3-link-2",
            label: "scikit-learn Metrics",
            url: "https://scikit-learn.org/stable/modules/model_evaluation.html",
          },
        ],
      },
    ],
  },
  {
    id: "creator-andrew-ng",
    name: "Andrew Ng",
    role: "体系",
    desc: "建立机器学习、深度学习和数据中心 AI 的共同语言，重点看项目决策和误差分析。",
    url: "https://www.deeplearning.ai/courses/machine-learning-specialization/",
    output:
      "为一个 LLM 项目写 error analysis：按数据、检索、prompt、模型、工具、产品约束分类。",
    units: [
      {
        id: "creator-andrew-ng-unit-1",
        title:
          "Machine Learning Specialization：只补监督学习、模型选择、误差分析。",
        links: [
          {
            id: "creator-andrew-ng-unit-1-link-1",
            label: "Machine Learning Specialization",
            url: "https://www.deeplearning.ai/courses/machine-learning-specialization/",
          },
          {
            id: "creator-andrew-ng-unit-1-link-2",
            label: "机器学习课程主页",
            url: "https://www.coursera.org/specializations/machine-learning-introduction",
          },
        ],
      },
      {
        id: "creator-andrew-ng-unit-2",
        title: "Deep Learning Specialization：神经网络、优化、调参、工程实践。",
        links: [
          {
            id: "creator-andrew-ng-unit-2-link-1",
            label: "Deep Learning Specialization",
            url: "https://www.deeplearning.ai/courses/deep-learning-specialization/",
          },
          {
            id: "creator-andrew-ng-unit-2-link-2",
            label: "PyTorch Tutorials",
            url: "https://pytorch.org/tutorials/",
          },
        ],
      },
      {
        id: "creator-andrew-ng-unit-3",
        title:
          "短课：Data-Centric AI、Building and Evaluating Advanced RAG Applications。",
        links: [
          {
            id: "creator-andrew-ng-unit-3-link-1",
            label: "DeepLearning.AI Courses · 官方课程目录",
            url: "https://www.deeplearning.ai/courses/",
          },
          {
            id: "creator-andrew-ng-unit-3-link-2",
            label: "Data-Centric AI · 课程目录搜索",
            url: "https://www.deeplearning.ai/courses/",
          },
          {
            id: "creator-andrew-ng-unit-3-link-3",
            label: "RAG / Evaluation · 课程目录搜索",
            url: "https://www.deeplearning.ai/courses/",
          },
        ],
      },
    ],
  },
  {
    id: "creator-hungyi-lee",
    name: "李宏毅 / Hung-yi Lee",
    role: "中文体系",
    desc: "用中文把深度学习、Transformer、生成式 AI 和趋势串成可理解的体系。",
    url: "https://speech.ee.ntu.edu.tw/~hylee/ml/2025-spring.php",
    output:
      "用一张表对比 pre-training、SFT、RLHF、DPO、RAG 和 prompt 的输入、目标、成本与边界。",
    units: [
      {
        id: "creator-hungyi-lee-unit-1",
        title:
          "Machine Learning：Transformer、self-attention、GPT、pre-training。",
        links: [
          {
            id: "creator-hungyi-lee-unit-1-link-1",
            label: "Machine Learning 课程主页",
            url: "https://speech.ee.ntu.edu.tw/~hylee/ml/2025-spring.php",
          },
          {
            id: "creator-hungyi-lee-unit-1-link-2",
            label: "Transformer 原论文",
            url: "https://arxiv.org/abs/1706.03762",
          },
        ],
      },
      {
        id: "creator-hungyi-lee-unit-2",
        title:
          "Introduction to Generative AI：LLM、diffusion、alignment、agent。",
        links: [
          {
            id: "creator-hungyi-lee-unit-2-link-1",
            label: "Introduction to Generative AI · 课程页",
            url: "https://speech.ee.ntu.edu.tw/~hylee/genai/2024-spring.php",
          },
          {
            id: "creator-hungyi-lee-unit-2-link-2",
            label: "该课程讲义/作业入口",
            url: "https://speech.ee.ntu.edu.tw/~hylee/genai/2024-spring.php",
          },
        ],
      },
      {
        id: "creator-hungyi-lee-unit-3",
        title: "生成式 AI 课程的作业和 slides：优先做能连接当前业务的部分。",
        links: [
          {
            id: "creator-hungyi-lee-unit-3-link-1",
            label: "Generative AI · 课程资料入口",
            url: "https://speech.ee.ntu.edu.tw/~hylee/genai/2024-spring.php",
          },
          {
            id: "creator-hungyi-lee-unit-3-link-2",
            label: "Hugging Face LLM Course（补充）",
            url: "https://huggingface.co/learn/llm-course",
          },
        ],
      },
    ],
  },
  {
    id: "creator-karpathy",
    name: "Andrej Karpathy",
    role: "实现",
    desc: "从 micrograd、makemore 到 GPT，建立对训练循环、tokenizer 和 Transformer 的代码级理解。",
    url: "https://karpathy.ai/zero-to-hero.html",
    output:
      "跑通一个小型 decoder-only Transformer，并记录 batch、seq length、显存、吞吐和 loss 曲线。",
    units: [
      {
        id: "creator-karpathy-unit-1",
        title: "micrograd：自动微分和反向传播。",
        links: [
          {
            id: "creator-karpathy-unit-1-link-1",
            label: "micrograd · 源码",
            url: "https://github.com/karpathy/micrograd",
          },
          {
            id: "creator-karpathy-unit-1-link-2",
            label: "Zero to Hero · 课程主页",
            url: "https://karpathy.ai/zero-to-hero.html",
          },
        ],
      },
      {
        id: "creator-karpathy-unit-2",
        title: "makemore：字符级语言模型、MLP、WaveNet 思路。",
        links: [
          {
            id: "creator-karpathy-unit-2-link-1",
            label: "makemore · 源码",
            url: "https://github.com/karpathy/makemore",
          },
          {
            id: "creator-karpathy-unit-2-link-2",
            label: "Zero to Hero · 课程总览",
            url: "https://karpathy.ai/zero-to-hero.html",
          },
        ],
      },
      {
        id: "creator-karpathy-unit-3",
        title:
          "Let’s build GPT：tokenizer、attention、Transformer、训练与生成。",
        links: [
          {
            id: "creator-karpathy-unit-3-link-1",
            label: "Zero to Hero · GPT 课程",
            url: "https://karpathy.ai/zero-to-hero.html",
          },
          {
            id: "creator-karpathy-unit-3-link-2",
            label: "Attention Is All You Need · 原论文",
            url: "https://arxiv.org/abs/1706.03762",
          },
        ],
      },
      {
        id: "creator-karpathy-unit-4",
        title: "配套源码：nanoGPT 与 microgpt，重点读训练入口和生成路径。",
        links: [
          {
            id: "creator-karpathy-unit-4-link-1",
            label: "nanoGPT · 源码",
            url: "https://github.com/karpathy/nanoGPT",
          },
          {
            id: "creator-karpathy-unit-4-link-2",
            label: "microgpt · Karpathy 单文件实现",
            url: "https://karpathy.ai/microgpt.html",
          },
          {
            id: "creator-karpathy-unit-4-link-3",
            label: "GPT-2 · OpenAI 技术报告（补充）",
            url: "https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf",
          },
        ],
      },
    ],
  },
  {
    id: "creator-assemblyai",
    name: "AssemblyAI",
    role: "应用工程",
    desc: "把 NLP、LLM、RAG 和语音教程转成可运行的应用原型，再补齐生产工程。",
    url: "https://www.youtube.com/@AssemblyAI",
    output:
      "把一个 demo 改成服务：有 golden set、trace、超时重试、权限过滤、延迟和单请求成本。",
    units: [
      {
        id: "creator-assemblyai-unit-1",
        title: "Semantic search 与 embeddings：向量表示、召回和相似度。",
        links: [
          {
            id: "creator-assemblyai-unit-1-link-1",
            label: "AssemblyAI · 官方频道/站内搜索",
            url: "https://www.youtube.com/@AssemblyAI",
          },
          {
            id: "creator-assemblyai-unit-1-link-2",
            label: "Sentence Transformers · 官方文档（补充）",
            url: "https://www.sbert.net/",
          },
        ],
      },
      {
        id: "creator-assemblyai-unit-2",
        title: "RAG：文档切分、检索、上下文组装、引用。",
        links: [
          {
            id: "creator-assemblyai-unit-2-link-1",
            label: "RAG · 原论文（补充）",
            url: "https://arxiv.org/abs/2005.11401",
          },
          {
            id: "creator-assemblyai-unit-2-link-2",
            label: "LlamaIndex RAG · 官方文档（补充）",
            url: "https://docs.llamaindex.ai/en/stable/understanding/rag/",
          },
        ],
      },
      {
        id: "creator-assemblyai-unit-3",
        title: "LLM evaluation：用固定数据集做回归，而不是凭感觉验收。",
        links: [
          {
            id: "creator-assemblyai-unit-3-link-1",
            label: "Ragas · RAG 评测文档（补充）",
            url: "https://docs.ragas.io/",
          },
          {
            id: "creator-assemblyai-unit-3-link-2",
            label: "OpenAI Evals · 源码（补充）",
            url: "https://github.com/openai/evals",
          },
        ],
      },
      {
        id: "creator-assemblyai-unit-4",
        title: "Speech/Multimodal：仅在业务需要时学习。",
        links: [
          {
            id: "creator-assemblyai-unit-4-link-1",
            label: "Hugging Face Audio Course · 官方课程",
            url: "https://huggingface.co/learn/audio-course",
          },
          {
            id: "creator-assemblyai-unit-4-link-2",
            label: "AssemblyAI · 官方频道/站内搜索",
            url: "https://www.youtube.com/@AssemblyAI",
          },
        ],
      },
    ],
  },
  {
    id: "creator-yannic-kilcher",
    name: "Yannic Kilcher",
    role: "论文",
    desc: "用论文解读建立研究阅读能力，但所有结论必须回到原论文、源码和实验。",
    url: "https://www.youtube.com/@YannicKilcher",
    output: "完成 5 张论文卡片：问题、方法、收益、代价、实验、工业适用边界。",
    units: [
      {
        id: "creator-yannic-kilcher-unit-1",
        title: "Attention Is All You Need：Transformer 基线。",
        links: [
          {
            id: "creator-yannic-kilcher-unit-1-link-1",
            label: "Yannic Kilcher · 官方频道/站内搜索",
            url: "https://www.youtube.com/@YannicKilcher",
          },
          {
            id: "creator-yannic-kilcher-unit-1-link-2",
            label: "Attention Is All You Need · 原论文",
            url: "https://arxiv.org/abs/1706.03762",
          },
        ],
      },
      {
        id: "creator-yannic-kilcher-unit-2",
        title: "Scaling Laws / Chinchilla：数据、参数、计算的配比。",
        links: [
          {
            id: "creator-yannic-kilcher-unit-2-link-1",
            label: "Chinchilla · 原论文",
            url: "https://arxiv.org/abs/2203.15556",
          },
          {
            id: "creator-yannic-kilcher-unit-2-link-2",
            label: "Scaling Laws · 原论文",
            url: "https://arxiv.org/abs/2001.08361",
          },
        ],
      },
      {
        id: "creator-yannic-kilcher-unit-3",
        title: "FlashAttention / ZeRO：IO 和内存瓶颈。",
        links: [
          {
            id: "creator-yannic-kilcher-unit-3-link-1",
            label: "FlashAttention · 原论文",
            url: "https://arxiv.org/abs/2205.14135",
          },
          {
            id: "creator-yannic-kilcher-unit-3-link-2",
            label: "ZeRO · 原论文",
            url: "https://arxiv.org/abs/1910.02054",
          },
        ],
      },
      {
        id: "creator-yannic-kilcher-unit-4",
        title:
          "LoRA / DPO / RAG / Speculative Decoding：适配、检索和推理优化。",
        links: [
          {
            id: "creator-yannic-kilcher-unit-4-link-1",
            label: "LoRA · 原论文",
            url: "https://arxiv.org/abs/2106.09685",
          },
          {
            id: "creator-yannic-kilcher-unit-4-link-2",
            label: "DPO · 原论文",
            url: "https://arxiv.org/abs/2305.18290",
          },
          {
            id: "creator-yannic-kilcher-unit-4-link-3",
            label: "RAG · 原论文",
            url: "https://arxiv.org/abs/2005.11401",
          },
          {
            id: "creator-yannic-kilcher-unit-4-link-4",
            label: "Speculative Decoding · 原论文",
            url: "https://arxiv.org/abs/2211.17192",
          },
        ],
      },
    ],
  },
  {
    id: "creator-two-minute-papers",
    name: "Two Minute Papers",
    role: "趋势",
    desc: "快速发现研究和产品趋势，适合建立雷达，不适合作为技术决策的最终依据。",
    url: "https://www.youtube.com/@TwoMinutePapers",
    output: "维护一份技术雷达，每项写清触发采用的条件、预期收益和验证实验。",
    units: [
      {
        id: "creator-two-minute-papers-unit-1",
        title: "每周扫描 3 个与你业务相关的主题。",
        links: [
          {
            id: "creator-two-minute-papers-unit-1-link-1",
            label: "Two Minute Papers · 官方频道",
            url: "https://www.youtube.com/@TwoMinutePapers",
          },
          {
            id: "creator-two-minute-papers-unit-1-link-2",
            label: "arXiv · cs.AI 最新论文",
            url: "https://arxiv.org/list/cs.AI/recent",
          },
        ],
      },
      {
        id: "creator-two-minute-papers-unit-2",
        title: "找到主题后回到原论文、官方代码或 benchmark。",
        links: [
          {
            id: "creator-two-minute-papers-unit-2-link-1",
            label: "Papers with Code · 论文与代码",
            url: "https://paperswithcode.com/",
          },
          {
            id: "creator-two-minute-papers-unit-2-link-2",
            label: "arXiv · cs.LG 最新论文",
            url: "https://arxiv.org/list/cs.LG/recent",
          },
        ],
      },
      {
        id: "creator-two-minute-papers-unit-3",
        title: "将结果分为立即实验、持续观察、暂不采用。",
        links: [
          {
            id: "creator-two-minute-papers-unit-3-link-1",
            label: "Hugging Face Papers · 社区热榜",
            url: "https://huggingface.co/papers",
          },
          {
            id: "creator-two-minute-papers-unit-3-link-2",
            label: "OpenReview · 会议论文",
            url: "https://openreview.net/",
          },
        ],
      },
    ],
  },
];
const directory = [
  {
    cat: "论文",
    level: "必读",
    name: "Attention Is All You Need",
    org: "Google · Transformer 基础",
    desc: "理解 self-attention、multi-head attention、position encoding 和 encoder-decoder；所有 LLM 系统知识的共同起点。",
    url: "https://arxiv.org/abs/1706.03762",
    tags: "transformer attention 原理",
  },
  {
    cat: "论文",
    level: "必读",
    name: "Language Models are Few-Shot Learners",
    org: "OpenAI · GPT-3",
    desc: "理解规模化语言模型、in-context learning 与模型能力随规模增长的工程背景。",
    url: "https://arxiv.org/abs/2005.14165",
    tags: "gpt scaling pretraining",
  },
  {
    cat: "论文",
    level: "必读",
    name: "Training Compute-Optimal Large Language Models",
    org: "DeepMind · Chinchilla",
    desc: "建立参数量、数据量、训练计算之间的配比判断，避免只追求更大的模型。",
    url: "https://arxiv.org/abs/2203.15556",
    tags: "scaling data compute",
  },
  {
    cat: "论文",
    level: "必读",
    name: "FlashAttention",
    org: "Stanford / Tri Dao · GPU 优化",
    desc: "理解 IO-aware attention 如何通过减少 HBM 读写提升训练和推理效率。",
    url: "https://arxiv.org/abs/2205.14135",
    tags: "attention gpu kernel inference",
  },
  {
    cat: "论文",
    level: "必读",
    name: "ZeRO: Memory Optimizations Toward Training Trillion Parameter Models",
    org: "Microsoft · 分布式训练",
    desc: "理解 optimizer、gradient、parameter 分片，以及大模型训练的内存扩展路径。",
    url: "https://arxiv.org/abs/1910.02054",
    tags: "training distributed deepspeed",
  },
  {
    cat: "论文",
    level: "必读",
    name: "Retrieval-Augmented Generation",
    org: "Meta · RAG 基线",
    desc: "理解参数化知识与外部检索知识的组合，以及知识密集型任务的 RAG 范式。",
    url: "https://arxiv.org/abs/2005.11401",
    tags: "rag retrieval knowledge",
  },
  {
    cat: "论文",
    level: "必读",
    name: "LoRA",
    org: "Microsoft · 参数高效微调",
    desc: "理解低秩适配的参数、显存和部署取舍；是工业微调的基础入口。",
    url: "https://arxiv.org/abs/2106.09685",
    tags: "finetuning lora training",
  },
  {
    cat: "论文",
    level: "必读",
    name: "Direct Preference Optimization",
    org: "Stanford · 对齐",
    desc: "理解偏好数据、DPO 目标和 RLHF 的简化路径，连接模型训练与产品反馈。",
    url: "https://arxiv.org/abs/2305.18290",
    tags: "alignment dpo rlhf",
  },
  {
    cat: "课程",
    level: "主线",
    name: "Stanford CS336 · Language Modeling from Scratch",
    org: "Stanford",
    desc: "研究生级别的 LLM 全链路课程：tokenizer、Transformer、训练、系统优化、评测和对齐。最适合作为系统化主线。",
    url: "https://cs336.stanford.edu/",
    tags: "course training systems",
  },
  {
    cat: "课程",
    level: "主线",
    name: "Karpathy · Neural Networks: Zero to Hero",
    org: "Andrej Karpathy",
    desc: "从 micrograd、makemore 到 GPT，从零建立代码级理解；建议边看边跑。",
    url: "https://karpathy.ai/zero-to-hero.html",
    tags: "course code gpt",
  },
  {
    cat: "课程",
    level: "主线",
    name: "Hugging Face Course",
    org: "Hugging Face",
    desc: "Transformer、tokenizer、datasets、微调和 Hub 的开放课程，适合作为工具生态参考。",
    url: "https://huggingface.co/learn",
    tags: "course transformers finetuning",
  },
  {
    cat: "课程",
    level: "体系",
    name: "Full Stack Deep Learning",
    org: "Berkeley / FSDL",
    desc: "从问题定义、数据、训练到部署、监控和产品化，适合架构师补齐端到端交付视角。",
    url: "https://fullstackdeeplearning.com/",
    tags: "course mlops production",
  },
  {
    cat: "课程",
    level: "体系",
    name: "DeepLearning.AI Courses",
    org: "Andrew Ng / DeepLearning.AI",
    desc: "课程集合，适合按需补 RAG、评测、Agent、数据中心 AI 和模型应用工程。",
    url: "https://www.deeplearning.ai/courses/",
    tags: "course rag agents evaluation",
  },
  {
    cat: "系统",
    level: "核心",
    name: "vLLM",
    org: "开源推理引擎",
    desc: "通用 LLM serving/runtime，重点学习 PagedAttention、continuous batching、调度、KV Cache 和 OpenAI-compatible serving。",
    url: "https://docs.vllm.ai/",
    tags: "inference serving gpu kv cache",
  },
  {
    cat: "系统",
    level: "核心",
    name: "SGLang",
    org: "LMSYS",
    desc: "偏结构化生成、前缀复用和 Agent/工作流场景的 serving/runtime；需结合模型支持矩阵和负载 benchmark 评估。",
    url: "https://docs.sglang.io/",
    tags: "inference serving cache",
  },
  {
    cat: "系统",
    level: "核心",
    name: "TensorRT-LLM",
    org: "NVIDIA",
    desc: "面向 NVIDIA GPU 的深度优化与编译/runtime，关注 kernel、量化、并行和 benchmark，同时评估硬件绑定与工程复杂度。",
    url: "https://nvidia.github.io/TensorRT-LLM/",
    tags: "inference nvidia gpu optimization",
  },
  {
    cat: "系统",
    level: "核心",
    name: "DeepSpeed",
    org: "Microsoft",
    desc: "主要用于大规模训练并行、ZeRO、内存优化和 checkpoint；具备部分推理能力，但在线 serving 需与专用 runtime 对比。",
    url: "https://www.deepspeed.ai/",
    tags: "training distributed memory inference",
  },
  {
    cat: "系统",
    level: "核心",
    name: "PyTorch Distributed",
    org: "Meta / PyTorch",
    desc: "理解 FSDP、tensor parallel、distributed checkpoint、compile 和 profiler，连接算法与基础设施。",
    url: "https://pytorch.org/docs/stable/distributed.html",
    tags: "training distributed pytorch",
  },
  {
    cat: "系统",
    level: "应用",
    name: "LlamaIndex",
    org: "LlamaIndex",
    desc: "RAG、数据连接器、索引、Agent 工作流的应用层参考；重点学抽象边界，不必绑定框架。",
    url: "https://developers.llamaindex.ai/python/framework/",
    tags: "rag agents framework",
  },
  {
    cat: "系统",
    level: "应用",
    name: "LangChain",
    org: "LangChain",
    desc: "了解模型、工具、检索和 Agent 编排的常见接口，以及何时需要自己掌控 runtime。",
    url: "https://docs.langchain.com/oss/python/langchain/overview",
    tags: "rag agents framework",
  },
  {
    cat: "系统",
    level: "核心",
    name: "Hugging Face TGI",
    org: "Hugging Face",
    desc: "了解开源模型服务、量化、张量并行和生产 API，是推理服务生态的重要对照。",
    url: "https://huggingface.co/docs/text-generation-inference/",
    tags: "inference serving huggingface",
  },
  {
    cat: "系统",
    level: "核心",
    name: "NVIDIA Triton Inference Server",
    org: "NVIDIA",
    desc: "理解通用推理服务、模型仓库、动态 batching、ensemble 和 GPU 服务治理。",
    url: "https://docs.nvidia.com/deeplearning/triton-inference-server/user-guide/docs/",
    tags: "inference serving gpu",
  },
  {
    cat: "系统",
    level: "核心",
    name: "Megatron-LM",
    org: "NVIDIA / 社区",
    desc: "大规模 Transformer 训练的并行、数据管道和性能基线，连接模型与 GPU 集群。",
    url: "https://github.com/NVIDIA/Megatron-LM",
    tags: "training distributed gpu",
  },
  {
    cat: "系统",
    level: "平台",
    name: "KServe",
    org: "KServe Community",
    desc: "Kubernetes 上的模型服务与流量编排层，承接部署、伸缩、路由与灰度；通常要组合训练、评测、注册、观测和 GPU 调度体系。",
    url: "https://kserve.github.io/website/",
    tags: "serving kubernetes platform",
  },
  {
    cat: "模型",
    level: "关注",
    name: "Llama",
    org: "Meta",
    desc: "开放模型生态的重要基线，关注模型卡、许可证、推理代码、安全和 Llama Stack。",
    url: "https://www.llama.com/models/",
    tags: "model open source meta",
  },
  {
    cat: "模型",
    level: "关注",
    name: "GPT",
    org: "OpenAI",
    desc: "闭源模型 API 与推理产品的重要基线，关注 Responses、工具调用、结构化输出、模型生命周期和价格。",
    url: "https://developers.openai.com/api/docs/models",
    tags: "model api closed source",
  },
  {
    cat: "模型",
    level: "关注",
    name: "Claude",
    org: "Anthropic",
    desc: "关注长上下文、工具调用、模型行为和企业级安全边界。",
    url: "https://platform.claude.com/docs/en/models/overview",
    tags: "model api safety",
  },
  {
    cat: "模型",
    level: "关注",
    name: "Gemini",
    org: "Google",
    desc: "关注多模态、长上下文、原生工具和 Google 模型服务体系。",
    url: "https://ai.google.dev/gemini-api/docs/models",
    tags: "model api multimodal",
  },
  {
    cat: "模型",
    level: "关注",
    name: "Qwen",
    org: "阿里巴巴通义",
    desc: "中文、多语言、代码和多模态生态的重要模型家族，关注模型卡、推理和训练报告。",
    url: "https://github.com/QwenLM/Qwen3",
    tags: "model chinese multimodal",
  },
  {
    cat: "模型",
    level: "关注",
    name: "DeepSeek",
    org: "DeepSeek",
    desc: "关注 MoE、长上下文、推理模型、训练效率和开放技术报告带来的系统启发。",
    url: "https://www.deepseek.com/",
    tags: "model moe reasoning open source",
  },
  {
    cat: "模型",
    level: "关注",
    name: "豆包 / 火山方舟",
    org: "字节跳动 / 火山引擎",
    desc: "中文工业界模型和企业级模型服务入口，关注模型能力、推理接入、评测、资源和成本。",
    url: "https://www.volcengine.com/product/ark",
    tags: "model chinese cloud api",
  },
  {
    cat: "模型",
    level: "关注",
    name: "文心 / 千帆",
    org: "百度智能云",
    desc: "中文模型与企业云平台入口，关注模型服务、知识库、Agent 和企业治理。",
    url: "https://cloud.baidu.com/product-s/qianfan_home",
    tags: "model chinese cloud enterprise",
  },
  {
    cat: "模型",
    level: "关注",
    name: "混元",
    org: "腾讯云",
    desc: "腾讯模型与企业服务入口，关注多模态、知识库、Agent 和云上部署。",
    url: "https://cloud.tencent.com/product/hunyuan",
    tags: "model chinese cloud multimodal",
  },
  {
    cat: "模型",
    level: "关注",
    name: "GLM",
    org: "智谱 AI",
    desc: "中文模型和开放平台入口，关注模型 API、Agent、微调与企业应用。",
    url: "https://open.bigmodel.cn/",
    tags: "model chinese api agent",
  },
  {
    cat: "模型",
    level: "关注",
    name: "Mistral AI",
    org: "Mistral",
    desc: "关注高效开放模型、稀疏 MoE、部署生态和模型许可证。",
    url: "https://docs.mistral.ai/",
    tags: "model moe europe",
  },
  {
    cat: "公司",
    level: "平台",
    name: "OpenAI Platform",
    org: "OpenAI",
    desc: "理解闭源模型 API、Responses、工具调用、结构化输出、评测和生产使用方式。",
    url: "https://developers.openai.com/",
    tags: "api provider models",
  },
  {
    cat: "公司",
    level: "平台",
    name: "Anthropic",
    org: "Anthropic",
    desc: "关注 Claude 模型、Messages API、工具使用、长上下文和 Constitutional AI 的产品化思路。",
    url: "https://docs.anthropic.com/",
    tags: "api provider safety",
  },
  {
    cat: "公司",
    level: "平台",
    name: "Google Gemini",
    org: "Google",
    desc: "关注多模态、长上下文、模型 API、Vertex AI 和 Google 的模型服务体系。",
    url: "https://ai.google.dev/gemini-api/docs",
    tags: "api provider multimodal",
  },
  {
    cat: "公司",
    level: "云平台",
    name: "AWS Bedrock",
    org: "Amazon Web Services",
    desc: "关注多模型托管、企业权限、Guardrails、知识库、Agent 和云上治理。",
    url: "https://docs.aws.amazon.com/bedrock/",
    tags: "cloud enterprise governance",
  },
  {
    cat: "公司",
    level: "云平台",
    name: "Google Vertex AI",
    org: "Google Cloud",
    desc: "关注模型注册、训练、评测、部署、监控和企业级 AI 平台能力。",
    url: "https://cloud.google.com/vertex-ai/docs",
    tags: "cloud mlops platform",
  },
  {
    cat: "公司",
    level: "云平台",
    name: "Microsoft Azure AI Foundry",
    org: "Microsoft Azure",
    desc: "关注企业模型目录、Agent、评测、安全治理和 Azure 生态集成。",
    url: "https://learn.microsoft.com/en-us/azure/ai-foundry/",
    tags: "cloud enterprise agents",
  },
  {
    cat: "评测",
    level: "必备",
    name: "HELM",
    org: "Stanford CRFM",
    desc: "研究型系统评测框架和场景集合，帮助理解质量、鲁棒性、偏差和效率；不能替代业务回归和人工验收。",
    url: "https://crfm.stanford.edu/helm/latest/",
    tags: "evaluation benchmark safety",
  },
  {
    cat: "评测",
    level: "必备",
    name: "LMSYS Chatbot Arena",
    org: "LMSYS",
    desc: "了解人类偏好评测、模型对战和榜单的局限；不要把榜单直接当业务验收。",
    url: "https://arena.ai/",
    tags: "evaluation benchmark models",
  },
  {
    cat: "评测",
    level: "工具",
    name: "lm-evaluation-harness",
    org: "EleutherAI",
    desc: "离线模型 benchmark 工具，适合建立可复现模型回归；不能单独代表线上任务成功率。",
    url: "https://github.com/EleutherAI/lm-evaluation-harness",
    tags: "evaluation benchmark open source",
  },
  {
    cat: "评测",
    level: "生产",
    name: "OpenAI Evals",
    org: "OpenAI / 社区",
    desc: "评测框架与样例集合，适合建立任务级回归、模型对比和自定义评测。",
    url: "https://github.com/openai/evals",
    tags: "evaluation regression",
  },
  {
    cat: "评测",
    level: "生产",
    name: "Ragas",
    org: "开源社区",
    desc: "RAG 诊断与评测工具，关注 faithfulness、context precision、context recall；指标依赖 judge、数据和人工校准。",
    url: "https://docs.ragas.io/",
    tags: "evaluation rag",
  },
  {
    cat: "评测",
    level: "生产",
    name: "Inspect AI",
    org: "UK AI Safety Institute",
    desc: "面向模型能力与安全评测的开源框架，适合设计可复现的评测任务。",
    url: "https://inspect.aisi.org.uk/",
    tags: "evaluation safety agents",
  },
  {
    cat: "安全",
    level: "必备",
    name: "OWASP Top 10 for LLM Applications",
    org: "OWASP",
    desc: "用于建立 Prompt Injection、敏感信息泄露、供应链、工具滥用等风险分类；不能替代 IAM、沙箱、审计和红队演练。",
    url: "https://owasp.org/www-project-top-10-for-large-language-model-applications/",
    tags: "security safety governance",
  },
  {
    cat: "安全",
    level: "必备",
    name: "NIST AI Risk Management Framework",
    org: "NIST",
    desc: "把 AI 风险识别、测量、管理和治理纳入企业流程；它是治理框架，不是完成即安全的技术清单。",
    url: "https://www.nist.gov/itl/ai-risk-management-framework",
    tags: "security governance enterprise",
  },
  {
    cat: "安全",
    level: "工程",
    name: "NVIDIA NeMo Guardrails",
    org: "NVIDIA",
    desc: "学习输入/输出 rail、对话流程、工具调用和安全策略的工程实现。",
    url: "https://docs.nvidia.com/nemo/guardrails/about-nemo-guardrails-library/overview.html",
    tags: "security guardrails agents",
  },
  {
    cat: "安全",
    level: "工程",
    name: "Google Secure AI Framework",
    org: "Google",
    desc: "从基础设施、模型、应用、供应链和运营角度建立生成式 AI 安全框架。",
    url: "https://saif.google/",
    tags: "security governance infrastructure",
  },
  {
    cat: "安全",
    level: "工程",
    name: "Microsoft AI Red Team",
    org: "Microsoft",
    desc: "了解 AI 红队、攻击面、模型和应用层风险测试方法。",
    url: "https://learn.microsoft.com/en-us/security/ai-red-team/",
    tags: "security red team testing",
  },
  {
    cat: "行业",
    level: "跟踪",
    name: "Stanford AI Index",
    org: "Stanford HAI",
    desc: "跟踪模型能力、投资、算力、成本、政策和产业采用的年度全局数据。",
    url: "https://aiindex.stanford.edu/",
    tags: "industry data trend",
  },
  {
    cat: "行业",
    level: "跟踪",
    name: "State of AI Report",
    org: "State of AI",
    desc: "研究、产业、产品和政策趋势的年度总结，适合建立技术雷达。",
    url: "https://www.stateof.ai/",
    tags: "industry trend research",
  },
  {
    cat: "行业",
    level: "跟踪",
    name: "Hugging Face Hub",
    org: "Hugging Face",
    desc: "模型、数据集、Spaces 和社区生态的实时入口，用于发现模型和复现实验。",
    url: "https://huggingface.co/",
    tags: "models datasets ecosystem",
  },
  {
    cat: "行业",
    level: "跟踪",
    name: "Artificial Analysis",
    org: "独立模型分析",
    desc: "对比模型质量、速度、价格、上下文和供应商，是做模型选型与成本决策的实用入口。",
    url: "https://artificialanalysis.ai/",
    tags: "industry models price benchmark",
  },
];
const weeks = [
  [
    "W01",
    "模型、数据与 RAG 基线",
    "Karpathy + 李宏毅 + AssemblyAI",
    "完成一个可运行的 RAG 基线，并能解释模型、token、检索、上下文和质量指标。",
  ],
  [
    "W02",
    "推理、评测与生产架构",
    "Yannic + 吴恩达 + StatQuest",
    "把基线升级为可评审的工业方案：有 benchmark、SLO、成本、权限、降级、回滚和容量模型。",
  ],
];
const days = [
  [
    "Day 01 · 定义战场",
    "100 分钟：界定真实场景、系统边界和成功指标。产出：项目 README、全景架构图、指标与退出条件。",
  ],
  [
    "Day 02 · 模型边界与 Transformer 机制",
    "105 分钟：比较模型能力边界，测量真实文本 token，并验证 embedding 与 causal attention。产出：选型矩阵、计算图和成本估算表。",
  ],
  [
    "Day 03 · 从零跑通最小 Transformer",
    "110 分钟：实现并验证最小 decoder-only Transformer 的训练与生成路径。产出：可运行脚本、loss 记录、生成样例和边界说明。",
  ],
  [
    "Day 04 · 可追溯数据资产工程",
    "105 分钟：构建清洗、去重、metadata、ACL、版本与血缘闭环。产出：可重跑脚本、质量报告和发布门禁 ADR。",
  ],
  [
    "Day 05 · RAG 检索基线",
    "100 分钟：在固定 query 集上比较 BM25 与 dense retrieval。产出：可复现 benchmark 和失败样例集。",
  ],
  [
    "Day 06 · RAG 质量提升",
    "100 分钟：完成三组单变量消融和引用核验。产出：ablation、可追溯 trace 与质量报告。",
  ],
  [
    "Day 07 · 第一周架构评审",
    "100 分钟：依据质量、延迟、成本和失败分类作 go/no-go 决策。产出：决策 ADR 和下一项实验卡。",
  ],
  [
    "Day 08 · 推理性能基线",
    "100 分钟：固定模型、硬件、runtime、量化格式与负载，完成至少 30 次热路径请求的最小实验；分别报告 TTFT、TPOT、E2E、吞吐与排队时间的 P50/P95/P99。",
  ],
  [
    "Day 09 · KV Cache 与调度",
    "105 分钟：复用 Day 8 环境，只改变一个负载变量，观测 KV Cache、continuous batching、背压与多租户公平性；用日志或 profiler 区分计算、显存带宽、调度和排队瓶颈。",
  ],
  [
    "Day 10 · 量化与受控服务",
    "110 分钟：选择真实后端明确支持的一种量化格式，与未量化基线做同负载对照；记录质量、显存、吞吐、P95、成本，并设计流式、超时、取消、限流和 fallback。",
  ],
  [
    "Day 11 · 评测与可观测性",
    "100 分钟：固定评测样本与指标规则，对比自动评分和人工抽检，设计可脱敏、可采样的 trace。产出：校准记录、trace schema 与质量门禁。",
  ],
  [
    "Day 12 · 安全、权限与成本",
    "110 分钟：执行四类核心攻击并记录证据，评估控制误报与残余风险，建立可重算成本容量模型。产出：攻击记录、权限图与成本表。",
  ],
  [
    "Day 13 · 生产架构与故障演练",
    "100 分钟：设计控制面/数据面和多租户保护，桌面演练故障、降级与恢复。产出：架构图、故障时序、RPO/RTO 和恢复证据。",
  ],
  [
    "Day 14 · 架构答辩与 90 天路线",
    "110 分钟：组装证据索引，完成 30 分钟架构答辩和 90 天优先级路线。产出：决策简报、容量/成本表、风险与恢复附录、实验 backlog。",
  ],
];
const dayDetails = [
  {
    goal: "把一个真实业务问题定义成可测量的 LLM 系统问题。",
    read: [
      [
        "李宏毅：Introduction to Generative AI 课程页",
        "https://speech.ee.ntu.edu.tw/~hylee/genai/2024-spring.php",
      ],
      ["Stanford AI Index：产业与能力数据", "https://aiindex.stanford.edu/"],
    ],
    do: "选一个你熟悉的场景（知识库问答、研发助手或客服），画出数据→模型→检索/工具→推理→评测→运营链路；固定模型、数据集、硬件和版本。",
    output:
      "项目 README、全景架构图、问题定义、质量/P95/成本/可用性 4 个指标。",
    pass: "每个指标都有测量方法、数据来源、目标值和不达标时的退出/降级条件。",
  },
  {
    goal: "理解 token、embedding、attention 的计算关系，以及它们如何影响成本。",
    read: [
      [
        "3Blue1Brown：Neural Networks / Linear Algebra 系列入口",
        "https://www.youtube.com/@3blue1brown",
      ],
      [
        "PyTorch Embedding 文档",
        "https://pytorch.org/docs/stable/generated/torch.nn.Embedding.html",
      ],
      ["Attention Is All You Need 原论文", "https://arxiv.org/abs/1706.03762"],
    ],
    do: "对 20 条真实文本做 token 统计；用 PyTorch 写一个 embedding 和单头 causal attention；打印每个张量 shape；推导 attention 的 O(n²) 计算和显存。",
    output: "计算图、shape 验证脚本、参数/FLOPs/KV Cache 估算表。",
    pass: "能解释序列长度翻倍时 attention、KV Cache 和 token 成本分别如何变化，并能用脚本复核。",
  },
  {
    goal: "从代码理解训练循环、反向传播和 decoder-only GPT。",
    read: [
      ["Karpathy：micrograd 源码", "https://github.com/karpathy/micrograd"],
      ["Karpathy：makemore 源码", "https://github.com/karpathy/makemore"],
      ["Zero to Hero 课程", "https://karpathy.ai/zero-to-hero.html"],
    ],
    do: "跑通一个 micrograd 反向传播例子；训练字符级 makemore；阅读 GPT 的 tokenizer、causal mask、训练 loop 和生成 loop；先过拟合一小批数据，再扩大训练集。",
    output: "训练日志、loss 曲线、生成样例、训练/推理 profiling。",
    pass: "能回答训练和推理的计算差异；小数据集能过拟合；README 记录 batch、seq_len、参数量、显存和吞吐。",
  },
  {
    goal: "把非结构化业务文档变成可追溯、可重跑、可更新的知识资产。",
    read: [
      [
        "Full Stack Deep Learning：数据与生产 ML 课程",
        "https://fullstackdeeplearning.com/",
      ],
      ["Hugging Face Datasets 文档", "https://huggingface.co/docs/datasets/"],
      [
        "NIST AI RMF：风险与治理",
        "https://www.nist.gov/itl/ai-risk-management-framework",
      ],
    ],
    do: "处理 Markdown/PDF/HTML 三类文档；做清洗、去重、分块、metadata；为每个 chunk 加 tenant、ACL、source、version、updated_at；设计增量更新和回滚。",
    output: "可重复数据脚本、质量报告、数据版本/血缘 ADR。",
    pass: "同一输入重复运行结果一致；能统计重复率、解析失败率、缺失 ACL 比例；任一 chunk 能追溯原文版本。",
  },
  {
    goal: "建立可量化的检索基线，知道问题来自召回还是排序。",
    read: [
      ["RAG 原论文", "https://arxiv.org/abs/2005.11401"],
      [
        "Elasticsearch BM25 文档",
        "https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html",
      ],
      ["Sentence Transformers 文档", "https://www.sbert.net/"],
    ],
    do: "准备 100 条带标准答案/证据的 query；分别实现 BM25 和 dense retrieval；固定 top-k、embedding 模型和硬件；记录 recall@5/10/20、MRR、索引大小、构建时间和 P95。",
    output: "第一版 benchmark、失败 query 集、BM25/dense 对比表。",
    pass: "所有指标有样本量和固定环境；至少分类 10 个失败 query：召回不到、排序错、权限错或数据过期。",
  },
  {
    goal: "用消融实验找到 RAG 质量和延迟的真实杠杆。",
    read: [
      ["Ragas 文档：RAG 指标", "https://docs.ragas.io/"],
      [
        "LlamaIndex RAG 文档",
        "https://developers.llamaindex.ai/python/framework/",
      ],
      ["RAG 原论文", "https://arxiv.org/abs/2005.11401"],
    ],
    do: "只改变一个变量，比较三种 chunk、hybrid search、reranker、query rewrite；生成带引用答案；记录 query、召回文档、prompt、答案、引用和 trace。",
    output: "至少三组 ablation、引用正确率报告、可回放 trace。",
    pass: "每组实验都有基线和单变量说明；人工抽检至少 20 条，引用正确率与 groundedness 的判定规则写清楚。",
  },
  {
    goal: "完成第一周 go/no-go 评审，决定是否值得进入推理优化。",
    read: [
      [
        "Andrew Ng：误差分析/数据中心 AI 课程目录",
        "https://www.deeplearning.ai/courses/",
      ],
      ["HELM：系统评测框架", "https://crfm.stanford.edu/helm/latest/"],
    ],
    do: "复盘模型、数据、检索、上下文、回答和成本；写 Prompt/RAG/SFT/换模型决策树；整理当前基线的质量、延迟和成本。",
    output: "RAG v1 demo、模型选型矩阵、第一周 ADR。",
    pass: "必须回答：质量是否达标、最大瓶颈是什么、是否进入第二周；若不达标，明确返工项而不是继续堆功能。",
  },
  {
    goal: "建立推理服务的可复现性能基线。",
    read: [
      ["vLLM Quickstart 与 User Guide", "https://docs.vllm.ai/"],
      ["SGLang 文档", "https://docs.sglang.io/"],
      [
        "Triton Inference Server 文档",
        "https://docs.nvidia.com/deeplearning/triton-inference-server/user-guide/docs/",
      ],
    ],
    do: "固定模型、量化、GPU、输入/输出长度分布；用 100 次以上请求分别测单流、并发、冷启动和热路径；记录 TTFT、TPOT、E2E、吞吐、队列等待和 GPU 利用率。",
    output: "请求生命周期图、benchmark 原始数据、P50/P95/P99 报告。",
    pass: "环境、负载和统计口径完整；能区分 prefill、decode、排队和冷启动成本。",
  },
  {
    goal: "理解 KV Cache、调度、背压和多租户公平性，而不是只看平均吞吐。",
    read: [
      ["vLLM PagedAttention/架构文档", "https://docs.vllm.ai/"],
      ["SGLang RadixAttention 文档", "https://docs.sglang.io/"],
      ["vLLM Benchmark 文档", "https://docs.vllm.ai/en/latest/benchmarking/"],
    ],
    do: "改变上下文、输出长度、batch、并发和租户配额；观察 KV Cache 显存、队列等待、P95/P99、拒绝率；设计 admission control、backpressure、优先级和公平调度。",
    output: "性能曲线、显存模型、队列策略 ADR。",
    pass: "能用 profiler/日志证据解释瓶颈属于计算、显存带宽、调度还是排队；给出尾延迟和隔离策略。",
  },
  {
    goal: "在真实后端约束下评估量化，并把模型接成受控服务。",
    read: [
      ["TensorRT-LLM 文档", "https://nvidia.github.io/TensorRT-LLM/"],
      ["GPTQ 原论文", "https://arxiv.org/abs/2210.17323"],
      ["AWQ 原论文", "https://arxiv.org/abs/2306.00978"],
    ],
    do: "只选择当前 GPU/runtime 支持的一种 weight-only 方案；用固定 golden set 对比质量；加入流式响应、超时、取消、限流、模型 fallback 和请求幂等键。",
    output: "质量/显存/吞吐/P95/单请求成本表、服务接口设计。",
    pass: "量化质量退化不超过预设阈值；所有结论注明模型、GPU、runtime、量化格式和 batch，不能泛化成“INT4 一定更快”。",
  },
  {
    goal: "建立可信的离线回归和线上 trace，而不是只生成一个自动分数。",
    read: [
      ["OpenAI Evals 源码", "https://github.com/openai/evals"],
      ["Ragas 文档", "https://docs.ragas.io/"],
      ["Inspect AI 文档", "https://inspect.aisi.org.uk/"],
    ],
    do: "建立 100 条 golden/regression 样本；定义 groundedness、引用正确率、工具成功率和任务成功率；自动评测后人工抽检 20 条；设计 trace sampling、PII 脱敏和高基数标签控制。",
    output: "自动评测报告、人工校准记录、trace schema、质量门禁。",
    pass: "报告自动与人工评分差异；每个指标有标注规则、阈值、抽样策略和回归处理流程。",
  },
  {
    goal: "完成 LLM 应用的威胁建模、权限传播和成本容量模型。",
    read: [
      [
        "OWASP Top 10 for LLM Applications",
        "https://owasp.org/www-project-top-10-for-large-language-model-applications/",
      ],
      ["NIST AI RMF", "https://www.nist.gov/itl/ai-risk-management-framework"],
      [
        "NVIDIA NeMo Guardrails",
        "https://docs.nvidia.com/nemo/guardrails/about-nemo-guardrails-library/overview.html",
      ],
    ],
    do: "设计并执行至少 8 个攻击用例：prompt injection、越权检索、敏感信息泄露、工具滥用、供应链、过度授权、拒绝服务、日志泄露；建立 token/GPU/检索/存储/人工成本模型。",
    output: "威胁模型、安全清单、权限图、月度成本和容量估算。",
    pass: "每个风险有攻击步骤、控制措施、拦截结果、误报和残余风险；成本模型能按 QPS、上下文和输出分布重算。",
  },
  {
    goal: "把原型变成可演练的生产级分布式架构。",
    read: [
      ["KServe：模型服务与流量编排", "https://kserve.github.io/website/"],
      [
        "PyTorch Distributed 文档",
        "https://pytorch.org/docs/stable/distributed.html",
      ],
      ["DeepSpeed ZeRO 原论文", "https://arxiv.org/abs/1910.02054"],
    ],
    do: "拆分控制面/数据面；设计多租户配额、公平调度、active-passive 多区、RPO/RTO、灰度、回滚、多级降级、消息重放和副作用去重；演练模型不可用、检索延迟、越权和重复写入。",
    output: "生产架构图、SLO/SLA、故障时序图、演练复盘。",
    pass: "明确故障域、backpressure、fallback、幂等键、RPO/RTO 和恢复证据；不能只写“加重试”。",
  },
  {
    goal: "完成一次可被团队评审的架构答辩。",
    read: [
      [
        "Full Stack Deep Learning：部署与监控",
        "https://fullstackdeeplearning.com/",
      ],
      ["Stanford AI Index：行业数据", "https://aiindex.stanford.edu/"],
      ["Artificial Analysis：模型/价格对比", "https://artificialanalysis.ai/"],
    ],
    do: "整理端到端 demo、benchmark、容量规划、ADR、SLO、成本模型和安全演练；做 30 分钟答辩，回答模型为何选它、瓶颈在哪里、失败如何恢复、容量如何推导、90 天先做什么。",
    output: "10–15 页架构文档、可运行 demo、实验数据、90 天路线图。",
    pass: "每个关键决策都有数据或实验证据；至少列出 5 个 trade-off、3 个未验证假设和明确的下一步实验。",
  },
];
const dayExams = [
  {
    questions: [
      "画出你选择场景的端到端链路，并指出控制面与数据面。",
      "质量、P95、成本、可用性四个指标分别如何采集？",
      "如果质量达标但成本超标，你的第一项架构动作是什么？",
    ],
    answer:
      "必须能把业务目标映射到系统组件和可观测指标，不能只回答“接一个模型”。",
    pass: "3 题全部回答；架构图包含数据、模型、推理、评测和治理；指标有目标值和退出条件。",
  },
  {
    questions: [
      "token 数量为什么会直接影响成本和上下文容量？",
      "attention 的时间/空间复杂度是什么？",
      "为什么 KV Cache 主要缓解 decode 阶段的重复计算？",
    ],
    answer: "回答必须同时包含序列长度、Q/K/V、缓存复用和显存约束。",
    pass: "3 题全对；能手算一个小 attention 的 shape，并解释序列长度翻倍的影响。",
  },
  {
    questions: [
      "训练阶段和推理阶段的计算路径有什么不同？",
      "causal mask 解决什么问题？",
      "为什么要先过拟合一个小 batch？",
    ],
    answer:
      "应涉及 teacher forcing、梯度更新、未来 token 泄露和数据/代码 sanity check。",
    pass: "3 题全对；能从日志定位一次 loss 不下降问题，并展示可生成结果。",
  },
  {
    questions: [
      "数据去重、版本和血缘分别解决什么问题？",
      "chunk 为什么不能只按固定字符数切？",
      "如何阻断一个无 ACL 的文档进入线上索引？",
    ],
    answer: "应覆盖可重跑、数据质量、语义边界、权限和发布门禁。",
    pass: "脚本可重复运行；随机抽 10 个 chunk 都能追溯来源、版本和 ACL。",
  },
  {
    questions: [
      "BM25 和 dense retrieval 分别擅长什么？",
      "recall@k 和 MRR 的区别是什么？",
      "召回不到证据时，应该先换 embedding 还是先查数据？",
    ],
    answer:
      "应能区分词法匹配、语义匹配、召回覆盖和排序位置，并按证据定位问题。",
    pass: "完成 100 条 query 评测；能解释至少 10 个失败样例。",
  },
  {
    questions: [
      "chunking、reranker、query rewrite 各改变 RAG 的哪一环？",
      "什么是 groundedness，如何人工校准？",
      "为什么引用存在不等于引用正确？",
    ],
    answer: "应覆盖检索证据、上下文、回答归因和人工标注规则。",
    pass: "三组单变量实验可复现；至少 20 条人工抽检并记录判定依据。",
  },
  {
    questions: [
      "当前 RAG 是否 go/no-go？依据哪些数据？",
      "Prompt、RAG、SFT、换模型分别在什么条件下选择？",
      "当前最大瓶颈和下一项实验是什么？",
    ],
    answer: "答案必须引用 benchmark、错误分类、成本和延迟数据，不能凭感觉。",
    pass: "完成 30 分钟评审；至少 1 个方案被明确否决并说明原因。",
  },
  {
    questions: [
      "TTFT、TPOT、E2E latency 分别测什么？",
      "prefill 和 decode 为什么应分开分析？",
      "P95 高但平均延迟正常，先查什么？",
    ],
    answer: "应涉及请求生命周期、输入/输出长度、排队和尾延迟。",
    pass: "至少 100 次请求；能报告 P50/P95/P99 并解释冷启动与热路径。",
  },
  {
    questions: [
      "KV Cache 的容量由哪些变量决定？",
      "continuous batching 如何提升利用率？",
      "多租户如何避免一个长上下文租户挤占所有 cache？",
    ],
    answer:
      "应覆盖层数、头数、head_dim、序列长度、精度、配额和 admission control。",
    pass: "有显存估算公式；能用 profiler/日志证明一个性能瓶颈。",
  },
  {
    questions: [
      "为什么不能笼统说 INT4 一定更快？",
      "量化质量退化如何测？",
      "网关如何处理超时、取消、重试和 fallback？",
    ],
    answer: "应涉及模型、后端、GPU、kernel、量化格式、幂等和副作用。",
    pass: "固定后端完成一组量化对比；质量退化、P95、吞吐和成本都有数据。",
  },
  {
    questions: [
      "自动评测为什么不能替代人工验收？",
      "trace 中哪些字段必须脱敏？",
      "如何控制 trace sampling 和高基数标签成本？",
    ],
    answer: "应覆盖 judge 偏差、人工校准、PII、采样率、可回放和线上开销。",
    pass: "100 条自动评测 + 20 条人工抽检；能报告自动/人工评分差异。",
  },
  {
    questions: [
      "Prompt Injection 和越权检索有什么区别？",
      "工具调用为什么必须传递用户权限？",
      "如何计算单位任务成本和峰值容量？",
    ],
    answer:
      "应覆盖内容操纵、身份/ACL、工具副作用、token/GPU/存储成本和峰值模型。",
    pass: "至少 8 个攻击用例；每项有攻击、控制、结果和残余风险。",
  },
  {
    questions: [
      "控制面和数据面分别放什么？",
      "active-passive 的 RPO/RTO 如何定义？",
      "消息重放和重试如何避免重复副作用？",
    ],
    answer:
      "应覆盖配置/发布与在线请求分离、故障域、幂等键、去重表、backpressure 和 fallback。",
    pass: "完成一次模型不可用或越权演练；能展示恢复证据和改进项。",
  },
  {
    questions: [
      "为什么选这个模型和 serving runtime？",
      "容量是如何从 QPS、上下文和输出分布推导的？",
      "系统最可能的三个失败模式是什么？",
      "未来 90 天为什么按这个优先级排？",
    ],
    answer: "每个回答必须引用实验、成本、SLO 或风险数据。",
    pass: "30 分钟答辩通过；至少 5 个 trade-off、3 个未验证假设和下一步实验清晰可追踪。",
  },
];
const dayOne = {
  id: "day-01",
  topic: "定义战场：把业务问题变成可验证的 LLM 系统问题",
  budget: [
    ["输入", 25],
    ["实践", 55],
    ["记录与验收", 20],
  ],
  objective:
    "把一个真实业务问题定义成可测量的 LLM 系统问题，并明确系统边界、成功指标和退出条件。",
  materials: [
    {
      title: "李宏毅：Introduction to Generative AI",
      url: "https://speech.ee.ntu.edu.tw/~hylee/genai/2024-spring.php",
      scope:
        "只看课程导论中生成式 AI 能力、应用形态与限制；用于建立业务能力边界。",
    },
    {
      title: "NIST AI RMF 1.0",
      url: "https://www.nist.gov/itl/ai-risk-management-framework",
      scope: "阅读 Govern、Map 概览；用于把风险、责任与退出条件纳入问题定义。",
    },
  ],
  practice: [
    "选择一个熟悉的场景（知识库问答、研发助手或客服），写清用户、任务、边界与不做什么。",
    "画出数据 → 模型 → 检索/工具 → 推理 → 评测 → 运营链路，并标出控制面与数据面。",
    "固定首轮模型、数据集、硬件与版本；定义质量、P95、单位任务成本、可用性的采集方法和目标。",
    "为每个目标写出不达标时的降级或退出条件，并记录仍未验证的假设。",
  ],
  output:
    "项目 README、一张标出控制面与数据面的全景架构图，以及质量/P95/成本/可用性指标表。",
  pass: "3 道检验问题都有可复核回答；证据摘要能定位 README、架构图和指标表；四类指标均包含数据来源、测量方法、目标值与退出或降级条件。",
  questions: dayExams[0].questions,
  rationale:
    "判断依据：业务目标必须映射到数据、模型、检索/工具、推理、评测和治理组件；控制面负责配置、发布和治理，数据面承载在线请求；质量、延迟、成本、可用性都需要可观测的数据来源、目标值与失败条件。只写“接入一个模型”或只报目标、不说明采集和退出条件，不能支持架构决策。",
  followUp:
    "后续延伸：把今天固定的文本样本带入 Day 2，观察 token 长度、上下文容量和成本之间的关系；长期可深入 NIST AI RMF 的 Measure 与 Manage。",
  evidenceHint: "请定位 README、架构图和指标表，并说明其中包含什么。",
  checks: [
    ["控制面与数据面", ["控制面", "数据面"]],
    ["四类指标", ["质量", "p95", "成本", "可用"]],
    ["目标与失败条件", ["目标", "退出", "降级"]],
  ],
};
const reviewedDays = [
  dayOne,
  {
    id: "day-02",
    topic: "模型边界与 Transformer 机制：从 token 到成本判断",
    budget: [
      ["输入", 25],
      ["实践", 55],
      ["记录与验收", 25],
    ],
    objective:
      "区分生成、推理、向量化与排序模型的职责，并用可运行实验解释 token、embedding、causal attention 对质量、上下文、延迟和成本的影响。",
    materials: [
      {
        title: "Hugging Face LLM Course：Tokenizers",
        url: "https://huggingface.co/learn/llm-course/chapter2/4",
        scope:
          "只读 tokenization pipeline、subword 与 special token；用于解释同一文本在不同 tokenizer 下长度和成本为何不同。",
      },
      {
        title: "Attention Is All You Need",
        url: "https://arxiv.org/abs/1706.03762",
        scope:
          "精读 3.2.1、3.2.2 与 Figure 1；聚焦 scaled dot-product、多头 attention、mask 和序列长度复杂度，不扩展复现整篇论文。",
      },
      {
        title: "PyTorch Embedding 官方文档",
        url: "https://pytorch.org/docs/stable/generated/torch.nn.Embedding.html",
        scope:
          "只看输入/输出 shape、词表大小与 embedding_dim；用于核对参数量和查表语义。",
      },
    ],
    practice: [
      "沿用 Day 1 的 20 条真实文本，用同一 tokenizer 输出每条 token 数、P50/P95、最长样本和特殊字符案例；写明 tokenizer 名称与版本。",
      "建立 Base/Instruct/Reasoning/Embedding/Reranker/VLM 能力矩阵：每类各写输入输出、收益、失败模式、延迟/费用代价与不适用场景。",
      "用 PyTorch 实现 embedding 与单头 causal attention，打印 token id、Q/K/V、attention score、mask、输出的 shape，并用断言证明未来 token 权重为零。",
      "手算 n=4 与 n=8 时 attention score 元素数，并估算同一 API 单价下 20 条样本的输入 token 成本；注明 attention 的 O(n²) 不等于所有端到端费用都严格平方增长。",
    ],
    output:
      "model-boundary.md 能力矩阵、token-stats.csv、可运行的 attention_shapes.py，以及包含 shape、复杂度、上下文与费用假设的 mechanism-note.md。",
    pass: "3 道问题均说明收益、代价、约束与生产适用范围；证据可定位 20 条样本统计、模型/版本、causal mask 断言和 n=4/8 手算；明确 prefill attention score 随序列长度平方增长，而 KV Cache 容量与已缓存 token 数近似线性增长。",
    questions: [
      "同一业务为何不能用一个生成模型替代 Embedding 与 Reranker？请给出各自收益、代价、约束和生产边界。",
      "token 数为何影响上下文容量、API 费用和延迟？哪些结论依赖 tokenizer、模型、硬件或计费口径？",
      "写出单头 causal attention 的 Q/K/V 与 score shape；序列长度翻倍时 prefill attention score 与 decode KV Cache 容量分别怎样变化？",
    ],
    rationale:
      "判断依据：Embedding 面向向量召回，Reranker 对候选相关性重新排序，生成/推理模型负责条件生成，职责、质量指标和成本曲线不同。token 是上下文和多数 API 计费单位，但数量取决于 tokenizer；标准 dense self-attention 的 score 矩阵随序列长度 O(n²) 增长，逐 token decode 复用 KV Cache 避免重算历史 K/V，而缓存容量对已缓存序列长度近似 O(n)。这些规律仍受模型结构、实现、硬件和供应商计费约束。",
    followUp:
      "Day 3 将这些 shape 与 mask 组装成一个可训练的 decoder-only Transformer；长期再深入 RoPE、GQA/MQA、FlashAttention 与稀疏 attention。",
    evidenceHint:
      "请定位能力矩阵、token 统计、脚本断言和 n=4/8 估算，并写明模型、tokenizer、版本和环境。",
    checks: [
      [
        "模型职责与取舍",
        ["embedding", "reranker", "生成", "收益", "代价", "约束"],
      ],
      ["token 与生产成本", ["token", "上下文", "费用", "延迟", "tokenizer"]],
      [
        "attention 与缓存机制",
        ["q", "k", "v", "mask", "o(n²)", "kv cache", "线性"],
      ],
    ],
  },
  {
    id: "day-03",
    topic: "最小实现验证：跑通 decoder-only Transformer",
    budget: [
      ["输入", 20],
      ["实践", 65],
      ["记录与验收", 25],
    ],
    objective:
      "用最小可运行实现验证 decoder-only Transformer 的前向、训练和自回归生成路径，并从日志判断实现是否可信，而不是追求训练大模型。",
    materials: [
      {
        title: "Karpathy：microgpt",
        url: "https://karpathy.ai/microgpt.html",
        scope:
          "阅读单文件实现的 tokenizer、参数初始化、attention、loss、反向传播与生成段；只复现最小闭环。",
      },
      {
        title: "PyTorch CrossEntropyLoss 官方文档",
        url: "https://pytorch.org/docs/stable/generated/torch.nn.CrossEntropyLoss.html",
        scope:
          "只看 logits/target shape 与未归一化 logits 约束；用于核对 next-token loss，不泛读所有参数。",
      },
    ],
    practice: [
      "准备一份不超过 10 KB 的固定文本和随机种子，记录词表、batch、seq_len、层数、头数、embedding 维度、参数量与运行环境。",
      "实现或裁剪一个含 token embedding、位置表示、causal self-attention、MLP、residual、normalization 和 LM head 的最小 decoder-only 模型；为 logits 与 mask shape 加断言。",
      "先在单个 batch 上训练到 loss 明显下降，再在固定小数据上运行至少 100 step；保存起止 loss、每步耗时或 tokens/s，并生成同一 prompt 的样例。",
      "做一次故障注入：移除或反转 causal mask，或错位 target；记录症状、定位证据和修复。说明此实现的收益、代价、约束，以及为何不直接用于生产。",
    ],
    output:
      "可运行的 minimal_transformer.py、带配置与环境的 run-log.md、起止 loss、生成样例，以及一次故障注入与修复记录。",
    pass: "固定 seed 的命令可重跑；shape 断言通过；单 batch loss 有明确下降；日志包含至少 100 step 的起止 loss 与吞吐/耗时；生成样例可查看；回答准确覆盖 teacher forcing、causal mask、训练/推理差异和生产边界。",
    questions: [
      "训练与自回归推理的输入、目标、计算复用和输出路径有什么不同？各自的性能代价是什么？",
      "causal mask 防止了什么泄露？请用 shape/断言或故障注入证据说明，而不只复述定义。",
      "为什么先过拟合一个 batch？若 loss 不下降，你按什么顺序排查数据、target、梯度和学习率；该最小实现为何不适合生产？",
    ],
    rationale:
      "判断依据：训练通常以 teacher forcing 并行计算各位置 next-token loss，并保留激活做反向传播；自回归推理逐 token 生成，可缓存历史 K/V，且不做梯度更新。causal mask 阻断对未来位置的访问。小 batch 过拟合是数据、目标对齐、前向、梯度和优化器的 sanity check，不证明泛化。生产还需可靠 tokenizer、数值稳定、批处理、KV Cache、监控、安全和评测。",
    followUp:
      "Day 4 会把训练/检索所依赖的输入升级为可版本化、可授权和可追溯的数据资产；长期可用 profiler 比较 fused kernel、FlashAttention 与 production runtime。",
    evidenceHint:
      "请定位运行命令、seed、配置、shape 断言、至少 100 step 的起止 loss、吞吐/耗时、生成样例与故障修复。",
    checks: [
      [
        "训练与推理机制",
        ["teacher forcing", "梯度", "推理", "kv cache", "代价"],
      ],
      ["mask 可验证证据", ["causal mask", "未来", "shape", "断言"]],
      [
        "sanity check 与生产边界",
        ["batch", "loss", "数据", "target", "学习率", "生产", "约束"],
      ],
    ],
  },
  {
    id: "day-04",
    topic: "可追溯数据资产：质量、ACL、版本与血缘",
    budget: [
      ["输入", 25],
      ["实践", 55],
      ["记录与验收", 25],
    ],
    objective:
      "把一小批业务文档转成可重跑、可审计、可回滚的 chunk 数据集，并在索引发布前阻断权限或血缘不完整的数据。",
    materials: [
      {
        title: "Hugging Face Datasets：Main classes",
        url: "https://huggingface.co/docs/datasets/package_reference/main_classes",
        scope:
          "只读 Dataset.map/filter、fingerprint 与 save/load；用于设计确定性处理、版本指纹和可重跑产物。",
      },
      {
        title: "NIST AI RMF 1.0",
        url: "https://www.nist.gov/itl/ai-risk-management-framework",
        scope:
          "阅读 MAP 3 与 MEASURE 2 中数据、隐私和质量相关条目；用于定义数据风险、责任人与发布证据。",
      },
      {
        title: "Azure AI Search：文档级访问控制",
        url: "https://learn.microsoft.com/en-us/azure/search/search-document-level-access-overview",
        scope:
          "只看 security filter 与文档级权限模式；用于理解 ACL 必须在检索链路强制执行，而不是只保存 metadata。",
      },
    ],
    practice: [
      "选 10–20 份固定 Markdown/HTML 文档，记录 source_id、content_hash、source_version、updated_at、tenant_id、acl_principals、parser_version 与 parent_id。",
      "实现规范化、空内容过滤、按 content_hash 精确去重和按标题/段落语义切分；同一输入和配置重复运行两次，比较 manifest hash 与 chunk 数。",
      "输出质量报告：输入/解析/过滤/chunk 数、重复率、解析失败率、缺失 ACL 比例；随机抽检 10 个 chunk，逐个回溯原文位置和版本。",
      "设计发布门禁：ACL、source/version/lineage 任一缺失即拒绝进入索引；用一个无 ACL 样本验证失败，并写出增量更新、下线与回滚到上一 manifest 的步骤。",
    ],
    output:
      "可重复运行的数据脚本、versioned manifest、10 条血缘抽检记录、数据质量报告，以及包含 ACL 发布门禁、增量更新、下线和回滚的数据 ADR。",
    pass: "两次运行 manifest hash 与 chunk 数一致；质量报告含明确分母；10/10 抽检 chunk 可追溯 source/version/location/parent；无 ACL 样本被门禁拒绝；回答能区分去重、metadata、ACL、版本与血缘的收益、代价、约束和生产责任。",
    questions: [
      "清洗、去重、metadata、版本与血缘分别解决什么问题？它们的存储/运维代价和适用边界是什么？",
      "为什么 chunk 不能只按固定字符数切？如何在语义完整、召回、上下文成本和可追溯性之间取舍？",
      "如何保证无 ACL 或血缘不完整的文档不会进入线上索引？请说明门禁、检索时强制过滤、审计和回滚证据。",
    ],
    rationale:
      "判断依据：清洗保证可解析性，去重减少污染和重复成本，metadata 支持过滤与解释，版本标识可复现快照，血缘连接 chunk 到原文、处理器和父文档。chunking 是语义完整性、召回粒度、上下文 token 成本和更新放大之间的取舍。ACL 必须既作为发布门禁又在查询时按调用者身份强制过滤；版本化 manifest、审计日志和原子索引别名支持回滚。",
    followUp:
      "Day 5 将在这份通过门禁的数据上建立 BM25/dense retrieval 基线；长期可深入近重复检测、表格/代码解析、版权与数据驻留。",
    evidenceHint:
      "请定位脚本、两次 manifest hash、质量报告分母、10 条血缘抽检、无 ACL 失败日志和回滚步骤。",
    checks: [
      [
        "数据资产职责与代价",
        ["清洗", "去重", "metadata", "版本", "血缘", "代价", "约束"],
      ],
      ["chunk 取舍", ["语义", "召回", "token", "追溯"]],
      ["ACL 生产闭环", ["acl", "门禁", "过滤", "审计", "回滚"]],
    ],
  },
  {
    id: "day-05",
    topic: "RAG 检索基线：先测召回，再谈生成",
    budget: [
      ["输入", 25],
      ["实践", 55],
      ["记录与验收", 20],
    ],
    objective:
      "在固定 query 集、索引版本和运行环境下比较 BM25 与 dense retrieval，用指标和失败样例区分召回覆盖与排序问题。",
    materials: [
      {
        title: "Retrieval-Augmented Generation 原论文",
        url: "https://arxiv.org/abs/2005.11401",
        scope:
          "阅读摘要、方法 2.1–2.2 与实验设置；用于理解检索器、生成器及可更新外部知识的边界。",
      },
      {
        title: "Sentence Transformers：Semantic Search",
        url: "https://www.sbert.net/examples/sentence_transformer/applications/semantic-search/README.html",
        scope:
          "阅读 symmetric/asymmetric search 与 retrieve-and-rerank；用于固定 dense baseline 的查询、语料编码方式。",
      },
      {
        title: "Elasticsearch：BM25 similarity",
        url: "https://www.elastic.co/guide/en/elasticsearch/reference/current/index-modules-similarity.html",
        scope:
          "只读 BM25 参数与默认实现说明；用于记录词法基线配置，不在首轮调参。",
      },
    ],
    practice: [
      "冻结至少 100 条 query、相关证据标注、语料/索引版本；记录 BM25 参数、embedding 模型版本、top-k、硬件与运行命令。",
      "在同一 query 集和环境分别运行 BM25 与 dense retrieval，保存每条 query 的排序结果和原始耗时。",
      "报告 recall@5/10/20、MRR、P50/P95 延迟、索引大小和构建时间；不得用平均值代替尾延迟。",
      "抽取至少 10 个失败 query，分类为召回不到、排序错误、权限错误或数据过期，并给出可回放标识。",
    ],
    output:
      "可复现的检索 benchmark（配置、命令、原始结果与汇总表）和至少 10 条带 query ID 的失败分类记录。",
    pass: "3 题全部回答；证据摘要包含固定 query 数、语料/索引与环境版本、BM25/dense 配置、recall@k、MRR、P95，以及至少 10 条失败分类。",
    questions: dayExams[4].questions,
    rationale:
      "判断依据：BM25 擅长精确词项匹配，dense retrieval 擅长语义近邻，但结论必须来自相同 query 集、索引版本、top-k 和硬件。recall@k 衡量相关证据是否进入前 k，MRR 关注首个相关结果的排序位置。召回不到时先核查语料、标注和权限，再根据失败分类决定是否更换 embedding。",
    followUp:
      "把 Day 5 的最佳可复现配置作为 Day 6 唯一基线；失败 query 集不得在消融过程中改写。",
    evidenceHint:
      "请定位 benchmark 配置/命令/原始结果，并列出 query 数、索引与环境版本、recall@k、MRR、P95 和失败分类。",
    checks: [
      ["固定 query 集与样本量", ["100", "query"]],
      ["固定环境与版本", ["环境", "版本"]],
      ["检索质量指标", ["recall@", "mrr"]],
      ["尾延迟", ["p95"]],
      ["两类基线", ["bm25", "dense"]],
      ["失败分类", ["召回不到", "排序", "权限", "过期"]],
    ],
  },
  {
    id: "day-06",
    topic: "RAG 单变量消融与引用验证",
    budget: [
      ["输入", 25],
      ["实践", 55],
      ["记录与验收", 20],
    ],
    objective:
      "以 Day 5 固定基线做一次只改变一个变量的消融，验证质量收益是否覆盖延迟与成本代价，并人工核对引用。",
    materials: [
      {
        title: "Ragas：Metrics 概念文档",
        url: "https://docs.ragas.io/en/stable/concepts/metrics/",
        scope:
          "只读 context precision/recall、faithfulness 的定义与输入；用于设计指标，自动分数须经人工校准。",
      },
      {
        title: "LlamaIndex：Evaluating RAG",
        url: "https://docs.llamaindex.ai/en/stable/optimizing/evaluation/evaluation/",
        scope:
          "阅读 retrieval 与 response evaluation；用于分开定位检索失败和回答归因失败。",
      },
      {
        title: "Retrieval-Augmented Generation 原论文",
        url: "https://arxiv.org/abs/2005.11401",
        scope:
          "回看实验与 ablation；用于理解对照实验，不照搬论文数据作为业务结论。",
      },
    ],
    practice: [
      "锁定 Day 5 的 query、语料/索引、模型、prompt、top-k、随机种子和环境，登记基线 run ID。",
      "从 chunking、hybrid、reranker 或 query rewrite 中只选一个变量；每次 run 仅改变该变量并保留配置 diff。",
      "比较 recall@k/MRR、引用正确率、groundedness、P95 和单位 query 成本，保留逐 query trace。",
      "人工抽检至少 20 条：检查引用是否真的支持答案，记录判定规则、分歧与失败类型。",
    ],
    output:
      "至少三组相对同一基线的单变量消融、20 条人工引用核验记录，以及包含 query→证据→prompt→答案→引用的可回放 trace。",
    pass: "每组实验都有 run ID、唯一变量和基线；报告质量、P95 与成本变化；至少 20 条人工抽检说明引用正确率与 groundedness 的规则。",
    questions: dayExams[5].questions,
    rationale:
      "判断依据：chunking 改变可检索证据单元，reranker 改变候选排序，query rewrite 改变检索请求。单变量实验必须复用 Day 5 数据和环境，才能归因。groundedness 检查答案是否受证据支持；出现引用只证明有链接，不证明该引用蕴含答案。",
    followUp:
      "将净收益最明确的一组配置带入 Day 7；未胜出的方案连同延迟、成本和失败证据进入否决候选。",
    evidenceHint:
      "请列出 Day 5 基线 run ID、三组 run ID/唯一变量、质量/P95/成本差值、20 条人工抽检位置和 trace 定位方式。",
    checks: [
      ["固定 Day 5 基线", ["day 5", "基线"]],
      ["单变量设计", ["单变量", "唯一变量"]],
      ["三组可追溯实验", ["三组", "run id"]],
      ["质量与代价", ["引用正确率", "groundedness", "p95", "成本"]],
      ["人工校准", ["20", "人工"]],
      ["可回放链路", ["query", "证据", "prompt", "答案", "引用"]],
    ],
  },
  {
    id: "day-07",
    topic: "第一周 go/no-go 架构评审",
    budget: [
      ["输入", 20],
      ["评审与决策", 60],
      ["记录与验收", 20],
    ],
    objective:
      "综合固定基线、消融和失败样例，对 RAG v1 作出可审计的 go/no-go 决策，并把未验证假设转成下一项实验。",
    materials: [
      {
        title:
          "Google Cloud Architecture Framework：Architecture decision records",
        url: "https://cloud.google.com/architecture/architecture-decision-records",
        scope:
          "阅读 ADR 的 context、options、decision、consequences；用于形成可追溯的中期决策。",
      },
      {
        title: "Full Stack Deep Learning：Testing and Experimentation",
        url: "https://fullstackdeeplearning.com/course/2022/lecture-3-troubleshooting-and-testing/",
        scope:
          "阅读测试、错误分析与实验迭代部分；用于检查结论是否由失败样例和对照实验支撑。",
      },
    ],
    practice: [
      "冻结评审包：Day 5 基线与 Day 6 最佳 run、query/索引/模型版本、样本量和统计口径。",
      "用同一表格呈现质量（recall@k、MRR、引用正确率/groundedness）、失败分类、P95 延迟和单位 query 成本，对照预设阈值。",
      "记录 go 或 no-go、适用边界、负责人和复审日期；至少否决一个备选方案并引用其收益、代价或失败证据。",
      "把最大未验证假设写成下一项单变量实验：假设、唯一变量、控制项、指标、成功阈值和停止条件。",
    ],
    output:
      "第一周 ADR、RAG v1 决策表、一个有证据的被否决方案，以及下一项可复现实验卡。",
    pass: "必须明确 go/no-go；同时引用质量、失败分类、P95 和成本；至少一个方案被否决并说明证据；下一项实验含唯一变量、控制项、阈值与停止条件。",
    questions: dayExams[6].questions,
    rationale:
      "判断依据：中期评审不是演示会。go/no-go 必须对照预先定义的质量、延迟和成本阈值，并结合失败分类判断可修复性。被否决方案体现真实取舍；下一实验必须一次只改变一个变量，否则无法把结果归因。",
    followUp:
      "只有 go 决策且风险可接受时才进入 Day 8 推理性能基线；no-go 则先执行记录的实验或修复，不用新增功能掩盖基线问题。",
    evidenceHint:
      "请定位 ADR/决策表，写明 go/no-go、质量/失败/P95/成本证据、被否决方案及下一项实验的控制项和停止条件。",
    checks: [
      ["明确决策", ["go/no-go"]],
      ["完整评审证据", ["质量", "失败分类", "p95", "成本"]],
      ["被否决方案", ["否决", "方案"]],
      ["下一项实验", ["下一项实验", "唯一变量", "控制项", "阈值", "停止条件"]],
      ["可复现范围", ["样本量", "版本", "统计口径"]],
    ],
  },
  {
    id: "day-08",
    number: 8,
    topic: "推理性能基线",
    budget: [
      ["权威输入", 25],
      ["最小实验", 55],
      ["记录与验收", 20],
    ],
    objective:
      "建立可复现的请求生命周期基线，分别解释 prefill、decode、排队与冷启动，而不是用单个平均延迟代表服务性能。",
    materials: [
      {
        title: "vLLM Benchmark CLI 官方文档",
        url: "https://docs.vllm.ai/en/latest/cli/bench/serve.html",
        scope:
          "只读请求率、输入/输出长度与结果字段；确认 TTFT、TPOT、ITL 和吞吐的统计口径。",
      },
      {
        title: "vLLM Metrics 官方文档",
        url: "https://docs.vllm.ai/en/latest/design/metrics.html",
        scope:
          "只读请求队列、prefill/decode 与 KV cache 指标；把客户端时间拆回服务端阶段。",
      },
      {
        title: "NVIDIA GenAI-Perf 官方文档",
        url: "https://docs.nvidia.com/deeplearning/triton-inference-server/user-guide/docs/perf_analyzer/genai-perf/README.html",
        scope:
          "只读输入/输出分布、并发和 percentile 报告；用于核对负载生成与采样方法。",
      },
    ],
    practice: [
      "10 分钟：记录模型及 revision、GPU 型号/数量/显存、驱动，runtime 及版本、量化格式（未量化也写 BF16/FP16），并固定采样参数。",
      "15 分钟：从真实样本或可解释的合成分布生成请求，报告输入/输出 token 的 P50/P95、并发/到达率与 warm-up；不要只给固定长度。",
      "30 分钟最小实验：同一配置完成 warm-up 后采集至少 30 个成功请求；若环境允许，延伸到 100 个以上并增加一个并发档位。记录原始逐请求数据。",
      "20 分钟：计算 TTFT、TPOT、E2E 和队列等待的 P50/P95/P99 及 token/request 吞吐；标注失败、超时是否进入分母。",
      "25 分钟：画 prefill→首 token→decode 生命周期，依据 trace 解释尾延迟；把结论限定到本模型、硬件、runtime 和本次负载。",
    ],
    output:
      "benchmark 原始数据与命令、环境/负载清单、请求生命周期图，以及含样本量和统计定义的 P50/P95/P99 报告。",
    pass: "3 题均有机制与证据；摘要完整记录模型、硬件、runtime、量化格式、输入/输出分布、并发、样本量和统计口径，并报告 TTFT、TPOT、E2E、排队与吞吐。少于 30 个成功请求只能作为冒烟结果，不得形成容量结论。",
    questions: [
      "TTFT、TPOT 与 E2E 分别从哪些时间点计算？它们如何对应排队、prefill 和 decode？",
      "P95 高但平均值正常时，你会如何用输入/输出分布、排队时间和冷/热路径定位？",
      "为什么这次 benchmark 不能直接推广到另一模型、GPU、runtime、量化格式或业务负载？",
    ],
    rationale:
      "TTFT 包含调度/排队与 prefill 至首 token；TPOT 描述首 token 后相邻输出 token 的平均生成间隔；E2E 覆盖请求到完整响应。percentile 必须基于明确样本集合和插值/聚合口径。模型、硬件、runtime、精度、长度分布、到达过程或并发任一变化，都可能改变瓶颈，因此局部实验只能支持条件化结论。",
    evidenceHint:
      "建议逐项写：模型/revision；硬件/驱动；runtime/版本；量化格式；输入 P50/P95、输出 P50/P95；并发或到达率；warm-up；成功/失败样本量；P50/P95/P99 算法与超时处理；TTFT/TPOT/E2E/队列/吞吐结果；原始数据位置；结论边界。",
    evidenceLabel: "benchmark 证据摘要",
    checks: [
      ["TTFT、TPOT 与 E2E", ["ttft", "tpot", "e2e"]],
      ["prefill、decode 与排队", ["prefill", "decode", "排队"]],
      ["结论适用边界", ["不能推广"]],
    ],
    followUp:
      "延伸任务（不计入通过）：增加 100+ 请求和更多到达率，画 latency-throughput 曲线。Day 9 必须复用本日基线，只改变一个变量。",
  },
  {
    id: "day-09",
    number: 9,
    topic: "KV Cache 与调度",
    budget: [
      ["权威输入", 25],
      ["最小实验", 55],
      ["记录与验收", 25],
    ],
    objective:
      "把 KV Cache 容量与 continuous batching 的收益放进真实排队系统，识别计算、显存带宽、调度或排队瓶颈，并设计背压与多租户公平性。",
    materials: [
      {
        title: "PagedAttention 原论文",
        url: "https://arxiv.org/abs/2309.06180",
        scope:
          "读摘要、§3–4 与实验限制；理解分页如何减少碎片，而不是把它误写成消除 KV Cache。",
      },
      {
        title: "vLLM Scheduler 源码文档",
        url: "https://docs.vllm.ai/en/latest/api/vllm/v1/core/sched/scheduler.html",
        scope:
          "追踪 waiting/running、token budget 与 KV cache 分配；定位 continuous batching 的调度位置。",
      },
      {
        title: "vLLM Production Metrics",
        url: "https://docs.vllm.ai/en/latest/design/metrics.html",
        scope:
          "只看 cache usage、waiting requests、queue time 与 preemption；为背压和 admission control 找观测证据。",
      },
    ],
    practice: [
      "10 分钟：复用 Day 8 的模型、硬件、runtime、量化格式和统计脚本，记录 KV dtype、block/page 配置及可用显存。",
      "15 分钟：估算每 token KV bytes 与单请求容量；注明层数、KV heads、head dimension、元素字节数和序列长度，校验 GQA/MQA 不能误用 attention heads。",
      "30 分钟最小实验：固定输入/输出分布和至少 30 个请求，只改变一个变量（并发或长上下文占比）；采集 cache usage、running/waiting、preemption/rejection、TTFT/TPOT/E2E P95。",
      "25 分钟：依据 profiler/日志把现象归到计算、显存带宽、调度或排队；没有对应证据时写“未证实”，不要从 GPU 利用率单点推断。",
      "25 分钟：为两个租户定义配额/权重、admission control、队列上限和 backpressure 响应，检查长上下文租户是否恶化另一租户 P95。",
    ],
    output:
      "KV Cache 容量表、单变量性能曲线、调度/队列 trace，以及包含背压、admission control 和多租户公平性的 ADR。",
    pass: "环境、负载、样本量和统计口径与 Day 8 一样可复核；有公式和观测数据；明确区分计算、显存带宽、调度、排队四类瓶颈；公平性至少分租户报告 P95、吞吐或拒绝率。",
    questions: [
      "KV Cache 每 token 容量由哪些变量决定？GQA/MQA 为什么会改变估算？",
      "continuous batching 如何利用 decode 的迭代边界，又可能怎样影响 TTFT 与尾延迟？",
      "长上下文租户耗尽 cache 时，admission control、backpressure、配额和公平调度如何协作？",
    ],
    rationale:
      "近似 KV bytes/token = 2 × 层数 × KV heads × head_dim × dtype bytes；还需计入实现元数据与碎片。continuous batching 在迭代边界移入/移出请求以提高利用率，但等待、抢占和大请求会扩大尾延迟。计算饱和需 kernel/算力证据，带宽瓶颈需 memory throughput 证据，调度与排队需 waiting、queue time、preemption 等证据。",
    evidenceHint:
      "建议逐项写：Day 8 基线引用；模型/硬件/runtime/量化格式；KV dtype/block；输入/输出分布；并发；样本量；P95 口径；KV 公式与实测；running/waiting/preemption/rejection；四类瓶颈证据；分租户指标与背压策略；结论边界。",
    evidenceLabel: "benchmark 证据摘要",
    checks: [
      ["KV Cache 与 continuous batching", ["kv cache", "continuous batching"]],
      ["四类瓶颈", ["计算", "显存带宽", "调度", "排队"]],
      ["背压与多租户公平性", ["背压", "公平"]],
    ],
    followUp:
      "延伸任务（不计入通过）：分别扫描上下文长度和并发，比较 prefix caching 或不同调度策略；不要在最小实验中同时改变多个变量。",
  },
  {
    id: "day-10",
    number: 10,
    topic: "量化与受控服务",
    budget: [
      ["权威输入", 25],
      ["最小实验", 60],
      ["记录与验收", 25],
    ],
    objective:
      "在后端支持矩阵内验证一种量化方案，并把质量、显存、吞吐、尾延迟和成本证据接入可取消、可限流、可降级的服务路径。",
    materials: [
      {
        title: "vLLM Quantization 官方文档",
        url: "https://docs.vllm.ai/en/latest/features/quantization/",
        scope:
          "先查硬件与量化方法兼容矩阵；只选择当前 runtime 明确支持且能加载的格式。",
      },
      {
        title: "AWQ 原论文",
        url: "https://arxiv.org/abs/2306.00978",
        scope:
          "读方法与实验设置，理解 weight-only 量化保护显著权重的假设；不把论文硬件结果外推到当前服务。",
      },
      {
        title: "vLLM OpenAI-compatible Server",
        url: "https://docs.vllm.ai/en/latest/serving/openai_compatible_server.html",
        scope:
          "只读流式、服务参数和请求接口；结合网关自行设计超时、取消、限流、幂等与 fallback。",
      },
    ],
    practice: [
      "10 分钟：在支持矩阵确认一种方案（例如 AWQ W4A16），记录模型/revision、GPU、驱动、runtime/版本、量化格式与 kernel；若不支持，记录阻断证据，不替换成虚假 benchmark。",
      "20 分钟：固定 Day 8 的输入/输出分布、并发、采样参数与至少 30 个请求，对未量化基线和量化候选执行同口径热路径测试。",
      "20 分钟：在固定 golden set 上报告任务指标与人工失败样例，预先写质量退化阈值；同时记录权重/峰值显存、吞吐、P95 和单位请求或每百万输出 token 成本。",
      "20 分钟：验证流式首 token、客户端取消、deadline/超时和限流；为可重试请求设置幂等键，明确产生副作用的请求不能盲目重试。",
      "20 分钟：设计超载/模型失败时的 fallback、熔断与恢复门槛；写出采用、拒绝或继续实验的条件化结论。",
    ],
    output:
      "量化决策记录、同负载对照表、golden set 质量差异与失败样例，以及流式/超时/取消/限流/幂等/fallback 的服务时序图。",
    pass: "真实后端支持证据和量化格式明确；基线/候选共享环境与负载；质量、显存、吞吐、P95、成本均有样本量和统计口径；结论不得写成“INT4 一定更快”，并明确质量阈值、失败模式、回滚条件。",
    questions: [
      "为什么相同位宽在不同模型、GPU、runtime 与 kernel 上不保证相同吞吐或 P95？",
      "你如何用固定 golden set 和失败样例决定质量退化是否可接受？",
      "流式请求超时或取消时，网关、推理后端、限流器、幂等与 fallback 各自做什么？",
    ],
    rationale:
      "量化减少权重容量或带宽不等于端到端必然加速：kernel、反量化、batch、KV cache、调度和硬件支持都会改变结果。质量比较必须固定模型任务、数据与解码参数并预注册阈值。受控路径要传播取消、停止无用生成，限流要在过载前背压；fallback 需受质量、成本和数据边界约束。",
    evidenceHint:
      "建议逐项写：模型/revision；硬件/驱动；runtime/版本/kernel；基线与量化格式；输入/输出分布；并发；样本量；P95/吞吐/成本口径；golden set 数量/指标/阈值/失败样例；显存；流式/超时/取消/限流/幂等/fallback 证据；回滚与结论边界。",
    evidenceLabel: "benchmark 证据摘要",
    checks: [
      ["质量、显存、吞吐、P95 与成本", ["质量", "显存", "吞吐", "p95", "成本"]],
      ["受控服务路径", ["流式", "超时", "取消", "限流", "fallback"]],
      ["量化结论边界", ["不一定"]],
    ],
    followUp:
      "延伸任务（不计入通过）：在同一后端增加第二种受支持格式或并发档位；只有重复实验仍成立，才扩大结论适用范围。",
  },
  {
    id: "day-11",
    topic: "评测与可观测性：校准质量信号与 trace",
    budget: [
      ["输入", 25],
      ["实践", 50],
      ["记录与验收", 25],
    ],
    objective:
      "用固定样本和明确规则校准自动评测，建立兼顾隐私、诊断价值与成本的 trace 策略。",
    materials: [
      {
        title: "OpenAI Evals · 官方源码",
        url: "https://github.com/openai/evals",
        scope:
          "只读 README 的 eval 结构、数据与结果部分；用于设计可重复的固定评测。",
      },
      {
        title: "Ragas · 官方 Metrics 文档",
        url: "https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/",
        scope:
          "只读 groundedness/faithfulness 与检索指标；记录指标适用边界，不把自动分数当事实。",
      },
      {
        title: "OpenTelemetry · Trace 语义",
        url: "https://opentelemetry.io/docs/concepts/signals/traces/",
        scope: "只读 span、attribute 与 sampling；用于定义请求链路和采样边界。",
      },
    ],
    practice: [
      "固定 100 条带样本 ID、版本和期望证据的 regression set；为任务成功率、groundedness、引用正确率和工具成功率写判定规则与阈值。",
      "运行自动评测，并按固定抽样方法人工抽检至少 20 条；记录自动/人工评分、分歧类型和处理结论。",
      "定义 request → 检索 → prompt → 模型 → 工具 → 回答的 trace schema；对 PII、密钥与正文做删除、哈希或掩码。",
      "给正常流量、错误、慢请求和安全事件分别设置采样率与保留期；全量运行等重实验列入延伸，不占主路径。",
    ],
    output:
      "固定评测集清单、指标规则表、至少 20 条人工校准记录、自动/人工差异报告、trace schema 与采样/脱敏策略。",
    pass: "证据标明 100 条固定样本与至少 20 条人工抽检；指标有规则和阈值；差异有归因；trace 覆盖脱敏、采样率、保留期和错误优先策略。",
    questions: dayExams[10].questions,
    rationale:
      "判断依据：自动 judge 会受模型、提示词和样本分布影响，因此必须用固定样本、明确标注规则与人工抽检校准。Trace 只收集诊断所需字段，敏感正文、身份和密钥应删除、哈希或掩码；采样应保留错误与慢请求，同时控制高基数和存储成本。",
    followUp:
      "延伸（不计入 100 分钟）：扩大回归集并做标注者一致性分析；把质量门禁接入 CI 或灰度发布。",
    evidenceHint:
      "请定位评测集版本、自动/人工对照表、trace schema 和采样配置，并写出样本量与关键结果。",
    checks: [
      [
        "样本量证据",
        ["100", "样本"],
        "缺少样本量证据：请写明固定评测集为 100 条。",
      ],
      [
        "人工校准",
        ["20", "人工"],
        "缺少人工校准证据：请写明至少 20 条人工抽检及抽样方法。",
      ],
      [
        "自动/人工差异",
        ["自动", "人工", "差异"],
        "缺少自动评测与人工评分差异及归因。",
      ],
      ["指标规则", ["规则", "阈值"], "缺少指标判定规则或质量门禁阈值。"],
      ["trace 策略", ["trace", "脱敏", "采样"], "缺少 trace 脱敏或采样策略。"],
    ],
  },
  {
    id: "day-12",
    topic: "安全、权限与成本：用攻击证据量化风险",
    budget: [
      ["输入", 25],
      ["实践", 60],
      ["记录与验收", 25],
    ],
    objective:
      "用攻击证据验证纵深控制与权限传播，并把安全误报、残余风险和成本容量放进同一决策表。",
    materials: [
      {
        title: "OWASP Top 10 for LLM Applications",
        url: "https://owasp.org/www-project-top-10-for-large-language-model-applications/",
        scope:
          "只读 Prompt Injection、Sensitive Information Disclosure、Excessive Agency；用于构造四类核心攻击。",
      },
      {
        title: "NIST AI RMF 1.0",
        url: "https://www.nist.gov/itl/ai-risk-management-framework",
        scope:
          "阅读 Measure 与 Manage 摘要；用于记录控制证据、责任人与残余风险。",
      },
    ],
    practice: [
      "各执行至少 1 个 prompt injection、越权检索、数据泄露、工具滥用用例；记录输入、身份/ACL、目标资源、实际结果与日志或 trace 定位。",
      "为每个攻击登记预防、检测和响应控制，记录是否拦截、误报样本、影响范围、残余风险、风险余量与责任人。",
      "画出用户身份和 tenant/ACL 经网关、检索与工具逐跳传播的权限图，证明拒绝发生在服务端而非只靠 prompt。",
      "建立可重算公式：月成本 = 请求量 ×（输入 token × 单价 + 输出 token × 单价 + 检索/存储/GPU/人工摊销），纳入峰值 QPS、上下文/输出分布和故障余量。",
    ],
    output:
      "四类攻击证据表、控制/误报/残余风险登记、权限传播图，以及可按 QPS 和 token 分布重算的成本容量表。",
    pass: "四类攻击均有可定位证据；权限在检索和工具层执行；控制同时报告拦截与误报；残余风险和风险余量明确；成本公式含假设、单位、峰值与容量余量。",
    questions: dayExams[11].questions,
    rationale:
      "判断依据：Prompt Injection 操纵内容，越权检索突破身份或 ACL 边界；二者都不能只靠提示词防护。工具必须使用调用者身份、最小权限、参数校验和副作用审批。成本容量应由请求量、输入/输出 token 分布、峰值和各资源单价推导，并保留故障余量。",
    followUp:
      "延伸（不计入 110 分钟）：扩展至供应链、拒绝服务、日志泄露等攻击，并让安全团队做独立红队复核。",
    evidenceHint:
      "请定位四类攻击日志或 trace、权限传播图、风险登记和成本表，写明误报、残余风险与重算参数。",
    checks: [
      [
        "四类攻击证据",
        ["prompt injection", "越权检索", "数据泄露", "工具滥用"],
        "攻击证据不完整：需覆盖 prompt injection、越权检索、数据泄露和工具滥用。",
      ],
      [
        "权限证据",
        ["身份", "acl", "权限"],
        "缺少权限证据：请说明身份/ACL 如何传播并在检索和工具层强制执行。",
      ],
      ["控制与误报", ["控制", "误报"], "缺少控制措施或误报记录。"],
      ["残余风险", ["残余风险", "风险余量"], "缺少残余风险或风险余量说明。"],
      [
        "可重算成本",
        ["qps", "输入", "输出", "成本"],
        "成本模型不可重算：请补充 QPS、输入/输出分布、单价或公式。",
      ],
    ],
  },
  {
    id: "day-13",
    topic: "生产架构与故障演练：证明系统可以恢复",
    budget: [
      ["输入", 20],
      ["实践", 55],
      ["记录与验收", 25],
    ],
    objective:
      "把原型设计成有隔离、流控、降级和恢复目标的生产架构，并用一次故障演练留下恢复证据。",
    materials: [
      {
        title: "Google SRE Workbook · Non-Abstract Large System Design",
        url: "https://sre.google/workbook/non-abstract-design/",
        scope: "只读容量、故障与设计权衡方法；用于约束容量余量和故障域。",
      },
      {
        title: "AWS Builders Library · Avoiding overload",
        url: "https://aws.amazon.com/builders-library/avoiding-overload-in-distributed-systems-by-putting-the-smaller-service-in-control/",
        scope: "只读 backpressure、负载卸载与重试边界；用于设计过载保护。",
      },
      {
        title: "KServe · 官方架构文档",
        url: "https://kserve.github.io/website/latest/modelserving/control_plane/",
        scope: "只读控制面与数据面职责；用于校验部署、路由和在线请求边界。",
      },
    ],
    practice: [
      "画出控制面/数据面、区域和依赖故障域；标注多租户配额、公平调度、admission control、backpressure 与容量余量。",
      "为模型不可用、检索超时和下游写入失败定义 fallback、熔断与降级；明确哪些请求可重试，副作用请求如何用幂等键和去重记录保护。",
      "为配置、索引和会话状态分别定义 RPO/RTO、复制方式、切换触发器、回退条件和责任人。",
      "执行一次桌面或测试环境演练，记录注入时间、告警时间、流量切换、数据核对、恢复时间、是否满足 RPO/RTO 与改进项。",
    ],
    output:
      "生产架构图、SLO/配额表、故障时序图、RPO/RTO 表和含时间戳/指标/数据核对的演练复盘。",
    pass: "控制面/数据面与故障域明确；有配额、公平性、backpressure、fallback 和容量余量；副作用具备幂等证据；RPO/RTO 可测；恢复证据足以证明是否达标，不能只写“重试”。",
    questions: dayExams[12].questions,
    rationale:
      "判断依据：控制面负责配置、部署和治理，数据面承载在线流量。过载时先 admission control/backpressure，再按业务语义 fallback；盲目重试会放大故障。RPO 衡量可接受数据丢失，RTO 衡量恢复时长；必须用演练时间戳、指标和数据核对证明，而不是写一个目标值。",
    followUp:
      "延伸（不计入 100 分钟）：在隔离测试环境执行真实区域切换和消息重放，验证复杂依赖与长期容量变化。",
    evidenceHint:
      "请定位架构图、配额表、RPO/RTO 表和演练时间线，写明告警、切换、数据核对、恢复时间及结果。",
    checks: [
      [
        "平面与故障域",
        ["控制面", "数据面", "故障域"],
        "缺少控制面/数据面边界或故障域证据。",
      ],
      [
        "多租户保护",
        ["配额", "公平", "backpressure"],
        "缺少配额、公平性或 backpressure 依据。",
      ],
      [
        "降级与副作用",
        ["fallback", "幂等"],
        "缺少 fallback 或幂等/去重证据；不能只写重试。",
      ],
      ["恢复目标", ["rpo", "rto"], "缺少可测的 RPO/RTO。"],
      [
        "恢复依据",
        ["时间", "恢复", "数据核对"],
        "缺少恢复依据：请提供演练时间线、恢复时长和数据核对结果。",
      ],
      ["容量风险余量", ["容量余量"], "缺少故障期间的容量风险余量。"],
    ],
  },
  {
    id: "day-14",
    topic: "架构答辩与 90 天路线：用证据守住决策",
    budget: [
      ["证据组装", 25],
      ["答辩与质询", 55],
      ["记录与验收", 30],
    ],
    objective:
      "把前 13 天的产出压缩成可质询的架构决策：模型与 runtime 为什么这样选、容量和成本如何推导、质量与故障如何归因，以及何时继续、降级或退出。",
    materials: [
      {
        title:
          "Google Cloud Architecture Framework：Architecture Decision Records",
        url: "https://cloud.google.com/architecture/architecture-decision-records",
        scope:
          "只读 ADR 的 context、options、decision、consequences；用于检查关键决定是否呈现备选项、证据和后果。",
      },
      {
        title: "Google SRE Workbook：Non-Abstract Large System Design",
        url: "https://sre.google/workbook/non-abstract-design/",
        scope:
          "只读需求、容量、冗余与故障分析方法；用于复核容量推导、故障余量和恢复路径。",
      },
      {
        title: "NIST AI RMF 1.0",
        url: "https://www.nist.gov/itl/ai-risk-management-framework",
        scope:
          "复核 Govern、Measure、Manage 的责任、测量和风险处置；用于质询权限、安全、残余风险与退出条件。",
      },
    ],
    practice: [
      "25 分钟：建立证据索引，把模型/revision、golden set、检索与推理 benchmark、SLO、容量公式、成本单价、攻击记录、权限图和恢复演练逐项链接到对应结论；未验证项显式标记 unknown。",
      "20 分钟：用峰值 QPS、输入/输出 token 分布、服务时间、并发、KV Cache、GPU 可用容量与故障余量推导副本数；列出单位任务和月成本的假设、公式、敏感性及预算上限。",
      "20 分钟：完成 30 分钟答辩中的核心陈述，覆盖模型/runtime 选择、质量归因树、身份/tenant/ACL 逐跳强制、威胁控制、故障降级/恢复/RPO/RTO，以及灰度、回滚和退出条件。",
      "15 分钟：列出至少 5 个明确 trade-off 和 3 个未验证假设；每个关键决定引用实验、指标或风险证据，没有证据则不得写成已确认事实。",
      "20 分钟：按价值、风险、依赖和可逆性排列 30/60/90 天优先级；为最高风险 unknown 定义下一步实验的假设、唯一变量、控制项、样本量、成功阈值、停止条件和负责人。",
      "10 分钟：模拟评审质询并记录反对意见、答复、决策变化和仍需人工签署的安全/业务风险。",
    ],
    output:
      "10–15 页架构决策简报及证据索引、模型选型 ADR、容量/成本推导表、质量归因树、权限/威胁与恢复附录、退出条件、5 个以上 trade-off、3 个以上 unknown，以及带实验门槛的 30/60/90 天路线图。",
    pass: "答辩覆盖模型选择、容量推导、质量归因、权限安全、故障恢复、成本、退出条件和 90 天优先级；每项关键决定均引用实验、指标或风险证据；至少 5 个 trade-off、3 个未验证假设和一个可执行下一步实验；浏览器只验证结构与关键证据词，外部材料仍须由资深架构师人工复核。",
    questions: [
      "为什么选择当前模型与 serving runtime？请用业务质量、延迟、成本、许可证/数据边界说明备选方案、trade-off 与退出条件。",
      "如何从峰值 QPS、token 分布、服务时间、KV Cache、单卡实测容量和故障余量推导副本数与成本？质量下降时如何按数据、检索、上下文、模型和工具归因？",
      "权限与安全如何逐跳执行，故障如何降级、恢复和回滚？未来 30/60/90 天为何这样排序，哪个 unknown 由什么下一步实验验证？",
    ],
    rationale:
      "判断依据：模型选择必须绑定真实业务质量、延迟、成本、许可证和数据边界，并保留可回滚备选。容量不是“QPS 除吞吐”的单点数字，而要由到达率、token 分布、服务时间、KV Cache、实测单卡容量、目标利用率和 N+1/故障余量共同推导。质量归因应沿数据→检索→上下文→模型→工具的 trace 分层。权限必须携带调用者身份并在检索与工具服务端强制执行。路线优先级由价值、风险、依赖和可逆性决定；unknown 只能由预注册阈值的实验转为结论。",
    followUp:
      "答辩不是自动认证。由安全、平台和业务负责人按证据索引签署或提出异议；未通过退出条件时暂停扩量，优先执行最高风险实验。",
    evidenceHint:
      "请定位决策简报/ADR、模型与 runtime 备选、benchmark、容量公式、成本表、质量归因树、权限/攻击证据、恢复演练、退出条件、5 个 trade-off、3 个 unknown 和下一步实验卡。",
    checks: [
      [
        "模型与 runtime 选择",
        ["模型", "runtime", "备选", "许可证"],
        "缺少模型/runtime 选择、备选方案或许可证/数据边界。",
      ],
      [
        "容量推导",
        ["qps", "token", "kv cache", "副本", "故障余量"],
        "容量推导不完整：需连接 QPS、token、KV Cache、实测副本容量和故障余量。",
      ],
      [
        "质量归因",
        ["数据", "检索", "上下文", "模型", "工具"],
        "缺少数据→检索→上下文→模型→工具的质量归因。",
      ],
      [
        "权限与安全",
        ["身份", "tenant", "acl", "攻击", "残余风险"],
        "缺少逐跳权限、安全攻击或残余风险证据。",
      ],
      [
        "恢复与退出",
        ["降级", "恢复", "rpo", "rto", "回滚", "退出条件"],
        "缺少故障降级、RPO/RTO、恢复/回滚或退出条件。",
      ],
      [
        "成本与优先级",
        ["成本", "30", "60", "90", "优先级"],
        "缺少可重算成本或 30/60/90 天优先级。",
      ],
      ["明确取舍", ["trade-off", "5"], "缺少至少 5 个明确 trade-off。"],
      [
        "未知与实验",
        ["unknown", "3", "下一步实验", "唯一变量", "阈值", "停止条件"],
        "缺少至少 3 个 unknown 或可执行的下一步实验门槛。",
      ],
      [
        "证据引用",
        ["benchmark", "指标", "风险", "证据"],
        "关键决策未引用 benchmark、指标或风险证据。",
      ],
    ],
  },
];
const reviewedDayById = Object.fromEntries(
  reviewedDays.map((day) => [day.id, day]),
);
const stateKey = "llm-learning-progress";
const stateVersion = 2;
const statusLabels = {
  "not-started": "未开始",
  "in-progress": "进行中",
  "pending-review": "待验收",
  "needs-revision": "需补充",
  passed: "已通过",
};
let learningState = { version: stateVersion, days: {} };
let migrationMessage = "";
let selectedWeek = 0;
let dialogReturnFocus = null;
const $ = (s) => document.querySelector(s);
function announce(message) {
  const region = $("#appAnnouncements");
  region.textContent = "";
  requestAnimationFrame(() => {
    region.textContent = message;
  });
}
function renderResources() {
  $("#resourceGrid").innerHTML = resources
    .map(
      (r, i) =>
        '<article class="resource-card" data-resource-id="' +
        r.id +
        '"><span class="resource-num">0' +
        (i + 1) +
        " / " +
        r.role.toUpperCase() +
        "</span><h3>" +
        r.name +
        "</h3><p>" +
        r.desc +
        '</p><div class="unit-count">' +
        r.units.length +
        ' 个可选学习单元</div><button class="resource-open" data-resource-id="' +
        r.id +
        '" aria-haspopup="dialog" aria-label="查看 ' +
        r.name +
        ' 的补充学习内容">查看补充学习内容 ↗</button></article>',
    )
    .join("");
  document
    .querySelectorAll(".resource-open")
    .forEach((b) => (b.onclick = () => openResource(b.dataset.resourceId, b)));
}
let directoryCategory = "全部";
function renderDirectory() {
  const query = ($("#resourceSearch")?.value || "").trim().toLowerCase();
  const list = directory.filter(
    (x) =>
      (directoryCategory === "全部" || x.cat === directoryCategory) &&
      (!query ||
        (x.name + x.org + x.desc + x.tags).toLowerCase().includes(query)),
  );
  $("#directoryGrid").innerHTML =
    list
      .map(
        (x) =>
          '<article class="directory-card"><div class="directory-meta"><span>' +
          x.cat +
          "</span><b>" +
          x.level +
          "</b></div><h3>" +
          x.name +
          '</h3><div class="directory-org">' +
          x.org +
          "</div><p>" +
          x.desc +
          '</p><a href="' +
          x.url +
          '" target="_blank" rel="noopener noreferrer" aria-label="打开 ' +
          x.name +
          '（新窗口）">打开补充资源 ↗</a></article>',
      )
      .join("") ||
    '<p class="empty-result">没有找到匹配资源，试试换一个关键词。</p>';
  if ($("#resultCount"))
    $("#resultCount").textContent =
      "显示 " + list.length + " / " + directory.length + " 条补充资源";
}
function initDirectory() {
  const cats = ["全部", ...new Set(directory.map((x) => x.cat))];
  $("#categoryFilters").innerHTML = cats
    .map(
      (x) =>
        '<button class="filter-btn ' +
        (x === "全部" ? "active" : "") +
        '" aria-pressed="' +
        (x === "全部") +
        '" data-cat="' +
        x +
        '">' +
        x +
        "</button>",
    )
    .join("");
  document.querySelectorAll("[data-cat]").forEach(
    (b) =>
      (b.onclick = () => {
        directoryCategory = b.dataset.cat;
        document.querySelectorAll("[data-cat]").forEach((x) => {
          x.classList.toggle("active", x === b);
          x.setAttribute("aria-pressed", x === b);
        });
        renderDirectory();
      }),
  );
  $("#resourceSearch").oninput = renderDirectory;
  renderDirectory();
}
function openResource(id, trigger) {
  const r = resources.find((resource) => resource.id === id);
  if (!r) return;
  dialogReturnFocus = trigger;
  $("#dialogContent").innerHTML =
    '<p class="kicker">补充路线 / ' +
    r.role.toUpperCase() +
    '</p><h2 id="detailDialogTitle">' +
    r.name +
    '</h2><p class="dialog-desc"><strong>可选拓展，不计入 14 天通过进度。</strong> ' +
    r.desc +
    "</p><h4>建议顺序与配套入口</h4><ol>" +
    r.units
      .map((unit) => {
        const unique = unit.links.filter(
          (link, index, all) =>
            all.findIndex((item) => item.url === link.url) === index,
        );
        return (
          '<li data-unit-id="' +
          unit.id +
          '"><div class="unit-title">' +
          unit.title +
          '</div><div class="unit-links">' +
          unique
            .map(
              (link) =>
                '<a class="unit-link" data-link-id="' +
                link.id +
                '" href="' +
                link.url +
                '" target="_blank" rel="noopener noreferrer">' +
                link.label +
                " ↗</a>",
            )
            .join("") +
          "</div></li>"
        );
      })
      .join("") +
    '</ol><div class="dialog-output"><span>建议验收产出</span><p>' +
    r.output +
    '</p></div><a class="primary-btn" href="' +
    r.url +
    '" target="_blank" rel="noopener noreferrer">打开资源主页 ↗</a>';
  $("#detailDialog").showModal();
  $("#closeDialog").focus();
}
function blankDayState() {
  return {
    status: "not-started",
    answers: ["", "", ""],
    evidence: "",
    tradeoffs: "",
    unknowns: "",
    experiment: {
      variable: "",
      controls: "",
      sampleSize: "",
      threshold: "",
      stopCondition: "",
    },
    declaration: false,
    feedback: [],
  };
}
function normalizeDayState(value) {
  const base = blankDayState();
  if (!value || typeof value !== "object") return base;
  return {
    status: Object.hasOwn(statusLabels, value.status)
      ? value.status
      : base.status,
    answers: Array.from({ length: 3 }, (_, i) =>
      typeof value.answers?.[i] === "string" ? value.answers[i] : "",
    ),
    evidence: typeof value.evidence === "string" ? value.evidence : "",
    tradeoffs: typeof value.tradeoffs === "string" ? value.tradeoffs : "",
    unknowns: typeof value.unknowns === "string" ? value.unknowns : "",
    experiment: Object.fromEntries(
      Object.keys(base.experiment).map((key) => [
        key,
        typeof value.experiment?.[key] === "string"
          ? value.experiment[key]
          : "",
      ]),
    ),
    declaration: value.declaration === true,
    feedback: Array.isArray(value.feedback)
      ? value.feedback.filter((x) => typeof x === "string")
      : [],
  };
}
function loadProgress() {
  try {
    const raw = localStorage.getItem(stateKey);
    if (!raw) return { version: stateVersion, days: {} };
    const value = JSON.parse(raw);
    if (Array.isArray(value)) {
      migrationMessage =
        "检测到旧版完成记录；旧数据没有答案和证据，无法证明通过，已安全重置。";
      const reset = { version: stateVersion, days: {} };
      localStorage.setItem(stateKey, JSON.stringify(reset));
      return reset;
    }
    if (
      value &&
      value.version === stateVersion &&
      value.days &&
      typeof value.days === "object"
    ) {
      return {
        version: stateVersion,
        days: Object.fromEntries(
          Object.entries(value.days).map(([id, day]) => [
            id,
            normalizeDayState(day),
          ]),
        ),
      };
    }
    migrationMessage =
      "检测到无法识别的学习记录，已安全重置，避免产生错误进度。";
  } catch {
    migrationMessage = "学习记录已损坏，已安全重置。";
  }
  const reset = { version: stateVersion, days: {} };
  try {
    localStorage.setItem(stateKey, JSON.stringify(reset));
  } catch {}
  return reset;
}
function saveProgress() {
  try {
    localStorage.setItem(stateKey, JSON.stringify(learningState));
  } catch {}
}
function currentDayState(dayId) {
  return normalizeDayState(learningState.days[dayId]);
}
function hasWork(day) {
  return (
    day.declaration ||
    day.evidence.trim() ||
    day.tradeoffs.trim() ||
    day.unknowns.trim() ||
    Object.values(day.experiment).some((x) => x.trim()) ||
    day.answers.some((x) => x.trim())
  );
}
function persistReviewedDay(form, definition) {
  const data = new FormData(form),
    day = currentDayState(definition.id);
  day.answers = definition.questions.map((_, i) =>
    String(data.get("answer-" + i) || ""),
  );
  day.evidence = String(data.get("evidence") || "");
  day.tradeoffs = String(data.get("tradeoffs") || "");
  day.unknowns = String(data.get("unknowns") || "");
  Object.keys(day.experiment).forEach((key) => {
    day.experiment[key] = String(data.get("experiment-" + key) || "");
  });
  day.declaration = data.get("declaration") === "on";
  day.status = hasWork(day) ? "in-progress" : "not-started";
  day.feedback = [];
  learningState.days[definition.id] = day;
  saveProgress();
}
function includesAny(text, terms) {
  return terms.some((term) => text.includes(term));
}
function looksLikeMeaningfulResponse(value) {
  const text = value.trim(),
    terms = text
      .toLowerCase()
      .split(/[\s，。；：、,.!?/()]+/)
      .filter(Boolean);
  return (
    text.length >= 20 && /[，。；：,.!?]/.test(text) && new Set(terms).size >= 3
  );
}
function structuredLines(value) {
  return value
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*(?:[-*]|\d+[.)、：:]?)\s*/, "").trim())
    .filter(Boolean);
}
function validateDayFourteen(day, feedback) {
  const tradeoffs = structuredLines(day.tradeoffs),
    unknowns = structuredLines(day.unknowns);
  if (tradeoffs.length !== 5)
    feedback.push("请分别填写恰好 5 个明确取舍，每行一个。");
  tradeoffs.forEach((item, index) => {
    if (
      item.length < 24 ||
      !includesAny(item, ["但", "代价", "成本", "风险", "降低", "增加", "牺牲"])
    )
      feedback.push("第 " + (index + 1) + " 个取舍缺少具体选择、收益与代价。");
  });
  if (new Set(tradeoffs.map((x) => x.toLowerCase())).size !== tradeoffs.length)
    feedback.push("5 个取舍必须互不重复。");
  if (unknowns.length !== 3)
    feedback.push("请分别填写恰好 3 个未验证假设，每行一个。");
  unknowns.forEach((item, index) => {
    if (
      item.length < 20 ||
      !includesAny(item.toLowerCase(), [
        "假设",
        "尚",
        "未验证",
        "待验证",
        "需要验证",
        "缺",
      ])
    )
      feedback.push("第 " + (index + 1) + " 个未验证假设缺少可核验陈述。");
  });
  if (new Set(unknowns.map((x) => x.toLowerCase())).size !== unknowns.length)
    feedback.push("3 个未验证假设必须互不重复。");
  const requirements = {
    variable: ["唯一变量描述不足", 18],
    controls: ["控制项描述不足", 18],
    sampleSize: ["样本量必须是明确的正整数", 1],
    threshold: ["成功阈值描述不足", 10],
    stopCondition: ["停止条件描述不足", 10],
  };
  Object.entries(requirements).forEach(([key, [label, min]]) => {
    const value = day.experiment[key].trim();
    if (key === "sampleSize" ? !/(?:[1-9]\d*)/.test(value) : value.length < min)
      feedback.push("下一步实验的" + label + "。");
  });
}
function validateReviewedDay(day, definition) {
  const feedback = [];
  day.answers.forEach((answer, i) => {
    if (!answer.trim()) feedback.push("问题 " + (i + 1) + " 尚未回答。");
    else if (answer.trim().length < 20)
      feedback.push("问题 " + (i + 1) + "回答过于简略，请说明判断依据。");
    else if (!looksLikeMeaningfulResponse(answer))
      feedback.push(
        "问题 " + (i + 1) + " 像关键词清单，请用完整陈述说明判断与依据。",
      );
  });
  if (
    new Set(day.answers.map((x) => x.trim().toLowerCase()).filter(Boolean))
      .size !== day.answers.filter((x) => x.trim()).length
  )
    feedback.push("每个问题需要分别作答，不能重复同一段内容。");
  if (day.evidence.trim().length < (definition.evidenceLabel ? 80 : 30))
    feedback.push(
      (definition.evidenceLabel || "产出") +
        "证据摘要不足：" +
        definition.evidenceHint,
    );
  if (
    day.evidence.trim() &&
    !/(?:\w+\.(?:md|csv|json|py|xlsx)|adr[- ]?\d+|run[- ]?\d+|trace|日志|报告|表|图|记录|脚本)/i.test(
      day.evidence,
    )
  )
    feedback.push(
      "证据摘要需要定位具体产物、记录或运行结果，并说明它支持的结论。",
    );
  if (!day.declaration) feedback.push("尚未确认外部产出已真实完成。");
  const combined = (
    day.answers.join(" ") +
    " " +
    day.evidence +
    " " +
    day.tradeoffs +
    " " +
    day.unknowns +
    " " +
    Object.values(day.experiment).join(" ")
  ).toLowerCase();
  if (definition.evidenceLabel) {
    const evidence = day.evidence.toLowerCase(),
      required = [
        [
          "模型与 revision",
          [
            ["模型", "model"],
            ["revision", "版本"],
          ],
        ],
        [
          "硬件与驱动",
          [
            ["硬件", "gpu"],
            ["驱动", "driver"],
          ],
        ],
        [
          "runtime 与版本",
          [
            ["runtime", "运行时"],
            ["版本", "version"],
          ],
        ],
        [
          "量化格式或精度",
          [["量化", "awq", "gptq", "int8", "int4", "bf16", "fp16"]],
        ],
        ["输入/输出分布", [["输入"], ["输出"]]],
        ["并发或到达率", [["并发", "到达率"]]],
        ["样本量", [["样本", "请求数"]]],
        ["统计口径", [["p95"], ["nearest", "百分位", "percentile", "插值"]]],
      ];
    required.forEach(([label, groups]) => {
      if (!groups.every((terms) => includesAny(evidence, terms)))
        feedback.push("证据摘要缺少" + label + "。");
    });
    if (!/(?:样本量|请求数)[^。；;\d]{0,12}(?:[3-9]\d|\d{3,})/.test(evidence))
      feedback.push(
        "样本量不足或不可判定：请明确至少 30 个成功请求；更小样本只能标为冒烟结果。",
      );
  }
  const checks =
    definition.id === "day-14"
      ? definition.checks.slice(0, 6)
      : definition.checks;
  checks.forEach(([label, terms, message]) => {
    if (!terms.every((term) => combined.includes(term.toLowerCase())))
      feedback.push(message || "缺少“" + label + "”的必要证据或关键概念。");
  });
  if (definition.id === "day-14") validateDayFourteen(day, feedback);
  return feedback;
}
function reviewDay(form, definition) {
  persistReviewedDay(form, definition);
  const day = currentDayState(definition.id);
  day.status = "pending-review";
  learningState.days[definition.id] = day;
  saveProgress();
  const feedback = validateReviewedDay(day, definition);
  day.feedback = feedback;
  day.status = feedback.length ? "needs-revision" : "passed";
  learningState.days[definition.id] = day;
  saveProgress();
  renderDays();
  updateProgress();
  const result = document.getElementById(definition.id + "-result");
  result?.focus();
  const label = "Day " + Number(definition.id.slice(-2));
  announce(
    feedback.length
      ? label + " 验收未通过，需要补充 " + feedback.length + " 项。"
      : label + " 验收已通过。",
  );
}
function updateReviewedDayStatus(dayId, day = currentDayState(dayId)) {
  const badge = $("#" + dayId + "-status");
  if (!badge) return;
  const previous = badge.dataset.status;
  badge.textContent = statusLabels[day.status];
  badge.dataset.status = day.status;
  if (previous && previous !== day.status)
    announce(
      "Day " +
        Number(dayId.slice(-2)) +
        " 状态更新为" +
        statusLabels[day.status],
    );
}
function renderReviewedDay(definition, index) {
  const day = currentDayState(definition.id),
    number = String(index + 1).padStart(2, "0"),
    label = "Day " + (index + 1),
    prefixed = index >= 10,
    total = definition.budget.reduce((sum, item) => sum + item[1], 0),
    evidenceLabel = definition.evidenceLabel || "产出证据摘要",
    materialsLabel =
      index === 0 ? "每日核心材料与阅读范围" : "精简权威材料与阅读范围",
    submitLabel =
      day.status === "passed"
        ? "重新提交 " + label + " 验收"
        : day.status === "needs-revision"
          ? "补充后重新提交 " + label + " 验收"
          : "提交 " + label + " 验收",
    dayFourteen =
      definition.id === "day-14"
        ? '<fieldset><legend>结构化架构决策</legend><label for="day-14-tradeoffs">5 个明确取舍（每行一个）</label><textarea id="day-14-tradeoffs" name="tradeoffs" aria-label="5 个明确取舍（每行一个）">' +
          escapeHtml(day.tradeoffs) +
          '</textarea><label for="day-14-unknowns">3 个未验证假设（每行一个）</label><textarea id="day-14-unknowns" name="unknowns" aria-label="3 个未验证假设（每行一个）">' +
          escapeHtml(day.unknowns) +
          "</textarea>" +
          [
            ["variable", "唯一变量"],
            ["controls", "控制项"],
            ["sampleSize", "样本量"],
            ["threshold", "成功阈值"],
            ["stopCondition", "停止条件"],
          ]
            .map(
              ([key, text]) =>
                '<label for="day-14-experiment-' +
                key +
                '">下一步实验：' +
                text +
                '</label><input id="day-14-experiment-' +
                key +
                '" name="experiment-' +
                key +
                '" aria-label="下一步实验：' +
                text +
                '" value="' +
                escapeHtml(day.experiment[key]) +
                '">',
            )
            .join("") +
          "</fieldset>"
        : "";
  return (
    '<article class="day-item day-detail" aria-label="DAY ' +
    number +
    " " +
    definition.topic +
    '"><header class="day-head"><div><span class="day-num">DAY ' +
    number +
    " · ID: " +
    definition.id +
    "</span><h3>" +
    definition.topic +
    '</h3></div><span id="' +
    definition.id +
    '-status" class="status-badge" data-status="' +
    day.status +
    '" role="status" aria-live="polite" aria-atomic="true">' +
    statusLabels[day.status] +
    '</span></header><div class="budget-row" aria-label="时间预算，共 ' +
    total +
    ' 分钟">' +
    definition.budget
      .map(
        (x) => "<span>" + x[0] + " <strong>" + x[1] + " 分钟</strong></span>",
      )
      .join("") +
    '</div><section class="day-block"><b>学习目标</b><p>' +
    definition.objective +
    '</p></section><section class="day-block"><b>' +
    materialsLabel +
    '</b><p class="core-note">以下材料属于今天的 14 天主线；补充资源目录不计入通过要求。</p><ul class="material-list">' +
    definition.materials
      .map(
        (x) =>
          '<li><a href="' +
          x.url +
          '" target="_blank" rel="noopener noreferrer">' +
          x.title +
          " ↗</a><p>" +
          x.scope +
          "</p></li>",
      )
      .join("") +
    '</ul></section><section class="day-block"><b>实践步骤</b><ol>' +
    definition.practice.map((x) => "<li>" + x + "</li>").join("") +
    '</ol></section><section class="day-block"><b>可观察产出</b><p>' +
    definition.output +
    '</p></section><section class="day-pass"><b>通过标准</b><p>' +
    definition.pass +
    '</p></section><section class="day-exam"><div class="exam-heading"><span>检验与验收</span><em>' +
    definition.questions.length +
    ' 题</em></div><form id="' +
    definition.id +
    '-form" data-reviewed-day="' +
    definition.id +
    '"><fieldset><legend>回答检验问题</legend>' +
    definition.questions
      .map(
        (q, i) =>
          '<label for="' +
          definition.id +
          "-answer-" +
          i +
          '">' +
          (i + 1) +
          ". " +
          q +
          '</label><textarea id="' +
          definition.id +
          "-answer-" +
          i +
          '" name="answer-' +
          i +
          '" aria-label="' +
          (prefixed ? label + " " : "") +
          "问题 " +
          (i + 1) +
          ' 的回答">' +
          escapeHtml(day.answers[i]) +
          "</textarea>",
      )
      .join("") +
    '</fieldset><label for="' +
    definition.id +
    '-evidence">' +
    evidenceLabel +
    " <small>" +
    (definition.evidenceLabel
      ? definition.evidenceHint
      : "这是学习者的诚实声明；浏览器不能独立验证外部文件。") +
    '</small></label><textarea id="' +
    definition.id +
    '-evidence" name="evidence" aria-label="' +
    (prefixed ? label + " " : "") +
    evidenceLabel +
    '">' +
    escapeHtml(day.evidence) +
    "</textarea>" +
    dayFourteen +
    '<label class="declaration"><input type="checkbox" name="declaration" ' +
    (day.declaration ? "checked" : "") +
    '> 我确认已完成上述外部产出，证据摘要真实可供人工复核。</label><button class="review-btn" type="submit">' +
    submitLabel +
    "</button></form>" +
    (day.feedback.length
      ? '<div id="' +
        definition.id +
        '-result" class="review-feedback" tabindex="-1" role="alert"><strong>需补充以下内容</strong><ul aria-label="' +
        label +
        ' 验收反馈">' +
        day.feedback.map((x) => "<li>" + x + "</li>").join("") +
        "</ul></div>"
      : day.status === "passed"
        ? '<p id="' +
          definition.id +
          '-result" class="review-success" tabindex="-1" role="status">' +
          label +
          " 已通过确定性完整性检查。外部产物质量仍应由学习者或人工评审复核。</p>"
        : "") +
    '<details class="answer-rationale"><summary>查看参考答案与判断依据</summary><p>' +
    definition.rationale +
    '</p></details><div class="day-follow-up"><b>后续延伸</b><p>' +
    definition.followUp +
    "</p></div></section></article>"
  );
}
function escapeHtml(value) {
  return value.replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
}
function renderStandardDay(d, num) {
  const detail = dayDetails[num],
    exam = dayExams[num],
    status =
      learningState.days["day-" + String(num + 1).padStart(2, "0")]?.status ||
      "not-started";
  return (
    '<article class="day-item day-summary" aria-label="DAY ' +
    String(num + 1).padStart(2, "0") +
    " " +
    d[0].replace(/^Day \d+ · /, "") +
    '"><div class="day-head"><span class="day-num">DAY ' +
    String(num + 1).padStart(2, "0") +
    '</span><span class="status-badge" data-status="' +
    status +
    '">' +
    statusLabels[status] +
    '</span></div><div class="day-main"><h3>' +
    d[0].replace(/^Day \d+ · /, "") +
    '</h3><div class="day-block"><b>学习目标</b><p>' +
    detail.goal +
    '</p></div><div class="day-block"><b>具体材料</b><div class="day-links">' +
    detail.read
      .map(
        (link) =>
          '<a href="' +
          link[1] +
          '" target="_blank" rel="noopener noreferrer">' +
          link[0] +
          " ↗</a>",
      )
      .join("") +
    '</div></div><div class="day-block"><b>动手步骤</b><p>' +
    detail.do +
    '</p></div><div class="day-block"><b>当天产出</b><p>' +
    detail.output +
    '</p></div><div class="day-pass"><b>通过标准</b><p>' +
    detail.pass +
    '</p></div><div class="day-exam"><div class="exam-heading"><span>当天考试</span><em>' +
    exam.questions.length +
    " 题</em></div><ol>" +
    exam.questions.map((q) => "<li>" + q + "</li>").join("") +
    "</ol><details><summary>查看参考答案方向</summary><p>" +
    exam.answer +
    "</p></details></div></div></article>"
  );
}
function updateProgress() {
  const n = Array.from(
    { length: 14 },
    (_, i) => "day-" + String(i + 1).padStart(2, "0"),
  ).filter((id) => learningState.days[id]?.status === "passed").length;
  $("#progressPercent").textContent = Math.round((n / 14) * 100) + "%";
  $("#progressBar").style.width = (n / 14) * 100 + "%";
  $("#progressLabel").textContent = n + " / 14 天通过";
}
function renderDays() {
  const start = selectedWeek * 7,
    w = weeks[selectedWeek];
  $("#weekBrief").innerHTML =
    '<div><span class="week-tag">' +
    w[0] +
    "</span><strong>" +
    w[1] +
    '</strong><span class="week-resource">主线：' +
    w[2] +
    "</span></div><p>" +
    w[3] +
    "</p>";
  $("#dayList").innerHTML = days
    .slice(start, start + 7)
    .map((d, i) =>
      reviewedDayById["day-" + String(start + i + 1).padStart(2, "0")]
        ? renderReviewedDay(
            reviewedDayById["day-" + String(start + i + 1).padStart(2, "0")],
            start + i,
          )
        : renderStandardDay(d, start + i),
    )
    .join("");
  document.querySelectorAll("[data-reviewed-day]").forEach((form) => {
    const definition = reviewedDayById[form.dataset.reviewedDay];
    form.addEventListener("input", () => {
      persistReviewedDay(form, definition);
      const badge = document.getElementById(definition.id + "-status");
      if (badge && badge.dataset.status !== "in-progress") {
        badge.dataset.status = "in-progress";
        badge.textContent = statusLabels["in-progress"];
      }
    });
    form.addEventListener("change", () => persistReviewedDay(form, definition));
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      reviewDay(form, definition);
    });
  });
}
function init() {
  learningState = loadProgress();
  if (migrationMessage) {
    $("#migrationNotice").hidden = false;
    $("#migrationNotice").textContent = migrationMessage;
  }
  renderResources();
  initDirectory();
  $("#weekFilters").innerHTML = Array.from(
    { length: 2 },
    (_, i) =>
      '<button class="filter-btn ' +
      (i === 0 ? "active" : "") +
      '" aria-pressed="' +
      (i === 0) +
      '" data-week="' +
      i +
      '">第 ' +
      (i + 1) +
      " 周</button>",
  ).join("");
  document.querySelectorAll("[data-week]").forEach(
    (b) =>
      (b.onclick = () => {
        selectedWeek = Number(b.dataset.week);
        document.querySelectorAll("[data-week]").forEach((x) => {
          x.classList.toggle("active", x === b);
          x.setAttribute("aria-pressed", x === b);
        });
        renderDays();
      }),
  );
  renderDays();
  updateProgress();
  const detailDialog = $("#detailDialog");
  $("#closeDialog").onclick = () => detailDialog.close();
  detailDialog.addEventListener("click", (e) => {
    if (e.target === detailDialog) detailDialog.close();
  });
  detailDialog.addEventListener("close", () => {
    dialogReturnFocus?.focus();
    dialogReturnFocus = null;
  });
  const resetDialog = $("#resetDialog"),
    resetButton = $("#resetProgress");
  resetButton.onclick = () => {
    dialogReturnFocus = resetButton;
    resetDialog.showModal();
    $("#cancelReset").focus();
  };
  $("#cancelReset").onclick = () => resetDialog.close();
  $("#confirmReset").onclick = () => {
    learningState = { version: stateVersion, days: {} };
    saveProgress();
    renderDays();
    updateProgress();
    resetDialog.close();
    announce("全部学习进度已重置。");
  };
  resetDialog.addEventListener("click", (event) => {
    if (event.target === resetDialog) resetDialog.close();
  });
  resetDialog.addEventListener("close", () => {
    dialogReturnFocus?.focus();
    dialogReturnFocus = null;
  });
  $("#copyTemplate").onclick = async () => {
    const text =
      "日期：\n学习目标：\n输入资源：\n代码/实验：\n关键数据：\n架构结论：\n未解决问题：\n明日动作：";
    try {
      await navigator.clipboard.writeText(text);
      $("#copyTemplate").textContent = "已复制 ✓";
      announce("记录模板已复制");
    } catch {
      $("#copyTemplate").textContent = "复制失败，请手动复制";
      announce("复制失败，请手动复制");
      setTimeout(() => window.prompt("请复制记录模板", text), 100);
    }
    setTimeout(() => ($("#copyTemplate").textContent = "复制记录模板"), 1800);
  };
  const links = document.querySelectorAll(".nav-link");
  const observer = new IntersectionObserver(
    (es) =>
      es.forEach((e) => {
        if (e.isIntersecting)
          links.forEach((l) => {
            l.classList.toggle("active", l.dataset.section === e.target.id);
            if (l.dataset.section === e.target.id)
              l.setAttribute("aria-current", "location");
            else l.removeAttribute("aria-current");
          });
      }),
    { rootMargin: "-35% 0px -55% 0px" },
  );
  document.querySelectorAll("section[id]").forEach((s) => observer.observe(s));
}
init();
