#!/bin/bash

echo "================================"
echo "🎤 Smart Teleprompter 启动脚本"
echo "================================"

# 检查是否在项目根目录
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ 错误：请在项目根目录运行此脚本"
    exit 1
fi

# 检查 Python
if ! command -v python3 &> /dev/null; then
    echo "❌ 错误：未检测到 Python 3，请先安装"
    exit 1
fi

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误：未检测到 Node.js，请先安装"
    exit 1
fi

echo ""
echo "📦 第一步：安装后端依赖..."
cd backend

if [ ! -d "venv" ]; then
    echo "创建虚拟环境..."
    python3 -m venv venv
fi

source venv/bin/activate
pip install -r requirements.txt --quiet

if [ ! -f ".env" ]; then
    echo "⚠️  警告：未检测到 .env 文件"
    echo "请复制 env_template.txt 为 .env 并填入您的 API Keys"
    echo "按回车继续（如果已配置）或 Ctrl+C 退出..."
    read
fi

echo ""
echo "🚀 第二步：启动后端服务..."
uvicorn main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
echo "✅ 后端服务已启动 (PID: $BACKEND_PID)"

cd ..

echo ""
echo "📦 第三步：安装前端依赖..."
cd frontend

if [ ! -d "node_modules" ]; then
    npm install
fi

echo ""
echo "🚀 第四步：启动前端服务..."
npm start &
FRONTEND_PID=$!

echo ""
echo "================================"
echo "✅ 启动完成！"
echo "================================"
echo "后端地址: http://localhost:8000"
echo "前端地址: http://localhost:3000"
echo ""
echo "按 Ctrl+C 停止所有服务"
echo "================================"

# 捕获中断信号
trap "echo ''; echo '🛑 正在停止服务...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT

# 等待
wait

