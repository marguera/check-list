import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { KnowledgeItem } from '../../../types';

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
      <DialogContent className="max-w-2xl bg-[#1F1F20] text-white border border-white/20">
        <DialogHeader>
          <DialogTitle className="text-white uppercase tracking-wide">Select Knowledge Item</DialogTitle>
          <DialogDescription className="text-white/70">Choose a knowledge item to link</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Search knowledge items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-white/20 rounded-md bg-[#19191A] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40"
          />
          <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
            {filteredItems.length === 0 ? (
              <p className="text-center text-white/50 py-8">
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
                  className="w-full text-left border border-white/10 rounded-lg p-4 bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <h3 className="font-semibold text-white mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-white/70">{item.description}</p>
                </button>
              ))
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="default"
            onClick={() => onOpenChange(false)}
            className="bg-transparent border border-white/20 text-white hover:bg-white/10"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

