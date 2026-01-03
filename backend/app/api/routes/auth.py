from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from fastapi.security import OAuth2PasswordBearer

router = APIRouter(prefix="/auth", tags=["auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

class UserLogin(BaseModel):
    username: str
    password: str

@router.post("/login")
async def login(user: UserLogin):
    # Placeholder for login logic
    return {"message": "Login successful"}


class UserRegister(BaseModel):
    username: str
    password: str
    confirm_password: str

@router.post("/register")
async def register(user: UserRegister):
    # Placeholder for registration logic
    return {"message": "Registration successful"}


@router.get("/request-token")
async def request_token(token: Annotated[str, Depends(oauth2_scheme)]):
    return {"token": token}