#!/usr/bin/env python3
"""
测试最新版 Gemini API (google-genai SDK)
Test latest Gemini API with google-genai SDK
"""

import os
from dotenv import load_dotenv
from google import genai

# 加载环境变量
load_dotenv('backend/.env')

api_key = os.getenv('GOOGLE_API_KEY')

if not api_key:
    print("❌ 错误：未找到 GOOGLE_API_KEY")
    print("请确保 backend/.env 文件中已配置 API Key")
    exit(1)

print("================================")
print("🧪 测试最新版 Gemini API")
print("================================")
print(f"\n📝 API Key: {api_key[:20]}...")
print(f"🤖 SDK: google-genai (最新版)")
print(f"📦 模型: gemini-2.5-flash")
print("\n正在测试...\n")

try:
    # 创建客户端
    client = genai.Client(api_key=api_key)
    
    # 测试生成内容
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents="用一个词说你好"
    )
    
    print("================================")
    print("✅ API 测试成功！")
    print("================================")
    print(f"\n🤖 AI 回复: {response.text}")
    print("\n🎉 最新版 SDK 工作正常！")
    print("\n💡 提示：这个 SDK 比旧版更快、更稳定！")
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
        print("\n✅ 好消息：API Key 本身是有效的！")
        print("\n解决方案：")
        print("• 等待 10-30 分钟后重试")
        print("• 检查配额：https://aistudio.google.com/app/apikey")
        print("• 现在就可以部署到云端（等待期间 API 会激活）")
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

