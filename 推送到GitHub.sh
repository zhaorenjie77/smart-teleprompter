#!/bin/bash

# 推送代码到 GitHub
# Push code to GitHub

echo "================================"
echo "📤 推送代码到 GitHub"
echo "================================"
echo ""

# 添加所有更改
echo "正在添加更改..."
git add .

# 提交更改
echo ""
echo "请输入提交信息（留空使用默认信息）："
read -p "Commit message: " commit_msg

if [ -z "$commit_msg" ]; then
    commit_msg="更新到 Gemini 2.5 Flash 模型"
fi

git commit -m "$commit_msg"

# 推送到 GitHub
echo ""
echo "正在推送到 GitHub..."
git push origin main || git push origin master

echo ""
echo "================================"
echo "✅ 推送完成！"
echo "================================"
echo ""
echo "现在可以到 Railway 部署了："
echo "https://railway.app/new"
echo ""
