import re
import os
from typing import List, Dict
from sentence_transformers import SentenceTransformer
import numpy as np
import google.generativeai as genai
from pdf2image import convert_from_path
from PIL import Image

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

class ScriptProcessor:
    def __init__(self, model_name='paraphrase-multilingual-MiniLM-L12-v2'):
        # 使用多语言模型以支持中英文混合场景
        self.model = SentenceTransformer(model_name)
        self.gemini_model = genai.GenerativeModel('gemini-1.5-flash')
        
    def split_text(self, text: str) -> List[str]:
        """
        智能分割中英文句子
        支持：中文句号、问号、感叹号；英文句号、问号、感叹号；分号
        """
        # 预处理：统一换行为空格
        text = text.replace('\n', ' ').replace('\r', ' ')
        
        # 精细化分割正则：支持中英文混合
        # 匹配中文标点：。！？；
        # 匹配英文标点：. ! ? ;（后面需要有空格或结尾）
        pattern = r'(?<=[。！？；])|(?<=[.!?;])(?=\s|$)'
        sentences = re.split(pattern, text)
        
        # 清理空白并过滤
        result = []
        for s in sentences:
            s = s.strip()
            # 过滤掉过短的片段（可能是误分割）
            if len(s) > 3:  # 至少3个字符
                result.append(s)
        
        return result

    def get_embeddings(self, texts: List[str]):
        """生成多语言向量"""
        return self.model.encode(texts, show_progress_bar=False)

    def extract_pdf_with_gemini(self, file_path: str) -> Dict[str, any]:
        """
        使用 Gemini 多模态能力深度理解 PDF/PPT
        返回：{
            'summary': 整体内容摘要,
            'pages': [每页的详细分析],
            'key_points': 关键论点列表
        }
        """
        try:
            # 将 PDF 转换为图片（每页一张）
            images = convert_from_path(file_path, dpi=150)
            
            pages_analysis = []
            for i, img in enumerate(images):
                # 用 Gemini 分析每一页（包含文字+图表+布局理解）
                prompt = f"""
                这是演讲 PPT 的第 {i+1} 页。请详细分析：
                1. 页面上的所有文字内容（中英文均需提取）
                2. 图表、图片的含义和传达的信息
                3. 该页的核心论点是什么
                
                请用简洁的语言总结，方便后续问答使用。
                """
                
                response = self.gemini_model.generate_content([prompt, img])
                pages_analysis.append({
                    'page': i + 1,
                    'content': response.text
                })
            
            # 生成整体摘要
            all_content = "\n\n".join([p['content'] for p in pages_analysis])
            summary_prompt = f"""
            以下是一份演讲 PPT 的逐页分析：
            
            {all_content}
            
            请提取：
            1. 整体主题
            2. 3-5个核心论点
            3. 重要的数据或案例
            """
            
            summary_response = self.gemini_model.generate_content(summary_prompt)
            
            return {
                'summary': summary_response.text,
                'pages': pages_analysis,
                'key_points': self._extract_key_points(summary_response.text)
            }
        
        except Exception as e:
            # 用户体验优化：降级方案
            return {
                'summary': f"PDF 解析遇到问题：{str(e)}",
                'pages': [],
                'key_points': []
            }
    
    def _extract_key_points(self, text: str) -> List[str]:
        """从摘要中提取关键点"""
        lines = text.split('\n')
        points = []
        for line in lines:
            line = line.strip()
            # 提取编号或标记开头的关键点
            if re.match(r'^[\d\-\*\•]', line) and len(line) > 10:
                points.append(line)
        return points

def calculate_similarity(vec1, vec2):
    """余弦相似度计算（优化：避免除零错误）"""
    dot_product = np.dot(vec1, vec2)
    norm_a = np.linalg.norm(vec1)
    norm_b = np.linalg.norm(vec2)
    
    if norm_a < 1e-10 or norm_b < 1e-10:
        return 0.0
    
    return float(dot_product / (norm_a * norm_b))

