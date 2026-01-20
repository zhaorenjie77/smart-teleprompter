#!/bin/bash

echo "================================"
echo "🚀 快速部署到云端"
echo "================================"
echo ""

# 检查 git
if ! command -v git &> /dev/null; then
    echo "❌ 未检测到 git，正在安装..."
    sudo apt update && sudo apt install -y git
fi

echo "📝 配置 Git..."
read -p "请输入您的 GitHub 用户名: " github_username
read -p "请输入您的邮箱: " github_email

git config --global user.name "$github_username"
git config --global user.email "$github_email"

echo ""
echo "📦 初始化 Git 仓库..."
cd /home/jack/ZRJ

if [ -d ".git" ]; then
    echo "✅ Git 仓库已存在"
else
    git init
fi

# 添加 .gitignore
cat > .gitignore << 'EOF'
# Python
__pycache__/
*.py[cod]
backend/venv/
backend/.env
*.egg-info/

# Node
frontend/node_modules/
frontend/build/
frontend/.env
frontend/.env.local

# 其他
.DS_Store
*.log
temp_*
EOF

echo ""
echo "📤 准备提交代码..."
git add .
git commit -m "Deploy to cloud" || echo "没有新的改动"

echo ""
echo "================================"
echo "✅ 准备完成！"
echo "================================"
echo ""
echo "接下来的步骤："
echo ""
echo "1. 访问 https://github.com/new"
echo "   创建一个新仓库，名称：smart-teleprompter"
echo "   选择 Public"
echo "   不要添加 README"
echo ""
echo "2. 运行以下命令（替换 YOUR_USERNAME）："
echo "   git remote add origin https://github.com/$github_username/smart-teleprompter.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. 部署后端到 Railway："
echo "   - 访问 https://railway.app"
echo "   - 点击 New Project → Deploy from GitHub"
echo "   - 选择 smart-teleprompter 仓库"
echo "   - Root Directory: backend"
echo "   - 添加环境变量: GOOGLE_API_KEY=你的Gemini密钥"
echo ""
echo "4. 部署前端到 Vercel："
echo "   - 访问 https://vercel.com"
echo "   - 点击 New Project"
echo "   - 选择 smart-teleprompter 仓库"
echo "   - Root Directory: frontend"
echo "   - 添加环境变量: REACT_APP_BACKEND_URL=[Railway给的后端地址]"
echo ""
echo "================================"

