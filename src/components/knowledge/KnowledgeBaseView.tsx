import { useState } from 'react';
import { KnowledgeItem } from '../../types';
import { Button } from '../ui/button';
import { Plus, Edit, Trash2, BookOpen } from 'lucide-react';
import { KnowledgeItemDialog } from './KnowledgeItemDialog';
import { KnowledgeItemViewer } from './KnowledgeItemViewer';

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
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Knowledge Base</h1>
          <p className="text-slate-600">
            Manage your knowledge base items that can be linked to tasks
          </p>
        </div>
        <Button onClick={handleAdd} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Item
        </Button>
      </div>

      {knowledgeItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-slate-200 rounded-lg bg-slate-50">
          <BookOpen className="h-16 w-16 text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            No knowledge items yet
          </h3>
          <p className="text-slate-600 mb-4">
            Get started by adding your first knowledge base item
          </p>
          <Button onClick={handleAdd} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add First Item
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {knowledgeItems.map((item) => (
            <div
              key={item.id}
              className="border border-slate-200 rounded-lg p-5 bg-white hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
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
                  <h3 className="text-xl font-semibold text-slate-900 mb-2 hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-slate-600">{item.description}</p>
                  )}
                </div>
                <div 
                  className="flex gap-2 ml-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(item)}
                    className="flex items-center gap-2"
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

