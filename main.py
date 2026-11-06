from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from LLM.groq_connection import get_available_models
from auth.signup import signup
from auth.login import login

app = FastAPI()

class SignupRequest(BaseModel):
    username: str

class LoginRequest(BaseModel):
    username: str
    user_uuid: str

@app.get("/models")
def available_models():
    response = get_available_models()
    if not response["success"]:
        raise HTTPException(
            status_code=500,
            detail=response["error"]
        )
    return response

@app.post("/signup")
def user_signup(request: SignupRequest):
    response = signup(request.username)
    if not response["success"]:
        raise HTTPException(
            status_code=400,
            detail=response["error"]
        )
    return response

@app.post("/login")
def user_login(request: LoginRequest):
    response = login(
        username=request.username,
        user_uuid=request.user_uuid
    )
    if not response["success"]:
        raise HTTPException(
            status_code=401,
            detail=response["error"]
        )
    return response