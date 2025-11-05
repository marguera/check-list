import { KnowledgeItem } from '../../types';
import { BookOpen } from 'lucide-react';
import { extractKnowledgeLinkIds } from '../../utils/knowledgeLinks';
import { KnowledgeItemViewer } from '../knowledge/KnowledgeItemViewer';
import { useState } from 'react';

interface KnowledgeDatabaseTabProps {
  linkedItemIds: string[];
  knowledgeItems: KnowledgeItem[];
  instructions?: string;
  mode?: 'view' | 'edit' | 'completion';
}

export function KnowledgeDatabaseTab({
  linkedItemIds,
  knowledgeItems,
  instructions,
  mode = 'edit',
}: KnowledgeDatabaseTabProps) {
  const isViewMode = mode === 'view' || mode === 'completion';
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<KnowledgeItem | null>(null);

  // Extract knowledge links from instructions HTML if provided
  let allLinkedIds = [...linkedItemIds];
  if (instructions) {
    const extractedIds = extractKnowledgeLinkIds(instructions);
    allLinkedIds = [...new Set([...allLinkedIds, ...extractedIds])];
  }

  const linkedItems = knowledgeItems.filter((item) =>
    allLinkedIds.includes(item.id)
  );

  const handleView = (item: KnowledgeItem) => {
    setViewingItem(item);
    setViewerOpen(true);
  };

  if (linkedItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <BookOpen className={`h-12 w-12 mb-4 ${isViewMode ? 'text-white/30' : 'text-slate-300'}`} />
        <p className={isViewMode ? 'text-white/60' : 'text-slate-500'}>No knowledge items linked in instructions</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className={`text-sm mb-4 ${isViewMode ? 'text-white/70' : 'text-slate-600'}`}>
          {linkedItems.length} knowledge item{linkedItems.length !== 1 ? 's' : ''} referenced in instructions
        </div>
        <div className="space-y-3">
          {linkedItems.map((item) => (
            <div
              key={item.id}
              className={`border p-4 transition-colors cursor-pointer ${
                isViewMode 
                  ? 'border-white/20 hover:bg-white/10' 
                  : 'border-slate-200 rounded-lg hover:bg-slate-50'
              }`}
              onClick={() => handleView(item)}
            >
              <h3 className={`font-semibold mb-2 transition-colors ${
                isViewMode 
                  ? 'text-white hover:text-blue-400' 
                  : 'text-slate-900 hover:text-blue-600'
              }`}>
                {item.title}
              </h3>
              {item.description && (
                <p className={`text-sm ${isViewMode ? 'text-white/70' : 'text-slate-600'}`}>{item.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>
      <KnowledgeItemViewer
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        item={viewingItem}
        knowledgeItems={knowledgeItems}
      />
    </>
  );
}

