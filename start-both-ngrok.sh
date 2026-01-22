#!/bin/bash

echo "================================"
echo "🚀 Smart Teleprompter - 完整版"
echo "   同时启动前端和后端 ngrok"
echo "================================"
echo ""

# 检查服务是否运行
if ! lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "❌ 前端服务未运行"
    echo "请先启动前端："
    echo "  cd frontend && npm start"
    exit 1
fi

if ! lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
    echo "❌ 后端服务未运行"
    echo "请先启动后端："
    echo "  cd backend && source venv/bin/activate && uvicorn main:app --host 0.0.0.0 --port 8000"
    exit 1
fi

echo "✅ 前端和后端服务都在运行"
echo ""

# 启动后端 ngrok（后台运行）
echo "🌐 启动后端 ngrok..."
ngrok http 8000 > /tmp/ngrok-backend.log 2>&1 &
BACKEND_PID=$!

# 等待后端 ngrok 启动
sleep 3

# 获取后端地址
BACKEND_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"https://[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$BACKEND_URL" ]; then
    echo "❌ 无法获取后端 ngrok 地址"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo "✅ 后端地址: $BACKEND_URL"
echo ""

# 启动前端 ngrok（后台运行）
echo "🌐 启动前端 ngrok..."
ngrok http 3001 > /tmp/ngrok-frontend.log 2>&1 &
FRONTEND_PID=$!

# 等待前端 ngrok 启动
sleep 3

# 获取前端地址
FRONTEND_URL=$(curl -s http://localhost:4041/api/tunnels | grep -o '"public_url":"https://[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$FRONTEND_URL" ]; then
    echo "❌ 无法获取前端 ngrok 地址"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 1
fi

echo "✅ 前端地址: $FRONTEND_URL"
echo ""

echo "================================"
echo "🎉 启动成功！"
echo "================================"
echo ""
echo "📱 手机访问地址："
echo "   $FRONTEND_URL"
echo ""
echo "🔧 后端 API 地址："
echo "   $BACKEND_URL"
echo ""
echo "📝 配置说明："
echo "   在手机浏览器打开前端地址后，按 F12 打开控制台"
echo "   输入以下命令配置后端地址："
echo "   localStorage.setItem('backend_url', '$BACKEND_URL')"
echo ""
echo "或者在电脑浏览器先配置，然后再用手机访问"
echo ""
echo "按 Ctrl+C 停止所有服务"
echo "================================"

# 捕获中断信号
trap "echo ''; echo '🛑 正在停止服务...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT

# 保持运行
wait




