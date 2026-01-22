#!/bin/bash

# 一键部署脚本
# One-click deployment script for Smart Teleprompter
# 智能提词器一键部署脚本

echo "================================"
echo "📤 准备上传到 GitHub"
echo "================================"
echo ""
echo "请输入您的 GitHub 用户名："
read github_username

echo ""
echo "正在配置..."

cd /home/jack/ZRJ

# 确保在 main 分支
git branch -M main

# 添加远程仓库
git remote remove origin 2>/dev/null
git remote add origin https://github.com/$github_username/smart-teleprompter.git

echo ""
echo "================================"
echo "✅ 配置完成！"
echo "================================"
echo ""
echo "现在需要您完成以下步骤："
echo ""
echo "1. 访问 https://github.com/new"
echo "   - Repository name: smart-teleprompter"
echo "   - 选择: Public"
echo "   - 点击: Create repository"
echo ""
echo "2. 回到终端，按回车继续..."
read

echo ""
echo "正在上传代码..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "================================"
    echo "🎉 代码上传成功！"
    echo "================================"
    echo ""
    echo "您的仓库地址："
    echo "https://github.com/$github_username/smart-teleprompter"
    echo ""
    echo "================================"
    echo "接下来部署后端到 Railway："
    echo "================================"
    echo ""
    echo "1. 访问: https://railway.app/new"
    echo "2. 点击: Deploy from GitHub repo"
    echo "3. 选择: smart-teleprompter"
    echo "4. 点击右上角 Variables，添加:"
    echo "   GOOGLE_API_KEY = AIzaSyAMHutLIm7JDSNBwtWxghP3aWKr7uxnL3Q"
    echo "5. 点击 Settings → 找到 Root Directory"
    echo "   设置为: backend"
    echo "6. 等待部署完成，复制域名(类似: xxx.railway.app)"
    echo ""
    echo "================================"
    echo "最后部署前端到 Vercel："
    echo "================================"
    echo ""
    echo "1. 访问: https://vercel.com/new"
    echo "2. 选择: smart-teleprompter"
    echo "3. 配置:"
    echo "   - Framework: Create React App"
    echo "   - Root Directory: frontend"
    echo "   - Build Command: npm run build"
    echo "   - Output Directory: build"
    echo "4. Environment Variables:"
    echo "   REACT_APP_BACKEND_URL = [刚才Railway的域名]"
    echo "5. 点击: Deploy"
    echo ""
    echo "🎉 5分钟后就能用了！"
    echo ""
else
    echo ""
    echo "================================"
    echo "❌ 上传失败"
    echo "================================"
    echo ""
    echo "可能的原因："
    echo "1. 还没创建 GitHub 仓库"
    echo "2. 需要输入 GitHub 密码"
    echo ""
    echo "如果要求输入密码，请使用 Personal Access Token："
    echo "https://github.com/settings/tokens"
    echo ""
fi



