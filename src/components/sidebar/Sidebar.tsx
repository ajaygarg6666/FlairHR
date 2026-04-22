import { 
  PlayCircle, 
  CheckCircle2, 
  UserCheck, 
  Zap, 
  Flag,
  LayoutGrid,
  Info,
  ChevronRight,
  Cloud,
  Search,
  BookOpen
} from 'lucide-react';
import type { NodeType } from '../../types/workflow';
import { cn } from '../../utils/cn';
import { useWorkflowStore } from '../../store/useWorkflowStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const nodeTypes: { type: NodeType; label: string; description: string; icon: any; color: string }[] = [
  { type: 'start', label: 'Start Node', description: 'Trigger point', icon: PlayCircle, color: 'text-emerald-600' },
  { type: 'task', label: 'Task Node', description: 'Human action', icon: CheckCircle2, color: 'text-blue-600' },
  { type: 'approval', label: 'Approval Node', description: 'Sign-off req', icon: UserCheck, color: 'text-orange-600' },
  { type: 'automation', label: 'Bot Step', description: 'Auto-execution', icon: Zap, color: 'text-purple-600' },
  { type: 'end', label: 'End Node', description: 'Termination', icon: Flag, color: 'text-red-600' },
];

const templates = [
  { id: 'onboarding', name: 'Employee Onboarding', category: 'HR' },
  { id: 'leave', name: 'Leave Approval', category: 'Admin' },
  { id: 'expense', name: 'Expense Reimbursment', category: 'Finance' },
];

const Sidebar = () => {
  const { nodes, edges } = useWorkflowStore();
  const [activeTab, setActiveTab] = useState<'components' | 'templates'>('components');
  const [saving, setSaving] = useState(false);

  const onDragStart = (event: React.DragEvent, nodeType: NodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  // Mock saving indicator
  useEffect(() => {
    if (nodes.length > 0 || edges.length > 0) {
      setSaving(true);
      const timer = setTimeout(() => setSaving(false), 800);
      return () => clearTimeout(timer);
    }
  }, [nodes, edges]);

  return (
    <aside className="w-80 flex-shrink-0 border-r border-slate-200 bg-white text-slate-600 flex flex-col shadow-sm relative z-30">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-lg shadow-lg shadow-primary/20">
              <LayoutGrid className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-none uppercase">FlairHR</h1>
              <p className="text-[10px] text-primary font-bold uppercase tracking-[0.2em] mt-1">Designer Pro</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AnimatePresence mode="wait">
              {saving ? (
                <motion.div 
                  key="saving"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1.5"
                >
                  <div className="h-1 w-1 rounded-full bg-primary animate-ping" />
                  <span className="text-[9px] font-bold text-primary uppercase">Syncing</span>
                </motion.div>
              ) : (
                <motion.div 
                  key="saved"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-1.5"
                >
                  <Cloud className="h-3 w-3 text-emerald-500" />
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Cloud</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
          <button 
            onClick={() => setActiveTab('components')}
            className={cn(
              "flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all",
              activeTab === 'components' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Components
          </button>
          <button 
            onClick={() => setActiveTab('templates')}
            className={cn(
              "flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all",
              activeTab === 'templates' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Templates
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search assets..." 
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-[12px] focus:ring-2 focus:ring-primary/20 focus:outline-none focus:border-primary transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <AnimatePresence mode="wait">
          {activeTab === 'components' ? (
            <motion.div 
              key="components"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              <div>
                <h2 className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-4">Node Library</h2>
                <div className="space-y-1">
                  {nodeTypes.map((node, index) => (
                    <div
                      key={node.type}
                      draggable
                      onDragStart={(e) => onDragStart(e, node.type)}
                      className="cursor-grab active:cursor-grabbing"
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg transition-all duration-200",
                          "hover:bg-slate-50 group border border-transparent hover:border-slate-100"
                        )}
                      >
                        <div className="h-9 w-9 rounded-lg bg-white border border-slate-100 flex items-center justify-center group-hover:scale-110 shadow-sm transition-all">
                          <node.icon className={cn("h-4 w-4", node.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-semibold text-slate-700 group-hover:text-slate-900 tracking-tight">
                            {node.label}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate tracking-tight font-medium">
                            {node.description}
                          </div>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-300 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                      </motion.div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="templates"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
               <div>
                <h2 className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-4">Standard Flows</h2>
                <div className="space-y-2">
                  {templates.map((template) => (
                    <div 
                      key={template.id}
                      className="group p-4 rounded-xl border border-slate-100 bg-white hover:border-primary/20 hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <BookOpen className="h-4 w-4 text-slate-400 group-hover:text-primary" />
                        <span className="text-[9px] font-bold text-primary uppercase bg-primary/5 px-1.5 py-0.5 rounded-md">
                          {template.category}
                        </span>
                      </div>
                      <h4 className="text-[12px] font-bold text-slate-900 group-hover:text-primary transition-colors">{template.name}</h4>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-100">
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Version</span>
            <span className="text-[12px] font-black text-slate-900">v2.4.1</span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Status</span>
            <span className="text-[10px] font-black text-emerald-600 uppercase">Deployed</span>
          </div>
        </div>
        
        <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
          <div className="flex items-center gap-2 mb-2">
            <Info className="h-3.5 w-3.5 text-primary" />
            <span className="text-[11px] font-bold text-primary uppercase tracking-wider">Help Center</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
            Drag components or select a template to build your enterprise logic flow.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
