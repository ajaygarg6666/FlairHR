import type { Node, Edge } from 'reactflow';

export type NodeType = 'start' | 'task' | 'approval' | 'automation' | 'end';

export interface BaseNodeData {
  title: string;
  subtitle?: string;
  type: NodeType;
}

export interface StartNodeData extends BaseNodeData {
  type: 'start';
  metadata: { key: string; value: string }[];
}

export interface TaskNodeData extends BaseNodeData {
  type: 'task';
  description: string;
  assignee: string;
  dueDate: string;
  customFields: { key: string; value: string }[];
}

export interface ApprovalNodeData extends BaseNodeData {
  type: 'approval';
  approverRole: 'Manager' | 'HRBP' | 'Director';
  threshold: number;
}

export interface AutomationNodeData extends BaseNodeData {
  type: 'automation';
  actionId: string;
  parameters: Record<string, string>;
}

export interface EndNodeData extends BaseNodeData {
  type: 'end';
  message: string;
  isSummary: boolean;
}

export type WorkflowNodeData = 
  | StartNodeData 
  | TaskNodeData 
  | ApprovalNodeData 
  | AutomationNodeData 
  | EndNodeData;

export type WorkflowNode = Node<WorkflowNodeData>;

export interface WorkflowState {
  nodes: WorkflowNode[];
  edges: Edge[];
  selectedNodeId: string | null;
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: any) => void;
  addNode: (type: NodeType, position: { x: number; y: number }) => void;
  updateNodeData: (nodeId: string, data: Partial<WorkflowNodeData>) => void;
  setSelectedNode: (nodeId: string | null) => void;
  deleteNode: (nodeId: string) => void;
}

export interface AutomationAction {
  id: string;
  label: string;
  params: string[];
}

export interface SimulationLog {
  timestamp: string;
  nodeId: string;
  nodeTitle: string;
  status: 'pending' | 'success' | 'failed' | 'processing';
  message: string;
}
