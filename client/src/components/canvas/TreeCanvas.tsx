import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  MarkerType,
} from '@xyflow/react';
import type { Edge, Node } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from '@dagrejs/dagre';
import CustomNode from './CustomNode';

const nodeTypes = { custom: CustomNode };

// Node dimensions for layout
const NODE_WIDTH = 240;
const NODE_HEIGHT = 160;

function getLayoutedElements(nodes: Node[], edges: Edge[]) {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: 'TB',        // top to bottom
    nodesep: 60,          // horizontal space between nodes
    ranksep: 90,          // vertical space between layers
    marginx: 40,
    marginy: 40,
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const { x, y } = dagreGraph.node(node.id);
    return {
      ...node,
      type: 'custom',
      position: {
        x: x - NODE_WIDTH / 2,
        y: y - NODE_HEIGHT / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}

interface TreeCanvasProps {
  nodes: Node[];
  edges: Edge[];
}

const chaosEdgeColor: Record<string, string> = {
  Mild: '#22c55e',
  Medium: '#facc15',
  High: '#f97316',
  Extreme: '#ef4444',
  Biohazard: '#d946ef',
};

export default function TreeCanvas({ nodes, edges }: TreeCanvasProps) {
  const styledEdges: Edge[] = edges.map((e) => ({
    ...e,
    style: {
      stroke: e.animated ? '#b026ff' : '#ffffff33',
      strokeWidth: e.animated ? 2 : 1.5,
    },
    labelStyle: { fill: '#aaa', fontSize: 10, fontWeight: 600 },
    labelBgStyle: { fill: '#0b0c10', fillOpacity: 0.8 },
    labelBgPadding: [4, 6] as [number, number],
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: e.animated ? '#b026ff' : '#444',
    },
  }));

  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, styledEdges);

  return (
    <div className="w-full h-full bg-[#0b0c10]">
      <ReactFlow
        nodes={layoutedNodes}
        edges={layoutedEdges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.25, includeHiddenNodes: false }}
        minZoom={0.1}
        maxZoom={2}
        panOnDrag={true}
        panOnScroll={false}
        zoomOnScroll={true}
        zoomOnPinch={true}
        zoomOnDoubleClick={false}
        selectNodesOnDrag={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={20} size={1} color="#1a1f2e" variant={'dots' as any} />
        <Controls className="!bg-[#1f2833] !border-white/10 !text-white" />
        <MiniMap
          nodeColor={(n) => {
            if (n.data?.nodeType === 'root') return '#b026ff';
            if (n.data?.nodeType === 'edge_case') return '#ef4444';
            if (n.data?.nodeType === 'outcome') return '#22c55e';
            return '#0ea5e9';
          }}
          maskColor="rgba(11, 12, 16, 0.85)"
          className="!bg-[#1f2833] !border-white/10"
        />
      </ReactFlow>
    </div>
  );
}
