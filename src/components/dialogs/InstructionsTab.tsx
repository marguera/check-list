import { TipTapEditor } from '../editor/TipTapEditor';
import { KnowledgeItem } from '../../types';
import { KnowledgeItemViewer } from '../knowledge/KnowledgeItemViewer';
import { useState, useEffect, useRef } from 'react';

interface InstructionsTabProps {
  instructions: string;
  onInstructionsChange: (instructions: string) => void;
  knowledgeItems: KnowledgeItem[];
  onKnowledgeLinkInserted: (itemId: string) => void;
  editable?: boolean;
  taskId?: string;
}

export function InstructionsTab({
  instructions,
  onInstructionsChange,
  knowledgeItems,
  onKnowledgeLinkInserted,
  editable = true,
  taskId,
}: InstructionsTabProps) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<KnowledgeItem | null>(null);
  const instructionsRef = useRef<HTMLDivElement>(null);

  const handleKnowledgeLinkInsert = (item: KnowledgeItem) => {
    onKnowledgeLinkInserted(item.id);
  };

  // Handle clicks on knowledge links in instructions (non-editable mode)
  useEffect(() => {
    if (!instructionsRef.current || editable) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[data-knowledge-link]') as HTMLAnchorElement;
      
      if (link) {
        e.preventDefault();
        const knowledgeId = link.getAttribute('data-knowledge-id');
        if (knowledgeId) {
          const item = knowledgeItems.find(item => item.id === knowledgeId);
          if (item) {
            setViewingItem(item);
            setViewerOpen(true);
          }
        }
      }
    };

    const container = instructionsRef.current;
    container.addEventListener('click', handleClick);
    
    return () => {
      container.removeEventListener('click', handleClick);
    };
  }, [instructions, editable, knowledgeItems]);

  // In view/preview mode, don't render TipTap editor at all
  if (!editable) {
    return (
      <>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Instructions
            </label>
            <div className="prose prose-sm max-w-none">
              <div 
                ref={instructionsRef}
                className="instructions-content"
                dangerouslySetInnerHTML={{ __html: instructions || 'No instructions provided.' }} 
                tabIndex={-1}
                style={{ outline: 'none' }}
              />
            <style>{`
              .instructions-content {
                outline: none !important;
                border: none !important;
              }
              .instructions-content * {
                outline: none !important;
                border: none !important;
              }
              .instructions-content:focus {
                outline: none !important;
                border: none !important;
              }
              .instructions-content:focus * {
                outline: none !important;
                border: none !important;
              }
              .instructions-content a {
                tabindex: -1;
              }
              .instructions-content a:focus {
                outline: none !important;
                border: none !important;
              }
              .instructions-content h1 {
                font-size: 2em;
                font-weight: bold;
                margin: 0.67em 0;
                line-height: 1.2;
                color: #0f172a;
              }
              .instructions-content h2 {
                font-size: 1.5em;
                font-weight: bold;
                margin: 0.75em 0;
                line-height: 1.3;
                color: #0f172a;
              }
              .instructions-content h3 {
                font-size: 1.17em;
                font-weight: bold;
                margin: 0.83em 0;
                line-height: 1.4;
                color: #0f172a;
              }
              .instructions-content h4 {
                font-size: 1em;
                font-weight: bold;
                margin: 1em 0;
                line-height: 1.5;
                color: #0f172a;
              }
              .instructions-content h5 {
                font-size: 0.83em;
                font-weight: bold;
                margin: 1.17em 0;
                line-height: 1.5;
                color: #0f172a;
              }
              .instructions-content h6 {
                font-size: 0.67em;
                font-weight: bold;
                margin: 1.33em 0;
                line-height: 1.5;
                color: #0f172a;
              }
              .instructions-content p {
                margin: 0.5em 0;
                color: #334155;
              }
              .instructions-content img {
                max-width: 100%;
                height: auto;
                display: block;
                margin: 1em auto;
                border-radius: 0.5rem;
              }
              .instructions-content a[data-knowledge-link] {
                color: #2563eb;
                text-decoration: underline;
                cursor: pointer;
                pointer-events: auto;
              }
              .instructions-content a[data-knowledge-link]:hover {
                color: #1d4ed8;
                text-decoration: underline;
              }
              .instructions-content a:not([data-knowledge-link]) {
                color: #2563eb;
                text-decoration: underline;
              }
              .instructions-content ul,
              .instructions-content ol {
                padding-left: 1.5em;
                margin: 0.5em 0;
                display: block;
                list-style-type: disc;
              }
              .instructions-content ol {
                list-style-type: decimal;
              }
              .instructions-content li {
                margin: 0.25em 0;
                display: list-item;
                list-style-position: outside;
              }
            `}</style>
          </div>
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

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-slate-700 mb-2 block">
          Instructions
        </label>
        <TipTapEditor
          key={taskId || 'new-task'}
          content={instructions}
          onChange={onInstructionsChange}
          knowledgeItems={knowledgeItems}
          onInsertKnowledgeLink={handleKnowledgeLinkInsert}
          editable={editable}
          onKnowledgeLinkClick={(item) => {
            setViewingItem(item);
            setViewerOpen(true);
          }}
        />
      </div>
      <KnowledgeItemViewer
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        item={viewingItem}
      />
    </div>
  );
}


