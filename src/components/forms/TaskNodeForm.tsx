import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2 } from 'lucide-react';
import type { TaskNodeData, WorkflowNode } from '../../types/workflow';
import { useWorkflowStore } from '../../store/useWorkflowStore';
import { useEffect } from 'react';
import { motion } from 'framer-motion';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string(),
  assignee: z.string().min(1, 'Assignee is required'),
  dueDate: z.string(),
  customFields: z.array(z.object({
    key: z.string().min(1, 'Key required'),
    value: z.string().min(1, 'Value required'),
  })),
});

const TaskNodeForm = ({ node }: { node: WorkflowNode }) => {
  const updateNodeData = useWorkflowStore(state => state.updateNodeData);
  const data = node.data as TaskNodeData;

  const { register, control, watch } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: data.title,
      description: data.description || '',
      assignee: data.assignee || '',
      dueDate: data.dueDate || '',
      customFields: data.customFields || [],
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "customFields"
  });

  useEffect(() => {
    const subscription = watch((value) => {
      updateNodeData(node.id, value as Partial<TaskNodeData>);
    });
    return () => subscription.unsubscribe();
  }, [watch, node.id, updateNodeData]);

  return (
    <form className="space-y-6">
      <div className="space-y-1.5">
        <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Task Title</label>
        <input
          {...register('title')}
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-medium text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Description</label>
        <textarea
          {...register('description')}
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-medium text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all min-h-[80px] resize-none"
          placeholder="What needs to be done?"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Assignee</label>
          <input
            {...register('assignee')}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-medium text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
            placeholder="Name or Email"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Due Date</label>
          <input
            {...register('dueDate')}
            type="date"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-medium text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
          />
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Custom Fields</label>
          <button
            type="button"
            onClick={() => append({ key: '', value: '' })}
            className="flex items-center gap-1.5 text-[10px] font-bold text-primary hover:text-primary-hover uppercase tracking-wider transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Add Field
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
                {...register(`customFields.${index}.key` as const)}
                className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-medium focus:ring-1 focus:ring-primary transition-all"
                placeholder="Label"
              />
              <input
                {...register(`customFields.${index}.value` as const)}
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
        </div>
      </div>
    </form>
  );
};

export default TaskNodeForm;
