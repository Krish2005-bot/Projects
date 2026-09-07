from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from database import users_col
from services.auth_service import hash_password, verify_password, create_token
from bson import ObjectId

router = APIRouter()

class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

@router.post("/signup")
async def signup(body: SignupRequest):
    if users_col.find_one({"email": body.email}):
        raise HTTPException(400, "Email already registered")

    result = users_col.insert_one({
        "name":     body.name,
        "email":    body.email,
        "password": hash_password(body.password),
    })
    user_id = str(result.inserted_id)
    token   = create_token(user_id, body.email)

    return {
        "token": token,
        "user": {"id": user_id, "name": body.name, "email": body.email}
    }

@router.post("/login")
async def login(body: LoginRequest):
    user = users_col.find_one({"email": body.email})
    if not user or not verify_password(body.password, user["password"]):
        raise HTTPException(401, "Invalid email or password")

    user_id = str(user["_id"])
    token   = create_token(user_id, body.email)

    return {
        "token": token,
        "user": {"id": user_id, "name": user["name"], "email": body.email}
    }