import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { ApprovalNodeData, WorkflowNode } from '../../types/workflow';
import { useWorkflowStore } from '../../store/useWorkflowStore';
import { useEffect } from 'react';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  approverRole: z.enum(['Manager', 'HRBP', 'Director']),
  threshold: z.number().min(1).max(10),
});

const ApprovalNodeForm = ({ node }: { node: WorkflowNode }) => {
  const updateNodeData = useWorkflowStore(state => state.updateNodeData);
  const data = node.data as ApprovalNodeData;

  const { register, watch } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: data.title,
      approverRole: data.approverRole || 'Manager',
      threshold: data.threshold || 1,
    }
  });

  useEffect(() => {
    const subscription = watch((value) => {
      updateNodeData(node.id, value as Partial<ApprovalNodeData>);
    });
    return () => subscription.unsubscribe();
  }, [watch, node.id, updateNodeData]);

  return (
    <form className="space-y-8">
      <div className="space-y-1.5">
        <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Node Title</label>
        <input
          {...register('title')}
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-medium text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Approver Role</label>
        <div className="relative">
          <select
            {...register('approverRole')}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-medium text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all appearance-none cursor-pointer"
          >
            <option value="Manager">Line Manager</option>
            <option value="HRBP">HR Business Partner</option>
            <option value="Director">Department Director</option>
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-slate-100">
        <div className="flex justify-between items-end mb-2">
          <div className="flex flex-col">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Threshold</label>
            <span className="text-[11px] text-slate-500 font-medium">Minimum approvals required</span>
          </div>
          <span className="text-xl font-bold text-primary tabular-nums">{watch('threshold')}</span>
        </div>
        <input
          {...register('threshold', { valueAsNumber: true })}
          type="range"
          min="1"
          max="5"
          className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-bold px-1 uppercase tracking-tighter">
          <span>1 Sign</span>
          <span>5 Signs</span>
        </div>
      </div>
    </form>
  );
};

export default ApprovalNodeForm;
