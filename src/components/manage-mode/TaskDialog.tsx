import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Button } from '../ui/button';
import { MobileViewHeader } from '../ui/MobileViewHeader';
import { MobileViewContainer } from '../ui/MobileViewContainer';
import { InstructionsTab } from './InstructionsTab';
import { ManageKnowledgeDatabaseTab } from './KnowledgeDatabaseTab';
import { ManageImagesTab } from './ImagesTab';
import { Task, KnowledgeItem } from '../../types';
import { extractKnowledgeLinkIds } from '../../utils/knowledgeLinks';
import { extractImageUrls } from '../../utils/imageExtraction';
import { KnowledgeItemViewer } from '../knowledge/KnowledgeItemViewer';
import { ImageViewerDialog } from '../dialogs/ImageViewerDialog';
import { Info, BookOpen, Image as ImageIcon } from 'lucide-react';

interface ManageTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  knowledgeItems: KnowledgeItem[];
  onSave: (task: Partial<Task>) => void;
  mode: 'add' | 'edit';
}

export function ManageTaskDialog({
  open,
  onOpenChange,
  task,
  knowledgeItems,
  onSave,
  mode,
}: ManageTaskDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [knowledgeLinks, setKnowledgeLinks] = useState<string[]>([]);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (document.activeElement && document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      
      if (task) {
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
      setTitle('');
      setDescription('');
      setInstructions('');
      setKnowledgeLinks([]);
    }
  }, [task?.id, open, task?.title, task?.description, task?.instructions, task?.knowledgeDatabaseLinks]);

  const handleSave = () => {
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

  const getAllKnowledgeLinks = () => {
    const extractedIds = extractKnowledgeLinkIds(instructions || '');
    return [...new Set([...knowledgeLinks, ...extractedIds])];
  };

  const getAllImages = () => {
    return extractImageUrls(instructions || '');
  };

  const imageUrls = getAllImages();
  const hasImages = imageUrls.length > 0;
  const hasKnowledgeLinks = getAllKnowledgeLinks().length > 0;
  const hasInstructions = true; // Always show instructions tab in edit/add mode
  const tabCount = (hasInstructions ? 1 : 0) + (hasKnowledgeLinks ? 1 : 0) + (hasImages ? 1 : 0);
  const gridCols = tabCount === 1 ? 'grid-cols-1' : tabCount === 2 ? 'grid-cols-2' : 'grid-cols-3';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="!max-w-full !w-full !h-full !max-h-screen !m-0 !rounded-none !translate-x-0 !translate-y-0 !left-0 !top-0 !border-0 flex flex-col p-0 !gap-0 [&>button]:hidden"
      >
        <div className="w-full h-full flex flex-col">
          <DialogHeader className="px-0 pt-0 pb-0 border-0 !space-y-0">
            <DialogTitle className="sr-only">
              {mode === 'add' ? 'Add Task' : 'Edit Task'}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {mode === 'add' ? 'Add a new task to the workflow' : 'Edit the task details'}
            </DialogDescription>
            <MobileViewHeader
              title={mode === 'add' ? 'Add Task' : 'Edit Task'}
              onBack={() => onOpenChange(false)}
              showBackButton={true}
            />
          </DialogHeader>

          <div className="flex-1 overflow-y-auto min-h-0 px-4 sm:px-6 py-4">
            <MobileViewContainer>
              <div className="space-y-6 mb-4">
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
              </div>

              {tabCount > 0 && (
                <Tabs defaultValue={hasInstructions ? "instructions" : (hasKnowledgeLinks ? "knowledge" : "images")} className="w-full">
                  <TabsList className={`grid w-full ${gridCols}`}>
                    {hasInstructions && (
                      <TabsTrigger value="instructions" className="flex items-center justify-center gap-2">
                        <Info className="w-4 h-4 flex-shrink-0" />
                        <span className="hidden sm:inline">Instructions</span>
                      </TabsTrigger>
                    )}
                    {hasKnowledgeLinks && (
                      <TabsTrigger value="knowledge" className="flex items-center justify-center gap-2">
                        <BookOpen className="w-4 h-4 flex-shrink-0" />
                        <span className="hidden sm:inline">Knowledge Database ({getAllKnowledgeLinks().length})</span>
                        <span className="sm:hidden">({getAllKnowledgeLinks().length})</span>
                      </TabsTrigger>
                    )}
                    {hasImages && (
                      <TabsTrigger value="images" className="flex items-center justify-center gap-2">
                        <ImageIcon className="w-4 h-4 flex-shrink-0" />
                        <span className="hidden sm:inline">Images ({imageUrls.length})</span>
                        <span className="sm:hidden">({imageUrls.length})</span>
                      </TabsTrigger>
                    )}
                  </TabsList>
                  {hasInstructions && (
                    <TabsContent value="instructions" className="mt-4">
                      <InstructionsTab
                        instructions={instructions}
                        onInstructionsChange={setInstructions}
                        knowledgeItems={knowledgeItems}
                        onKnowledgeLinkInserted={handleKnowledgeLinkInserted}
                        editable={true}
                        taskId={task?.id}
                      />
                    </TabsContent>
                  )}
                  {hasKnowledgeLinks && (
                    <TabsContent value="knowledge" className="mt-4">
                      <ManageKnowledgeDatabaseTab
                        linkedItemIds={knowledgeLinks}
                        knowledgeItems={knowledgeItems}
                        instructions={instructions}
                      />
                    </TabsContent>
                  )}
                  {hasImages && (
                    <TabsContent value="images" className="mt-4">
                      <ManageImagesTab imageUrls={imageUrls} />
                    </TabsContent>
                  )}
                </Tabs>
              )}
            </MobileViewContainer>
          </div>

          <DialogFooter className="px-6 pb-6 pt-4 border-t">
            <MobileViewContainer>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {mode === 'add' ? 'Add Task' : 'Save Changes'}
              </Button>
            </MobileViewContainer>
          </DialogFooter>
        </div>
      </DialogContent>

      <KnowledgeItemViewer
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        item={null}
      />

      <ImageViewerDialog
        open={!!selectedImage}
        onOpenChange={(open) => !open && setSelectedImage(null)}
        imageUrl={selectedImage}
        alt="Image preview"
      />
    </Dialog>
  );
}

