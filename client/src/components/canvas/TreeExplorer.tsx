import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, ChevronDown, ChevronRight, Star, ArrowLeft, Share2 } from 'lucide-react';

// ──── Types ────
interface NodeData {
  label: string;
  description: string;
  vibeCheck: string;
  chaosLevel: string;
  brainRotScore: number;
  probability: number;
  emoji: string;
  isRoot: boolean;
  nodeType: string;
  ttsScript?: string;
}

interface TreeNode {
  id: string;
  data: NodeData;
}

interface TreeEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  animated: boolean;
}

interface Recommended {
  pathId: string;
  reason: string;
}

interface TreeExplorerProps {
  nodes: TreeNode[];
  edges: TreeEdge[];
  recommended?: Recommended;
  onBack: () => void;
  onPublish: () => void;
}

// ──── Chaos colors ────
const chaosColors: Record<string, string> = {
  Mild: '#22c55e',
  Medium: '#facc15',
  High: '#f97316',
  Extreme: '#ef4444',
  Biohazard: '#d946ef',
};

// ──── TTS Player Hook ────
function useTTS() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);

  const speak = async (nodeId: string, text: string) => {
    // Stop current audio if playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (playing === nodeId) {
      setPlaying(null);
      return;
    }

    setPlaying(nodeId);

    try {
      const res = await fetch('http://localhost:8000/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        console.error('TTS failed:', res.status);
        setPlaying(null);
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        setPlaying(null);
        URL.revokeObjectURL(url);
      };

      audio.play();
    } catch (err) {
      console.error('TTS error:', err);
      setPlaying(null);
    }
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlaying(null);
  };

  return { speak, stop, playing };
}

// ──── Small Node Card (outcome / edge_case) ────
function SmallCard({ node, isPlaying, onSpeak }: {
  node: TreeNode;
  isPlaying: boolean;
  onSpeak: () => void;
}) {
  const color = chaosColors[node.data.chaosLevel] || '#888';

  return (
    <div className="bg-[#111827]/80 border border-white/10 rounded-lg px-3 py-2.5 flex flex-col gap-1.5">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <span className="text-base">{node.data.emoji}</span>
          <span className="text-white text-xs font-semibold">{node.data.label}</span>
        </div>
        {node.data.ttsScript && (
          <button
            onClick={onSpeak}
            className={`p-1 rounded transition-all ${isPlaying ? 'text-[var(--color-neon-pink)] animate-pulse' : 'text-gray-500 hover:text-white'}`}
          >
            {isPlaying ? <VolumeX size={12} /> : <Volume2 size={12} />}
          </button>
        )}
      </div>
      <p className="text-[10px] text-gray-400 leading-relaxed">{node.data.description}</p>
      <div className="flex gap-1 flex-wrap">
        <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase"
          style={{ background: color + '22', color, border: `1px solid ${color}33` }}
        >{node.data.chaosLevel}</span>
        <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-white/10 text-gray-300">
          {node.data.probability}% likely
        </span>
        <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-white/5 text-gray-400">
          🧠 {node.data.brainRotScore}/10
        </span>
      </div>
    </div>
  );
}

