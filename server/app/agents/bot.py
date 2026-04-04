import logging
from livekit.agents import AutoSubscribe, JobContext, WorkerOptions, cli, llm
from livekit.agents.voice_assistant import VoiceAssistant
from livekit.plugins import google, silero
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger("antidote-bot")

async def entrypoint(ctx: JobContext):
    # Setup context
    initial_ctx = llm.ChatContext().append(
        role="system",
        text=(
            "You are the 'Antidote AI'. You help Gen-Z users stop overthinking by breaking down their problems. "
            "Your tone is sarcastic, supportive, and extremely online. You use terms like 'no cap', 'rent-free', 'main character', and 'delulu'. "
            "Keep your responses concise, as you are speaking out loud in a voice conversation."
        ),
    )

    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    # We use Google's Gemini models for STT, TTS, and LLM via livekit-plugins-google
    assistant = VoiceAssistant(
        vad=silero.VAD.load(),
        stt=google.STT(),
        llm=google.LLM(),
        tts=google.TTS(),
        chat_ctx=initial_ctx,
    )

    assistant.start(ctx.room)
    await assistant.say("Hey bestie, welcome to the vibe check room. Spill the tea, what are you overthinking today?", allow_interruptions=True)

if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
