import React from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
} from '@xyflow/react';
import type { Edge, Node } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CustomNode from './CustomNode';

const nodeTypes = { custom: CustomNode };

interface TreeCanvasProps {
  nodes: Node[];
  edges: Edge[];
}

export default function TreeCanvas({ nodes, edges }: TreeCanvasProps) {
  // We need to map standard nodes to our custom node type
  const mappedNodes = nodes.map(n => ({
    ...n,
    type: 'custom',
  }));

  return (
    <div className="w-full h-full bg-[#0b0c10] border-t border-white/10">
      <ReactFlow
        nodes={mappedNodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background gap={12} size={1} color="#333" />
        <Controls />
        <MiniMap 
          nodeColor={(n) => {
            return '#1f2833';
          }}
          maskColor="rgba(11, 12, 16, 0.7)"
        />
      </ReactFlow>
    </div>
  );
}
