# 🎤 Smart Teleprompter - AI 智能提词器

> 基于语音识别（STT）和大语言模型（LLM）的智能演讲助手，专为大学生课堂 Presentation 设计。

## 核心功能

### 1. 非线性进度追踪（Real-time Tracking）
- ✅ **语义匹配**：使用多语言向量模型（支持中英文混合），即使口语化表达也能精准定位
- ✅ **自动滚动**：实时跟随您的演讲进度，自动滚动到当前句子
- ✅ **状态可视化**：
  - 🟢 已讲内容标记为绿色
  - 🔴 跳过内容标记为红色
  - 🔵 当前正在讲的内容高亮显示
- ✅ **跳读检测**：智能检测跨段落跳读，自动标记中间跳过的内容
- ✅ **Free Style 模式**：脱稿时自动暂停追踪并提示

### 2. 上下文感知问答（Context-aware Q&A）
- ✅ **状态注入**：AI 清楚知道哪些内容已讲、哪些被跳过
- ✅ **智能提醒**：如果教授提问涉及被跳过的内容，AI 会明确提示您补充
- ✅ **多模态理解**：使用 Gemini 深度分析 PPT（包括图表、图片），作为问答背景

### 3. 用户体验优化
- ✅ 平滑追踪（避免频繁跳动）
- ✅ 实时进度条显示
- ✅ 优雅的错误处理和加载提示
- ✅ 现代化 UI 设计（渐变背景、流畅动画）

## 技术架构

### 后端（Python + FastAPI）
- **文本处理**：智能中英文分句，多语言向量化（Sentence-Transformers）
- **实时追踪**：余弦相似度匹配 + 状态机管理
- **多模态分析**：Gemini API 深度理解 PPT 内容
- **问答引擎**：OpenAI GPT-4o-mini + 动态 Prompt 构建

### 前端（React）
- **语音识别**：Web Speech API（浏览器原生 STT）
- **实时通信**：WebSocket 双向流式传输
- **UI 交互**：自动滚动、状态渲染、动画效果

## 快速开始

### 1. 环境准备

**系统要求：**
- Python 3.8+
- Node.js 16+
- Chrome 或 Edge 浏览器（语音识别支持）

**获取 API Keys：**
- [OpenAI API Key](https://platform.openai.com/api-keys)（用于问答功能）
- [Google Gemini API Key](https://ai.google.dev/)（用于 PPT 分析）

### 2. 后端启动

```bash
cd backend

# 创建虚拟环境
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp env_template.txt .env
# 编辑 .env 文件，填入您的 API Keys

# 启动后端服务
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

后端将运行在 `http://localhost:8000`

### 3. 前端启动

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm start
```

前端将运行在 `http://localhost:3000`

## 使用流程

### 📝 第一步：准备材料
1. 准备您的演讲稿（`.txt` 格式）
2. 准备您的 PPT（转换为 `.pdf` 格式）

### 🚀 第二步：上传内容
1. 点击「上传演讲稿」按钮，选择您的稿件
2. 点击「上传 PPT (PDF)」按钮，选择您的演示文稿
3. 等待系统处理（稿件会被智能分句并向量化）

### 🎙️ 第三步：开始演讲
1. 点击「开始演讲」按钮
2. 浏览器会请求麦克风权限，请允许
3. 开始讲话，系统会实时追踪您的进度
4. 屏幕会自动滚动到当前句子，并高亮显示

### 💬 第四步：问答环节
1. 演讲结束后，点击「Q&A 助手」按钮
2. 在文本框中输入教授的问题
3. 点击「获取回答建议」，AI 会结合您的演讲状态给出建议
4. 如果问题涉及跳过的内容，AI 会用 ⚠️ 明确提示

## 核心逻辑说明

### 追踪算法
```
1. 实时语音 → STT → 文本片段
2. 文本片段 → 向量化
3. 计算与所有段落的余弦相似度
4. 判断逻辑：
   - 相似度 > 0.75 → 匹配成功，滚动到该段
   - 相似度 < 0.25 且连续 3 次 → 进入 Free Style 模式
   - 检测到跳读 → 自动标记中间段落为 Skipped (Red)
```

### 问答 Prompt 构建
```
Context:
- 已讲内容列表（COVERED）
- 跳过内容列表（SKIPPED）← 重点
- 未讲内容列表（PENDING）
- PPT 背景信息（Gemini 提取）

Critical Constraint:
如果问题涉及 [SKIPPED] 内容，必须提示用户补充
```

## 项目结构

```
ZRJ/
├── backend/
│   ├── main.py              # FastAPI 主应用
│   ├── models.py            # 数据模型定义
│   ├── processor.py         # 文本处理与向量化
│   ├── tracker.py           # 追踪核心逻辑
│   ├── requirements.txt     # Python 依赖
│   └── env_template.txt     # 环境变量模板
├── frontend/
│   ├── src/
│   │   ├── App.js           # React 主组件
│   │   ├── App.css          # 样式文件
│   │   └── index.js         # 入口文件
│   ├── public/
│   │   └── index.html       # HTML 模板
│   └── package.json         # Node.js 依赖
└── README.md                # 本文件
```

## 常见问题

### Q1: 语音识别不工作？
**A:** 确保您使用的是 Chrome 或 Edge 浏览器，并且已授权麦克风权限。Safari 对 Web Speech API 支持有限。

### Q2: 追踪不准确怎么办？
**A:** 可能原因：
- 环境噪音过大
- 语速过快或过慢
- 稿件内容与实际表达差异过大

**解决方案**：
- 调整 `backend/tracker.py` 中的阈值（`threshold_high` 和 `threshold_low`）
- 使用更接近口语的稿件

### Q3: PPT 分析失败？
**A:** 确保：
- PDF 文件格式正确
- 已正确配置 `GOOGLE_API_KEY`
- Gemini API 配额充足

### Q4: 支持哪些语言？
**A:** 当前支持中英文混合演讲。如需其他语言，请修改：
- `frontend/src/App.js` 中的 `recognition.current.lang` 参数
- 向量模型保持 `paraphrase-multilingual-MiniLM-L12-v2` 即可

## 性能优化建议

1. **首次加载优化**：预加载向量模型（约 200MB）
2. **追踪延迟优化**：使用 GPU 加速向量计算
3. **网络优化**：部署时使用 Redis 缓存演讲状态

## 未来功能规划

- [ ] 支持离线模式（本地 Whisper）
- [ ] PPT 自动翻页联动
- [ ] 演讲复盘功能（生成分析报告）
- [ ] 多人协同演讲支持
- [ ] 移动端 App（iOS/Android）

## 开源协议

MIT License

## 联系方式

如有问题或建议，欢迎提 Issue 或 PR！

---

**祝您演讲顺利！🎉**

