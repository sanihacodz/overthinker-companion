from langgraph.graph import StateGraph, START, END
from typing_extensions import TypedDict
import os
import json
from google import genai
from .prompts import ANTIDOTE_SYSTEM_PROMPT

class GraphState(TypedDict):
    thought: str
    parsed_json: dict

def analyze_node(state: GraphState):
    api_key = os.environ.get("GEMINI_API_KEY", "")
    if not api_key or api_key == "your_gemini_api_key_here":
        # Return mock data if API key is not yet set
        return {"parsed_json": get_mock_data()}

    client = genai.Client(api_key=api_key)
    thought = state["thought"]
    
    # Using Gemini 2.5 flash as 3.0 flash map
    try:
        res = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=f"User's thought: {thought}",
            config=genai.types.GenerateContentConfig(
                system_instruction=ANTIDOTE_SYSTEM_PROMPT,
                temperature=0.7,
                response_mime_type="application/json"
            )
        )
        parsed = json.loads(res.text)
    except Exception as e:
        print(f"Error calling Gemini: {e}")
        parsed = get_mock_data()
        
    return {"parsed_json": parsed}

def get_mock_data():
    return {
        "nodes": [
            {
                "id": "1",
                "data": {
                    "label": "Should I text my ex?",
                    "vibeCheck": "Extremely delulu",
                    "chaosLevel": "High",
                    "brainRotScore": 9,
                    "isRoot": True
                },
                "position": { "x": 250, "y": 0 }
            },
            {
                "id": "2",
                "data": {
                    "label": "The Good Path: Don't text, drink water.",
                    "vibeCheck": "Hydrated and healing",
                    "chaosLevel": "Low",
                    "brainRotScore": 2
                },
                "position": { "x": 100, "y": 150 }
            },
            {
                "id": "3",
                "data": {
                    "label": "The Chaotic Path: Send a meme.",
                    "vibeCheck": "Main character syndrome",
                    "chaosLevel": "Extreme",
                    "brainRotScore": 10
                },
                "position": { "x": 400, "y": 150 }
            }
        ],
        "edges": [
            { "id": "e1-2", "source": "1", "target": "2", "label": "Healing Route", "animated": True },
            { "id": "e1-3", "source": "1", "target": "3", "label": "Chaos Route", "animated": True }
        ]
    }

workflow = StateGraph(GraphState)
workflow.add_node("analyzer", analyze_node)
workflow.add_edge(START, "analyzer")
workflow.add_edge("analyzer", END)

graph_app = workflow.compile()

async def process_thought(thought: str):
    # Execute the LangGraph workflow
    initial_state = {"thought": thought, "parsed_json": {}}
    result = graph_app.invoke(initial_state)
    return result["parsed_json"]
