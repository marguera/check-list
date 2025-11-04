import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Button } from '../ui/button';
import { InstructionsTab } from './InstructionsTab';
import { KnowledgeDatabaseTab } from './KnowledgeDatabaseTab';
import { ImagesTab } from './ImagesTab';
import { Task, KnowledgeItem } from '../../types';
import { extractKnowledgeLinkIds } from '../../utils/knowledgeLinks';
import { extractImageUrls } from '../../utils/imageExtraction';
import { KnowledgeItemViewer } from '../knowledge/KnowledgeItemViewer';

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  knowledgeItems: KnowledgeItem[];
  onSave: (task: Partial<Task>) => void;
  mode: 'add' | 'edit' | 'view';
}

export function TaskDialog({
  open,
  onOpenChange,
  task,
  knowledgeItems,
  onSave,
  mode,
}: TaskDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [knowledgeLinks, setKnowledgeLinks] = useState<string[]>([]);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<KnowledgeItem | null>(null);
  const instructionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      if (task) {
        // Force update all fields immediately when dialog opens with a task
        setTitle(task.title);
        setDescription(task.description);
        setInstructions(task.instructions || '');
        setKnowledgeLinks(task.knowledgeDatabaseLinks || []);
      } else {
        setTitle('');
        setDescription('');
        setInstructions('');
        setKnowledgeLinks([]);
      }
    } else {
      // Reset state when dialog closes to prevent stale data
      setTitle('');
      setDescription('');
      setInstructions('');
      setKnowledgeLinks([]);
    }
  }, [task?.id, open, task?.title, task?.description, task?.instructions, task?.knowledgeDatabaseLinks]);

  const handleSave = () => {
    // Extract knowledge links from instructions HTML and merge with existing links
    const extractedIds = extractKnowledgeLinkIds(instructions || '');
    const allKnowledgeLinks = [...new Set([...knowledgeLinks, ...extractedIds])];
    
    onSave({
      title,
      description,
      instructions,
      knowledgeDatabaseLinks: allKnowledgeLinks,
    });
    onOpenChange(false);
  };

  const handleKnowledgeLinkInserted = (itemId: string) => {
    if (!knowledgeLinks.includes(itemId)) {
      setKnowledgeLinks([...knowledgeLinks, itemId]);
    }
  };

  // Get all knowledge links including those from instructions HTML
  const getAllKnowledgeLinks = () => {
    const extractedIds = extractKnowledgeLinkIds(instructions || '');
    return [...new Set([...knowledgeLinks, ...extractedIds])];
  };

  // Get all images from instructions HTML
  const getAllImages = () => {
    return extractImageUrls(instructions || '');
  };

  const isViewMode = mode === 'view';
  const imageUrls = getAllImages();
  const hasImages = imageUrls.length > 0;
  const hasKnowledgeLinks = getAllKnowledgeLinks().length > 0;

  // Handle clicks on knowledge links in instructions
  useEffect(() => {
    if (!instructionsRef.current || !isViewMode) return;

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
  }, [instructions, isViewMode, knowledgeItems]);

  // Determine which tabs to show
  const tabCount = 1 + (hasKnowledgeLinks ? 1 : 0) + (hasImages ? 1 : 0);
  const gridCols = tabCount === 1 ? 'grid-cols-1' : tabCount === 2 ? 'grid-cols-2' : 'grid-cols-3';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="!max-w-full !w-full !h-full !max-h-screen !m-0 !rounded-none !translate-x-0 !translate-y-0 !left-0 !top-0 !border-0 flex flex-col p-0"
        onOpenAutoFocus={(e) => {
          if (isViewMode) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-2xl">
            {mode === 'add' ? 'Add Task' : mode === 'edit' ? 'Edit Task' : 'Task Details'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-6 mb-4">
            {isViewMode ? (
              <>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    {title || 'Untitled Task'}
                  </h2>
                  {description && (
                    <p className="text-base text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {description}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
                    placeholder="Enter task title"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
                    placeholder="Enter task description"
                  />
                </div>
              </>
            )}
          </div>

          <Tabs defaultValue="instructions" className="w-full">
            <TabsList className={`grid w-full ${gridCols}`}>
              <TabsTrigger value="instructions">Instructions</TabsTrigger>
              {hasKnowledgeLinks && (
                <TabsTrigger value="knowledge">
                  Knowledge Database ({getAllKnowledgeLinks().length})
                </TabsTrigger>
              )}
              {hasImages && (
                <TabsTrigger value="images">
                  Images ({imageUrls.length})
                </TabsTrigger>
              )}
            </TabsList>
            <TabsContent value="instructions" className="mt-4">
              {isViewMode ? (
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
              ) : (
                <InstructionsTab
                  instructions={instructions}
                  onInstructionsChange={setInstructions}
                  knowledgeItems={knowledgeItems}
                  onKnowledgeLinkInserted={handleKnowledgeLinkInserted}
                  editable={!isViewMode}
                  taskId={task?.id}
                />
              )}
            </TabsContent>
            {hasKnowledgeLinks && (
              <TabsContent value="knowledge" className="mt-4">
                <KnowledgeDatabaseTab
                  linkedItemIds={knowledgeLinks}
                  knowledgeItems={knowledgeItems}
                  instructions={instructions}
                />
              </TabsContent>
            )}
            {hasImages && (
              <TabsContent value="images" className="mt-4">
                <ImagesTab imageUrls={imageUrls} />
              </TabsContent>
          )}
        </Tabs>
      </div>

      <KnowledgeItemViewer
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        item={viewingItem}
      />

      <DialogFooter className="px-6 pb-6 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {isViewMode ? 'Close' : 'Cancel'}
          </Button>
          {!isViewMode && (
            <Button onClick={handleSave}>
              {mode === 'add' ? 'Add Task' : 'Save Changes'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

