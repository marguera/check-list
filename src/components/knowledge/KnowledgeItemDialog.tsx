import { useState, useEffect } from 'react';
import { KnowledgeItem } from '../../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { TipTapEditor } from '../editor/TipTapEditor';

interface KnowledgeItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: KnowledgeItem | null;
  onSave: (item: Partial<KnowledgeItem>) => void;
  mode: 'add' | 'edit';
}

export function KnowledgeItemDialog({
  open,
  onOpenChange,
  item,
  onSave,
  mode,
}: KnowledgeItemDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (open) {
      if (item) {
        setTitle(item.title);
        setDescription(item.description);
        setContent(item.content);
      } else {
        setTitle('');
        setDescription('');
        setContent('');
      }
    }
  }, [open, item]);

  const handleSave = () => {
    if (!title.trim()) {
      return;
    }
    onSave({ title, description, content });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Add Knowledge Item' : 'Edit Knowledge Item'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
              placeholder="Enter knowledge item title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
              placeholder="Enter a brief description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Content
            </label>
            <TipTapEditor
              key={item?.id || 'new'}
              content={content}
              onChange={setContent}
              knowledgeItems={[]}
              editable={true}
              showKnowledgeLinkButton={false}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!title.trim()}>
            {mode === 'add' ? 'Add' : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

