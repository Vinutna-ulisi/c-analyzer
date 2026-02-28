from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime
    class Config:
        orm_mode = True

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class BehavioralResponseCreate(BaseModel):
    question_id: int
    selected_option: str
    score_weight: float

class BehavioralResponseResponse(BehavioralResponseCreate):
    id: int
    user_id: int
    class Config:
        orm_mode = True

class TechnicalAttemptCreate(BaseModel):
    question_id: int
    selected_answer: str
    correct_answer: str
    response_time: float
    is_correct: bool
    attempt_number: int

class TechnicalAttemptResponse(TechnicalAttemptCreate):
    id: int
    user_id: int
    class Config:
        orm_mode = True

class CognitiveProfileBase(BaseModel):
    behavioral_score: float
    technical_score: float
    cognitive_level: str
    learning_style: str
    recommended_strategy: str

class CognitiveProfileResponse(CognitiveProfileBase):
    id: int
    user_id: int
    last_updated: datetime
    class Config:
        orm_mode = True

class ModuleBase(BaseModel):
    title: str
    content_theoretical: Optional[str] = None
    content_practical: Optional[str] = None
    content_visual: Optional[str] = None
    video_url: Optional[str] = None
    order: int

class ModuleCreate(ModuleBase):
    course_id: int

class ModuleResponse(ModuleBase):
    id: int
    course_id: int
    class Config:
        orm_mode = True

class QuestionBase(BaseModel):
    text: str
    options: str
    correct_answer: str
    explanation: Optional[str] = None

class QuestionResponse(QuestionBase):
    id: int
    quiz_id: int
    class Config:
        orm_mode = True

class QuizBase(BaseModel):
    title: str

class QuizResponse(QuizBase):
    id: int
    course_id: int
    questions: List[QuestionResponse] = []
    class Config:
        orm_mode = True

class CourseBase(BaseModel):
    title: str
    description: str
    difficulty: str
    instructor: str
    image_url: Optional[str] = None

class CourseCreate(CourseBase):
    pass

class CourseResponse(CourseBase):
    id: int
    modules: List[ModuleResponse] = []
    quiz: Optional[QuizResponse] = None
    class Config:
        orm_mode = True
