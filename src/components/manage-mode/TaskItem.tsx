import { useState, useRef } from 'react';
import { Task, TaskImportance } from '../../types';
import { X, Upload, Flag, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';

interface ManageTaskItemProps {
  task: Task;
  onEdit: () => void;
  onDelete?: () => void;
  onImageUpdate?: (imageUrl: string | null) => void;
  onImportanceChange?: (importance: TaskImportance) => void;
  isDragging?: boolean;
}

export function ManageTaskItem({
  task,
  onEdit,
  onDelete,
  onImageUpdate,
  onImportanceChange,
  isDragging,
}: ManageTaskItemProps) {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get importance with default to 'low'
  const importance: TaskImportance = (task.importance === 'high' ? 'high' : 'low');

  // Get styling based on importance
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
        };
    }
  };

  const styles = getImportanceStyles();

  // Build container classes - card style for manage mode
  const getContainerClasses = () => {
    const baseClasses = `mb-4 ${styles.background} ${styles.border} rounded-lg hover:shadow-md ${styles.padding}`;
    return baseClasses;
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
        data-task-id={task.id}
        className={`transition-all ${getContainerClasses()} ${isDragging ? 'opacity-50' : ''}`}
      >
        <div className="flex flex-col">
          {/* Step Number */}
          <div className="font-semibold text-xs sm:text-sm mb-1 text-slate-600">
            STEP {task.stepNumber}
          </div>
          
          {/* Main content row (image + content) */}
          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
            {/* Image/Icon */}
            {task.imageUrl ? (
              <div className="flex-shrink-0">
                <div className="relative group">
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
                </div>
              </div>
            ) : (
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
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2 gap-1 sm:gap-2">
                <div className="flex-1 min-w-0">
                  <div className={`flex items-center gap-2 flex-wrap ${task.description ? 'mb-1' : ''}`}>
                    <h3 className={`${styles.title} m-0 inline-block align-middle text-slate-900 break-words`}>
                      {task.title}
                    </h3>
                  </div>
                  {task.description && (
                    <p className={`${styles.description} line-clamp-2 text-slate-600`}>
                      {task.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {onImportanceChange && (
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
                  {onDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmOpen(true);
                      }}
                      className="transition-all p-1.5 rounded text-red-500 hover:text-red-700 hover:bg-red-50"
                      title="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="text-sm font-medium underline text-blue-600 hover:text-blue-700"
              >
                Add/Edit Details
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{task.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onDelete?.();
                setDeleteConfirmOpen(false);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

