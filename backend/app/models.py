from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    behavioral_responses = relationship("BehavioralResponse", back_populates="user")
    technical_attempts = relationship("TechnicalAttempt", back_populates="user")
    profile = relationship("CognitiveProfile", back_populates="user", uselist=False)

class BehavioralResponse(Base):
    __tablename__ = "behavioral_responses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    question_id = Column(Integer)
    selected_option = Column(String)
    score_weight = Column(Float)
    
    user = relationship("User", back_populates="behavioral_responses")

class TechnicalAttempt(Base):
    __tablename__ = "technical_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    question_id = Column(Integer)
    selected_answer = Column(String)
    correct_answer = Column(String)
    response_time = Column(Float) # in seconds
    is_correct = Column(Boolean)
    attempt_number = Column(Integer)
    
    user = relationship("User", back_populates="technical_attempts")

class CognitiveProfile(Base):
    __tablename__ = "cognitive_profiles"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    behavioral_score = Column(Float, default=0.0)
    technical_score = Column(Float, default=0.0)
    cognitive_level = Column(String, default="Beginner")
    learning_style = Column(String, default="General") # Visual, Theoretical, Practical
    recommended_strategy = Column(String, default="Explore foundations")
    last_updated = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="profile")

class Course(Base):
    __tablename__ = "courses"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    difficulty = Column(String)
    instructor = Column(String)
    image_url = Column(String, nullable=True)
    modules = relationship("Module", back_populates="course", cascade="all, delete-orphan")
    quiz = relationship("Quiz", back_populates="course", uselist=False, cascade="all, delete-orphan")

class Module(Base):
    __tablename__ = "modules"
    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"))
    title = Column(String)
    content_theoretical = Column(String, nullable=True) # Detailed text
    content_practical = Column(String, nullable=True)   # Labs/Code
    content_visual = Column(String, nullable=True)      # Summaries/Key points
    video_url = Column(String, nullable=True)
    order = Column(Integer)
    course = relationship("Course", back_populates="modules")

class Quiz(Base):
    __tablename__ = "quizzes"
    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), unique=True)
    title = Column(String)
    course = relationship("Course", back_populates="quiz")
    questions = relationship("Question", back_populates="quiz", cascade="all, delete-orphan")

class Question(Base):
    __tablename__ = "questions"
    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"))
    text = Column(String)
    options = Column(String) # Store as JSON string or comma-separated
    correct_answer = Column(String)
    explanation = Column(String, nullable=True)
    quiz = relationship("Quiz", back_populates="questions")
