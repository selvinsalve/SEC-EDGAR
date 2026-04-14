from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
import bcrypt
import jwt
import datetime

from database import get_db
import models

router = APIRouter()
SECRET_KEY = "sec_comply_super_secret"

class RegisterRequest(BaseModel):
    email: str
    password: str
    first_name: str
    last_name: str
    age: int
    business_details: str
    address: str

class LoginRequest(BaseModel):
    user_id: str
    password: str

@router.post("/register")
def register(user: RegisterRequest, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    new_user = models.User(
        email=user.email,
        password_hash=hashed_password,
        first_name=user.first_name,
        last_name=user.last_name,
        # age=user.age,
        business_details=user.business_details,
        address=user.address
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User registered successfully"}

@router.post("/login")
def login(creds: LoginRequest, db: Session = Depends(get_db)):
    # Provided template uses "userId", which we map to email
    user = db.query(models.User).filter(models.User.email == creds.user_id).first()
    if not user or not bcrypt.checkpw(creds.password.encode('utf-8'), user.password_hash.encode('utf-8')):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        
    token_data = {
        "sub": user.email,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=1)
    }
    token = jwt.encode(token_data, SECRET_KEY, algorithm="HS256")
    
    return {
        "token": token,
        "user_id": user.email,
        "company": user.business_details
    }
