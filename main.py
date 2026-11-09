from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel

from LLM.groq_connection import get_available_models
from auth.signup import signup
from auth.login import login
from chat.chat_service import chat_service
from chat_Management.chat_history import chat_history
from chat_Management.get_all_chats import get_all_chats

from APIAuth.basic_auth import verify_basic_auth
from APIAuth.generate_jwt import generate_jwt
from APIAuth.verify_jwt import verify_jwt

app = FastAPI()

# Authentication schemes
basic_security = HTTPBasic()
bearer_security = HTTPBearer()

# Request Models
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

# Basic Auth Dependency
def require_basic_auth(
    credentials: HTTPBasicCredentials = Depends(basic_security)
):
    response = verify_basic_auth(
        username=credentials.username,
        password=credentials.password
    )
    if not response["success"]:
        raise HTTPException(
            status_code=401,
            detail=response["error"],
            headers={"WWW-Authenticate": "Basic"}
        )
    return True

# JWT Verification Dependency
def require_jwt(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_security)
):
    response = verify_jwt(credentials.credentials)
    if not response["success"]:
        raise HTTPException(
            status_code=401,
            detail=response["error"],
            headers={"WWW-Authenticate": "Bearer"}
        )
    return response["payload"]


# Token Generation API
@app.post("/token")
def create_access_token(
    authenticated: bool = Depends(require_basic_auth)
):
    response = generate_jwt()
    if not response["success"]:
        raise HTTPException(
            status_code=500,
            detail=response["error"]
        )
    return response


# Available Models API
@app.get("/models", dependencies=[Depends(require_jwt)])
def available_models():
    response = get_available_models()
    if not response["success"]:
        raise HTTPException(
            status_code=500,
            detail=response["error"]
        )
    return response

# Signup API
@app.post("/signup")
def user_signup(request: SignupRequest):
    response = signup(request.username)
    if not response["success"]:
        raise HTTPException(
            status_code=400,
            detail=response["error"]
        )
    return response

# Login API
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

# Chat API
@app.post("/chat", dependencies=[Depends(require_jwt)])
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

# Chat History API
@app.post("/chat/history", dependencies=[Depends(require_jwt)])
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


# All Chats API
@app.post("/chats", dependencies=[Depends(require_jwt)])
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
