import { useState } from 'react';
import { Dialog, DialogContent } from '../ui/dialog';
import { ViewTaskList } from '../view-mode/TaskList';
import { ViewTaskDialog } from '../view-mode/TaskDialog';
import { Task, Project } from '../../types';
import { X } from 'lucide-react';
import { MobileViewContainer } from '../ui/MobileViewContainer';

interface PreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflow: Project['workflows'][0];
  knowledgeItems: any[];
}

export function PreviewDialog({
  open,
  onOpenChange,
  workflow,
  knowledgeItems,
}: PreviewDialogProps) {
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);

  const handleViewTaskDetails = (task: Task) => {
    const latestTask = workflow.tasks.find(t => t.id === task.id) || task;
    setCurrentTask(latestTask);
    setTaskDialogOpen(true);
  };

  // Sort tasks by stepNumber to ensure proper order
  const sortedTasks = [...workflow.tasks].sort((a, b) => a.stepNumber - b.stepNumber);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="!max-w-full !w-full !h-full !max-h-screen !m-0 !rounded-none !translate-x-0 !translate-y-0 !left-0 !top-0 !border-0 flex flex-col p-0 !gap-0 [&>button]:hidden !bg-[#19191A]">
          <div className="bg-[#1F1F20] px-4 sm:px-6 py-4 border-b border-white/20" style={{ width: '100vw', marginLeft: 'calc(50% - 50vw)', marginRight: 'calc(50% - 50vw)' }}>
            <div className="flex items-center gap-3 max-w-4xl mx-auto relative">
              <button
                onClick={() => onOpenChange(false)}
                className="absolute right-0 top-0 rounded-sm opacity-70 hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-[#1F1F20]"
                aria-label="Close preview"
              >
                <X className="h-5 w-5 text-white" />
              </button>
              <h1 className="text-lg font-semibold text-white/60 uppercase flex-1 pr-8">
                Preview: {workflow.title}
              </h1>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0 py-4">
            <MobileViewContainer>
              <ViewTaskList
                tasks={sortedTasks}
                onTaskEdit={handleViewTaskDetails}
                // Don't pass completion/undo handlers - this is preview mode
              />
            </MobileViewContainer>
          </div>
        </DialogContent>
      </Dialog>

      <ViewTaskDialog
        open={taskDialogOpen}
        onOpenChange={(open) => {
          setTaskDialogOpen(open);
          if (!open) {
            setCurrentTask(null);
          }
        }}
        task={currentTask ? (workflow.tasks.find(t => t.id === currentTask.id) || currentTask) : null}
        knowledgeItems={knowledgeItems}
        // Don't pass completion handlers - this is preview mode
        isCurrentStep={false}
        isCompleted={false}
      />
    </>
  );
}

