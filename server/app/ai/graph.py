from langgraph.graph import StateGraph, START, END
from typing_extensions import TypedDict
import os
import json
import re
import time
from google import genai
from google.genai import errors as genai_errors
from .prompts import ANTIDOTE_SYSTEM_PROMPT

class GraphState(TypedDict):
    thought: str
    parsed_json: dict

# Primary model, fallback if it's overloaded
PRIMARY_MODEL = 'gemini-3.1-flash-lite-preview'
FALLBACK_MODEL = 'gemini-2.0-flash'

def clean_json_response(text: str) -> str:
    """Strip markdown code fences if the model wraps output in them."""
    text = text.strip()
    match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', text)
    if match:
        return match.group(1).strip()
    return text

def call_gemini(client, model: str, thought: str):
    """Call Gemini generate_content and return parsed JSON."""
    res = client.models.generate_content(
        model=model,
        contents=f"User's thought: {thought}",
        config=genai.types.GenerateContentConfig(
            system_instruction=ANTIDOTE_SYSTEM_PROMPT,
            temperature=0.7,
            response_mime_type="application/json"
        )
    )
    raw = res.text
    print(f"[graph] Model used: {model} | Response preview: {raw[:200]}")
    cleaned = clean_json_response(raw)
    return json.loads(cleaned)

def analyze_node(state: GraphState):
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not set in environment.")

    client = genai.Client(api_key=api_key)
    thought = state["thought"]

    # Try primary model (gemini-3-flash-preview), fall back to gemini-2.0-flash on 503
    for attempt, model in enumerate([PRIMARY_MODEL, FALLBACK_MODEL]):
        try:
            if attempt > 0:
                print(f"[graph] Primary model overloaded, retrying with fallback: {model}")
                time.sleep(1)  # small pause before fallback
            parsed = call_gemini(client, model, thought)
            return {"parsed_json": parsed}
        except genai_errors.ServerError as e:
            if e.status_code == 503 and attempt == 0:
                print(f"[graph] 503 from {model}, switching to fallback.")
                continue
            raise  # re-raise if it's not a 503 or if fallback also fails
        except json.JSONDecodeError as e:
            print(f"[graph] JSON parse error from {model}: {e}")
            if attempt == 0:
                continue
            raise

    raise RuntimeError("All Gemini models failed to respond.")

workflow = StateGraph(GraphState)
workflow.add_node("analyzer", analyze_node)
workflow.add_edge(START, "analyzer")
workflow.add_edge("analyzer", END)

graph_app = workflow.compile()

async def process_thought(thought: str):
    initial_state = {"thought": thought, "parsed_json": {}}
    result = graph_app.invoke(initial_state)
    return result["parsed_json"]
