"""
智能提词器 - 轻量级部署版本
Smart Teleprompter - Lightweight Deployment Version

此文件用于快速部署，移除了大型依赖
"""

import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

app = FastAPI(title="Smart Teleprompter API - Lite")

# 允许跨域
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 全局状态
presentation_data = {
    "script_content": "",
    "segments": [],
    "ppt_analysis": {}
}

@app.get("/")
async def root():
    """根路径"""
    return {
        "message": "Smart Teleprompter API",
        "version": "1.0-lite",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    """健康检查"""
    return {
        "status": "ok",
        "service": "Smart Teleprompter",
        "api_key_configured": bool(os.getenv("GOOGLE_API_KEY"))
    }

@app.post("/upload_script")
async def upload_script(file: UploadFile = File(...)):
    """上传演讲稿"""
    try:
        content = (await file.read()).decode("utf-8")
        presentation_data["script_content"] = content
        
        # 简单分句
        import re
        pattern = r'(?<=[。！？；])|(?<=[.!?;])(?=\s|$)'
        sentences = [s.strip() for s in re.split(pattern, content) if len(s.strip()) > 3]
        
        presentation_data["segments"] = [
            {"id": i, "text": text, "status": "pending"}
            for i, text in enumerate(sentences)
        ]
        
        return {
            "success": True,
            "message": "演讲稿处理完成",
            "total_segments": len(sentences),
            "segments": presentation_data["segments"],
            "preview": sentences[:3]
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"处理失败: {str(e)}")

@app.post("/upload_ppt")
async def upload_ppt(file: UploadFile = File(...)):
    """上传 PPT（PDF格式）"""
    try:
        # 保存临时文件
        file_path = f"/tmp/temp_{file.filename}"
        with open(file_path, "wb") as f:
            f.write(await file.read())
        
        # 使用 PyMuPDF 提取文本
        try:
            import fitz
            doc = fitz.open(file_path)
            all_text = ""
            for page in doc:
                all_text += page.get_text()
            doc.close()
            
            # 使用 Gemini 分析
            model = genai.GenerativeModel('gemini-2.5-flash')
            prompt = f"""
            这是一份演讲 PPT 的文本内容，请提取：
            1. 整体主题
            2. 3-5个核心论点
            
            内容：
            {all_text[:3000]}
            """
            response = model.generate_content(prompt)
            
            presentation_data["ppt_analysis"] = {
                "summary": response.text,
                "raw_text": all_text[:1000]
            }
            
            os.remove(file_path)
            
            return {
                "success": True,
                "message": "PPT 分析完成",
                "summary": response.text
            }
        
        except ImportError:
            raise HTTPException(status_code=500, detail="PDF 处理库未安装")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PPT 处理失败: {str(e)}")

@app.post("/ask_qa")
async def ask_qa(question: str):
    """问答功能"""
    try:
        script = presentation_data.get("script_content", "")
        ppt_summary = presentation_data.get("ppt_analysis", {}).get("summary", "")
        
        prompt = f"""
        你是一位演讲辅助专家。

        演讲稿：{script[:1000]}
        PPT摘要：{ppt_summary}
        
        教授的问题：{question}
        
        请给出简洁、专业的回答建议。
        """
        
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)
        
        return {
            "success": True,
            "answer": response.text
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI 回答失败: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

