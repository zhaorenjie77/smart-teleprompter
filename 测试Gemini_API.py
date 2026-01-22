#!/usr/bin/env python3
"""
测试 Gemini API Key
Test Gemini API Key
"""

import os
from dotenv import load_dotenv
import google.generativeai as genai

# 加载环境变量
load_dotenv('backend/.env')

api_key = os.getenv('GOOGLE_API_KEY')

if not api_key:
    print("❌ 错误：未找到 GOOGLE_API_KEY")
    print("请确保 backend/.env 文件中已配置 API Key")
    exit(1)

print("================================")
print("🧪 测试 Gemini API")
print("================================")
print(f"\n📝 API Key: {api_key[:20]}...")
print(f"🤖 模型: gemini-2.5-flash")
print("\n正在测试...\n")

try:
    # 配置 API Key
    genai.configure(api_key=api_key)
    
    # 创建模型实例
    model = genai.GenerativeModel('gemini-2.5-flash')
    
    # 测试简单对话
    response = model.generate_content("用一个词说你好")
    
    print("================================")
    print("✅ API Key 有效！")
    print("================================")
    print(f"\n🤖 AI 回复: {response.text}")
    print("\n🎉 可以开始使用了！")
    print("\n================================\n")
    
except Exception as e:
    error_msg = str(e)
    print("================================")
    
    if "429" in error_msg or "quota" in error_msg.lower() or "RESOURCE_EXHAUSTED" in error_msg:
        print("⚠️  配额限制")
        print("================================")
        print("\n原因：")
        print("1. API Key 刚创建，需要等待 10-30 分钟激活")
        print("2. 或者今天的免费配额已用完")
        print("\n解决方案：")
        print("• 等待 10-30 分钟后重试")
        print("• 检查配额：https://aistudio.google.com/app/apikey")
        print("• 或者重新生成一个新的 API Key")
    elif "404" in error_msg or "not found" in error_msg.lower():
        print("⚠️  模型不可用")
        print("================================")
        print("\n可能原因：")
        print("• API Key 可能没有访问该模型的权限")
        print("• 或者模型名称错误")
    elif "INVALID" in error_msg or "invalid" in error_msg.lower():
        print("❌ API Key 无效")
        print("================================")
        print("\n请检查：")
        print("1. API Key 是否完整复制（包括 AIzaSy 开头）")
        print("2. 是否从正确的账号获取")
        print("3. 是否已启用 Gemini API")
    else:
        print("❌ 测试失败")
        print("================================")
        print(f"\n错误信息：{error_msg}")
    
    print("\n================================\n")
    exit(1)

