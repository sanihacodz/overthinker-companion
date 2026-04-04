import React, { useState } from 'react';
import { Sparkles, BrainCircuit, Users, Globe } from 'lucide-react';
import TreeCanvas from './components/canvas/TreeCanvas';
import Feed from './components/community/Feed';

function App() {
  const [thought, setThought] = useState('');
  const [loading, setLoading] = useState(false);
  const [treeData, setTreeData] = useState<{nodes: any[], edges: any[]} | null>(null);
  const [username, setUsername] = useState('AnxiousAxolotl_42');
  const [activeTab, setActiveTab] = useState<'solo' | 'community'>('solo');

  const handleAnalyze = async () => {
    if (!thought.trim()) return;
    setLoading(true);
    
    try {
      // Direct call to FastAPI backend
      const res = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: username, thought })
      });
      const data = await res.json();
      if (data && data.data) {
        setTreeData(data.data);
      }
    } catch (err) {
      console.error("Failed to analyze thought", err);
    } finally {
      setLoading(false);
    }
  };

  const generateName = () => {
    const adjectives = ['Anxious', 'Delulu', 'MainCharacter', 'Chaotic', 'NPC', 'Based'];
    const nouns = ['Axolotl', 'Energy', 'Vibes', 'Overthinker', 'Gremlin', 'Bestie'];
    const num = Math.floor(Math.random() * 1000);
    const newName = `${adjectives[Math.floor(Math.random()*adjectives.length)]}${nouns[Math.floor(Math.random()*nouns.length)]}_${num}`;
    setUsername(newName);
  };

  return (
    <div className="w-full h-screen flex flex-col bg-[#0b0c10] text-white overflow-hidden font-sans">
      {/* Header */}
      <header className="w-full p-4 border-b border-white/10 flex justify-between items-center bg-[#1f2833]/50 backdrop-blur">
        <div className="flex items-center gap-2">
          <BrainCircuit className="text-[var(--color-neon-purple)]" />
          <h1 className="font-bold text-xl tracking-tight">The Overthinker's Antidote</h1>
        </div>
        
        <div className="flex bg-[#0b0c10] border border-white/10 rounded-full p-1">
          <button 
            onClick={() => setActiveTab('solo')}
            className={`px-4 py-1 rounded-full text-sm transition-all ${activeTab === 'solo' ? 'bg-white/10 font-bold' : 'text-gray-400 hover:text-white'}`}
          >
            Solo Dump
          </button>
          <button 
            onClick={() => setActiveTab('community')}
            className={`px-4 py-1 rounded-full text-sm transition-all flex items-center gap-1 ${activeTab === 'community' ? 'bg-white/10 font-bold' : 'text-gray-400 hover:text-white'}`}
          >
            <Globe size={14}/> Feed
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={generateName}
            className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition-colors flex items-center gap-2"
          >
             {username}
          </button>
          <button className="bg-[var(--color-neon-pink)] hover:bg-pink-600 text-white px-4 py-2 rounded-md font-semibold transition-all shadow-[0_0_15px_rgba(255,42,133,0.4)] flex items-center gap-2">
            <Users size={16} /> Invite Vibe Check
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center overflow-y-auto">
        {activeTab === 'community' ? (
          <Feed />
        ) : !treeData ? (
          <div className="flex-1 w-full max-w-2xl flex flex-col justify-center gap-8 px-4 py-12">
            <div className="text-center">
              <h2 className="text-4xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-neon-pink)] to-[var(--color-neon-blue)]">
                Dump Your Brain-Rot.
              </h2>
              <p className="text-gray-400">
                Type your overthinking loop below and our AI will visualize it into a logical, hilarious decision tree.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <textarea 
                className="w-full h-32 bg-[#1f2833] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-[var(--color-neon-purple)] focus:ring-1 focus:ring-[var(--color-neon-purple)] transition-all resize-none shadow-inner"
                placeholder="Should I text my ex back after they liked my story?"
                value={thought}
                onChange={(e) => setThought(e.target.value)}
              />
              <button 
                onClick={handleAnalyze}
                disabled={loading}
                className="self-end bg-[var(--color-neon-purple)] hover:bg-purple-600 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-bold transition-all shadow-[0_0_15px_rgba(176,38,255,0.4)] flex items-center gap-2"
              >
                {loading ? 'Analyzing...' : <><Sparkles size={18} /> Solve My Overthought</>}
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full h-full relative">
            <button 
              onClick={() => setTreeData(null)}
              className="absolute top-4 left-4 z-10 bg-white/10 hover:bg-white/20 px-4 py-2 rounded text-sm backdrop-blur transition-all"
            >
              ← Back to Brain Dump
            </button>
            <TreeCanvas nodes={treeData.nodes} edges={treeData.edges} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
