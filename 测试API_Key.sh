#!/bin/bash

# 测试 Google Gemini API Key
# Test Google Gemini API Key

echo "================================"
echo "🧪 测试 Gemini API Key"
echo "================================"
echo ""
echo "请输入你的 API Key："
read -p "API Key: " api_key

if [ -z "$api_key" ]; then
    echo ""
    echo "❌ API Key 不能为空！"
    exit 1
fi

echo ""
echo "正在测试..."
echo ""

# 测试 API 调用（使用最新的 gemini-2.5-flash 模型）
response=$(curl -s -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=$api_key" \
  -H 'Content-Type: application/json' \
  -d '{
    "contents": [{
      "parts": [{
        "text": "Say hello in one word"
      }]
    }]
  }')

# 检查响应
if echo "$response" | grep -q "candidates"; then
    echo "================================"
    echo "✅ API Key 有效！"
    echo "================================"
    echo ""
    echo "API 响应："
    echo "$response" | grep -o '"text":"[^"]*"' | head -1
    echo ""
    echo "🎉 可以开始使用了！"
    echo ""
elif echo "$response" | grep -q "API_KEY_INVALID"; then
    echo "================================"
    echo "❌ API Key 无效！"
    echo "================================"
    echo ""
    echo "请检查："
    echo "1. API Key 是否完整复制（包括 AIzaSy 开头）"
    echo "2. 是否从正确的账号获取"
    echo "3. 是否已启用 API"
    echo ""
elif echo "$response" | grep -q "quota"; then
    echo "================================"
    echo "⚠️  配额已用完"
    echo "================================"
    echo ""
    echo "请等待配额重置或检查限制"
    echo ""
else
    echo "================================"
    echo "⚠️  测试失败"
    echo "================================"
    echo ""
    echo "响应内容："
    echo "$response"
    echo ""
fi



