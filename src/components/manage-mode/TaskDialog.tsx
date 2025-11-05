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
import { ArrowLeft } from 'lucide-react';
import { InstructionsTab } from './InstructionsTab';
import { Task, KnowledgeItem } from '../../types';
import { extractKnowledgeLinkIds } from '../../utils/knowledgeLinks';
import { KnowledgeItemViewer } from '../knowledge/KnowledgeItemViewer';
import { ImageViewerDialog } from '../dialogs/ImageViewerDialog';

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


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="!max-w-full !w-full !h-full !max-h-screen !m-0 !rounded-none !translate-x-0 !translate-y-0 !left-0 !top-0 !border-0 !bg-white flex flex-col p-0 !gap-0 [&>button]:hidden"
      >
        <div className="w-full h-full flex flex-col bg-white">
          <DialogHeader className="px-4 sm:px-6 py-4 border-b border-slate-200 bg-white">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <DialogTitle className="text-lg font-semibold text-slate-900 flex-1">
                {mode === 'add' ? 'Add Task' : 'Edit Task'}
              </DialogTitle>
            </div>
            <DialogDescription className="sr-only">
              {mode === 'add' ? 'Add a new task to the workflow' : 'Edit the task details'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto min-h-0 px-4 sm:px-6 py-4">
            <div className="max-w-4xl mx-auto">
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

              <div className="mt-6">
                <InstructionsTab
                  instructions={instructions}
                  onInstructionsChange={setInstructions}
                  knowledgeItems={knowledgeItems}
                  onKnowledgeLinkInserted={handleKnowledgeLinkInserted}
                  editable={true}
                  taskId={task?.id}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 pb-6 pt-4 border-t">
            <div className="max-w-4xl mx-auto w-full flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {mode === 'add' ? 'Add Task' : 'Save Changes'}
              </Button>
            </div>
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

