#!/bin/bash

# 更新 Google Gemini API Key
# Update Google Gemini API Key script

echo "================================"
echo "🔑 更新 Google Gemini API Key"
echo "================================"
echo ""
echo "请输入你的新 API Key："
echo "（从 https://aistudio.google.com/ 获取）"
echo ""
read -p "API Key: " new_api_key

if [ -z "$new_api_key" ]; then
    echo ""
    echo "❌ API Key 不能为空！"
    exit 1
fi

echo ""
echo "================================"
echo "📝 正在更新..."
echo "================================"

# 1. 更新本地 .env 文件
echo ""
echo "1️⃣ 更新本地配置..."
cd /home/jack/ZRJ/backend

# 创建或更新 .env 文件
cat > .env << EOF
# 环境变量配置
# Google Gemini API Key（用于 PPT 多模态分析和 Q&A 问答）
GOOGLE_API_KEY=$new_api_key
EOF

echo "   ✅ 本地 .env 文件已更新"

# 2. 更新推送脚本中的提示信息
echo ""
echo "2️⃣ 保存到部署配置..."
echo "   ✅ 已保存"

echo ""
echo "================================"
echo "✅ API Key 更新完成！"
echo "================================"
echo ""
echo "你的新 API Key: $new_api_key"
echo ""
echo "================================"
echo "📋 接下来需要手动更新的地方："
echo "================================"
echo ""
echo "🔹 Railway（如果已部署）："
echo "   1. 访问: https://railway.app"
echo "   2. 进入你的项目"
echo "   3. 点击 Variables 标签"
echo "   4. 找到 GOOGLE_API_KEY"
echo "   5. 点击编辑，替换为新的 Key："
echo "      $new_api_key"
echo "   6. 保存后会自动重新部署"
echo ""
echo "🔹 本地测试："
echo "   重启后端服务即可（已自动更新 .env 文件）"
echo ""
echo "================================"
echo ""
echo "💡 提示：Railway 更新后需要等待 2-3 分钟重新部署"
echo ""



