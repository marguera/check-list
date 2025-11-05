import { useState, useRef } from 'react';
import { Task, TaskImportance } from '../../types';
import { Check, X, Upload, Flag, RotateCcw } from 'lucide-react';
import { Dialog, DialogContent } from '../ui/dialog';

interface TaskItemProps {
  task: Task;
  onEdit: () => void;
  onDelete?: () => void;
  onComplete?: () => void;
  onImageUpdate?: (imageUrl: string | null) => void;
  onImportanceChange?: (importance: TaskImportance) => void;
  isDragging?: boolean;
  mode: 'edit' | 'view';
  workflowId?: string;
  workflowVersion?: number;
  isTaskCompleted?: (workflowId: string, workflowVersion: number, taskId: string) => boolean;
  currentStepTaskId?: string | null;
  lastCompletedTaskId?: string | null;
  onUndo?: () => void;
}

export function TaskItem({
  task,
  onEdit,
  onDelete: _onDelete,
  onComplete: _onComplete,
  onImageUpdate,
  onImportanceChange,
  isDragging,
  mode,
  workflowId,
  workflowVersion,
  isTaskCompleted,
  currentStepTaskId,
  lastCompletedTaskId,
  onUndo,
}: TaskItemProps) {
  const [fullImageOpen, setFullImageOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Get completion state from execution if available, otherwise false
  const completed = mode === 'view' && workflowId && workflowVersion && isTaskCompleted
    ? isTaskCompleted(workflowId, workflowVersion, task.id)
    : false;

  // Get importance with default to 'low'
  // Handle legacy 'medium' values by converting to 'low'
  const importance: TaskImportance = (task.importance === 'high' ? 'high' : 'low');

  // Get styling based on importance (similar to heading styles)
  const getImportanceStyles = () => {
    switch (importance) {
      case 'high':
        return {
          title: 'text-2xl font-bold',
          description: 'text-base',
          border: 'border border-slate-200',
          padding: 'p-5',
          background: 'bg-amber-100',
          imageSize: 'w-16 h-16 sm:w-24 sm:h-24',
          checkSize: 'w-6 h-6',
        };
      case 'low':
      default:
        return {
          title: 'text-lg font-semibold',
          description: 'text-sm',
          border: 'border border-slate-200',
          padding: 'p-4',
          background: 'bg-white',
          imageSize: 'w-16 h-16 sm:w-24 sm:h-24',
          checkSize: 'w-5 h-5',
        };
    }
  };

  const styles = getImportanceStyles();

  // Build container classes - flat list style for both mobile and desktop
  const getContainerClasses = () => {
    if (mode === 'view') {
      // Flat list style with dividers and horizontal padding for all screen sizes
      // Check if undo button will be shown to adjust bottom padding
      const hasUndoButton = completed && lastCompletedTaskId === task.id && onUndo;
      // Check if this is the active step (current incomplete step)
      const isActiveStep = !completed && currentStepTaskId === task.id;
      // Use pt-4 for top padding, adjust bottom padding to match spacing
      // When undo button is present, it adds mt-1 spacing, so we need more padding to match
      // Base background: white for incomplete, transparent for completed
      // Active steps have left green border and bottom divider, others just have bottom border
      const borderClasses = isActiveStep 
        ? 'border-l-4 border-l-green-600 border-b border-slate-200' 
        : 'border-b border-slate-200';
      // Background: high importance gets amber, completed high importance gets subtle darker, completed others get transparent, others get white
      let backgroundClass = 'bg-white';
      let hoverClass = 'hover:bg-slate-50';
      if (completed) {
        if (importance === 'high') {
          backgroundClass = 'bg-slate-100';
          hoverClass = 'hover:bg-slate-200';
        } else {
          backgroundClass = 'bg-transparent';
          hoverClass = 'hover:bg-slate-50';
        }
      } else if (importance === 'high') {
        backgroundClass = 'bg-amber-50';
        hoverClass = 'hover:bg-amber-100';
      }
      const baseClasses = `pt-4 ${hasUndoButton ? 'pb-3' : 'pb-4'} px-4 ${borderClasses} ${backgroundClass} cursor-pointer transition-colors ${hoverClass}`;
      return baseClasses;
    } else {
      // Edit mode: card style
      const baseClasses = `mb-4 ${styles.background} ${styles.border} rounded-lg hover:shadow-md ${styles.padding}`;
      if (completed) {
        if (importance === 'high') {
          return `mb-4 bg-slate-100 rounded-lg ${styles.padding}`;
        } else {
          return `mb-4 bg-transparent border-none shadow-none ${styles.padding}`;
        }
      }
      return baseClasses;
    }
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Only allow full-size viewing in view mode
    if (task.imageUrl && mode === 'view') {
      setFullImageOpen(true);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        onImageUpdate?.(dataUrl);
      };
      reader.readAsDataURL(file);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onImageUpdate?.(null);
  };

  const handleUploadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleImportanceToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newImportance: TaskImportance = importance === 'high' ? 'low' : 'high';
    onImportanceChange?.(newImportance);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Only handle card clicks in view mode
    if (mode !== 'view') return;
    
    // Don't trigger if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'BUTTON' ||
      target.tagName === 'A' ||
      target.closest('button') ||
      target.closest('a')
    ) {
      return;
    }
    
    onEdit();
  };

  return (
    <>
      <div
        data-task-id={task.id}
        onClick={handleCardClick}
        className={`
          transition-all
          ${getContainerClasses()}
          ${isDragging ? 'opacity-50' : ''}
        `}
      >
        {/* Layout: Column with buttons on new line for all screen sizes */}
        <div className="flex flex-col">
          {/* Main content row (image + content) */}
          <div className="flex gap-3 sm:gap-4 flex-1 min-w-0">
            {/* Image/Icon */}
            {task.imageUrl ? (
              <div className="flex-shrink-0">
                <div className="relative group">
                  {mode === 'view' ? (
                    <button
                      onClick={handleImageClick}
                      className={`${styles.imageSize} bg-slate-100 rounded-lg overflow-hidden relative cursor-pointer hover:opacity-90 transition-opacity`}
                      title="Click to view full size"
                    >
                      <img
                        src={task.imageUrl}
                        alt={task.title}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ) : (
                    <>
                      <div className={`${styles.imageSize} bg-slate-100 rounded-lg overflow-hidden relative`}>
                        <img
                          src={task.imageUrl}
                          alt={task.title}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={handleRemoveImage}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          title="Remove image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <button
                          onClick={handleUploadClick}
                          className="absolute top-1 left-1 bg-blue-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-600"
                          title="Replace image"
                        >
                          <Upload className="w-3 h-3" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              mode === 'edit' && (
                <div className="flex-shrink-0">
                  <button
                    onClick={handleUploadClick}
                    className={`${styles.imageSize} bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg hover:border-slate-400 hover:bg-slate-100 transition-all flex flex-col items-center justify-center gap-1.5 text-slate-600 hover:text-slate-700 group`}
                    title="Add image"
                  >
                    <Upload className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-medium">Add Image</span>
                  </button>
                </div>
              )
            )}
            {mode === 'edit' && (
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2 gap-1 sm:gap-2">
                <div className="flex-1 min-w-0">
                  <div className={`flex items-center gap-2 flex-wrap ${task.description ? 'mb-1' : ''}`}>
                    <h3 className={`${styles.title} ${
                      completed 
                        ? 'text-slate-500 line-through' 
                        : 'text-slate-900'
                    } break-words`}>
                      <span className="hidden sm:inline">Step {task.stepNumber} - </span>
                      <span className="sm:hidden">{task.stepNumber}. </span>
                      {task.title}
                    </h3>
                    {/* Show completion check inline at end of title in view mode */}
                    {mode === 'view' && completed && (
                      <span title="Task completed">
                        <Check className={`${styles.checkSize} text-green-600 flex-shrink-0`} />
                      </span>
                    )}
                    {/* Show "Completed" text after title on larger screens */}
                    {mode === 'view' && completed && (
                      <span className="text-xs sm:text-sm font-medium text-green-600 hidden sm:inline flex-shrink-0">Completed</span>
                    )}
                  </div>
                  {task.description && (
                    <p className={`${styles.description} line-clamp-2 ${
                      completed 
                        ? 'text-slate-400' 
                        : 'text-slate-600'
                    }`}>
                      {task.description}
                    </p>
                  )}
                </div>
                {mode === 'edit' && onImportanceChange && (
                  <button
                    onClick={handleImportanceToggle}
                    className={`transition-all p-1.5 rounded ${
                      importance === 'high'
                        ? 'text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100'
                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                    }`}
                    title={importance === 'high' ? 'High importance (click to remove)' : 'Click to highlight as important'}
                  >
                    <Flag className={`w-4 h-4 ${importance === 'high' ? 'fill-current' : ''}`} />
                  </button>
                )}
              </div>
              {mode === 'edit' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                  className={`text-sm font-medium underline ${
                    completed
                      ? 'text-slate-400 hover:text-slate-500'
                      : 'text-blue-600 hover:text-blue-700'
                  }`}
                >
                  Add/Edit Details
                </button>
              )}
            </div>

          </div>

          {/* Actions - New line below content for all screen sizes */}
          {mode === 'view' && completed && lastCompletedTaskId === task.id && onUndo && (
            <div className="flex flex-col gap-2 mt-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUndo();
                }}
                className="text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer transition-colors px-3 py-1.5 text-xs font-medium rounded-md flex items-center justify-center gap-1.5 w-full"
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

