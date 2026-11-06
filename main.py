from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from LLM.groq_connection import get_available_models
from auth.signup import signup
from auth.login import login
from chat.chat_service import chat_service
from chat_Management.chat_history import chat_history
from chat_Management.get_all_chats import get_all_chats

app = FastAPI()

class SignupRequest(BaseModel):
    username: str

class LoginRequest(BaseModel):
    username: str
    user_uuid: str

class ChatRequest(BaseModel):
    user_uuid: str
    model: str
    message: str
    chat_id: str | None = None

class ChatHistoryRequest(BaseModel):
    user_uuid: str
    chat_id: str

class AllChatsRequest(BaseModel):
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

@app.post("/chat")
def user_chat(request: ChatRequest):
    response = chat_service(
        user_uuid=request.user_uuid,
        model=request.model,
        message=request.message,
        chat_id=request.chat_id
    )
    if not response["success"]:
        raise HTTPException(
            status_code=400,
            detail=response["error"]
        )
    return response

@app.post("/chat/history")
def user_chat_history(request: ChatHistoryRequest):
    response = chat_history(
        user_uuid=request.user_uuid,
        chat_id=request.chat_id
    )
    if not response["success"]:
        raise HTTPException(
            status_code=400,
            detail=response["error"]
        )
    return response

@app.post("/chats")
def user_all_chats(request: AllChatsRequest):
    response = get_all_chats(
        user_uuid=request.user_uuid
    )

    if not response["success"]:
        raise HTTPException(
            status_code=400,
            detail=response["error"]
        )

    return response