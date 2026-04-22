import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Tag } from 'lucide-react';
import type { StartNodeData, WorkflowNode } from '../../types/workflow';
import { useWorkflowStore } from '../../store/useWorkflowStore';
import { useEffect } from 'react';
import { motion } from 'framer-motion';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  metadata: z.array(z.object({
    key: z.string().min(1, 'Key required'),
    value: z.string().min(1, 'Value required'),
  })),
});

const StartNodeForm = ({ node }: { node: WorkflowNode }) => {
  const updateNodeData = useWorkflowStore(state => state.updateNodeData);
  const data = node.data as StartNodeData;

  const { register, control, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: data.title,
      metadata: data.metadata || [],
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "metadata"
  });

  useEffect(() => {
    const subscription = watch((value) => {
      updateNodeData(node.id, value as Partial<StartNodeData>);
    });
    return () => subscription.unsubscribe();
  }, [watch, node.id, updateNodeData]);

  return (
    <form className="space-y-8">
      <div className="space-y-1.5">
        <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Entry Point Title</label>
        <input
          {...register('title')}
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-medium text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
          placeholder="e.g. Employee Onboarding"
        />
        {errors.title && <p className="text-[10px] text-red-500 font-bold italic mt-1">{errors.title.message}</p>}
      </div>

      <div className="space-y-4 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="h-3.5 w-3.5 text-primary" />
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Metadata Tags</label>
          </div>
          <button
            type="button"
            onClick={() => append({ key: '', value: '' })}
            className="flex items-center gap-1.5 text-[10px] font-bold text-primary hover:text-primary-hover uppercase tracking-wider transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Add Tag
          </button>
        </div>

        <div className="space-y-3">
          {fields.map((field, index) => (
            <motion.div 
              key={field.id}
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex gap-2 group"
            >
              <input
                {...register(`metadata.${index}.key` as const)}
                className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-medium focus:ring-1 focus:ring-primary transition-all"
                placeholder="Key"
              />
              <input
                {...register(`metadata.${index}.value` as const)}
                className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-medium focus:ring-1 focus:ring-primary transition-all"
                placeholder="Value"
              />
              <button
                type="button"
                onClick={() => remove(index)}
                className="p-1.5 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
          {fields.length === 0 && (
            <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/30">
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">No metadata tags</p>
            </div>
          )}
        </div>
      </div>
    </form>
  );
};

export default StartNodeForm;
