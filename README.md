# The Overthinker's Antidote 🧠✨

Welcome to **The Overthinker's Antidote**, a platform where users can dump their "brain-rot" overthinking loops and have an AI visualize them into a logical, hilarious, and helpful decision tree. It’s part utility tool, part Discord-like community, and part vibe-check.

## 🚀 Project Overview

This repository is split into two main sections:
1. **Frontend (`/client`)**: A React 19 application built with Vite, TypeScript, and Tailwind CSS. It features a React Flow canvas to visualize thought trees and a neon-infused modern UI.
2. **Backend (`/server`)**: A FastAPI Python backend powered by LangGraph. It orchestrates the AI logic, connecting to the Gemini 2.5 Flash model and generating the LiveKit tokens for voice rooms.

## 🏗 System Architecture & Flow

### 1. The Solo Dump Diagram Flow
- **Input**: User inputs a dilemma (e.g., "Should I text my ex back?") in the frontend.
- **API Call**: Frontend sends a `POST /analyze` request to the FastAPI backend.
- **AI Orchestration (LangGraph)**: 
  - The backend receives the prompt, initializes the LangGraph state, and calls Google's Gemini 2.5 Flash model using the `google-genai` SDK.
  - The model parses the thought, applies the "Antidote System Prompt" (sarcastic, Gen-Z tone), and calculates a `Vibe Check`, `Chaos Level`, and `Brain Rot Score`.
  - Gemini returns a structured JSON payload representing nodes and edges compatible with React Flow.
- **Rendering**: The backend sends the structure back to the frontend, which renders the glowing decision tree on the canvas.

### 2. The Voice & Sync Flow (Upcoming)
- Uses **LiveKit** to create a voice room where users can join and discuss their overthoughts.
- The FastAPI backend has an endpoint to generate a LiveKit Access Token based on environment credentials.
- **Supabase Realtime** synchronizes the React Flow trees across connected clients.

## 🔑 Required APIs & Setup

To run this project fully, you will need several API keys. Place them in their respective `.env` files.

### 1. Gemini API (Google AI Studio)
- **What it does**: Powers the LangGraph Analyzer.
- **Where to get it**: [Google AI Studio](https://aistudio.google.com/)
- **Cost**: Free tier available.
- **Where to put it**: `server/.env` -> `GEMINI_API_KEY`

### 2. LiveKit Cloud (Voice RTC)
- **What it does**: Provides infrastructure for WebRTC voice communication.
- **Where to get it**: [LiveKit Cloud](https://cloud.livekit.io/)
- **Cost**: Generous free tier.
- **Where to put it**: 
  - `server/.env` -> `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `LIVEKIT_URL`
  - `client/.env` -> `VITE_LIVEKIT_URL`

### 3. Supabase (Database & Realtime)
- **What it does**: Hosts the community feed and syncs tree state.
- **Where to get it**: [Supabase](https://supabase.com/)
- **Cost**: Free tier available.
- **Where to put it**: 
  - `server/.env` -> `SUPABASE_URL`, `SUPABASE_KEY`
  - `client/.env` -> `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

### 4. ElevenLabs (Optional / Upcoming)
- **What it does**: Provides Text-to-Speech voices for the AI agent to talk back.
- **Where to get it**: [ElevenLabs](https://elevenlabs.io/)
- **Where to put it**: `server/.env` -> `ELEVENLABS_API_KEY`

## 🏁 Getting Started

We recommend opening two separate terminal windows—one for the server and one for the client.
Please see the individual READMEs in `client/README.md` and `server/README.md` for specific execution commands.
