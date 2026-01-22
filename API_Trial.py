from google import genai
import os
from dotenv import load_dotenv

# 加载 API Key
load_dotenv('backend/.env')
api_key = os.getenv('GOOGLE_API_KEY')

# 创建客户端（必须传入 api_key）
client = genai.Client(api_key=api_key)

# 生成内容（使用正确的模型名）
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="写一首诗给我"
)

print(response.text)