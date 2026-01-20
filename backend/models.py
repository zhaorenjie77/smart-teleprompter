from enum import Enum
from pydantic import BaseModel
from typing import List, Optional

class SegmentStatus(str, Enum):
    PENDING = "pending"
    COVERED = "covered"
    SKIPPED = "skipped"
    CURRENT = "current"

class ScriptSegment(BaseModel):
    id: int
    text: str
    status: SegmentStatus = SegmentStatus.PENDING
    embedding_idx: int

class PresentationState(BaseModel):
    segments: List[ScriptSegment]
    current_idx: int = -1
    is_free_style: bool = False

