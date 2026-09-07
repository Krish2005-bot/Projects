from jose import jwt, JWTError
import bcrypt, os
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

SECRET  = os.getenv("JWT_SECRET")
EXPIRE  = int(os.getenv("JWT_EXPIRE_HOURS", 72))
ALGO    = "HS256"

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.utcnow() + timedelta(hours=EXPIRE)
    }
    return jwt.encode(payload, SECRET, algorithm=ALGO)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET, algorithms=[ALGO])
    except JWTError:
        return None