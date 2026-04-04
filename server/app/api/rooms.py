import os
from fastapi import APIRouter, HTTPException
from livekit import api

router = APIRouter()

@router.get("/getToken")
async def get_token(room_name: str, participant_name: str):
    api_key = os.environ.get("LIVEKIT_API_KEY")
    api_secret = os.environ.get("LIVEKIT_API_SECRET")
    
    if not api_key or not api_secret:
        raise HTTPException(status_code=500, detail="LiveKit credentials are not configured in the environment.")

    grants = api.VideoGrants(room_join=True, room=room_name)
    access_token = api.AccessToken(api_key, api_secret)
    access_token.with_identity(participant_name).with_grants(grants)
    token = access_token.to_jwt()

    return {
        "token": token,
        "url": os.environ.get("LIVEKIT_URL", "wss://livekit.example.com")
    }
