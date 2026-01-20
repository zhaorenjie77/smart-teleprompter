# 🌐 使用 ngrok - 让手机随时随地访问

## 什么是 ngrok？

ngrok 是一个内网穿透工具，可以把您电脑上的服务暴露到公网。

**简单理解：**
```
没有ngrok：
手机 ─X─ 无法访问 ─X─ 家里的电脑（不在同一WiFi）

有了ngrok：
手机 ──▶ ngrok.io ──▶ 家里的电脑 ✅
     (通过互联网)
```

---

## 🚀 5分钟快速开始

### 步骤 1：安装 ngrok

```bash
# 下载安装
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | \
  sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null && \
  echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | \
  sudo tee /etc/apt/sources.list.d/ngrok.list && \
  sudo apt update && sudo apt install ngrok
```

### 步骤 2：注册账号（免费）

1. 访问：https://dashboard.ngrok.com/signup
2. 用 Google 账号登录（最快）
3. 复制您的 authtoken

### 步骤 3：配置 authtoken

```bash
ngrok config add-authtoken 你的token
```

### 步骤 4：启动服务

**确保后端和前端正在运行，然后：**

```bash
# 新开一个终端，启动ngrok
ngrok http 3000
```

**您会看到：**
```
ngrok                                                                    

Session Status                online                                     
Account                       your-email@gmail.com (Plan: Free)         
Version                       3.x.x                                      
Region                        United States (us)                         
Latency                       45ms                                       
Web Interface                 http://127.0.0.1:4040                     
Forwarding                    https://abc123.ngrok.io -> http://localhost:3000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

### 步骤 5：在手机上访问

**复制 Forwarding 后面的地址：**
```
https://abc123.ngrok.io
```

**在手机浏览器打开这个地址！**

**现在：**
- ✅ 在任何地方都能访问
- ✅ 不需要同一WiFi
- ✅ 4G/5G 也可以
- ✅ 可以分享给朋友测试

---

## 🎨 组合使用：ngrok + PWA

### 完美流程：

1. **启动 ngrok**
```bash
ngrok http 3000
```

2. **在手机浏览器打开 ngrok 提供的地址**
```
https://abc123.ngrok.io
```

3. **添加到主屏幕**
   - iOS：分享 → 添加到主屏幕
   - Android：菜单 → 添加到主屏幕

4. **完成！**

**现在您有了：**
- ✅ 真正的 App 图标
- ✅ 全屏体验
- ✅ 随时随地访问
- ✅ 不受网络限制

---

## 💡 使用技巧

### 每次使用的流程

```bash
# 1. 启动后端（如果还没启动）
cd /home/jack/ZRJ/backend && source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000

# 2. 启动前端（如果还没启动）
cd /home/jack/ZRJ/frontend && npm start

# 3. 启动 ngrok
ngrok http 3000
```

### 保持 ngrok 地址不变（可选）

**免费版每次重启地址会变，付费版可以固定域名：**
```bash
# 付费版（$8/月）
ngrok http 3000 --domain=your-custom-domain.ngrok.io
```

### 查看访问日志

ngrok 提供了一个 Web 界面查看所有请求：
```
http://127.0.0.1:4040
```

---

## 🎯 对比

| 方案 | 网络要求 | 设置难度 | 成本 | 适用场景 |
|------|----------|----------|------|----------|
| 本地IP | 同一WiFi | ⭐ | 免费 | 家里测试 |
| ngrok免费版 | 任何网络 | ⭐⭐ | 免费 | 测试开发 |
| ngrok付费版 | 任何网络 | ⭐⭐ | $8/月 | 固定域名 |
| 云端部署 | 任何网络 | ⭐⭐⭐ | 免费 | 正式发布 |

---

## ⚠️ 注意事项

### 免费版限制
- ✅ 每分钟 40 个连接
- ✅ 40,000 次请求/月
- ❌ 地址每次重启会变
- ❌ 会话超时 2 小时

**对于测试来说完全够用！**

### 安全提示
- ngrok 地址是公开的，任何知道地址的人都能访问
- 不要在生产环境长期使用 ngrok
- 测试完成后可以关闭 ngrok

---

## 🔥 一键启动脚本

创建一个便捷脚本：

```bash
#!/bin/bash
# 文件名：start-with-ngrok.sh

echo "🚀 启动 Smart Teleprompter + ngrok"

# 启动后端（后台运行）
cd /home/jack/ZRJ/backend
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 &

# 启动前端（后台运行）
cd /home/jack/ZRJ/frontend
npm start &

# 等待服务启动
sleep 10

# 启动 ngrok
echo "✅ 正在启动 ngrok..."
ngrok http 3000
```

使用方法：
```bash
chmod +x start-with-ngrok.sh
./start-with-ngrok.sh
```

---

**这样您就可以随时随地测试 App 了！** 🎉

