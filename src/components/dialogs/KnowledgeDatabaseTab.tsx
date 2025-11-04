import { KnowledgeItem } from '../../types';
import { BookOpen } from 'lucide-react';
import { extractKnowledgeLinkIds } from '../../utils/knowledgeLinks';
import { KnowledgeItemViewer } from '../knowledge/KnowledgeItemViewer';
import { useState } from 'react';

interface KnowledgeDatabaseTabProps {
  linkedItemIds: string[];
  knowledgeItems: KnowledgeItem[];
  instructions?: string;
}

export function KnowledgeDatabaseTab({
  linkedItemIds,
  knowledgeItems,
  instructions,
}: KnowledgeDatabaseTabProps) {
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
        <BookOpen className="h-12 w-12 text-slate-300 mb-4" />
        <p className="text-slate-500">No knowledge items linked in instructions</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="text-sm text-slate-600 mb-4">
          {linkedItems.length} knowledge item{linkedItems.length !== 1 ? 's' : ''} referenced in instructions
        </div>
        <div className="space-y-3">
          {linkedItems.map((item) => (
            <div
              key={item.id}
              className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors cursor-pointer"
              onClick={() => handleView(item)}
            >
              <h3 className="font-semibold text-slate-900 mb-2 hover:text-blue-600 transition-colors">
                {item.title}
              </h3>
              {item.description && (
                <p className="text-sm text-slate-600">{item.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>
      <KnowledgeItemViewer
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        item={viewingItem}
      />
    </>
  );
}

