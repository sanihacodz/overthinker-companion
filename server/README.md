# The Overthinker's Antidote - Backend Server

This is the FastAPI backend for the Antidote platform. It provides the API endpoints for analyzing overthoughts and manages the LiveKit token generation.

## 🧠 Code Flow & Architecture

The backend primarily handles the `POST /analyze` endpoint.

1. **Endpoint Routing (`app/main.py`)**: 
   - A request comes in containing a user's `thought`.
   - The endpoint invokes the async `process_thought` graph execution function.
2. **LangGraph Processing (`app/ai/graph.py`)**:
   - The function initializes a LangGraph `GraphState` with the raw thought.
   - The graph flows through the `analyze_node`, which is connected to Google's Gemini Flash Model via the `google-genai` SDK.
   - We inject the **Antidote System Prompt** (`app/ai/prompts.py`), configuring the AI to act like a Gen-Z therapist and format the response as JSON (React Flow nodes and edges).
3. **Data Formatting**:
   - The node safely parses the Gemini JSON response. If the API key is missing, the backend gracefully falls back to a mocked "Should I text my ex?" tree structure.
4. **LiveKit Tokens (`app/api/rooms.py`)**:
   - A secondary endpoint generates JWTs so that clients can connect to voice rooms via WebRTC.

## 🛠 Local Setup & Running

**1. Create a Virtual Environment**
```powershell
python -m venv venv
.\venv\Scripts\activate
```

**2. Install Dependencies**
```powershell
pip install -r requirements.txt
```

**3. Configure Environment**
Copy `.env.sample` to `.env`:
```powershell
cp .env.sample .env
```
Open `.env` and add your **GEMINI_API_KEY**. You can obtain this key for free from [Google AI Studio](https://aistudio.google.com/).
*(LiveKit and Supabase keys are optional if you are just testing the local thought analyzer tool).*

**4. Start the Server**
```powershell
uvicorn app.main:app --reload
```
The server will be available at `http://localhost:8000`. You can visit `http://localhost:8000/docs` to see the automated Swagger UI for testing endpoints.
