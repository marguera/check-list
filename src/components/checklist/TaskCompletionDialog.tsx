import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Task, KnowledgeItem } from '../../types';
import { useState, useEffect } from 'react';
import { MobileViewHeader } from '../ui/MobileViewHeader';
import { MobileViewContainer } from '../ui/MobileViewContainer';
import { TaskDetailsContent } from '../dialogs/TaskDetailsContent';
import { KnowledgeItemViewer } from '../knowledge/KnowledgeItemViewer';
import { ImageViewerDialog } from '../dialogs/ImageViewerDialog';

interface TaskCompletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  knowledgeItems?: KnowledgeItem[];
  onConfirm: () => void;
}

export function TaskCompletionDialog({
  open,
  onOpenChange,
  task,
  knowledgeItems = [],
  onConfirm,
}: TaskCompletionDialogProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<KnowledgeItem | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      // Blur any focused element in the background to prevent aria-hidden conflicts
      if (document.activeElement && document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    }
  }, [open]);

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="!max-w-full !w-full !h-full !max-h-screen !m-0 !rounded-none !translate-x-0 !translate-y-0 !left-0 !top-0 !border-0 flex flex-col p-0 [&>button]:hidden"
      >
        <div className="w-full h-full flex flex-col">
          <DialogHeader className="px-0 pt-0 pb-0 border-0">
            <DialogTitle className="sr-only">
              Complete Task
            </DialogTitle>
            <DialogDescription className="sr-only">
              Review the task details and confirm completion
            </DialogDescription>
            <MobileViewHeader
              title="Complete Task"
              onBack={() => onOpenChange(false)}
              showBackButton={true}
            />
          </DialogHeader>

          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto min-h-0 px-4 sm:px-6 py-4">
            <MobileViewContainer>
              <TaskDetailsContent
                task={task}
                knowledgeItems={knowledgeItems}
                mode="completion"
                onKnowledgeLinkClick={(item) => {
                  setViewingItem(item);
                  setViewerOpen(true);
                }}
                onImageClick={(imageUrl) => {
                  setSelectedImage(imageUrl);
                }}
              />

              {/* Confirmation Checkbox */}
              <div className="pt-6 mt-6 border-t border-slate-200 pb-4">
                <h3 className="font-semibold text-slate-900 mb-3">Confirmation Required</h3>
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
                    className="text-sm text-slate-700 cursor-pointer"
                  >
                    I confirm all instructions were followed
                  </label>
                </div>
              </div>
            </MobileViewContainer>
          </div>

          {/* Fixed footer */}
          <div className="border-t bg-white px-4 sm:px-6 py-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (confirmed) {
                  onConfirm();
                  setConfirmed(false);
                  onOpenChange(false);
                } else {
                  alert('Please confirm that all instructions were followed');
                }
              }}
              disabled={!confirmed}
            >
              Confirm Completion
            </Button>
          </div>
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