// ──── Path Card (main path) ────
function PathCard({ node, children, isExpanded, onToggle, isRecommended, isPlaying, onSpeak, edges }: {
  node: TreeNode;
  children: TreeNode[];
  isExpanded: boolean;
  onToggle: () => void;
  isRecommended: boolean;
  isPlaying: boolean;
  onSpeak: () => void;
  edges: TreeEdge[];
}) {
  const color = chaosColors[node.data.chaosLevel] || '#888';
  const { speak: speakChild, playing: playingChild } = useTTS();

  return (
    <div
      className={`rounded-xl border transition-all duration-300 overflow-hidden ${
        isExpanded ? 'border-white/20 bg-[#0f1520]' : 'border-white/10 bg-[#0d1117] hover:border-white/20'
      } ${isRecommended ? 'ring-1 ring-[var(--color-neon-blue)]/40' : ''}`}
    >
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between text-left group"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{node.data.emoji}</span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-white font-bold text-sm">{node.data.label}</h3>
              {isRecommended && (
                <span className="text-[9px] bg-[var(--color-neon-blue)]/10 text-[var(--color-neon-blue)] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <Star size={8} /> RECOMMENDED
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase"
                style={{ background: color + '22', color, border: `1px solid ${color}33` }}
              >{node.data.chaosLevel}</span>
              <span className="text-[9px] text-gray-500">{node.data.probability}% likely</span>
              <span className="text-[9px] text-gray-500">🧠 {node.data.brainRotScore}/10</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {node.data.ttsScript && (
            <span
              onClick={(e) => { e.stopPropagation(); onSpeak(); }}
              className={`p-1.5 rounded-lg transition-all ${isPlaying ? 'text-[var(--color-neon-pink)] bg-[var(--color-neon-pink)]/10 animate-pulse' : 'text-gray-500 hover:text-white hover:bg-white/10'}`}
            >
              {isPlaying ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </span>
          )}
          <span className="text-gray-400 group-hover:text-white transition-colors">
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </span>
        </div>
      </button>

      {/* Expanded content */}
      <div
        className={`transition-all duration-300 overflow-hidden ${
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pb-4">
          {/* Description */}
          <p className="text-xs text-gray-400 leading-relaxed mb-3 border-t border-white/5 pt-3">
            {node.data.description}
          </p>

          {/* Vibe check */}
          <div className="text-[10px] italic text-gray-500 mb-3">
            ✨ {node.data.vibeCheck}
          </div>

          {/* Child outcomes / edge cases */}
          {children.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Possible Outcomes</span>
              {children.map((child) => {
                // Find sub-children of this child
                const subChildIds = edges.filter(e => e.source === child.id).map(e => e.target);
                return (
                  <div key={child.id} className="flex flex-col gap-1.5">
                    <SmallCard
                      node={child}
                      isPlaying={playingChild === child.id}
                      onSpeak={() => speakChild(child.id, child.data.ttsScript || child.data.description)}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ──── Root Card ────
function RootCard({ node, isPlaying, onSpeak }: {
  node: TreeNode;
  isPlaying: boolean;
  onSpeak: () => void;
}) {
  const color = chaosColors[node.data.chaosLevel] || '#888';

  return (
    <div className="bg-gradient-to-br from-[#1e0a3c]/60 to-[#130826]/60 border border-[var(--color-neon-purple)]/30 rounded-xl p-5 text-center relative overflow-hidden">
      {/* Glow */}
      <div className="absolute inset-0 opacity-10 blur-3xl pointer-events-none" style={{ background: 'var(--color-neon-purple)' }} />

      <div className="relative z-10 flex flex-col items-center gap-2">
        <span className="text-4xl">{node.data.emoji}</span>
        <h2 className="text-white text-lg font-extrabold">{node.data.label}</h2>
        <p className="text-gray-400 text-xs max-w-sm">{node.data.description}</p>
        <div className="flex gap-2 mt-1 items-center">
          <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase"
            style={{ background: color + '22', color, border: `1px solid ${color}33` }}
          >{node.data.chaosLevel}</span>
          <span className="text-[9px] text-gray-500">🧠 Brain Rot: {node.data.brainRotScore}/10</span>
          {node.data.ttsScript && (
            <button
              onClick={onSpeak}
              className={`p-1.5 rounded-lg transition-all ${isPlaying ? 'text-[var(--color-neon-pink)] bg-[var(--color-neon-pink)]/10 animate-pulse' : 'text-gray-500 hover:text-white hover:bg-white/10'}`}
            >
              {isPlaying ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
          )}
        </div>
        <div className="text-[10px] italic text-gray-500 mt-1">✨ {node.data.vibeCheck}</div>
      </div>
    </div>
  );
}

// ──── Main Explorer ────
export default function TreeExplorer({ nodes, edges, recommended, onBack, onPublish }: TreeExplorerProps) {
  const [expandedPath, setExpandedPath] = useState<string | null>(null);
  const { speak, playing } = useTTS();

  const rootNode = nodes.find(n => n.data.isRoot || n.data.nodeType === 'root');
  const pathNodes = nodes.filter(n => n.data.nodeType === 'path');

  // Build children lookup: for each path, find its direct children
  const getChildren = (parentId: string): TreeNode[] => {
    const childIds = edges.filter(e => e.source === parentId).map(e => e.target);
    return nodes.filter(n => childIds.includes(n.id));
  };

  const togglePath = (pathId: string) => {
    if (expandedPath === pathId) {
      setExpandedPath(null);
    } else {
      setExpandedPath(pathId);
      // Auto-play TTS when opening a path
      const pathNode = nodes.find(n => n.id === pathId);
      if (pathNode?.data.ttsScript) {
        speak(pathId, pathNode.data.ttsScript);
      }
    }
  };

  if (!rootNode) return <div className="text-center p-10 text-gray-400">No decision tree data.</div>;

  return (
    <div className="flex-1 w-full overflow-y-auto" style={{ minHeight: 0 }}>
      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-4">
        {/* Top bar */}
        <div className="flex justify-between items-center">
          <button onClick={onBack} className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={14} /> Back
          </button>
          <button
            onClick={onPublish}
            className="bg-[var(--color-neon-blue)] hover:bg-blue-500 text-[var(--color-dark-bg)] px-4 py-1.5 rounded-lg font-bold text-sm shadow-[0_0_10px_rgba(0,240,255,0.3)] transition-all flex items-center gap-1"
          >
            <Share2 size={13} /> Publish
          </button>
        </div>

        {/* Root node */}
        <RootCard
          node={rootNode}
          isPlaying={playing === rootNode.id}
          onSpeak={() => speak(rootNode.id, rootNode.data.ttsScript || rootNode.data.description)}
        />

        {/* Recommended banner */}
        {recommended && (
          <div className="bg-[var(--color-neon-blue)]/5 border border-[var(--color-neon-blue)]/20 rounded-lg px-4 py-2 flex items-center gap-2">
            <Star size={14} className="text-[var(--color-neon-blue)]" />
            <span className="text-xs text-gray-300">
              <strong className="text-[var(--color-neon-blue)]">Recommended:</strong> {recommended.reason}
            </span>
          </div>
        )}

        {/* Paths */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Choose Your Path</span>
          {pathNodes.map((pathNode) => (
            <PathCard
              key={pathNode.id}
              node={pathNode}
              children={getChildren(pathNode.id)}
              isExpanded={expandedPath === pathNode.id}
              onToggle={() => togglePath(pathNode.id)}
              isRecommended={recommended?.pathId === pathNode.id}
              isPlaying={playing === pathNode.id}
              onSpeak={() => speak(pathNode.id, pathNode.data.ttsScript || pathNode.data.description)}
              edges={edges}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
