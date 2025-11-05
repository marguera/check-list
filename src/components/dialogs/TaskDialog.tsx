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
import { KnowledgeDatabaseTab } from './KnowledgeDatabaseTab';
import { ImagesTab } from './ImagesTab';
import { TaskDetailsContent } from './TaskDetailsContent';
import { Task, KnowledgeItem } from '../../types';
import { extractKnowledgeLinkIds } from '../../utils/knowledgeLinks';
import { extractImageUrls } from '../../utils/imageExtraction';
import { isInstructionsEmpty } from '../../utils/instructions';
import { KnowledgeItemViewer } from '../knowledge/KnowledgeItemViewer';
import { ImageViewerDialog } from './ImageViewerDialog';
import { Check, Info, BookOpen, Image as ImageIcon } from 'lucide-react';

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  knowledgeItems: KnowledgeItem[];
  onSave: (task: Partial<Task>) => void;
  mode: 'add' | 'edit' | 'view';
  // Completion props
  isCurrentStep?: boolean;
  isCompleted?: boolean;
  onComplete?: () => void;
}

export function TaskDialog({
  open,
  onOpenChange,
  task,
  knowledgeItems,
  onSave,
  mode,
  isCurrentStep = false,
  isCompleted = false,
  onComplete,
}: TaskDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [knowledgeLinks, setKnowledgeLinks] = useState<string[]>([]);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<KnowledgeItem | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (open) {
      // Blur any focused element in the background to prevent aria-hidden conflicts
      if (document.activeElement && document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      
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
      setConfirmed(false);
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
  const isEditMode = mode === 'edit' || mode === 'add';
  const imageUrls = getAllImages();
  const hasImages = imageUrls.length > 0;
  const hasKnowledgeLinks = getAllKnowledgeLinks().length > 0;

  // Determine which tabs to show
  // In view mode: only show Instructions tab if there are instructions
  // In edit/add mode: always show Instructions tab so users can add/edit instructions
  const hasInstructions = isEditMode ? true : !isInstructionsEmpty(instructions);
  const tabCount = (hasInstructions ? 1 : 0) + (hasKnowledgeLinks ? 1 : 0) + (hasImages ? 1 : 0);
  const gridCols = tabCount === 1 ? 'grid-cols-1' : tabCount === 2 ? 'grid-cols-2' : 'grid-cols-3';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={`!max-w-full !w-full !h-full !max-h-screen !m-0 !rounded-none !translate-x-0 !translate-y-0 !left-0 !top-0 !border-0 flex flex-col p-0 !gap-0 [&>button]:hidden ${isViewMode ? '!bg-[#19191A]' : ''}`}
        onOpenAutoFocus={(e) => {
          if (isViewMode) {
            e.preventDefault();
          }
        }}
      >
        <div className={`w-full h-full flex flex-col ${isViewMode ? 'text-white' : ''}`}>
          <DialogHeader className="px-0 pt-0 pb-0 border-0 !space-y-0">
            <DialogTitle className="sr-only">
              {mode === 'add' ? 'Add Task' : mode === 'edit' ? 'Edit Task' : (task ? `Step ${task.stepNumber}` : '')}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {mode === 'add' ? 'Add a new task to the workflow' : mode === 'edit' ? 'Edit the task details' : (task ? `View details for step ${task.stepNumber}` : '')}
            </DialogDescription>
            <MobileViewHeader
              title={mode === 'add' ? 'Add Task' : mode === 'edit' ? 'Edit Task' : (task ? `Step ${task.stepNumber}` : '')}
              onBack={() => onOpenChange(false)}
              showBackButton={true}
            />
          </DialogHeader>

          <div className="flex-1 overflow-y-auto min-h-0 px-4 sm:px-6 py-4">
            <MobileViewContainer>
              {isViewMode && task ? (
                <>
                  {/* Completed Step Indicator */}
                  {isCompleted && (
                    <div className="mb-4 pb-4 border-b border-white/20">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-8 h-8 bg-green-500/20">
                          <Check className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-green-400">Step Completed</div>
                          <div className="text-xs text-white/60">This step has been completed. You are viewing it for reference.</div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className={isCompleted ? 'opacity-75' : ''}>
                    <TaskDetailsContent
                      task={task}
                      knowledgeItems={knowledgeItems}
                      mode="view"
                      onKnowledgeLinkClick={(item) => {
                        setViewingItem(item);
                        setViewerOpen(true);
                      }}
                      onImageClick={(imageUrl) => {
                        setSelectedImage(imageUrl);
                      }}
                    />
                  </div>
                  
                  {/* Confirmation Checkbox - only show for current incomplete step */}
                  {!isCompleted && isCurrentStep && onComplete && (
                    <div className="pt-6 mt-6 border-t border-white/20 pb-4">
                      <h3 className="font-semibold text-white mb-3">Confirm below to complete this step</h3>
                      <div className="flex items-center space-x-2.5">
                        <input
                          type="checkbox"
                          id="confirm-checkbox"
                          checked={confirmed}
                          onChange={(e) => setConfirmed(e.target.checked)}
                          className="h-5 w-5 accent-green-600 focus:accent-green-600 focus:outline-none focus:ring-0 border-slate-300 rounded"
                        />
                        <label
                          htmlFor="confirm-checkbox"
                          className="text-sm text-white/80 cursor-pointer"
                        >
                          I confirm all instructions were followed
                        </label>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
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
                            editable={!isViewMode}
                            taskId={task?.id}
                          />
                        </TabsContent>
                      )}
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
                  )}
                </>
              )}
            </MobileViewContainer>
          </div>

          {!isViewMode && (
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
          )}
          
          {isViewMode && !isCompleted && isCurrentStep && onComplete && (
            <DialogFooter className="px-6 pb-6 pt-4 border-t border-white/20 bg-[#19191A]">
              <MobileViewContainer>
                <div className="flex justify-end gap-2 w-full">
                  <Button variant="outline" onClick={() => onOpenChange(false)} className="border-white/20 text-white hover:bg-white/10 !bg-transparent !rounded-none">
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      if (confirmed) {
                        onComplete();
                        setConfirmed(false);
                        onOpenChange(false);
                      } else {
                        alert('Please confirm that all instructions were followed');
                      }
                    }}
                    disabled={!confirmed}
                    className="bg-green-600 hover:bg-green-700 text-white disabled:bg-slate-300 disabled:text-slate-500"
                  >
                    Confirm Completion
                  </Button>
                </div>
              </MobileViewContainer>
            </DialogFooter>
          )}
        </div>
      </DialogContent>

      <KnowledgeItemViewer
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        item={viewingItem}
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

