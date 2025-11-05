import { KnowledgeItem } from '../../types';
import { BookOpen } from 'lucide-react';
import { extractKnowledgeLinkIds } from '../../utils/knowledgeLinks';
import { KnowledgeItemViewer } from '../knowledge/KnowledgeItemViewer';
import { useState } from 'react';

interface ManageKnowledgeDatabaseTabProps {
  linkedItemIds: string[];
  knowledgeItems: KnowledgeItem[];
  instructions?: string;
}

export function ManageKnowledgeDatabaseTab({
  linkedItemIds,
  knowledgeItems,
  instructions,
}: ManageKnowledgeDatabaseTabProps) {
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
        <BookOpen className="h-12 w-12 mb-4 text-slate-300" />
        <p className="text-slate-500">No knowledge items linked in instructions</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="text-sm mb-4 text-slate-600">
          {linkedItems.length} knowledge item{linkedItems.length !== 1 ? 's' : ''} referenced in instructions
        </div>
        <div className="space-y-3">
          {linkedItems.map((item) => (
            <div
              key={item.id}
              className="border border-slate-200 rounded-lg hover:bg-slate-50 p-4 transition-colors cursor-pointer"
              onClick={() => handleView(item)}
            >
              <h3 className="font-semibold mb-2 transition-colors text-slate-900 hover:text-blue-600">
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
        knowledgeItems={knowledgeItems}
      />
    </>
  );
}

