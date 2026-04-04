import React, { useState } from 'react';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  BarVisualizer,
  ConnectionStateToast,
  VoiceAssistantControlBar,
  useVoiceAssistant,
} from '@livekit/components-react';
import '@livekit/components-styles';

export default function VibeRoom({ onLeave }: { onLeave: () => void }) {
  const [token, setToken] = useState('');
  const [url, setUrl] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [roomName, setRoomName] = useState('vibe-check-room');
  const [username, setUsername] = useState('AnxiousParticipant_' + Math.floor(Math.random() * 100));

  const joinRoom = async () => {
    setConnecting(true);
    try {
      // Connect to our FastAPI endpoint to get the LiveKit token
      const res = await fetch(`http://localhost:8000/api/rooms/getToken?room_name=${roomName}&participant_name=${username}`);
      const data = await res.json();
      setToken(data.token);
      setUrl(data.url);
    } catch (e) {
      console.error(e);
      alert('Failed to connect to room. Server might be down!');
    } finally {
      setConnecting(false);
    }
  };

  if (token === '') {
    return (
      <div className="flex-1 w-full flex flex-col items-center justify-center p-4">
        <div className="bg-[#1f2833] p-8 rounded-xl border border-white/10 shadow-lg text-center max-w-sm w-full">
          <h2 className="text-2xl font-bold mb-4 text-[var(--color-neon-pink)]">Join Vibe Check</h2>
          <p className="text-gray-400 mb-6 text-sm">Jump into a voice room with the Antidote AI agent to talk through your problems out loud.</p>
          <div className="flex flex-col gap-3">
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-[#0b0c10] border border-white/20 p-2 rounded text-white" 
              placeholder="Your Alias" 
            />
            <input 
              type="text" 
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="bg-[#0b0c10] border border-white/20 p-2 rounded text-white" 
              placeholder="Room Name" 
            />
            <button 
              onClick={joinRoom}
              disabled={connecting}
              className="bg-[var(--color-neon-purple)] hover:bg-purple-600 font-bold py-2 rounded mt-2"
            >
              {connecting ? "Connecting..." : "Connect"}
            </button>
            <button onClick={onLeave} className="text-gray-400 hover:text-white mt-2 underline text-sm">Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full flex flex-col relative h-[500px]">
      <LiveKitRoom
        token={token}
        serverUrl={url}
        connect={true}
        onDisconnected={onLeave}
        audio={true}
        className="w-full h-full flex flex-col bg-[#0b0c10]"
      >
        <RoomAudioRenderer />
        <ConnectionStateToast />
        
        <div className="flex-1 flex flex-col items-center justify-center relative">
          <div className="absolute top-4 left-4">
            <button onClick={onLeave} className="bg-white/10 px-3 py-1 rounded text-sm hover:bg-white/20">Leave Room</button>
          </div>
          
          <h2 className="text-xl font-bold mb-8 text-[var(--color-neon-blue)]">Live Session: {roomName}</h2>
          
          <AgentVisualizer />
        </div>

        <div className="w-full bg-[#1f2833] p-4 flex justify-center border-t border-white/10">
          <VoiceAssistantControlBar />
        </div>
      </LiveKitRoom>
    </div>
  );
}

function AgentVisualizer() {
  const { state, audioTrack } = useVoiceAssistant();
  
  return (
    <div className="flex flex-col items-center bg-[#1f2833]/50 p-10 rounded-2xl border border-white/10 shadow-[0_0_30px_rgba(176,38,255,0.15)] relative overflow-hidden">
      <div className={`text-sm mb-4 uppercase font-bold tracking-widest ${state === 'speaking' ? 'text-[var(--color-neon-pink)]' : 'text-gray-400'}`}>
        Antidote AI: {state}
      </div>
      
      <div className="h-24 w-64 flex items-center justify-center">
        {audioTrack ? (
          <BarVisualizer
            state={state}
            trackRef={audioTrack}
            barCount={7}
            options={{ minHeight: 10 }}
            className="w-full h-full"
          />
        ) : (
          <span className="text-gray-500 animate-pulse">Waiting for AI Agent...</span>
        )}
      </div>
      <p className="mt-8 text-xs text-gray-500 text-center max-w-sm">Make sure you have started the backend agent worker in your terminal to see the AI join the room.</p>
    </div>
  );
}
