import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { EndNodeData, WorkflowNode } from '../../types/workflow';
import { useWorkflowStore } from '../../store/useWorkflowStore';
import { useEffect } from 'react';
import { FileText, CheckCircle2 } from 'lucide-react';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  isSummary: z.boolean(),
});

const EndNodeForm = ({ node }: { node: WorkflowNode }) => {
  const updateNodeData = useWorkflowStore(state => state.updateNodeData);
  const data = node.data as EndNodeData;

  const { register, watch } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: data.title,
      message: data.message || '',
      isSummary: data.isSummary ?? true,
    }
  });

  useEffect(() => {
    const subscription = watch((value) => {
      updateNodeData(node.id, value as Partial<EndNodeData>);
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
        <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Completion Message</label>
        <textarea
          {...register('message')}
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-medium text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all min-h-[120px] resize-none"
          placeholder="Thank you for completing the process..."
        />
      </div>

      <div className="pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-primary/20 transition-all cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="text-[12px] font-bold text-slate-900">Generate Summary</h4>
              <p className="text-[10px] text-slate-500 font-medium">Export a PDF report automatically</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" {...register('isSummary')} className="sr-only peer" />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 shadow-inner"></div>
          </label>
        </div>
      </div>

      <div className="bg-emerald-50/30 border border-emerald-500/10 p-4 rounded-2xl flex gap-3">
        <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-emerald-700 leading-normal font-semibold italic">
          This node successfully terminates the workflow sequence.
        </p>
      </div>
    </form>
  );
};

export default EndNodeForm;
