import { TipTapEditor } from '../editor/TipTapEditor';
import { KnowledgeItem } from '../../types';
import { KnowledgeItemViewer } from '../knowledge/KnowledgeItemViewer';
import { ImageViewerDialog } from './ImageViewerDialog';
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const instructionsRef = useRef<HTMLDivElement>(null);

  const handleKnowledgeLinkInsert = (item: KnowledgeItem) => {
    onKnowledgeLinkInserted(item.id);
  };

  // Handle clicks on knowledge links and images in instructions (non-editable mode)
  // Use event delegation to handle tab switching
  useEffect(() => {
    if (editable) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Only handle clicks within the instructions content area
      const instructionsContent = target.closest('.instructions-content');
      if (!instructionsContent) return;
      
      // Check for knowledge links
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
        return;
      }
      
      // Check for images
      const img = target.closest('img') as HTMLImageElement;
      if (img && img.src) {
        e.preventDefault();
        setSelectedImage(img.src);
      }
    };

    // Use event delegation at document level with a selector check
    document.addEventListener('click', handleClick);
    
    return () => {
      document.removeEventListener('click', handleClick);
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
                border-radius: 0.5rem;
                display: block;
                cursor: pointer;
                transition: opacity 0.2s;
              }
              .instructions-content img:hover {
                opacity: 0.9;
              }
              .instructions-content img:not([data-align]) {
                margin: 1em auto;
              }
              .instructions-content img[data-align="left"] {
                margin: 1em 0;
              }
              .instructions-content img[data-align="right"] {
                margin-left: auto;
                margin-right: 0;
                margin-top: 1em;
                margin-bottom: 1em;
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
        knowledgeItems={knowledgeItems}
      />
      <ImageViewerDialog
        open={!!selectedImage}
        onOpenChange={(open) => !open && setSelectedImage(null)}
        imageUrl={selectedImage}
        alt="Image preview"
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
          onImageClick={(imageUrl) => {
            setSelectedImage(imageUrl);
          }}
        />
      </div>
      <KnowledgeItemViewer
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        item={viewingItem}
        knowledgeItems={knowledgeItems}
      />
    </div>
  );
}


