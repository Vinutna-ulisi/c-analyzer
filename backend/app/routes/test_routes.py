from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database
from .auth_routes import get_current_user
from .recommendation_routes import update_cognitive_profile

router = APIRouter(
    prefix="/tests",
    tags=["Tests"],
)

@router.post("/behavioral", response_model=schemas.BehavioralResponseResponse)
def submit_behavioral_response(
    response: schemas.BehavioralResponseCreate, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_response = models.BehavioralResponse(
        user_id=current_user.id,
        question_id=response.question_id,
        selected_option=response.selected_option,
        score_weight=response.score_weight
    )
    db.add(db_response)
    db.commit()
    db.refresh(db_response)
    # trigger profile update implicitly or explicitly
    update_cognitive_profile(current_user.id, db)
    return db_response

@router.post("/technical", response_model=schemas.TechnicalAttemptResponse)
def submit_technical_attempt(
    attempt: schemas.TechnicalAttemptCreate, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_attempt = models.TechnicalAttempt(
        user_id=current_user.id,
        question_id=attempt.question_id,
        selected_answer=attempt.selected_answer,
        correct_answer=attempt.correct_answer,
        response_time=attempt.response_time,
        is_correct=attempt.is_correct,
        attempt_number=attempt.attempt_number
    )
    db.add(db_attempt)
    db.commit()
    db.refresh(db_attempt)
    # trigger profile update
    update_cognitive_profile(current_user.id, db)
    return db_attempt

