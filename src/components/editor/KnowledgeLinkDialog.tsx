import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { KnowledgeItem } from '../../types';

interface KnowledgeLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  knowledgeItems: KnowledgeItem[];
  onSelect: (item: KnowledgeItem) => void;
}

export function KnowledgeLinkDialog({
  open,
  onOpenChange,
  knowledgeItems,
  onSelect,
}: KnowledgeLinkDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = knowledgeItems.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select Knowledge Item</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Search knowledge items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
          />
          <div className="max-h-96 overflow-y-auto space-y-2">
            {filteredItems.length === 0 ? (
              <p className="text-center text-slate-500 py-8">
                No knowledge items found
              </p>
            ) : (
              filteredItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelect(item);
                    onOpenChange(false);
                    setSearchTerm('');
                  }}
                  className="w-full text-left border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors"
                >
                  <h3 className="font-semibold text-slate-900 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600">{item.description}</p>
                </button>
              ))
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


