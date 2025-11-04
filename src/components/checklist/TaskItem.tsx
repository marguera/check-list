import { useState, useRef } from 'react';
import { Task, TaskImportance } from '../../types';
import { Trash2, Check, X, Upload, Flag, RotateCcw } from 'lucide-react';
import { Dialog, DialogContent } from '../ui/dialog';

interface TaskItemProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onComplete: () => void;
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
  onDelete,
  onComplete,
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
          imageSize: 'w-24 h-24',
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
          imageSize: 'w-24 h-24',
          checkSize: 'w-5 h-5',
        };
    }
  };

  const styles = getImportanceStyles();

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

  return (
    <>
      <div
        className={`
          mb-4 transition-all
          ${completed 
            ? (importance === 'high' 
                ? 'bg-slate-100 rounded-lg' 
                : 'bg-transparent border-none shadow-none')
            : `${styles.background} ${styles.border} rounded-lg hover:shadow-md`
          }
          ${styles.padding}
          ${isDragging ? 'opacity-50' : ''}
        `}
      >
        <div className="flex gap-4">
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
          <div className="flex items-start justify-between mb-2 gap-2">
            <div className="flex-1">
              <h3 className={`${styles.title} mb-1 ${
                completed 
                  ? 'text-slate-500 line-through' 
                  : 'text-slate-900'
              }`}>
                Step {task.stepNumber} - {task.title}
              </h3>
              <p className={`${styles.description} line-clamp-2 ${
                completed 
                  ? 'text-slate-400' 
                  : 'text-slate-600'
              }`}>
                {task.description}
              </p>
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
            {mode === 'view' ? 'View Details' : 'Add/Edit Details'}
          </button>
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 flex items-start gap-2">
          {mode === 'view' && (
            <>
              {/* Show completion button only for current step (first incomplete task) */}
              {!completed && currentStepTaskId === task.id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onComplete();
                  }}
                  className="text-blue-600 hover:text-blue-700 cursor-pointer transition-colors px-3 py-1.5 text-sm font-medium bg-blue-50 hover:bg-blue-100 rounded-md"
                  title="Complete this step"
                >
                  Complete Step
                </button>
              )}
              {/* Show completed status and undo button for completed tasks */}
              {completed && (
                <div className="flex flex-col items-end gap-2">
                  <div className="text-green-600 flex items-center gap-1.5" title="Task completed">
                    <Check className={`${styles.checkSize} text-green-600`} />
                    <span className="text-sm font-medium">Completed</span>
                  </div>
                  {/* Show undo button only for the last completed task */}
                  {lastCompletedTaskId === task.id && onUndo && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUndo();
                      }}
                      className="text-white bg-slate-900 hover:bg-slate-800 cursor-pointer transition-colors px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5"
                      title="Uncheck this step"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Uncheck
                    </button>
                  )}
                </div>
              )}
            </>
          )}
          {mode === 'edit' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-slate-400 hover:text-red-600 transition-colors"
              title="Delete task"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
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

