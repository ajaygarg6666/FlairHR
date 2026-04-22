import { create } from 'zustand';
import { 
  type Connection, 
  type Edge, 
  type EdgeChange, 
  type NodeChange, 
  addEdge, 
  applyEdgeChanges, 
  applyNodeChanges 
} from 'reactflow';
import type { WorkflowState, NodeType, WorkflowNodeData } from '../types/workflow';

const initialNodes: any[] = [];
const initialEdges: Edge[] = [];

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  selectedNodeId: null,

  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  onConnect: (connection: Connection) => {
    set({
      edges: addEdge({ ...connection, animated: true }, get().edges),
    });
  },

  addNode: (type: NodeType, position: { x: number; y: number }) => {
    const id = `${type}-${Date.now()}`;
    let data: WorkflowNodeData;

    switch (type) {
      case 'start':
        data = { title: 'Start Workflow', type: 'start', metadata: [] };
        break;
      case 'task':
        data = { title: 'New Task', type: 'task', description: '', assignee: '', dueDate: '', customFields: [] };
        break;
      case 'approval':
        data = { title: 'Review Request', type: 'approval', approverRole: 'Manager', threshold: 1 };
        break;
      case 'automation':
        data = { title: 'Bot Action', type: 'automation', actionId: '', parameters: {} };
        break;
      case 'end':
        data = { title: 'Finish', type: 'end', message: 'Workflow completed successfully.', isSummary: true };
        break;
      default:
        data = { title: 'New Node', type: 'task', description: '', assignee: '', dueDate: '', customFields: [] };
    }

    set({
      nodes: [
        ...get().nodes,
        {
          id,
          type: 'customNode',
          position,
          data,
        },
      ],
    });
  },

  updateNodeData: (nodeId: string, newData: Partial<WorkflowNodeData>) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, ...newData } as WorkflowNodeData };
        }
        return node;
      }),
    });
  },

  setSelectedNode: (nodeId: string | null) => {
    set({ selectedNodeId: nodeId });
  },

  deleteNode: (nodeId: string) => {
    set({
      nodes: get().nodes.filter((node) => node.id !== nodeId),
      edges: get().edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
      selectedNodeId: get().selectedNodeId === nodeId ? null : get().selectedNodeId,
    });
  },
}));
