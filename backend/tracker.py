from typing import List
from models import SegmentStatus, ScriptSegment, PresentationState
from processor import calculate_similarity
import numpy as np
from collections import deque

class Tracker:
    def __init__(self, segments: List[ScriptSegment], embeddings: np.ndarray):
        self.state = PresentationState(segments=segments)
        self.embeddings = embeddings
        
        # 用户体验优化：动态阈值
        self.threshold_high = 0.75  # 高置信度匹配（降低以适应口语化表达）
        self.threshold_low = 0.25   # 低于此视为脱稿
        
        # 平滑处理：避免频繁跳动
        self.recent_matches = deque(maxlen=3)  # 保留最近3次匹配结果
        self.free_style_counter = 0  # 连续低相似度计数
        self.free_style_threshold = 3  # 连续3次才判定为Free Style

    def process_speech_vector(self, speech_vec: np.ndarray) -> PresentationState:
        """
        优化的追踪逻辑：
        1. 优先搜索当前位置附近（性能优化）
        2. 平滑处理（避免抖动）
        3. 智能Free Style判断（避免误触发）
        """
        best_sim = -1
        best_idx = -1
        
        # 优化1：优先搜索当前附近的段落（±5范围）
        search_range = self._get_smart_search_range()
        
        for i in search_range:
            if i < 0 or i >= len(self.embeddings):
                continue
            sim = calculate_similarity(speech_vec, self.embeddings[i])
            if sim > best_sim:
                best_sim = sim
                best_idx = i

        # 记录匹配历史
        self.recent_matches.append((best_idx, best_sim))

        # 逻辑判断：Free Style 检测（连续多次低相似度）
        if best_sim < self.threshold_low:
            self.free_style_counter += 1
            if self.free_style_counter >= self.free_style_threshold:
                self.state.is_free_style = True
            return self.state
        else:
            self.free_style_counter = 0
            self.state.is_free_style = False

        # 逻辑判断：正常匹配
        if best_sim > self.threshold_high:
            prev_idx = self.state.current_idx
            
            # 平滑处理：如果连续匹配到同一位置，才确认跳转
            if self._is_stable_match(best_idx):
                # 标记当前段落为 COVERED
                self.state.segments[best_idx].status = SegmentStatus.COVERED
                
                # 跳读检测：向前跳跃超过1段
                if prev_idx >= 0 and best_idx > prev_idx + 1:
                    for j in range(prev_idx + 1, best_idx):
                        if self.state.segments[j].status == SegmentStatus.PENDING:
                            self.state.segments[j].status = SegmentStatus.SKIPPED
                
                # 更新当前位置
                self.state.current_idx = best_idx
            
        return self.state
    
    def _get_smart_search_range(self) -> List[int]:
        """智能搜索范围：优先搜索当前附近"""
        current = self.state.current_idx
        total = len(self.embeddings)
        
        if current < 0:
            # 初始状态：全局搜索
            return list(range(total))
        
        # 优先搜索 current ± 10 的范围，然后扩展到全局
        nearby_range = list(range(max(0, current - 2), min(total, current + 15)))
        full_range = list(range(total))
        
        # 去重并保持nearby优先
        seen = set(nearby_range)
        result = nearby_range + [i for i in full_range if i not in seen]
        return result
    
    def _is_stable_match(self, idx: int) -> bool:
        """判断匹配是否稳定（避免抖动）"""
        if len(self.recent_matches) < 2:
            return True
        
        # 如果最近2次都匹配到相同或相邻位置，认为稳定
        recent_indices = [m[0] for m in self.recent_matches]
        return recent_indices.count(idx) >= 2 or abs(recent_indices[-1] - idx) <= 1

