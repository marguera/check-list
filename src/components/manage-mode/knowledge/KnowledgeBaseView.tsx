import { useState } from 'react';
import { KnowledgeItem } from '../../../types';
import { Button } from '../../ui/button';
import { Plus, Edit, Trash2, BookOpen } from 'lucide-react';
import { KnowledgeItemDialog } from './KnowledgeItemDialog';
import { KnowledgeItemViewer } from '../../knowledge/KnowledgeItemViewer';

interface KnowledgeBaseViewProps {
  knowledgeItems: KnowledgeItem[];
  onAdd: (item: Omit<KnowledgeItem, 'id'>) => void;
  onUpdate: (id: string, item: Partial<KnowledgeItem>) => void;
  onDelete: (id: string) => void;
}

export function KnowledgeBaseView({
  knowledgeItems,
  onAdd,
  onUpdate,
  onDelete,
}: KnowledgeBaseViewProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<KnowledgeItem | null>(null);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<KnowledgeItem | null>(null);

  const handleAdd = () => {
    setCurrentItem(null);
    setDialogMode('add');
    setDialogOpen(true);
  };

  const handleEdit = (item: KnowledgeItem) => {
    setCurrentItem(item);
    setDialogMode('edit');
    setDialogOpen(true);
  };

  const handleSave = (itemData: Partial<KnowledgeItem>) => {
    if (dialogMode === 'add') {
      onAdd({
        title: itemData.title || '',
        description: itemData.description || '',
        content: itemData.content || '',
      });
    } else if (currentItem) {
      onUpdate(currentItem.id, itemData);
    }
    setDialogOpen(false);
    setCurrentItem(null);
  };

  const handleView = (item: KnowledgeItem) => {
    setViewingItem(item);
    setViewerOpen(true);
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold uppercase text-white">Knowledge Base</h1>
          <p className="text-white/70 max-w-2xl">
            Manage your knowledge base items that can be linked to tasks
          </p>
        </div>
        <Button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-white/10 border border-white/20 text-white hover:bg-white/20"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </Button>
      </div>

      {knowledgeItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-white/10 rounded-lg bg-white/5">
          <BookOpen className="h-16 w-16 text-white/30 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            No knowledge items yet
          </h3>
          <p className="text-white/60 mb-4">
            Get started by adding your first knowledge base item
          </p>
          <Button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-white/10 border border-white/20 text-white hover:bg-white/20"
          >
            <Plus className="w-4 h-4" />
            Add First Item
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {knowledgeItems.map((item) => (
            <div
              key={item.id}
              className="border border-white/10 rounded-lg p-5 bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => handleView(item)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleView(item);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <h3 className="text-xl font-semibold text-white mb-2 hover:text-white/80 transition-colors">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-white/70">{item.description}</p>
                  )}
                </div>
                <div
                  className="flex flex-wrap gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(item)}
                    className="flex items-center gap-2 text-white bg-white/5 border border-white/10 hover:bg-white/15"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(item.id)}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <KnowledgeItemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        item={currentItem}
        onSave={handleSave}
        mode={dialogMode}
      />
      <KnowledgeItemViewer
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        item={viewingItem}
        knowledgeItems={knowledgeItems}
      />
    </div>
  );
}

