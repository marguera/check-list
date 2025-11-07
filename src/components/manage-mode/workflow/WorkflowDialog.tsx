import { useState, useEffect } from 'react';
import { Project } from '../../../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../ui/dialog';
import { Button } from '../../ui/button';

interface WorkflowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflow: Project['workflows'][0] | null;
  onSave: (workflow: Partial<Project['workflows'][0]>) => void;
  mode: 'add' | 'edit';
}

export function WorkflowDialog({
  open,
  onOpenChange,
  workflow,
  onSave,
  mode,
}: WorkflowDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (open) {
      if (workflow) {
        setTitle(workflow.title);
        setDescription(workflow.description);
      } else {
        setTitle('');
        setDescription('');
      }
    }
  }, [open, workflow]);

  const handleSave = () => {
    if (!title.trim()) {
      return;
    }
    onSave({ title, description });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-[#1F1F20] text-white border border-white/20">
        <DialogHeader>
          <DialogTitle className="text-white uppercase tracking-wide">
            {mode === 'add' ? 'Add Workflow' : 'Edit Workflow'}
          </DialogTitle>
          <DialogDescription className="text-white/70">
            {mode === 'add' ? 'Create a new workflow for your project' : 'Edit the workflow details'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <label className="block text-sm font-semibold uppercase tracking-wide text-white/70 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-white/20 rounded-md bg-[#19191A] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40"
              placeholder="Enter workflow title"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold uppercase tracking-wide text-white/70 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-white/20 rounded-md bg-[#19191A] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 resize-none"
              placeholder="Enter workflow description"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t border-white/20">
          <Button
            variant="default"
            onClick={() => onOpenChange(false)}
            className="bg-transparent border border-white/20 text-white hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!title.trim()}
            className="bg-white text-[#19191A] hover:bg-white/90 disabled:opacity-50"
          >
            {mode === 'add' ? 'Add' : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

