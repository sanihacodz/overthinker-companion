import { Handle, Position } from '@xyflow/react';
import { Lock, Unlock, Star } from 'lucide-react';

const chaosColors: Record<string, string> = {
  Mild: '#22c55e',
  Medium: '#facc15',
  High: '#f97316',
  Extreme: '#ef4444',
  Biohazard: '#d946ef',
};

const nodeTypeBg: Record<string, string> = {
  root: 'bg-gradient-to-br from-[#1e0a3c] to-[#2d0057]',
  path: 'bg-gradient-to-br from-[#0a1628] to-[#0f1f3d]',
  outcome: 'bg-[#0f1a0f]',
  edge_case: 'bg-[#1a0a0a]',
};

export default function CustomNode({ data }: { data: any }) {
  const isRoot = data.isRoot || false;
  const isRecommended = data.isRecommended || false;
  const isLocked = data.isLocked || false;
  const isPath = data.nodeType === 'path';
  const borderColor = isRecommended ? '#00f0ff' : (chaosColors[data.chaosLevel] || '#ffffff33');
  const bgClass = nodeTypeBg[data.nodeType] || 'bg-[#1f2833]';

  return (
    <div
      style={{ borderColor, cursor: 'pointer' }}
      className={`relative shadow-xl rounded-xl border-2 ${bgClass} min-w-[180px] max-w-[240px] transition-all duration-200 hover:shadow-[0_0_25px_rgba(176,38,255,0.2)] hover:scale-[1.02]`}
    >
      {/* Glow for root */}
      {isRoot && (
        <div className="absolute inset-0 rounded-xl opacity-25 blur-2xl pointer-events-none"
          style={{ background: 'var(--color-neon-purple)' }} />
      )}

      {/* Recommended glow */}
      {isRecommended && (
        <div className="absolute inset-0 rounded-xl opacity-15 blur-xl pointer-events-none"
          style={{ background: '#00f0ff' }} />
      )}

      {/* Locked overlay for path nodes */}
      {isLocked && (
        <div className="absolute inset-0 rounded-xl bg-black/40 backdrop-blur-[2px] z-20 flex items-center justify-center">
          <div className="flex flex-col items-center gap-1 text-gray-400">
            <Lock size={18} />
            <span className="text-[9px] font-bold uppercase tracking-wider">Click to reveal</span>
          </div>
        </div>
      )}

      {!isRoot && <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-white/60" />}

      <div className="px-3 py-3 flex flex-col gap-1.5 relative z-10">
        {/* Recommended badge */}
        {isRecommended && (
          <div className="text-[8px] bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/20 px-1.5 py-0.5 rounded-full font-bold self-start flex items-center gap-1 mb-0.5">
            <Star size={8} /> RECOMMENDED
          </div>
        )}

        {/* Emoji + Label */}
        <div className="flex items-start gap-2">
          <span className="text-xl leading-none mt-0.5">{data.emoji || '🧠'}</span>
          <h3 className="text-white font-bold text-[13px] leading-snug">{data.label}</h3>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap gap-1 mt-1">
          <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full"
            style={{ background: (chaosColors[data.chaosLevel] || '#888') + '22', color: chaosColors[data.chaosLevel] || '#888',
            border: `1px solid ${(chaosColors[data.chaosLevel] || '#888')}44` }}>
            {data.chaosLevel}
          </span>
          {data.probability && (
            <span className="text-[9px] bg-white/10 text-gray-300 px-1.5 py-0.5 rounded-full font-semibold">
              {data.probability}%
            </span>
          )}
          {data.brainRotScore && (
            <span className="text-[9px] bg-[var(--color-neon-pink)]/10 text-[var(--color-neon-pink)] px-1.5 py-0.5 rounded-full font-semibold">
              🧠 {data.brainRotScore}/10
            </span>
          )}
        </div>

        {/* Vibe check */}
        {data.vibeCheck && (
          <div className="text-[9px] italic text-gray-500 truncate">✨ {data.vibeCheck}</div>
        )}

        {/* Status hint */}
        {isPath && !isLocked && (
          <div className="text-[8px] text-green-500/80 text-center mt-0.5 flex items-center justify-center gap-1">
            <Unlock size={8} /> Revealed
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-white/60" />
    </div>
  );
}
