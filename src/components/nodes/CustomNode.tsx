import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { 
  PlayCircle, 
  CheckCircle2, 
  UserCheck, 
  Zap, 
  Flag,
} from 'lucide-react';
import type { WorkflowNodeData, NodeType } from '../../types/workflow';
import { cn } from '../../utils/cn';
import { motion } from 'framer-motion';

const nodeConfig: Record<NodeType, { icon: any; color: string; accent: string }> = {
  start: { icon: PlayCircle, color: 'text-emerald-600', accent: 'bg-emerald-500' },
  task: { icon: CheckCircle2, color: 'text-blue-600', accent: 'bg-blue-500' },
  approval: { icon: UserCheck, color: 'text-orange-600', accent: 'bg-orange-500' },
  automation: { icon: Zap, color: 'text-purple-600', accent: 'bg-purple-500' },
  end: { icon: Flag, color: 'text-red-600', accent: 'bg-red-500' },
};

const CustomNode = ({ data, selected }: NodeProps<WorkflowNodeData>) => {
  const { icon: Icon, color, accent } = nodeConfig[data.type];

  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "group relative flex min-w-[240px] flex-col rounded-lg bg-white border border-slate-200 transition-all duration-200",
        selected ? "ring-2 ring-primary ring-offset-2 shadow-xl z-50 scale-[1.02]" : "shadow-sm hover:shadow-md hover:border-slate-300"
      )}
    >
      {/* Top Accent Bar */}
      <div className={cn("h-1 w-full rounded-t-lg", accent)} />

      <Handle
        type="target"
        position={Position.Top}
        className="!top-0"
      />
      
      <div className="flex items-center gap-3 p-3 pt-4">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 border border-slate-100")}>
          <Icon className={cn("h-5 w-5", color)} />
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-slate-900 truncate leading-tight tracking-tight">
              {data.title}
            </span>
          </div>
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mt-0.5">
            {data.type}
          </span>
        </div>
      </div>

      {(data.type === 'task' || data.type === 'approval') && (
        <div className="border-t border-slate-50 bg-slate-50/30 p-2.5 px-3">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span className="truncate max-w-[140px]">
              {data.type === 'task' ? `Assigned: ${(data as any).assignee || 'Unassigned'}` : `Role: ${(data as any).approverRole}`}
            </span>
            {data.type === 'task' && (data as any).dueDate && (
              <span className="font-medium text-slate-400">{(data as any).dueDate}</span>
            )}
          </div>
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bottom-0"
      />
    </motion.div>
  );
};

export default memo(CustomNode);
