"""
轻量级 Processor（用于快速部署）
Lightweight Processor for fast deployment
"""

import re
import os
from typing import List, Dict
import google.generativeai as genai
import fitz  # PyMuPDF

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

class ScriptProcessor:
    def __init__(self):
        # 轻量级版本：不使用大型 ML 模型
        self.gemini_model = genai.GenerativeModel('gemini-2.5-flash')
        
    def split_text(self, text: str) -> List[str]:
        """
        智能分割中英文句子
        支持：中文句号、问号、感叹号；英文句号、问号、感叹号；分号
        """
        text = text.replace('\n', ' ').replace('\r', ' ')
        pattern = r'(?<=[。！？；])|(?<=[.!?;])(?=\s|$)'
        sentences = re.split(pattern, text)
        
        result = []
        for s in sentences:
            s = s.strip()
            if len(s) > 3:
                result.append(s)
        
        return result

    def get_embeddings(self, texts: List[str]):
        """
        简化版：返回简单的文本特征（用于文本匹配）
        """
        # 轻量级实现：返回文本长度和关键词
        return [{"text": t, "length": len(t), "words": t.split()[:5]} for t in texts]

    def extract_pdf_with_gemini(self, file_path: str) -> Dict[str, any]:
        """
        使用 Gemini 多模态能力深度理解 PDF/PPT
        """
        try:
            # 使用 PyMuPDF 提取文本
            doc = fitz.open(file_path)
            pages_analysis = []
            
            for page_num in range(len(doc)):
                page = doc[page_num]
                text = page.get_text()
                
                pages_analysis.append({
                    'page': page_num + 1,
                    'content': text
                })
            
            doc.close()
            
            # 生成整体摘要
            all_content = "\n\n".join([p['content'] for p in pages_analysis])
            summary_prompt = f"""
            以下是一份演讲 PPT 的文本内容：
            
            {all_content[:3000]}  # 限制长度
            
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
            if re.match(r'^[\d\-\*\•]', line) and len(line) > 10:
                points.append(line)
        return points

def calculate_similarity(vec1, vec2):
    """
    简化版相似度计算：基于文本重叠
    """
    if isinstance(vec1, dict) and isinstance(vec2, dict):
        text1 = vec1.get('text', '').lower()
        text2 = vec2.get('text', '').lower()
        
        # 简单的文本相似度：计算共同词数
        words1 = set(text1.split())
        words2 = set(text2.split())
        
        if not words1 or not words2:
            return 0.0
        
        common = words1.intersection(words2)
        return len(common) / max(len(words1), len(words2))
    
    return 0.0

