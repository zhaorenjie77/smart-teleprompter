#!/bin/bash

echo "================================"
echo "🌐 Smart Teleprompter + ngrok"
echo "================================"
echo ""

# 检查 ngrok 是否安装
if ! command -v ngrok &> /dev/null; then
    echo "📥 正在安装 ngrok..."
    curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | \
      sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null && \
      echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | \
      sudo tee /etc/apt/sources.list.d/ngrok.list && \
      sudo apt update && sudo apt install -y ngrok
    
    echo ""
    echo "✅ ngrok 安装完成！"
    echo ""
    echo "⚠️  请先配置 ngrok："
    echo "1. 访问：https://dashboard.ngrok.com/signup"
    echo "2. 注册并获取 authtoken"
    echo "3. 运行：ngrok config add-authtoken 你的token"
    echo "4. 然后重新运行此脚本"
    echo ""
    exit 0
fi

echo "✅ 检测到 ngrok 已安装"
echo ""
echo "🚀 启动服务中..."
echo ""

# 检查端口是否被占用
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ 前端服务已在运行"
else
    echo "❌ 前端服务未运行"
    echo "请先启动前端服务："
    echo "  cd frontend && npm start"
    exit 1
fi

if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ 后端服务已在运行"
else
    echo "❌ 后端服务未运行"
    echo "请先启动后端服务："
    echo "  cd backend && source venv/bin/activate && uvicorn main:app --host 0.0.0.0 --port 8000"
    exit 1
fi

echo ""
echo "🌐 启动 ngrok..."
echo ""
echo "================================"
echo "📱 复制下面的 https 地址"
echo "   在手机浏览器中打开即可！"
echo "================================"
echo ""

ngrok http 3000




