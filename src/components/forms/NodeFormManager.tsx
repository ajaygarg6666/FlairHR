import { useWorkflowStore } from '../../store/useWorkflowStore';
import { X, Trash2, Settings2, Sparkles } from 'lucide-react';
import StartNodeForm from './StartNodeForm';
import TaskNodeForm from './TaskNodeForm';
import ApprovalNodeForm from './ApprovalNodeForm';
import AutomationNodeForm from './AutomationNodeForm';
import EndNodeForm from './EndNodeForm';
import { motion, AnimatePresence } from 'framer-motion';

const NodeFormManager = () => {
  const { nodes, selectedNodeId, setSelectedNode, deleteNode } = useWorkflowStore();
  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  return (
    <div className="w-96 border-l border-slate-200 bg-white flex flex-col relative z-30 shadow-[-4px_0_24px_rgba(0,0,0,0.02)]">
      <AnimatePresence mode="wait">
        {!selectedNode ? (
          <motion.div 
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8 text-center"
          >
            <div className="h-16 w-16 rounded-3xl bg-slate-50 flex items-center justify-center mb-6 border border-slate-100 shadow-inner">
              <Settings2 className="h-7 w-7 text-slate-200" />
            </div>
            <h3 className="text-[13px] font-bold text-slate-900 uppercase tracking-wider">Properties</h3>
            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed font-medium">
              Select a component on the canvas to configure its logic and properties.
            </p>
          </motion.div>
        ) : (
          <motion.div 
            key="content"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 20, opacity: 0 }}
            className="flex-1 flex flex-col"
          >
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-primary/5 rounded-xl flex items-center justify-center border border-primary/10">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-sm font-bold text-slate-900 leading-none">Node Editor</h2>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">{selectedNode.data.type} node</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => deleteNode(selectedNode.id)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  title="Delete Node"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => setSelectedNode(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Resource Name</span>
                <p className="text-[11px] text-slate-500 font-mono bg-slate-50 p-2 rounded-lg border border-slate-100 break-all">
                  {selectedNode.id}
                </p>
              </div>

              <div className="h-px bg-slate-100 w-full" />

              {selectedNode.data.type === 'start' && <StartNodeForm node={selectedNode} />}
              {selectedNode.data.type === 'task' && <TaskNodeForm node={selectedNode} />}
              {selectedNode.data.type === 'approval' && <ApprovalNodeForm node={selectedNode} />}
              {selectedNode.data.type === 'automation' && <AutomationNodeForm node={selectedNode} />}
              {selectedNode.data.type === 'end' && <EndNodeForm node={selectedNode} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NodeFormManager;
