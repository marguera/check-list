import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { KnowledgeItem } from '../../types';
import { useState, useEffect, useRef } from 'react';
import { MobileViewHeader } from '../ui/MobileViewHeader';
import { MobileViewContainer } from '../ui/MobileViewContainer';

interface KnowledgeItemViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: KnowledgeItem | null;
  knowledgeItems?: KnowledgeItem[];
}

export function KnowledgeItemViewer({
  open,
  onOpenChange,
  item,
  knowledgeItems = [],
}: KnowledgeItemViewerProps) {
  const [currentItem, setCurrentItem] = useState<KnowledgeItem | null>(item);
  const [history, setHistory] = useState<KnowledgeItem[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setHistory([]);
      setCurrentItem(null);
    } else {
      // Blur any focused element in the background to prevent aria-hidden conflicts
      if (document.activeElement && document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    }
  }, [open]);

  // Update currentItem when item prop changes (but preserve history)
  useEffect(() => {
    if (item && open) {
      // Only reset history if this is a new item (not from navigation)
      setCurrentItem(prev => {
        if (!prev || prev.id !== item.id) {
          setHistory([]);
          return item;
        }
        return prev;
      });
    }
  }, [item?.id, open]);

  // Handle clicks on knowledge links in content
  useEffect(() => {
    if (!open || !currentItem || knowledgeItems.length === 0) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const contentElement = contentRef.current;
      if (!contentElement) return;

      // Only handle clicks within the knowledge content area
      if (!contentElement.contains(target)) return;

      // Check for knowledge links
      const link = target.closest('a[data-knowledge-link]') as HTMLAnchorElement;
      if (link) {
        e.preventDefault();
        const knowledgeId = link.getAttribute('data-knowledge-id');
        if (knowledgeId) {
          const linkedItem = knowledgeItems.find(item => item.id === knowledgeId);
          if (linkedItem && linkedItem.id !== currentItem.id) {
            // Push current item to history and navigate to linked item
            setHistory(prev => [...prev, currentItem]);
            setCurrentItem(linkedItem);
          }
        }
        return;
      }
    };

    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [open, currentItem, knowledgeItems]);

  const handleBack = () => {
    if (history.length > 0) {
      const previousItem = history[history.length - 1];
      setHistory(prev => prev.slice(0, -1));
      setCurrentItem(previousItem);
    }
  };

  if (!currentItem) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="!max-w-full !w-full !h-full !max-h-screen !m-0 !rounded-none !translate-x-0 !translate-y-0 !left-0 !top-0 !border-0 flex flex-col p-0 [&>button]:hidden"
      >
        <div className="w-full h-full flex flex-col">
          <DialogHeader className="px-0 pt-0 pb-0 border-0">
            <DialogTitle className="sr-only">
              {currentItem.title}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {currentItem.description || 'Knowledge item details'}
            </DialogDescription>
            <MobileViewHeader
              title={currentItem.title}
              onBack={history.length > 0 ? handleBack : () => onOpenChange(false)}
              showBackButton={true}
            />
          </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0 px-4 sm:px-6 py-4">
          <MobileViewContainer>
            {currentItem.description && (
              <p className="text-lg text-slate-600 mb-6">{currentItem.description}</p>
            )}
            <div className="prose prose-lg max-w-none">
              <div 
                ref={contentRef}
                className="knowledge-content"
                dangerouslySetInnerHTML={{ __html: currentItem.content || '' }}
              />
              <style>{`
              .knowledge-content h1 {
                font-size: 2em;
                font-weight: bold;
                margin: 0.67em 0;
                line-height: 1.2;
                color: #0f172a;
              }
              .knowledge-content h2 {
                font-size: 1.5em;
                font-weight: bold;
                margin: 0.75em 0;
                line-height: 1.3;
                color: #0f172a;
              }
              .knowledge-content h3 {
                font-size: 1.17em;
                font-weight: bold;
                margin: 0.83em 0;
                line-height: 1.4;
                color: #0f172a;
              }
              .knowledge-content h4 {
                font-size: 1em;
                font-weight: bold;
                margin: 1em 0;
                line-height: 1.5;
                color: #0f172a;
              }
              .knowledge-content h5 {
                font-size: 0.83em;
                font-weight: bold;
                margin: 1.17em 0;
                line-height: 1.5;
                color: #0f172a;
              }
              .knowledge-content h6 {
                font-size: 0.67em;
                font-weight: bold;
                margin: 1.33em 0;
                line-height: 1.5;
                color: #0f172a;
              }
              .knowledge-content p {
                margin: 0.5em 0;
                color: #334155;
              }
              .knowledge-content img {
                max-width: 100%;
                height: auto;
                border-radius: 0.5rem;
                display: block;
              }
              .knowledge-content img:not([data-align]) {
                margin: 1em auto;
              }
              .knowledge-content img[data-align="left"] {
                margin: 1em 0;
              }
              .knowledge-content img[data-align="right"] {
                margin-left: auto;
                margin-right: 0;
                margin-top: 1em;
                margin-bottom: 1em;
              }
              .knowledge-content a {
                color: #2563eb;
                text-decoration: underline;
              }
              .knowledge-content a:hover {
                color: #1d4ed8;
              }
              .knowledge-content a[data-knowledge-link] {
                color: #2563eb;
                text-decoration: underline;
                cursor: pointer;
                pointer-events: auto;
              }
              .knowledge-content a[data-knowledge-link]:hover {
                color: #1d4ed8;
                text-decoration: underline;
              }
              .knowledge-content ul,
              .knowledge-content ol {
                padding-left: 1.5em;
                margin: 0.5em 0;
                display: block;
                list-style-type: disc;
              }
              .knowledge-content ol {
                list-style-type: decimal;
              }
              .knowledge-content li {
                margin: 0.25em 0;
                display: list-item;
                list-style-position: outside;
              }
              .knowledge-content strong {
                font-weight: bold;
              }
              .knowledge-content em {
                font-style: italic;
              }
              `}</style>
            </div>
          </MobileViewContainer>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

