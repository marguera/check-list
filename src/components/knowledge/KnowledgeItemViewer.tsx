import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { KnowledgeItem } from '../../types';

interface KnowledgeItemViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: KnowledgeItem | null;
}

export function KnowledgeItemViewer({
  open,
  onOpenChange,
  item,
}: KnowledgeItemViewerProps) {
  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="!max-w-full !w-full !h-full !max-h-screen !m-0 !rounded-none !translate-x-0 !translate-y-0 !left-0 !top-0 !border-0 flex flex-col p-0"
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-2xl">{item.title}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {item.description && (
            <p className="text-lg text-slate-600 mb-6">{item.description}</p>
          )}
          <div className="prose prose-lg max-w-none">
            <div 
              className="knowledge-content"
              dangerouslySetInnerHTML={{ __html: item.content || '' }}
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
        </div>
      </DialogContent>
    </Dialog>
  );
}

