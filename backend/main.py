import os
import sys
import asyncio
from pathlib import Path

# 添加backend目录到Python路径
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from fastapi import FastAPI, UploadFile, File, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from processor import ScriptProcessor
from tracker import Tracker
from models import SegmentStatus, ScriptSegment
import google.generativeai as genai
from dotenv import load_dotenv
from typing import Dict

load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

app = FastAPI(title="Smart Teleprompter API")

# 允许跨域
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 全局状态存储
presentation_data = {
    "processor": ScriptProcessor(),
    "tracker": None,
    "script_content": "",
    "ppt_analysis": {}
}

@app.post("/upload_script")
async def upload_script(file: UploadFile = File(...)):
    """
    上传演讲稿并预处理
    用户体验优化：返回详细进度信息
    """
    try:
        content = (await file.read()).decode("utf-8")
        presentation_data["script_content"] = content
        
        processor = presentation_data["processor"]
        
        # 步骤1：智能分句（支持中英文）
        sentences = processor.split_text(content)
        
        if len(sentences) == 0:
            raise HTTPException(status_code=400, detail="稿件内容为空或格式错误")
        
        # 步骤2：生成多语言向量
        embeddings = processor.get_embeddings(sentences)
        
        # 步骤3：构建追踪器
        segments = [
            ScriptSegment(
                id=i,
                text=text,
                status=SegmentStatus.PENDING,
                embedding_idx=i
            ) for i, text in enumerate(sentences)
        ]
        
        presentation_data["tracker"] = Tracker(segments, embeddings)
        
        return {
            "success": True,
            "message": "演讲稿处理完成",
            "total_segments": len(segments),
            "segments": [s.dict() for s in segments],
            "preview": sentences[:3]  # 预览前3句
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"处理失败: {str(e)}")

@app.post("/upload_ppt")
async def upload_ppt(file: UploadFile = File(...)):
    """
    上传 PPT（PDF格式），使用 Gemini 多模态分析
    用户体验优化：异步处理 + 进度反馈
    """
    try:
        # 保存临时文件
        file_path = f"/tmp/temp_{file.filename}"
        with open(file_path, "wb") as f:
            f.write(await file.read())
        
        processor = presentation_data["processor"]
        
        # 使用 Gemini 深度分析（可能需要几秒）
        analysis = processor.extract_pdf_with_gemini(file_path)
        presentation_data["ppt_analysis"] = analysis
        
        # 清理临时文件
        os.remove(file_path)
        
        return {
            "success": True,
            "message": "PPT 分析完成",
            "summary": analysis['summary'],
            "total_pages": len(analysis['pages']),
            "key_points": analysis['key_points']
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PPT 处理失败: {str(e)}")

@app.post("/ask_qa")
async def ask_qa(question: str):
    """
    上下文感知问答
    核心逻辑：注入演讲状态（Skipped段落警告）
    """
    tracker = presentation_data["tracker"]
    if not tracker:
        raise HTTPException(status_code=400, detail="请先上传演讲稿")

    # 构建详细的状态报告
    covered_parts = []
    skipped_parts = []
    pending_parts = []
    
    for s in tracker.state.segments:
        if s.status == SegmentStatus.COVERED:
            covered_parts.append(s.text)
        elif s.status == SegmentStatus.SKIPPED:
            skipped_parts.append(s.text)
        elif s.status == SegmentStatus.PENDING:
            pending_parts.append(s.text)

    # PPT 背景
    ppt_summary = presentation_data["ppt_analysis"].get("summary", "未上传PPT")
    
    # 构建智能 Prompt
    prompt = f"""
Role: 演讲辅助专家 - 你正在帮助一位大学生回答教授在 presentation 后的提问。

===== 演讲进度状态 =====
已讲内容 (COVERED):
{chr(10).join(covered_parts) if covered_parts else "尚未开始"}

跳过内容 (SKIPPED - 需要特别注意):
{chr(10).join(skipped_parts) if skipped_parts else "无"}

未讲内容 (PENDING):
{chr(10).join(pending_parts) if pending_parts else "已全部完成"}

===== PPT 背景信息 =====
{ppt_summary}

===== Critical Constraint =====
如果教授的问题涉及 [SKIPPED] 部分，你必须在回答开头用 ⚠️ 标记并明确提示：
"⚠️ 这部分内容刚才未讲到，建议您补充说明..."

然后再给出简洁、专业的回答建议。回答需要：
1. 直接切入重点（不要冗长）
2. 使用演讲者的口吻
3. 如果涉及数据或案例，从PPT中引用

===== 教授的问题 =====
"{question}"

请给出回答建议：
"""

    try:
        # 使用最新的 Gemini 2.5 Flash 模型生成回答
        gemini_model = genai.GenerativeModel('gemini-2.5-flash')
        response = gemini_model.generate_content(prompt)
        
        answer = response.text
        
        return {
            "success": True,
            "answer": answer,
            "has_skipped_content": len(skipped_parts) > 0,
            "skipped_count": len(skipped_parts)
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI 回答失败: {str(e)}")

@app.websocket("/ws/speech")
async def websocket_endpoint(websocket: WebSocket):
    """
    实时语音追踪 WebSocket
    用户体验优化：
    1. 支持接收文本（前端STT）或音频流（后端STT）
    2. 平滑推送更新
    3. 错误恢复机制
    """
    await websocket.accept()
    tracker = presentation_data["tracker"]
    processor = presentation_data["processor"]
    
    if not tracker:
        await websocket.send_json({
            "error": "请先上传演讲稿"
        })
        await websocket.close()
        return
    
    try:
        while True:
            data = await websocket.receive_json()
            speech_text = data.get("text", "").strip()
            
            if not speech_text:
                continue
            
            # 实时向量化并匹配
            vec = processor.get_embeddings([speech_text])[0]
            new_state = tracker.process_speech_vector(vec)
            
            # 推送更新（只发送必要信息，减少延迟）
            response = {
                "current_idx": new_state.current_idx,
                "is_free_style": new_state.is_free_style,
                "segments": [
                    {
                        "id": s.id,
                        "status": s.status.value,
                        "text": s.text
                    } for s in new_state.segments
                ]
            }
            
            await websocket.send_json(response)
    
    except WebSocketDisconnect:
        print("WebSocket disconnected")
    except Exception as e:
        await websocket.send_json({"error": str(e)})
        await websocket.close()

@app.get("/health")
async def health_check():
    """健康检查"""
    return {"status": "ok", "service": "Smart Teleprompter"}

