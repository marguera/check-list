import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { MobileViewHeader } from '../ui/MobileViewHeader';
import { MobileViewContainer } from '../ui/MobileViewContainer';
import { ViewTaskDetailsContent } from './TaskDetailsContent';
import { Task, KnowledgeItem } from '../../types';
import { KnowledgeItemViewer } from '../knowledge/KnowledgeItemViewer';
import { ImageViewerDialog } from '../dialogs/ImageViewerDialog';
import { Check } from 'lucide-react';

interface ViewTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  knowledgeItems: KnowledgeItem[];
  isCurrentStep?: boolean;
  isCompleted?: boolean;
  onComplete?: () => void;
}

export function ViewTaskDialog({
  open,
  onOpenChange,
  task,
  knowledgeItems,
  isCurrentStep = false,
  isCompleted = false,
  onComplete,
}: ViewTaskDialogProps) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<KnowledgeItem | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (open) {
      if (document.activeElement && document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      setConfirmed(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="!max-w-full !w-full !h-full !max-h-screen !m-0 !rounded-none !translate-x-0 !translate-y-0 !left-0 !top-0 !border-0 flex flex-col p-0 !gap-0 [&>button]:hidden !bg-[#19191A]"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
        }}
      >
        <div className="w-full h-full flex flex-col text-white">
          <DialogHeader className="px-0 pt-0 pb-0 border-0 !space-y-0">
            <DialogTitle className="sr-only">
              {task ? `Step ${task.stepNumber}` : ''}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {task ? `View details for step ${task.stepNumber}` : ''}
            </DialogDescription>
            <MobileViewHeader
              title={task ? `Step ${task.stepNumber}` : ''}
              onBack={() => onOpenChange(false)}
              showBackButton={true}
            />
          </DialogHeader>

          <div className="flex-1 overflow-y-auto min-h-0 px-4 sm:px-6 py-4">
            <MobileViewContainer>
              {task && (
                <>
                  {/* Completed Step Indicator */}
                  {isCompleted && (
                    <div className="mb-4 pb-4 border-b border-white/20">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-8 h-8 bg-green-500/20">
                          <Check className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <div className="text-base font-semibold text-green-400">Step Completed</div>
                          <div className="text-sm text-white/60">This step has been completed. You are viewing it for reference.</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <ViewTaskDetailsContent
                    task={task}
                    knowledgeItems={knowledgeItems}
                    onKnowledgeLinkClick={(item) => {
                      setViewingItem(item);
                      setViewerOpen(true);
                    }}
                    onImageClick={(imageUrl) => {
                      setSelectedImage(imageUrl);
                    }}
                  />

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
              )}
            </MobileViewContainer>
          </div>

          {!isCompleted && isCurrentStep && onComplete && (
            <DialogFooter className="px-6 pb-6 pt-4 border-t border-white/20 bg-[#19191A]">
              <MobileViewContainer>
                <div className="flex justify-end gap-2 w-full">
                  <Button variant="outline" onClick={() => onOpenChange(false)} className="border-white/20 !text-white !bg-transparent hover:!bg-blue-500/10 ">
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

