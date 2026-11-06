from fastapi import FastAPI, HTTPException
from LLM.groq_connection import get_available_models

app = FastAPI()

@app.get("/models")
def available_models():
    response = get_available_models()
    if not response["success"]:
        raise HTTPException(
            status_code=500,
            detail=response["error"]
        )
    return response
