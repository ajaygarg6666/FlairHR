import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Settings2, Zap, RefreshCcw } from 'lucide-react';
import type { AutomationNodeData, WorkflowNode, AutomationAction } from '../../types/workflow';
import { useWorkflowStore } from '../../store/useWorkflowStore';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  actionId: z.string().min(1, 'Action is required'),
  parameters: z.record(z.string(), z.string()),
});

const AutomationNodeForm = ({ node }: { node: WorkflowNode }) => {
  const updateNodeData = useWorkflowStore(state => state.updateNodeData);
  const data = node.data as AutomationNodeData;
  const [actions, setActions] = useState<AutomationAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);

  const { register, watch } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: data.title,
      actionId: data.actionId || '',
      parameters: data.parameters || {},
    }
  });

  const selectedActionId = watch('actionId');
  const selectedAction = actions.find(a => a.id === selectedActionId);

  useEffect(() => {
    fetch('/automations')
      .then(res => res.json())
      .then(data => {
        setActions(data);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const subscription = watch((value) => {
      updateNodeData(node.id, value as Partial<AutomationNodeData>);
    });
    return () => subscription.unsubscribe();
  }, [watch, node.id, updateNodeData]);

  const handleTest = () => {
    setTesting(true);
    setTimeout(() => setTesting(false), 1500);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-6 w-6 text-primary animate-spin mb-3" />
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Initialising Bot...</p>
      </div>
    );
  }

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
        <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Automation Routine</label>
        <div className="relative">
          <select
            {...register('actionId')}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-medium text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all appearance-none cursor-pointer"
          >
            <option value="">Select Routine...</option>
            {actions.map(action => (
              <option key={action.id} value={action.id}>{action.label}</option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <Zap className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>

      {selectedAction && (
        <div className="space-y-6 pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Settings2 className="h-3.5 w-3.5 text-primary" />
              <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Parameters</h4>
            </div>
            <button
              type="button"
              onClick={handleTest}
              disabled={testing}
              className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-wider"
            >
              {testing ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCcw className="h-3 w-3" />}
              {testing ? 'Verifying...' : 'Test Sync'}
            </button>
          </div>
          
          <div className="space-y-4">
            {selectedAction.params.map(param => (
              <div key={param} className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 capitalize tracking-tight">{param.replace('_', ' ')}</label>
                <input
                  {...register(`parameters.${param}`)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[12px] font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                  placeholder={`Config value for ${param}`}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </form>
  );
};

export default AutomationNodeForm;
