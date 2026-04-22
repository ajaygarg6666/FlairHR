import { useState } from 'react';
import { 
  Play, 
  Terminal, 
  ChevronUp, 
  ChevronDown, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Clock,
  Activity,
  Box,
  Server
} from 'lucide-react';
import { useWorkflowStore } from '../../store/useWorkflowStore';
import type { SimulationLog } from '../../types/workflow';
import { cn } from '../../utils/cn';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const SandboxPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [logs, setLogs] = useState<SimulationLog[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  const { nodes, edges } = useWorkflowStore();

  const validateWorkflow = () => {
    const errors: string[] = [];
    const startNodes = nodes.filter(n => n.data.type === 'start');
    const endNodes = nodes.filter(n => n.data.type === 'end');

    if (startNodes.length === 0) errors.push('Initial entry point missing');
    if (startNodes.length > 1) errors.push('Duplicate entry points detected');
    if (endNodes.length === 0) errors.push('Termination point missing');

    nodes.forEach(node => {
      const hasIncoming = edges.some(e => e.target === node.id);
      const hasOutgoing = edges.some(e => e.source === node.id);
      
      if (node.data.type === 'start' && hasIncoming) errors.push('Start node cannot have inbound links');
      if (node.data.type === 'end' && hasOutgoing) errors.push('End node cannot have outbound links');
      if (node.data.type !== 'start' && !hasIncoming) errors.push(`Unreachable: "${node.data.title}"`);
      if (node.data.type !== 'end' && !hasOutgoing) errors.push(`Dead-end: "${node.data.title}"`);
    });

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const runSimulation = async () => {
    if (!validateWorkflow()) {
      setIsOpen(true);
      return;
    }

    setIsOpen(true);
    setIsSimulating(true);
    setLogs([]);

    try {
      const response = await fetch('/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges }),
      });
      const data = await response.json();
      setLogs(data);
    } catch (error) {
      console.error('Simulation failed', error);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <motion.div 
      initial={false}
      animate={{ height: isOpen ? 440 : 48 }}
      className="fixed bottom-0 left-80 right-96 bg-[#0b1c30] border-t border-slate-800 transition-all duration-300 z-40 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 h-12 bg-[#0b1c30] border-b border-white/5 cursor-pointer select-none" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <Activity className={cn("h-4 w-4", isSimulating ? "text-primary animate-pulse" : "text-slate-500")} />
            <span className="text-[10px] uppercase font-black tracking-[0.2em] text-white">System Runtime</span>
          </div>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <div className={cn("h-1.5 w-1.5 rounded-full", validationErrors.length > 0 ? "bg-red-500" : "bg-emerald-500")} />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {validationErrors.length > 0 ? 'Integrity Fail' : 'Integrity Pass'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isOpen ? <ChevronDown className="h-4 w-4 text-slate-500" /> : <ChevronUp className="h-4 w-4 text-slate-500" />}
          <button
            onClick={(e) => { e.stopPropagation(); runSimulation(); }}
            disabled={isSimulating}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover disabled:bg-slate-800 text-white px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all shadow-xl shadow-primary/20"
          >
            {isSimulating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3 fill-current" />}
            Execute Sequence
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-8 h-[392px] overflow-y-auto bg-[#0b1c30] custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-10">
          
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
              <Server className="h-5 w-5 text-primary mb-3" />
              <div className="text-2xl font-black text-white tabular-nums">{nodes.length}</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Instances</div>
            </div>
            <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
              <Box className="h-5 w-5 text-secondary mb-3" />
              <div className="text-2xl font-black text-white tabular-nums">{edges.length}</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Data Streams</div>
            </div>
            <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
              <Activity className="h-5 w-5 text-emerald-500 mb-3" />
              <div className="text-2xl font-black text-white tabular-nums">{isSimulating ? '...' : logs.length}</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Events Processed</div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {validationErrors.length > 0 ? (
              <motion.div 
                key="errors"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 px-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <h3 className="text-[11px] uppercase font-black text-white tracking-widest">Logic Exceptions</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {validationErrors.map((err, i) => (
                    <div key={i} className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-red-400 text-[11px] font-medium">
                      <XCircle className="h-4 w-4 flex-shrink-0" />
                      {err}
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : logs.length > 0 ? (
              <motion.div 
                key="logs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 px-2">
                  <Terminal className="h-4 w-4 text-primary" />
                  <h3 className="text-[11px] uppercase font-black text-white tracking-widest">Execution Stream</h3>
                </div>
                <div className="space-y-3">
                  {logs.map((log, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/[0.08] transition-colors"
                    >
                      <div className={cn(
                        "mt-1.5 h-1.5 w-1.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]",
                        log.status === 'success' ? "bg-emerald-500 shadow-emerald-500/20" : "bg-red-500 shadow-red-500/20"
                      )} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1.5">
                          <h4 className="text-[12px] font-black text-white tracking-tight">{log.nodeTitle}</h4>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold">
                            <Clock className="h-3 w-3" />
                            {format(new Date(log.timestamp), 'HH:mm:ss.SSS')}
                          </div>
                        </div>
                        <p className="text-[12px] text-slate-400 leading-relaxed font-medium">{log.message}</p>
                      </div>
                      <div className="pt-0.5">
                        {log.status === 'success' ? (
                          <div className="h-6 w-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          </div>
                        ) : (
                          <div className="h-6 w-6 rounded-full bg-red-500/10 flex items-center justify-center">
                            <XCircle className="h-3.5 w-3.5 text-red-500" />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <div className="h-20 w-20 bg-white/5 rounded-[40px] flex items-center justify-center mb-6 border border-white/5 shadow-2xl">
                  <Terminal className="h-8 w-8 text-slate-700" />
                </div>
                <h3 className="text-[13px] font-black text-white uppercase tracking-widest">Ready for deployment</h3>
                <p className="text-[11px] text-slate-500 mt-2 font-medium">Configure your logic and trigger the engine to verify integrity.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default SandboxPanel;
