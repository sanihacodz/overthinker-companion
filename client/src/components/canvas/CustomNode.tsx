import { Handle, Position } from '@xyflow/react';

const chaosColors: Record<string, string> = {
  Mild: '#22c55e',       // green
  Medium: '#facc15',     // yellow
  High: '#f97316',       // orange
  Extreme: '#ef4444',    // red
  Biohazard: '#d946ef',  // fuchsia/neon-pink
};

const nodeTypeBg: Record<string, string> = {
  root: 'bg-gradient-to-br from-[#1e0a3c] to-[#2d0057] border-[var(--color-neon-purple)]',
  path: 'bg-gradient-to-br from-[#0a1628] to-[#0f1f3d] border-[var(--color-neon-blue)]',
  outcome: 'bg-[#0f1a0f] border-green-700',
  edge_case: 'bg-[#1a0a0a] border-red-800',
};

export default function CustomNode({ data }: { data: any }) {
  const isRoot = data.isRoot || false;
  const borderColor = chaosColors[data.chaosLevel] || '#ffffff44';
  const bgClass = nodeTypeBg[data.nodeType] || 'bg-[#1f2833]';

  return (
    <div
      style={{ borderColor }}
      className={`relative shadow-xl rounded-xl border-2 ${bgClass} min-w-[180px] max-w-[240px]`}
    >
      {/* Glow effect for root node */}
      {isRoot && (
        <div
          className="absolute inset-0 rounded-xl opacity-20 blur-xl pointer-events-none"
          style={{ background: 'var(--color-neon-purple)' }}
        />
      )}

      {!isRoot && <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-white/60" />}

      <div className="px-3 py-3 flex flex-col gap-1.5 relative z-10">
        {/* Emoji + Label */}
        <div className="flex items-start gap-2">
          <span className="text-xl leading-none mt-0.5">{data.emoji || '🧠'}</span>
          <h3 className="text-white font-bold text-[13px] leading-snug">{data.label}</h3>
        </div>

        {/* Description */}
        {data.description && (
          <p className="text-[10px] text-gray-400 leading-relaxed border-t border-white/10 pt-1.5">
            {data.description}
          </p>
        )}

        {/* Metadata row */}
        <div className="flex flex-wrap gap-1 mt-1">
          {/* Chaos Level badge */}
          <span
            className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full"
            style={{ background: borderColor + '22', color: borderColor, border: `1px solid ${borderColor}44` }}
          >
            {data.chaosLevel}
          </span>

          {/* Probability */}
          {data.probability && (
            <span className="text-[9px] bg-white/10 text-gray-300 px-1.5 py-0.5 rounded-full font-semibold">
              {data.probability}% likely
            </span>
          )}

          {/* Brain Rot Score */}
          {data.brainRotScore && (
            <span className="text-[9px] bg-[var(--color-neon-pink)]/10 text-[var(--color-neon-pink)] px-1.5 py-0.5 rounded-full font-semibold">
              🧠 {data.brainRotScore}/10
            </span>
          )}
        </div>

        {/* Vibe check tag */}
        {data.vibeCheck && (
          <div className="text-[9px] italic text-gray-500 truncate">
            ✨ {data.vibeCheck}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-white/60" />
    </div>
  );
}
