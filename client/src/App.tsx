import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Sparkles, BrainCircuit, Users, Globe, Share2, Volume2, VolumeX, Star, X, BarChart3 } from 'lucide-react';
import TreeCanvas from './components/canvas/TreeCanvas';
import Feed from './components/community/Feed';
import VibeRoom from './components/rooms/VibeRoom';
import AnalysisPage from './components/analysis/AnalysisPage';
import { supabase } from './lib/supabase';

interface TreeData {
  nodes: any[];
  edges: any[];
  recommended?: { pathId: string; reason: string };
}

function App() {
  const [thought, setThought] = useState('');
  const [loading, setLoading] = useState(false);
  const [treeData, setTreeData] = useState<TreeData | null>(null);
  const [username, setUsername] = useState('AnxiousAxolotl_42');
  const [activeTab, setActiveTab] = useState<'solo' | 'community' | 'voice' | 'analysis'>('solo');
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [revealedPaths, setRevealedPaths] = useState<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Reset state when tree changes
  useEffect(() => {
    setRevealedPaths(new Set());
    setSelectedNode(null);
    stopAudio();
  }, [treeData]);

  // ──── Build visible nodes/edges based on revealed state ────
  const visibleData = useMemo(() => {
    if (!treeData) return { nodes: [], edges: [] };

    const allNodes = treeData.nodes;
    const allEdges = treeData.edges;

    // Find root
    const rootNode = allNodes.find((n: any) => n.data.isRoot || n.data.nodeType === 'root');
    if (!rootNode) return { nodes: allNodes, edges: allEdges };

    // Find path nodes (direct children of root)
    const pathEdges = allEdges.filter((e: any) => e.source === rootNode.id);
    const pathIds = new Set(pathEdges.map((e: any) => e.target));

    // Always visible: root + path nodes + edges between root and paths
    const visibleNodeIds = new Set<string>([rootNode.id, ...pathIds]);
    const visibleEdgeIds = new Set<string>(pathEdges.map((e: any) => e.id));

    // For each revealed path, add ALL its descendants recursively
    for (const pathId of revealedPaths) {
      const queue = [pathId];
      while (queue.length > 0) {
        const current = queue.shift()!;
        const childEdges = allEdges.filter((e: any) => e.source === current);
        for (const edge of childEdges) {
          visibleNodeIds.add(edge.target);
          visibleEdgeIds.add(edge.id);
          queue.push(edge.target);
        }
      }
    }

    // Mark path nodes as locked/unlocked
    const nodes = allNodes
      .filter((n: any) => visibleNodeIds.has(n.id))
      .map((n: any) => ({
        ...n,
        data: {
          ...n.data,
          isRecommended: treeData.recommended?.pathId === n.id,
          isLocked: pathIds.has(n.id) && !revealedPaths.has(n.id),
        }
      }));

    const edges = allEdges.filter((e: any) => visibleEdgeIds.has(e.id));

    return { nodes, edges };
  }, [treeData, revealedPaths]);

  // ──── TTS via Edge Neural Voice ────
  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    setIsSpeaking(false);
  };

  const speakText = async (text: string) => {
    if (isSpeaking) {
      stopAudio();
      return;
    }

    setIsSpeaking(true);
    try {
      const res = await fetch('http://localhost:8000/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        console.error('TTS failed:', res.status);
        setIsSpeaking(false);
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(url);
        audioRef.current = null;
      };

      audio.play();
    } catch (err) {
      console.error('TTS error:', err);
      setIsSpeaking(false);
    }
  };

  // ──── Handlers ────
  const handleAnalyze = async () => {
    if (!thought.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: username, thought })
      });
      const data = await res.json();
      if (data && data.data) {
        const tree = data.data;
        setTreeData(tree);
        // ── Save session to Supabase for analytics ──
        try {
          const rootNode = tree.nodes.find((n: any) => n.data.isRoot || n.data.nodeType === 'root');
          const pathNodes = tree.nodes.filter((n: any) => n.data.nodeType === 'path');
          const edgeCaseNodes = tree.nodes.filter((n: any) => n.data.nodeType === 'edge_case');
          // Derive sentiment from root chaos level
          const chaosToSentiment: Record<string, string> = {
            Mild: 'Calm', Medium: 'Neutral', High: 'Anxious', Extreme: 'Anxious', Biohazard: 'Chaotic',
          };
          const sentiment = chaosToSentiment[rootNode?.data.chaosLevel] || 'Neutral';
          // Simple text hash for loop detection
          const revisit_hash = thought.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().slice(0, 60);
          await supabase.from('user_sessions').insert([{
            username,
            dilemma: thought,
            tree_data: tree,
            brain_rot_score: rootNode?.data.brainRotScore || 5,
            chaos_level: rootNode?.data.chaosLevel || 'Medium',
            node_count: tree.nodes.length,
            edge_case_count: edgeCaseNodes.length,
            path_count: pathNodes.length,
            recommended_path_id: tree.recommended?.pathId || null,
            sentiment,
            session_hour: new Date().getHours(),
            revisit_hash,
          }]);
        } catch (sessionErr) {
          console.warn('Session save failed (non-critical):', sessionErr);
        }
      }
    } catch (err) {
      console.error("Failed to analyze thought", err);
    } finally {
      setLoading(false);
    }
  };

  const generateName = () => {
    const adj = ['Anxious', 'Delulu', 'MainCharacter', 'Chaotic', 'NPC', 'Based'];
    const noun = ['Axolotl', 'Energy', 'Vibes', 'Overthinker', 'Gremlin', 'Bestie'];
    setUsername(`${adj[Math.floor(Math.random()*adj.length)]}${noun[Math.floor(Math.random()*noun.length)]}_${Math.floor(Math.random()*1000)}`);
  };

  const handlePublish = async () => {
    if (!treeData) return;
    const rootNode = treeData.nodes.find((n: any) => n.data.isRoot);
    try {
      const { error } = await supabase.from('thoughts').insert([
        { author: username, dilemma: thought, tree_data: treeData, vibe_check: rootNode?.data.vibeCheck || 'Unknown' }
      ]);
      if (error) throw error;
      alert("Published!");
      setActiveTab('community');
      setTreeData(null);
      setThought('');
    } catch (err) {
      console.error("Publish failed", err);
    }
  };

  const handleNodeClick = useCallback((_: any, node: any) => {
    // If locked path → reveal its entire branch + auto-narrate
    if (node.data.isLocked && node.data.nodeType === 'path') {
      setRevealedPaths(prev => new Set(prev).add(node.id));
      if (node.data.ttsScript) speakText(node.data.ttsScript);
    }
    setSelectedNode(node);
  }, [isSpeaking]);

  const chaosColors: Record<string, string> = {
    Mild: '#22c55e', Medium: '#facc15', High: '#f97316', Extreme: '#ef4444', Biohazard: '#d946ef',
  };

  return (
    <div className="w-full h-screen flex flex-col bg-[#0b0c10] text-white overflow-hidden font-sans">
      {/* Header */}
      <header className="w-full px-4 py-3 border-b border-white/10 flex justify-between items-center bg-[#0d1117]/80 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <BrainCircuit className="text-[var(--color-neon-purple)]" size={22} />
          <h1 className="font-bold text-lg tracking-tight">Antidote</h1>
        </div>
        <div className="flex bg-[#0b0c10] border border-white/10 rounded-full p-0.5">
          <button onClick={() => setActiveTab('solo')}
            className={`px-3 py-1 rounded-full text-xs transition-all ${activeTab === 'solo' ? 'bg-white/10 font-bold' : 'text-gray-400 hover:text-white'}`}>Solo</button>
          <button onClick={() => setActiveTab('community')}
            className={`px-3 py-1 rounded-full text-xs transition-all flex items-center gap-1 ${activeTab === 'community' ? 'bg-white/10 font-bold' : 'text-gray-400 hover:text-white'}`}>
            <Globe size={11}/> Feed</button>
          <button onClick={() => setActiveTab('analysis')}
            className={`px-3 py-1 rounded-full text-xs transition-all flex items-center gap-1 ${activeTab === 'analysis' ? 'bg-white/10 font-bold' : 'text-gray-400 hover:text-white'}`}>
            <BarChart3 size={11}/> Analysis</button>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={generateName}
            className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1 rounded-full transition-colors">{username}</button>
          <button onClick={() => setActiveTab('voice')}
            className={`bg-[var(--color-neon-pink)] hover:bg-pink-600 text-white px-3 py-1.5 rounded-lg font-semibold text-xs transition-all shadow-[0_0_12px_rgba(255,42,133,0.3)] flex items-center gap-1.5 ${activeTab === 'voice' ? 'ring-2 ring-white' : ''}`}>
            <Users size={13} /> Vibe Check</button>
        </div>
      </header>

      <main className="flex-1 flex flex-col overflow-hidden" style={{ minHeight: 0 }}>
        {activeTab === 'voice' ? (
          <VibeRoom onLeave={() => setActiveTab('solo')} />
        ) : activeTab === 'analysis' ? (
          <AnalysisPage username={username} onBack={() => setActiveTab('solo')} />
        ) : activeTab === 'community' ? (
          <div className="flex-1 w-full overflow-y-auto flex flex-col items-center">
            <Feed onViewTree={(tree: any) => { setTreeData(tree); setActiveTab('solo'); }} />
          </div>
        ) : !treeData ? (
          /* ──── Input Screen ──── */
          <div className="flex-1 w-full flex flex-col items-center justify-center overflow-y-auto">
            <div className="w-full max-w-xl flex flex-col gap-6 px-4">
              <div className="text-center">
                <h2 className="text-3xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-neon-pink)] to-[var(--color-neon-blue)]">
                  Dump Your Brain-Rot.
                </h2>
                <p className="text-gray-500 text-sm">Type your overthinking loop and we'll map every possible outcome.</p>
              </div>
              <div className="flex flex-col gap-3">
                <textarea
                  className="w-full h-28 bg-[#111827] border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-[var(--color-neon-purple)]/60 focus:ring-1 focus:ring-[var(--color-neon-purple)]/30 transition-all resize-none placeholder-gray-600"
                  placeholder="Should I text my ex back after they liked my story?"
                  value={thought}
                  onChange={(e) => setThought(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAnalyze(); } }}
                />
                <button onClick={handleAnalyze} disabled={loading || !thought.trim()}
                  className="self-end bg-[var(--color-neon-purple)] hover:bg-purple-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-all shadow-[0_0_15px_rgba(176,38,255,0.3)] flex items-center gap-2">
                  {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing...</>
                    : <><Sparkles size={16} /> Solve My Overthought</>}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ──── Tree View ──── */
          <div className="flex-1 w-full relative" style={{ minHeight: 0 }}>
            {/* Top bar */}
            <div className="absolute top-4 left-4 z-10 flex gap-2">
              <button onClick={() => { setTreeData(null); setSelectedNode(null); stopAudio(); }}
                className="bg-black/60 hover:bg-black/80 border border-white/20 backdrop-blur px-4 py-2 rounded-lg text-sm transition-all">← Back</button>
              <button onClick={handlePublish}
                className="bg-[var(--color-neon-blue)] hover:bg-blue-500 text-[var(--color-dark-bg)] px-4 py-2 rounded-lg font-bold text-sm shadow-[0_0_10px_rgba(0,240,255,0.3)] transition-all flex items-center gap-1">
                <Share2 size={13} /> Publish</button>
            </div>

            {/* Recommended banner */}
            {treeData.recommended && (
              <div className="absolute top-4 right-4 z-10 bg-black/70 border border-[var(--color-neon-blue)]/30 backdrop-blur px-3 py-2 rounded-lg flex items-center gap-2 max-w-xs">
                <Star size={14} className="text-[var(--color-neon-blue)] shrink-0" />
                <span className="text-[10px] text-gray-300 leading-tight">
                  <strong className="text-[var(--color-neon-blue)]">Best move:</strong> {treeData.recommended.reason}
                </span>
              </div>
            )}

            {/* Bottom hints */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-black/60 border border-white/10 backdrop-blur px-4 py-1.5 rounded-full text-[10px] text-gray-500 flex gap-4">
              <span>🔓 Click locked paths to reveal</span>
              <span>👆 Click any node for details + voice</span>
            </div>

            {/* ReactFlow tree graph */}
            <TreeCanvas
              nodes={visibleData.nodes}
              edges={visibleData.edges}
              onNodeClick={handleNodeClick}
              recommended={treeData.recommended}
            />

            {/* ──── Detail Panel (slides from right) ──── */}
            {selectedNode && (
              <div className="absolute top-0 right-0 h-full w-80 bg-[#0d1117]/95 backdrop-blur-xl border-l border-white/10 z-20 flex flex-col overflow-y-auto animate-slide-in">
                <div className="p-4 flex flex-col gap-3">
                  <button onClick={() => { setSelectedNode(null); stopAudio(); }}
                    className="self-end p-1 text-gray-400 hover:text-white"><X size={16} /></button>

                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{selectedNode.data.emoji || '🧠'}</span>
                    <div>
                      <h3 className="text-white font-bold text-sm leading-snug">{selectedNode.data.label}</h3>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase"
                          style={{
                            background: (chaosColors[selectedNode.data.chaosLevel] || '#888') + '22',
                            color: chaosColors[selectedNode.data.chaosLevel] || '#888',
                            border: `1px solid ${(chaosColors[selectedNode.data.chaosLevel] || '#888')}33`
                          }}>{selectedNode.data.chaosLevel}</span>
                        {selectedNode.data.isRecommended && (
                          <span className="text-[8px] bg-[#00f0ff]/10 text-[#00f0ff] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                            <Star size={7} /> RECOMMENDED
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-gray-400 leading-relaxed border-t border-white/10 pt-3">
                    {selectedNode.data.description || 'No description.'}
                  </p>

                  {/* Stats */}
                  <div className="flex gap-2 flex-wrap">
                    {selectedNode.data.probability != null && (
                      <span className="text-[9px] bg-white/10 text-gray-300 px-2 py-0.5 rounded-full">{selectedNode.data.probability}% likely</span>
                    )}
                    {selectedNode.data.brainRotScore != null && (
                      <span className="text-[9px] bg-[var(--color-neon-pink)]/10 text-[var(--color-neon-pink)] px-2 py-0.5 rounded-full">🧠 {selectedNode.data.brainRotScore}/10</span>
                    )}
                    {selectedNode.data.nodeType && (
                      <span className="text-[9px] bg-white/5 text-gray-500 px-2 py-0.5 rounded-full uppercase">{selectedNode.data.nodeType.replace('_', ' ')}</span>
                    )}
                  </div>

                  {selectedNode.data.vibeCheck && (
                    <div className="text-[10px] italic text-gray-500">✨ {selectedNode.data.vibeCheck}</div>
                  )}

                  {/* TTS button */}
                  <button
                    onClick={() => speakText(selectedNode.data.ttsScript || selectedNode.data.description || selectedNode.data.label)}
                    className={`mt-2 w-full py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      isSpeaking
                        ? 'bg-[var(--color-neon-pink)]/20 text-[var(--color-neon-pink)] border border-[var(--color-neon-pink)]/30 animate-pulse'
                        : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                    }`}
                  >
                    {isSpeaking ? <><VolumeX size={14} /> Stop</> : <><Volume2 size={14} /> Hear Explanation</>}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
