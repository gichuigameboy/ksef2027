from pydantic import BaseModel, Field
from typing import List, Optional

class CurriculumTopic(BaseModel):
    id: str
    subject_id: str
    name: str
    description: str
    prerequisites: List[str] = [] # list of topic_ids that are prerequisites
    learning_objectives: List[str] = []
    order_index: int = 0
    active: bool = True

class CurriculumSubject(BaseModel):
    id: str
    name: str
    icon: str
    description: str
    topics: List[CurriculumTopic] = []
