
import { create } from 'zustand';
// Use explicit type imports for React Flow types and named imports for utility functions to resolve module resolution errors
import { 
  type Connection, 
  type Edge, 
  type EdgeChange, 
  type Node, 
  type NodeChange, 
  addEdge, 
  applyEdgeChanges, 
  applyNodeChanges 
} from 'reactflow';
import { FunnelNodeData } from './types';

interface FunnelStore {
  nodes: Node<FunnelNodeData>[];
  edges: Edge[];
  selectedNodeId: string | null;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  setNodes: (nodes: Node<FunnelNodeData>[]) => void;
  setEdges: (edges: Edge[]) => void;
  setSelectedNodeId: (id: string | null) => void;
  updateNodeData: (id: string, data: Partial<FunnelNodeData>) => void;
  addNode: (node: Node<FunnelNodeData>) => void;
}

export const useFunnelStore = create<FunnelStore>((set, get) => ({
  nodes: [
    {
      id: '1',
      type: 'funnelNode',
      position: { x: 250, y: 50 },
      data: { 
        label: 'Instagram Ads', 
        description: 'Targeting Lookalike 1%', 
        category: 'TRAFFIC', 
        iconType: 'facebook_ads',
        tags: ['Paid', 'Ads']
      },
    },
    {
      id: '2',
      type: 'funnelNode',
      position: { x: 250, y: 250 },
      data: { 
        label: 'Lead Magnet LP', 
        description: 'Ebook Giveaway', 
        category: 'PAGE', 
        iconType: 'lp_capture',
        tags: ['Capture']
      },
    },
  ],
  edges: [
    { id: 'e1-2', source: '1', target: '2', animated: true }
  ],
  selectedNodeId: null,

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  onConnect: (connection) => {
    set({
      edges: addEdge({ ...connection, animated: true }, get().edges),
    });
  },

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  
  updateNodeData: (id, data) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, ...data } };
        }
        return node;
      }),
    });
  },

  addNode: (node) => {
    set({
      nodes: [...get().nodes, node],
    });
  },
}));
