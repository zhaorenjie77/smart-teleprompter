"""
智能提词器 - 轻量级部署版本
Smart Teleprompter - Lightweight Deployment Version

此文件用于快速部署，移除了大型依赖
"""

import os
from fastapi import FastAPI, UploadFile, File, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

# 安全配置 API Key
API_KEY = os.getenv("GOOGLE_API_KEY")
if API_KEY:
    genai.configure(api_key=API_KEY)

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
    "ppt_analysis": {},
    "current_idx": -1,
    "is_free_style": False
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
    api_key = os.getenv("GOOGLE_API_KEY")
    return {
        "status": "ok",
        "service": "Smart Teleprompter Lite",
        "version": "1.0",
        "api_key_configured": bool(api_key),
        "api_key_preview": f"{api_key[:10]}..." if api_key else "not set"
    }

@app.post("/upload_script")
async def upload_script(file: UploadFile = File(...)):
    """上传演讲稿（支持 .txt, .doc, .docx 格式）"""
    try:
        raw_content = await file.read()
        filename = file.filename.lower()
        
        # 处理 .docx 文件
        if filename.endswith('.docx'):
            try:
                from docx import Document
                import io
                doc = Document(io.BytesIO(raw_content))
                content = '\n'.join([paragraph.text for paragraph in doc.paragraphs])
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Word 文档解析失败: {str(e)}")
        
        # 处理纯文本文件
        else:
            # 智能编码检测：尝试多种编码
            content = None
            for encoding in ['utf-8', 'gbk', 'gb2312', 'gb18030', 'utf-16', 'latin-1']:
                try:
                    content = raw_content.decode(encoding)
                    break
                except (UnicodeDecodeError, AttributeError):
                    continue
            
            if content is None:
                raise HTTPException(status_code=400, detail="无法识别文件编码，请使用 UTF-8 编码或 .docx 格式")
        
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
        segments = presentation_data.get("segments", [])
        
        # 检查是否有跳过的段落
        skipped = [s for s in segments if s.get("status") == "skipped"]
        has_skipped = len(skipped) > 0
        
        prompt = f"""
        你是一位演讲辅助专家。

        演讲稿：{script[:1000]}
        PPT摘要：{ppt_summary}
        
        教授的问题：{question}
        
        请给出简洁、专业的回答建议。
        """
        
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)
        
        answer = response.text
        if has_skipped:
            answer = "⚠️ 提示：演讲中有部分内容被跳过，如果问题涉及这些内容，建议补充说明。\n\n" + answer
        
        return {
            "success": True,
            "answer": answer,
            "has_skipped_content": has_skipped
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI 回答失败: {str(e)}")

@app.websocket("/ws/speech")
async def websocket_speech(websocket: WebSocket):
    """
    实时语音追踪 WebSocket
    轻量级版本：使用简单的文本匹配
    """
    await websocket.accept()
    
    segments = presentation_data.get("segments", [])
    
    if len(segments) == 0:
        await websocket.send_json({
            "error": "请先上传演讲稿"
        })
        await websocket.close()
        return
    
    try:
        while True:
            # 接收前端发送的语音文字
            data = await websocket.receive_json()
            speech_text = data.get("text", "").strip()
            
            if not speech_text:
                continue
            
            # 轻量级匹配逻辑：改进的相似度计算
            matched_idx = -1
            max_similarity = 0
            
            # 预处理语音文本：去除标点和空格
            import re
            speech_clean = re.sub(r'[，。！？；：、\s,\.!?;:\s]+', '', speech_text.lower())
            
            # 设置匹配阈值（可调节）
            MATCH_THRESHOLD = 0.5  # 50% 相似度即可匹配
            MIN_MATCH_LENGTH = 3   # 至少匹配 3 个字符
            
            for idx, segment in enumerate(segments):
                text = segment["text"]
                text_clean = re.sub(r'[，。！？；：、\s,\.!?;:\s]+', '', text.lower())
                
                # 计算相似度
                similarity = 0
                
                # 方法1: 简单包含关系
                if speech_clean in text_clean or text_clean in speech_clean:
                    similarity = 1.0
                
                # 方法2: 字符重叠比例
                else:
                    common_chars = set(speech_clean) & set(text_clean)
                    if len(common_chars) > 0:
                        # 计算重叠比例
                        overlap_ratio = len(common_chars) / max(len(set(speech_clean)), len(set(text_clean)))
                        
                        # 检查连续子串
                        max_substr = 0
                        for i in range(len(speech_clean)):
                            for j in range(i + MIN_MATCH_LENGTH, len(speech_clean) + 1):
                                substr = speech_clean[i:j]
                                if substr in text_clean:
                                    max_substr = max(max_substr, len(substr))
                        
                        # 综合评分
                        if max_substr >= MIN_MATCH_LENGTH:
                            substr_ratio = max_substr / len(text_clean)
                            similarity = (overlap_ratio * 0.3 + substr_ratio * 0.7)
                
                # 更新最佳匹配
                if similarity > max_similarity and similarity >= MATCH_THRESHOLD:
                    max_similarity = similarity
                    matched_idx = idx
            
            # 更新状态
            if matched_idx != -1:
                # 找到匹配
                old_idx = presentation_data["current_idx"]
                presentation_data["current_idx"] = matched_idx
                presentation_data["is_free_style"] = False
                
                # 标记已讲
                segments[matched_idx]["status"] = "covered"
                
                # 检测跳读
                if old_idx != -1 and matched_idx > old_idx + 1:
                    # 中间被跳过的段落标记为 skipped
                    for i in range(old_idx + 1, matched_idx):
                        if segments[i]["status"] == "pending":
                            segments[i]["status"] = "skipped"
                
            else:
                # 未找到匹配，可能是脱稿
                presentation_data["is_free_style"] = True
            
            # 发送更新
            await websocket.send_json({
                "segments": segments,
                "current_idx": presentation_data["current_idx"],
                "is_free_style": presentation_data["is_free_style"],
                "matched": matched_idx != -1
            })
    
    except WebSocketDisconnect:
        pass
    except Exception as e:
        await websocket.send_json({"error": str(e)})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

