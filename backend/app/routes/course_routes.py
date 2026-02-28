from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from .. import models, schemas, database

router = APIRouter(
    prefix="/courses",
    tags=["Courses"],
)

@router.get("/", response_model=List[schemas.CourseResponse])
def get_courses(db: Session = Depends(database.get_db)):
    return db.query(models.Course).options(joinedload(models.Course.modules)).all()

@router.get("/{course_id}", response_model=schemas.CourseResponse)
def get_course(course_id: int, db: Session = Depends(database.get_db)):
    course = db.query(models.Course).options(
        joinedload(models.Course.modules),
        joinedload(models.Course.quiz).joinedload(models.Quiz.questions)
    ).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course
