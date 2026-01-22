# 🔑 Gemini API Key 获取教程

## 📋 前置要求

- ✅ 一个 Google 账号（Gmail）
- ✅ 能够访问 Google 服务（可能需要科学上网）
- ✅ 浏览器（Chrome、Firefox、Safari 等）

---

## 🚀 获取步骤（5分钟）

### 第 1 步：访问 Google AI Studio

**打开浏览器，访问以下任一网址：**

🔗 **主页：** https://aistudio.google.com/

🔗 **API Key 页面（推荐直达）：** https://aistudio.google.com/app/apikey

---

### 第 2 步：登录 Google 账号

1. **如果未登录**
   - 点击页面上的 **"Get started"** 或 **"Sign in"**
   - 使用你的 Google 账号登录

2. **如果已登录其他账号**
   - 点击右上角头像
   - 选择 **"Sign out"**（退出）
   - 重新登录你自己的账号

---

### 第 3 步：创建 API Key

#### 界面说明：

登录后，你会看到左侧菜单栏，点击 **"Get API key"**

或者已经在 API Key 页面了（如果你用的是直达链接）

#### 创建步骤：

1. **点击蓝色按钮：**
   ```
   + Create API key
   ```

2. **选择项目：**
   
   会弹出一个对话框，选择以下之一：
   
   - **✅ "Create API key in new project"**（推荐）
     - 在新项目中创建
     - 适合第一次使用
   
   - 或 **"Select existing project"**
     - 选择已有的 Google Cloud 项目
     - 如果你有其他 Google Cloud 项目

3. **等待生成**
   
   几秒钟后，会显示你的 API Key

4. **复制 API Key**
   
   会看到类似这样的内容：
   
   ```
   AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
   
   - 长度：39 个字符
   - 格式：以 `AIzaSy` 开头
   
   点击右侧的 **"Copy"** 图标复制

---

### 第 4 步：保存 API Key

⚠️ **重要：妥善保管你的 API Key！**

虽然可以随时在 Google AI Studio 查看，但建议：

1. **保存到安全的地方**（密码管理器、笔记应用）
2. **不要分享给他人**
3. **不要上传到公开的 GitHub 仓库**

---

## 🧪 第 5 步：测试 API Key（可选）

### 方法 A：使用测试脚本（自动）

在终端运行：

```bash
cd /home/jack/ZRJ
./测试API_Key.sh
```

按提示输入你的 API Key，脚本会自动测试。

### 方法 B：网页测试（手动）

1. 访问：https://aistudio.google.com/app/prompts/new_chat

2. 输入任意问题（比如："Hello"）

3. 点击 **"Run"**

4. 如果能看到回复，说明 API 可用 ✅

### 方法 C：命令行测试（高级）

```bash
curl -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=你的API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "contents": [{
      "parts": [{
        "text": "Hello"
      }]
    }]
  }'
