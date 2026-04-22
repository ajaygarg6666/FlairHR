import React, { useCallback, useRef } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  Panel,
  type ReactFlowInstance,
  ConnectionMode,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useWorkflowStore } from '../../store/useWorkflowStore';
import CustomNode from '../nodes/CustomNode';
import type { NodeType } from '../../types/workflow';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Trash2, Download, Maximize2, Zap } from 'lucide-react';
import dagre from 'dagre';

const nodeTypes = {
  customNode: CustomNode,
};

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes: any[], edges: any[], direction = 'TB') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 240, height: 100 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.position = {
      x: nodeWithPosition.x - 240 / 2,
      y: nodeWithPosition.y - 100 / 2,
    };

    return node;
  });

  return { nodes: layoutedNodes, edges };
};

const Canvas = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { 
    nodes, 
    edges, 
    onNodesChange, 
    onEdgesChange, 
    onConnect, 
    addNode,
    setSelectedNode
  } = useWorkflowStore();

  const [reactFlowInstance, setReactFlowInstance] = React.useState<ReactFlowInstance | null>(null);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowWrapper.current || !reactFlowInstance) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow') as NodeType;

      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      addNode(type, position);
    },
    [reactFlowInstance, addNode]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: any) => {
    setSelectedNode(node.id);
  }, [setSelectedNode]);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  const isValidConnection = useCallback((connection: any) => {
    const sourceNode = nodes.find(n => n.id === connection.source);
    const targetNode = nodes.find(n => n.id === connection.target);

    if (targetNode?.data.type === 'start') return false;
    if (sourceNode?.data.type === 'end') return false;
    
    return true;
  }, [nodes]);

  const onLayout = useCallback(
    (direction: string) => {
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        nodes,
        edges,
        direction
      );

      useWorkflowStore.setState({ 
        nodes: [...layoutedNodes], 
        edges: [...layoutedEdges] 
      });
    },
    [nodes, edges]
  );

  const onSave = () => {
    const workflow = { nodes, edges };
    const blob = new Blob([JSON.stringify(workflow, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `workflow-${Date.now()}.json`;
    link.click();
  };

  const onClear = () => {
    if (window.confirm('Are you sure you want to clear the entire canvas?')) {
      useWorkflowStore.setState({ nodes: [], edges: [], selectedNodeId: null });
    }
  };

  return (
    <div className="flex-1 h-full relative" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        isValidConnection={isValidConnection}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        className="bg-[#f8f9ff]"
      >
        <Background color="#cbd5e1" gap={24} size={1} />
        
        <Controls className="!bg-white !border-slate-200 !shadow-lg !rounded-xl overflow-hidden !m-6" />
        
        <MiniMap 
          className="!bg-white !border-slate-200 !shadow-xl !rounded-xl !m-6"
          style={{ height: 120, width: 200 }} 
          zoomable 
          pannable 
          nodeColor={(n) => {
            if (n.data?.type === 'start') return '#10b981';
            if (n.data?.type === 'task') return '#1a73e8';
            if (n.data?.type === 'approval') return '#f97316';
            if (n.data?.type === 'automation') return '#a855f7';
            if (n.data?.type === 'end') return '#ef4444';
            return '#eee';
          }}
        />
        
        <Panel position="top-left" className="m-6">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white border border-slate-200 shadow-xl rounded-2xl p-3 px-5 flex items-center gap-6"
          >
            <div className="flex flex-col">
              <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">Canvas</h2>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-bold text-slate-900 tracking-tight">FlairHR Designer</span>
              </div>
            </div>
            
            <div className="h-8 w-px bg-slate-100" />
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => onLayout('TB')}
                className="flex items-center gap-2 px-3 py-2 bg-slate-50 text-slate-600 text-[11px] font-bold uppercase rounded-lg hover:bg-slate-100 transition-all border border-slate-100"
                title="Auto Layout"
              >
                <Zap className="h-3.5 w-3.5 text-primary" />
                Auto Layout
              </button>
              
              <button 
                onClick={onSave}
                className="flex items-center gap-2 px-3 py-2 bg-slate-900 text-white text-[11px] font-bold uppercase rounded-lg hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
              >
                <Download className="h-3.5 w-3.5" />
                Export
              </button>
              
              <button 
                onClick={onClear}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-red-100 text-red-500 text-[11px] font-bold uppercase rounded-lg hover:bg-red-50 transition-all"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear
              </button>
            </div>
          </motion.div>
        </Panel>

        <Panel position="bottom-center" className="mb-8">
           <AnimatePresence>
            {nodes.length === 0 && (
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                className="bg-white border border-primary/20 shadow-2xl rounded-2xl p-4 px-6 text-center max-w-sm"
              >
                <Layers className="h-8 w-8 text-primary mx-auto mb-3 opacity-20" />
                <h3 className="text-sm font-bold text-slate-900 mb-1">Canvas is empty</h3>
                <p className="text-[12px] text-slate-500 leading-relaxed font-medium">
                  Start by dragging a <span className="text-emerald-600 font-bold">Start Node</span> from the sidebar onto this work area.
                </p>
              </motion.div>
            )}
           </AnimatePresence>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export default Canvas;
