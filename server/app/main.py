from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import os
import io
import edge_tts
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="The Overthinker's Antidote",
    description="Backend API for processing overthinking loops.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api.rooms import router as rooms_router
app.include_router(rooms_router, prefix="/api/rooms")

class AnalyzeRequest(BaseModel):
    user_id: str
    thought: str

class TTSRequest(BaseModel):
    text: str

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

@app.post("/tts")
async def text_to_speech(req: TTSRequest):
    """Generate natural-sounding TTS using Microsoft Edge Neural voices."""
    try:
        # en-US-AvaMultilingualNeural — young, natural female voice perfect for Gen-Z
        voice = "en-US-AvaMultilingualNeural"
        communicate = edge_tts.Communicate(req.text, voice, rate="+5%", pitch="+2Hz")

        # Collect all audio chunks into memory
        audio_buffer = io.BytesIO()
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_buffer.write(chunk["data"])

        audio_buffer.seek(0)
        return StreamingResponse(
            audio_buffer,
            media_type="audio/mpeg",
            headers={"Content-Disposition": "inline"}
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
