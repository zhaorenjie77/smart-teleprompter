#!/bin/bash

# 在虚拟环境中安装 Python 包
# Install Python packages in virtual environment

if [ -z "$1" ]; then
    echo "================================"
    echo "📦 安装 Python 包"
    echo "================================"
    echo ""
    echo "用法: ./安装依赖.sh <包名>"
    echo "示例: ./安装依赖.sh google-genai"
    echo ""
    exit 1
fi

echo "================================"
echo "📦 安装 $1"
echo "================================"
echo ""

cd /home/jack/ZRJ/backend
source venv/bin/activate
pip install -U "$1"

echo ""
echo "================================"
echo "✅ 安装完成！"
echo "================================"
echo ""

