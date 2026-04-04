from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(
    title="The Overthinker's Antidote",
    description="Backend API for processing overthinking loops.",
    version="1.0.0"
)

# Allow React app to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For hackathon, allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api.rooms import router as rooms_router
app.include_router(rooms_router, prefix="/api/rooms")

class AnalyzeRequest(BaseModel):
    user_id: str
    thought: str

@app.get("/")
def health_check():
    return {"status": "healthy", "vibe": "immaculate"}

@app.post("/analyze")
async def analyze_thought(req: AnalyzeRequest):
    try:
        from .ai.graph import process_thought
        result = await process_thought(req.thought)
        return {"data": result}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
