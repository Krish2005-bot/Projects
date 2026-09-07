from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from database import sessions_col
from middleware.auth_middleware import get_current_user
from services.gemini_service import generate_questions, evaluate_answers
from services.scoring_service import compute_confidence

router = APIRouter()

class GenerateRequest(BaseModel):
    jobRole:      str
    experience:   Optional[str] = "0"
    difficulty:   str = "medium"
    numQuestions: int = 10
    skills:       List[str] = []

class AnswerItem(BaseModel):
    answer:    str
    timeTaken: int

class EvaluateRequest(BaseModel):
    questions:   List[str]
    answers:     List[AnswerItem]
    jobRole:     str
    difficulty:  Optional[str] = "N/A"
    mode:        Optional[str] = "manual"

@router.post("/generate")
async def generate(
    body: GenerateRequest,
    current_user: dict = Depends(get_current_user)
):
    try:
        questions = await generate_questions(
            body.jobRole, body.experience,
            body.difficulty, body.numQuestions, body.skills
        )
        return {"questions": questions}
    except Exception as e:
        raise HTTPException(500, f"Question generation failed: {str(e)}")

@router.post("/evaluate")
async def evaluate(
    body: EvaluateRequest,
    current_user: dict = Depends(get_current_user)
):
    try:
        answers_dict = [a.dict() for a in body.answers]

        # AI evaluation from Gemini
        ai_result = await evaluate_answers(body.questions, answers_dict, body.jobRole)

        # NLP confidence scoring
        confidence = compute_confidence(answers_dict, body.questions)
        ai_result["confidence_level"] = confidence

        # Save session to MongoDB
        sessions_col.insert_one({
            "user_id":          current_user["sub"],
            "job_role":         body.jobRole,
            "difficulty":       body.difficulty,    # ← was hardcoded "N/A"
            "mode":             body.mode,          # ← was missing
            "num_questions":    len(body.questions),
            "questions":        body.questions,
            "answers":          answers_dict,
            "overall_score":    ai_result.get("overall_score", 0),
            "confidence_level": confidence,
            "feedback":         ai_result.get("feedback", []),
            "improvement_areas": ai_result.get("improvement_areas", []),
            "created_at":       datetime.utcnow().isoformat(),
        })

        return ai_result

    except Exception as e:
        raise HTTPException(500, f"Evaluation failed: {str(e)}")

@router.get("/history")
async def history(current_user: dict = Depends(get_current_user)):
    docs = sessions_col.find(
        {"user_id": current_user["sub"]},
        {"questions": 0, "answers": 0, "feedback": 0}
    ).sort("created_at", -1)

    sessions = []
    for doc in docs:
        doc["_id"] = str(doc["_id"])
        sessions.append(doc)

    return {"sessions": sessions}

@router.get("/history/{session_id}")
async def get_session(session_id: str, current_user: dict = Depends(get_current_user)):
    try:
        obj_id = ObjectId(session_id)
    except Exception:
        raise HTTPException(400, "Invalid session id")

    doc = sessions_col.find_one({
        "_id": obj_id,
        "user_id": current_user["sub"]
    })

    if not doc:
        raise HTTPException(404, "Session not found")

    doc["_id"] = str(doc["_id"])
    return doc