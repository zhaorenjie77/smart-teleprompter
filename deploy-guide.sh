#!/bin/bash

echo "================================"
echo "🚀 Smart Teleprompter 部署向导"
echo "================================"
echo ""

# 检查 git 是否安装
if ! command -v git &> /dev/null; then
    echo "❌ 错误：未检测到 git，请先安装"
    echo "   运行：sudo apt install git"
    exit 1
fi

echo "这个向导将帮助您完成以下步骤："
echo "1. 初始化 Git 仓库"
echo "2. 准备部署配置"
echo "3. 提供部署指引"
echo ""
read -p "按回车继续..."

# 步骤 1：初始化 Git
echo ""
echo "📦 步骤 1/3：初始化 Git 仓库"
echo "================================"

if [ -d ".git" ]; then
    echo "✅ Git 仓库已存在"
else
    echo "初始化 Git 仓库..."
    git init
    echo "✅ Git 仓库初始化完成"
fi

# 配置 git
echo ""
read -p "请输入您的 GitHub 用户名: " github_username
read -p "请输入您的邮箱: " github_email

git config user.name "$github_username"
git config user.email "$github_email"

echo "✅ Git 配置完成"

# 步骤 2：提交代码
echo ""
echo "📝 步骤 2/3：提交代码"
echo "================================"

git add .
git commit -m "Prepare for deployment" || echo "没有新的改动需要提交"

echo "✅ 代码已提交"

# 步骤 3：部署指引
echo ""
echo "🌐 步骤 3/3：部署到云平台"
echo "================================"
echo ""
echo "接下来需要您手动完成以下步骤："
echo ""
echo "【后端部署 - Railway】"
echo "1. 访问：https://railway.app"
echo "2. 用 GitHub 账号登录"
echo "3. 点击 'New Project' → 'Deploy from GitHub repo'"
echo "4. 如果这是您的第一次，需要先在 GitHub 创建仓库："
echo "   - 访问：https://github.com/new"
echo "   - 仓库名：smart-teleprompter"
echo "   - 创建后运行："
echo "     git remote add origin https://github.com/$github_username/smart-teleprompter.git"
echo "     git branch -M main"
echo "     git push -u origin main"
echo "5. 在 Railway 选择您的仓库"
echo "6. 添加环境变量：GOOGLE_API_KEY=你的Gemini密钥"
echo "7. 等待部署完成，复制后端地址"
echo ""
echo "【前端部署 - Vercel】"
echo "1. 访问：https://vercel.com"
echo "2. 用 GitHub 账号登录"
echo "3. 点击 'New Project'"
echo "4. 选择 'smart-teleprompter' 仓库"
echo "5. Root Directory 设置为 'frontend'"
echo "6. 添加环境变量："
echo "   REACT_APP_BACKEND_URL=你在Railway获得的后端地址"
echo "7. 点击 Deploy"
echo ""
echo "🎉 部署完成后，Vercel 会给您一个网址，例如："
echo "   https://smart-teleprompter.vercel.app"
echo ""
echo "用户就可以通过这个网址访问您的 App 了！"
echo ""
echo "================================"
echo "📚 更多详细信息请查看："
echo "   - 发布指南.md"
echo "   - README.md"
echo "================================"

