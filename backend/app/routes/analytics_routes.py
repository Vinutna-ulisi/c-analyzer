from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from .. import models, database
from .auth_routes import get_current_user

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"],
)

@router.get("/performance")
def get_performance_analytics(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Fetch attempts
    attempts = db.query(models.TechnicalAttempt).filter(models.TechnicalAttempt.user_id == current_user.id).all()
    # Fetch behavioral
    behavioral = db.query(models.BehavioralResponse).filter(models.BehavioralResponse.user_id == current_user.id).all()
    # Fetch profile
    profile = db.query(models.CognitiveProfile).filter(models.CognitiveProfile.user_id == current_user.id).first()

    accuracy_trend: List[Dict[str, Any]] = []
    response_time_trend: List[Dict[str, Any]] = []
    
    # Process attempts to generate trend data
    # (Assuming questions are done sequentially)
    total_correct = 0
    for idx, attempt in enumerate(attempts):
        total_correct += 1 if attempt.is_correct else 0
        acc = float((total_correct / (idx + 1)) * 100)
        accuracy_trend.append({"attempt": idx + 1, "accuracy": round(acc, 2)})
        response_time_trend.append({"attempt": idx + 1, "time": attempt.response_time})

    return {
        "profile": profile,
        "accuracy_trend": accuracy_trend[-10:], # last 10
        "response_time_trend": response_time_trend[-10:],
        "total_attempts": len(attempts),
        "total_behavioral_responses": len(behavioral)
    }

