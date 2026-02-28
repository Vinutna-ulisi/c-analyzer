from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database
from .auth_routes import get_current_user

router = APIRouter(
    prefix="/recommendations",
    tags=["Recommendations"],
)

def update_cognitive_profile(user_id: int, db: Session):
    behavioral_responses = db.query(models.BehavioralResponse).filter(models.BehavioralResponse.user_id == user_id).all()
    technical_attempts = db.query(models.TechnicalAttempt).filter(models.TechnicalAttempt.user_id == user_id).all()
    
    # Calculate Behavioral Score (0-100)
    behavioral_score = 0
    if behavioral_responses:
        total_weight = sum(r.score_weight for r in behavioral_responses)
        # assuming max question weight is 10 and max questions = 15 -> max score 150
        behavioral_score = min((total_weight / (len(behavioral_responses) * 10)) * 100, 100)
        
    # Calculate Technical Score, Accuracy, Speed
    technical_accuracy = 0
    response_speed_score = 0
    retry_persistence_score = 0
    
    if technical_attempts:
        correct_count = sum(1 for a in technical_attempts if a.is_correct)
        technical_accuracy = (correct_count / len(technical_attempts)) * 100
        
        avg_time = sum(a.response_time for a in technical_attempts) / len(technical_attempts)
        # Assuming optimal time is 30s. Less is better till a threshold, let's normalize this 0-100
        response_speed_score = max(0, 100 - (max(0, avg_time - 10) * 1.5)) # just an arbitrary scoring metric
        
        # Retry persistence: higher attempts means more retries
        retries = sum(a.attempt_number for a in technical_attempts) - len(technical_attempts)
        retry_persistence_score = min(retries * 10, 100)
        
    # Combine: Behavioral (40%), Technical (30%), Speed (15%), Retry (15%)
    final_score = (behavioral_score * 0.4) + (technical_accuracy * 0.3) + (response_speed_score * 0.15) + (retry_persistence_score * 0.15)
    
    # Classification
    if final_score < 40:
        cognitive_level = "Basic Learner"
        strategy = "Recommend structured learning, Daily 1 hour focused study, Video-based learning."
    elif final_score < 60:
        cognitive_level = "Developing Learner"
        strategy = "Focus on foundational concepts and take more practice tests."
    elif final_score < 75:
        cognitive_level = "Moderate Performer"
        strategy = "Practice problem solving, Weekly mock tests, Revision strategy."
    elif final_score < 90:
        cognitive_level = "Advanced Learner"
        strategy = "Competitive exams practice, Timed quizzes, Analytical challenges."
    else:
        cognitive_level = "Strong Analytical Learner"
        strategy = "Focus on complex edge-cases, help tutor basic learners, advanced project building."
        
    # Simple Learning Style Heuristics (based on behavioral questions if we had specific mapping,
    # for now we derive it from scores: high speed -> Practical, high behavioral -> Theoretical, otherwise Visual)
    if response_speed_score > 70:
        learning_style = "Practical"
    elif behavioral_score > 70:
        learning_style = "Theoretical"
    else:
        learning_style = "Visual"

    profile = db.query(models.CognitiveProfile).filter(models.CognitiveProfile.user_id == user_id).first()
    if profile:
        profile.behavioral_score = behavioral_score
        profile.technical_score = technical_accuracy
        profile.cognitive_level = cognitive_level
        profile.learning_style = learning_style
        profile.recommended_strategy = strategy
    else:
        profile = models.CognitiveProfile(
            user_id=user_id,
            behavioral_score=behavioral_score,
            technical_score=technical_accuracy,
            cognitive_level=cognitive_level,
            learning_style=learning_style,
            recommended_strategy=strategy
        )
        db.add(profile)
    db.commit()

@router.get("/profile", response_model=schemas.CognitiveProfileResponse)
def get_cognitive_profile(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    profile = db.query(models.CognitiveProfile).filter(models.CognitiveProfile.user_id == current_user.id).first()
    if not profile:
        update_cognitive_profile(current_user.id, db)
        profile = db.query(models.CognitiveProfile).filter(models.CognitiveProfile.user_id == current_user.id).first()
    return profile

@router.get("/courses", response_model=List[schemas.CourseResponse])
def get_recommended_courses(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    profile = db.query(models.CognitiveProfile).filter(models.CognitiveProfile.user_id == current_user.id).first()
    if not profile:
        update_cognitive_profile(current_user.id, db)
        profile = db.query(models.CognitiveProfile).filter(models.CognitiveProfile.user_id == current_user.id).first()
    
    # Map cognitive level to difficulty
    level_map = {
        "Strong Analytical Learner": "Advanced",
        "Advanced Learner": "Advanced",
        "Moderate Performer": "Intermediate",
        "Developing Learner": "Beginner",
        "Basic Learner": "Beginner"
    }
    target_difficulty = level_map.get(profile.cognitive_level, "Beginner")
    
    # Fetch courses matching difficulty
    recommended = db.query(models.Course).filter(models.Course.difficulty == target_difficulty).limit(5).all()
    
    # If not enough, fill with others
    if len(recommended) < 3:
        others = db.query(models.Course).filter(models.Course.difficulty != target_difficulty).limit(3).all()
        recommended.extend(others)
        
    return recommended

