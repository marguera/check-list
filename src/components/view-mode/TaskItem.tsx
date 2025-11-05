import { useState } from 'react';
import { Task, TaskImportance } from '../../types';
import { Check, X, RotateCcw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';

interface ViewTaskItemProps {
  task: Task;
  onEdit: () => void;
  workflowId?: string;
  workflowVersion?: number;
  isTaskCompleted?: (workflowId: string, workflowVersion: number, taskId: string) => boolean;
  currentStepTaskId?: string | null;
  lastCompletedTaskId?: string | null;
  onUndo?: () => void;
}

export function ViewTaskItem({
  task,
  onEdit,
  workflowId,
  workflowVersion,
  isTaskCompleted,
  currentStepTaskId,
  lastCompletedTaskId,
  onUndo,
}: ViewTaskItemProps) {
  const [fullImageOpen, setFullImageOpen] = useState(false);
  
  // Get completion state from execution if available, otherwise false
  const completed = workflowId && workflowVersion && isTaskCompleted
    ? isTaskCompleted(workflowId, workflowVersion, task.id)
    : false;

  // Check if this is the active step (current incomplete step)
  const isActiveStep = !completed && currentStepTaskId === task.id;

  // Get importance with default to 'low'
  const importance: TaskImportance = (task.importance === 'high' ? 'high' : 'low');

  // Get styling based on importance
  const getImportanceStyles = () => {
    switch (importance) {
      case 'high':
        return {
          title: 'text-2xl font-semibold',
          description: 'text-base',
          imageSize: 'w-16 h-16 sm:w-24 sm:h-24',
        };
      case 'low':
      default:
        return {
          title: 'text-lg font-medium',
          description: 'text-sm',
          imageSize: 'w-16 h-16 sm:w-24 sm:h-24',
        };
    }
  };

  const styles = getImportanceStyles();

  // Build container classes - flat list style for view mode
  const getContainerClasses = () => {
    const hasUndoButton = completed && lastCompletedTaskId === task.id && onUndo;
    const borderClasses = isActiveStep 
      ? 'border-l-4 border-l-green-500 border-b border-white/20' 
      : 'border-b border-white/20';
    
    let backgroundClass = 'bg-transparent';
    let hoverClass = 'hover:bg-white/5';
    if (completed) {
      if (importance === 'high') {
        backgroundClass = 'bg-white/5';
        hoverClass = 'hover:bg-white/10';
      }
    } else if (importance === 'high') {
      backgroundClass = 'bg-white/5';
      hoverClass = 'hover:bg-white/10';
    }
    
    return `pt-4 ${hasUndoButton ? 'pb-3' : 'pb-4'} px-4 ${borderClasses} ${backgroundClass} cursor-pointer transition-colors ${hoverClass}`;
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (task.imageUrl) {
      if (document.activeElement && document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      setFullImageOpen(true);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'BUTTON' ||
      target.tagName === 'A' ||
      target.closest('button') ||
      target.closest('a')
    ) {
      return;
    }
    
    if (document.activeElement && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    
    onEdit();
  };

  return (
    <>
      <div
        data-task-id={task.id}
        onClick={handleCardClick}
        className={`transition-all ${getContainerClasses()}`}
      >
        <div className="flex flex-col">
          {/* Step Number */}
          <div className="font-semibold text-xs sm:text-sm mb-1 text-white/60">
            STEP {task.stepNumber}
          </div>
          
          {/* Main content row (image + content) */}
          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
            {/* Image/Icon */}
            {task.imageUrl && (
              <div className="flex-shrink-0">
                <button
                  onClick={handleImageClick}
                  className={`${styles.imageSize} bg-white/10 overflow-hidden relative cursor-pointer hover:opacity-90 transition-opacity`}
                  title="Click to view full size"
                >
                  <img
                    src={task.imageUrl}
                    alt={task.title}
                    className="w-full h-full object-cover"
                  />
                </button>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2 gap-1 sm:gap-2">
                <div className="flex-1 min-w-0">
                  <div className={`flex items-center gap-2 flex-wrap ${task.description ? 'mb-1' : ''}`}>
                    <h3 className={`${styles.title} m-0 inline-block align-middle ${
                      completed ? 'text-white/30 line-through uppercase' : 'text-white/60 uppercase'
                    } break-words`}>
                      {task.title}
                    </h3>
                    {/* Show completion check and text */}
                    {completed && (
                      <span className="inline-flex items-center gap-1 flex-shrink-0 align-middle" title="Task completed">
                        <Check className="w-4 h-4 text-green-400" />
                        <span className="text-xs font-medium text-green-400 uppercase">COMPLETED</span>
                      </span>
                    )}
                    {/* Show current badge for active step */}
                    {isActiveStep && (
                      <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium flex-shrink-0 bg-green-500/20 text-green-400">
                        CURRENT
                      </span>
                    )}
                  </div>
                  {task.description && (
                    <p className={`${styles.description} line-clamp-2 ${
                      completed ? 'text-white/40' : 'text-white/70'
                    }`}>
                      {task.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Undo button */}
          {completed && lastCompletedTaskId === task.id && onUndo && (
            <div className="flex flex-col gap-2 mt-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUndo();
                }}
                className="text-white/80 bg-white/10 hover:bg-white/20 cursor-pointer transition-colors px-3 py-1.5 text-xs font-medium flex items-center justify-center gap-1.5 w-full"
                title="Uncheck this step"
              >
                <RotateCcw className="w-3 h-3 flex-shrink-0" />
                Uncheck
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Full-size image viewer */}
      {task.imageUrl && (
        <Dialog open={fullImageOpen} onOpenChange={setFullImageOpen}>
          <DialogContent className="max-w-4xl p-0">
            <DialogHeader className="sr-only">
              <DialogTitle>{task.title}</DialogTitle>
              <DialogDescription>Full-size image viewer for {task.title}</DialogDescription>
            </DialogHeader>
            <div className="relative">
              <button
                onClick={() => setFullImageOpen(false)}
                className="absolute top-4 right-4 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors z-10"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={task.imageUrl}
                alt={task.title}
                className="w-full h-auto max-h-[90vh] object-contain"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