```

如果返回 JSON 响应并包含 `"text"` 字段，说明 API 有效 ✅

---

## 🎯 第 6 步：更新到项目

### 方法 A：使用更新脚本（推荐）

```bash
cd /home/jack/ZRJ
./更新API_Key.sh
```

按提示输入你的新 API Key。

### 方法 B：手动更新

#### 本地开发：

编辑 `backend/.env` 文件：

```bash
cd /home/jack/ZRJ/backend
nano .env
```

内容：

```env
GOOGLE_API_KEY=你的API_KEY
```

#### Railway 部署：

1. 访问：https://railway.app
2. 进入你的项目
3. 点击 **Variables** 标签
4. 找到或添加：`GOOGLE_API_KEY`
5. 值：你的 API Key
6. 保存

---

## ❓ 常见问题

### Q1: 找不到 "Get API key" 选项？

**A:** 可能的原因：

1. **未登录**：确保已登录 Google 账号
2. **地区限制**：某些地区可能无法访问，需要科学上网
3. **浏览器问题**：尝试清除缓存或换个浏览器

**解决方案：**
- 直接访问：https://aistudio.google.com/app/apikey
- 或访问：https://makersuite.google.com/app/apikey

### Q2: 提示 "API_KEY_INVALID"？

**A:** 检查以下几点：

1. **API Key 是否完整**：必须包含完整的 39 个字符
2. **是否有多余空格**：复制时可能带有空格
3. **是否过期**：API Key 一般不会过期，但可以在页面上重新生成

### Q3: 提示配额已用完？

**A:** Gemini API 免费额度：

- 每分钟：15 次请求
- 每天：1500 次请求

**解决方案：**
- 等待配额重置（每分钟/每天重置）
- 检查是否有其他程序在使用同一个 Key
- 如需更多额度，考虑付费升级（但个人使用免费额度完全够）

### Q4: 无法访问 aistudio.google.com？

**A:** 可能是网络问题：

1. **检查网络**：确保能访问 Google 服务
2. **科学上网**：可能需要 VPN 或代理
3. **备用域名**：尝试访问 https://makersuite.google.com/

### Q5: 需要绑定信用卡吗？

**A:** **不需要！** Gemini API 的免费层完全免费，不需要绑定任何支付方式。

### Q6: API Key 会过期吗？

**A:** **不会过期！** 只要你不删除它，就可以一直使用。

但建议：
- 定期检查是否有异常使用
- 如果泄露，立即在 Google AI Studio 删除并重新生成

### Q7: 可以生成多个 API Key 吗？

**A:** **可以！** 你可以创建多个 API Key，用于不同的项目：

1. 在 API Key 页面点击 `+ Create API key`
2. 每个 Key 独立管理
3. 可以随时删除不用的 Key

---

## 🔒 安全建议

### ✅ 应该做的：

1. **使用环境变量**：将 API Key 存储在 `.env` 文件中
2. **添加到 .gitignore**：防止上传到 GitHub
3. **定期检查使用情况**：在 Google AI Studio 查看 API 调用统计
4. **限制访问权限**：如果是团队项目，使用不同的 Key

### ❌ 不应该做的：

1. **不要硬编码**：不要直接写在代码里
2. **不要分享**：不要分享给不信任的人
3. **不要上传到公开仓库**：GitHub、GitLab 等
4. **不要在客户端使用**：不要直接在网页前端调用（会暴露 Key）

---

## 📊 API 配额说明

### 免费层（Free Tier）

```
📊 请求限制：
- 每分钟：15 次请求（RPM）
- 每天：1500 次请求（RPD）
- 每月：无限制（只要不超过每日限制）

📦 数据限制：
- 输入 Token：最多 30,000 tokens
- 输出 Token：最多 2,048 tokens

💰 费用：完全免费
```

### 对你的应用够用吗？

**个人使用：** ✅ 完全够用

```
典型使用场景（一次 Presentation）：
- 上传 PPT (5页)：1-2 次请求
- Q&A 问答（10个问题）：10 次请求
- 总计：12 次请求

一天做 100 次 Presentation：
12 × 100 = 1200 次 < 1500 次限制 ✅
```

**小规模分享（10-20人）：** ✅ 应该够用

**中大规模（>50人）：** ⚠️ 可能需要付费或优化

---

## 🚀 下一步

获取到 API Key 后：

1. ✅ **测试 API Key**：`./测试API_Key.sh`
2. ✅ **更新到项目**：`./更新API_Key.sh`
3. ✅ **部署到 Railway**：在 Variables 中添加
4. ✅ **开始使用**：运行 `./start.sh`

---

## 🆘 需要帮助？

如果遇到问题：

1. **查看官方文档**：https://ai.google.dev/docs
2. **查看 API 状态**：https://status.cloud.google.com/
3. **联系我**：把错误信息发给我，我帮你解决！

---

## 📚 参考链接

- 🔗 **Google AI Studio**：https://aistudio.google.com/
- 🔗 **API 文档**：https://ai.google.dev/docs
- 🔗 **定价说明**：https://ai.google.dev/pricing
- 🔗 **快速开始**：https://ai.google.dev/tutorials/get_started_web

---

祝你顺利获取 API Key！🎉



