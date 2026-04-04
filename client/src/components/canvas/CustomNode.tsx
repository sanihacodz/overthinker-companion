import React from 'react';
import { Handle, Position } from '@xyflow/react';

export default function CustomNode({ data }: { data: any }) {
  const isRoot = data.isRoot || false;
  
  // Choose border color based on chaosLevel
  let borderColor = 'border-white/20';
  if (data.chaosLevel === 'Extreme') borderColor = 'border-[var(--color-neon-pink)]';
  if (data.chaosLevel === 'High') borderColor = 'border-[var(--color-neon-purple)]';
  if (data.chaosLevel === 'Low') borderColor = 'border-[var(--color-neon-blue)]';

  return (
    <div className={`relative px-4 py-3 shadow-lg rounded-xl bg-gray-900/80 backdrop-blur border-2 ${borderColor} min-w-[200px]`}>
      {/* Root Node Handle (Output only) */}
      {!isRoot && <Handle type="target" position={Position.Top} className="w-3 h-3 bg-white" />}

      <div className="flex flex-col gap-2">
        <h3 className="text-white font-bold text-sm leading-snug">{data.label}</h3>
        
        <div className="flex flex-col gap-1 text-[10px] uppercase font-semibold mt-2 border-t border-white/10 pt-2">
          {data.vibeCheck && (
            <div className="flex justify-between items-center text-gray-400">
              <span>Vibe</span>
              <span className="text-[var(--color-neon-pink)]">{data.vibeCheck}</span>
            </div>
          )}
          {data.chaosLevel && (
            <div className="flex justify-between items-center text-gray-400">
              <span>Chaos</span>
              <span className="text-yellow-400">{data.chaosLevel}</span>
            </div>
          )}
          {data.brainRotScore && (
            <div className="flex justify-between items-center text-gray-400">
              <span>Rot Score</span>
              <span className="text-[var(--color-neon-blue)]">{data.brainRotScore}/10</span>
            </div>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-white" />
    </div>
  );
}
