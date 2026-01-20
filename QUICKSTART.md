# 🚀 快速开始指南

## 5 分钟快速体验

### 第一步：克隆并进入项目
```bash
cd /home/jack/ZRJ
```

### 第二步：配置 API Keys

1. 复制环境变量模板：
```bash
cp backend/env_template.txt backend/.env
```

2. 编辑 `.env` 文件，填入您的密钥：
```bash
nano backend/.env
```

内容示例：
```
OPENAI_API_KEY=sk-proj-xxx...
GOOGLE_API_KEY=AIzaSyxxx...
```

保存并退出（Ctrl+X, Y, Enter）

### 第三步：一键启动

```bash
./start.sh
```

脚本会自动：
- ✅ 创建 Python 虚拟环境
- ✅ 安装所有后端依赖
- ✅ 安装所有前端依赖
- ✅ 启动后端服务（端口 8000）
- ✅ 启动前端应用（端口 3000）

### 第四步：开始使用

1. 浏览器会自动打开 `http://localhost:3000`
2. 点击「📄 上传演讲稿」，选择 `sample_script.txt`（项目根目录）
3. 点击「🎙️ 开始演讲」，允许麦克风权限
4. 开始朗读稿件，观察实时追踪效果！

---

## 手动启动（如果脚本失败）

### 后端启动
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 前端启动（新终端）
```bash
cd frontend
npm install
npm start
```

---

## 测试功能

### 1. 测试正常跟读
朗读 `sample_script.txt` 的前几句，观察：
- ✅ UI 自动滚动
- ✅ 当前句子高亮（蓝色）
- ✅ 已读句子变绿

### 2. 测试跳读检测
直接跳到稿件中间的某一句，观察：
- ✅ UI 立即跳转
- ✅ 中间跳过的句子变红

### 3. 测试 Free Style
说一些稿件中没有的内容，观察：
- ✅ 屏幕变暗黄色
- ✅ 顶部显示 "Free Style Mode"

### 4. 测试 Q&A
1. 点击「💬 Q&A 助手」
2. 输入问题（例如："AI 在教育中有什么局限性？"）
3. 点击「获取回答建议」
4. 观察 AI 的回答，并注意如果问题涉及跳过的内容，会有 ⚠️ 提示

---

## 常见问题

### 麦克风不工作
- 使用 Chrome 或 Edge 浏览器
- 检查浏览器权限设置
- 确保没有其他应用占用麦克风

### 后端启动失败
```bash
# 检查端口占用
lsof -i :8000
# 如果被占用，杀死进程或换端口
```

### 前端启动失败
```bash
# 清除缓存重试
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### API Key 错误
- 确保 `.env` 文件在 `backend/` 目录下
- 检查 Key 格式是否正确（无多余空格）
- 验证 API 配额是否用尽

---

## 下一步

- 📖 阅读完整 [README.md](README.md) 了解详细功能
- 🛠️ 自定义阈值参数（`backend/tracker.py`）
- 🎨 修改 UI 样式（`frontend/src/App.css`）
- 📊 上传自己的 PPT 测试多模态分析

---

**祝您使用愉快！如有问题，请查阅 README.md 或提 Issue。**

