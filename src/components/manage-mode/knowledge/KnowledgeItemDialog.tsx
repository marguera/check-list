import { useState, useEffect } from 'react';
import { KnowledgeItem } from '../../../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../ui/dialog';
import { Button } from '../../ui/button';
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#1F1F20] text-white border border-white/20">
        <DialogHeader>
          <DialogTitle className="text-white uppercase tracking-wide">
            {mode === 'add' ? 'Add Knowledge Item' : 'Edit Knowledge Item'}
          </DialogTitle>
          <DialogDescription className="text-white/70">
            {mode === 'add' ? 'Create a new knowledge item for your database' : 'Edit the knowledge item details'}
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
              placeholder="Enter knowledge item title"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold uppercase tracking-wide text-white/70 mb-2">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-white/20 rounded-md bg-[#19191A] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40"
              placeholder="Enter a brief description"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold uppercase tracking-wide text-white/70 mb-2">
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

