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
          title: 'text-lg font-semibold uppercase',
          description: 'text-sm',
          container: 'bg-white/10 border border-white/20 hover:bg-white/15',
          padding: 'p-5',
          imageSize: 'w-16 h-16 sm:w-24 sm:h-24',
          imageFrame: 'bg-white/10',
        };
      case 'low':
      default:
        return {
          title: 'text-base font-semibold uppercase',
          description: 'text-sm',
          container: 'bg-white/5 border border-white/10 hover:bg-white/10',
          padding: 'p-4',
          imageSize: 'w-16 h-16 sm:w-24 sm:h-24',
          imageFrame: 'bg-white/5',
        };
    }
  };

  const styles = getImportanceStyles();

  // Build container classes - card style for manage mode
  const getContainerClasses = () => {
    const baseClasses = `mb-4 rounded-lg transition-colors ${styles.container} ${styles.padding}`;
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
        className={`transition-all ${getContainerClasses()} ${isDragging ? 'opacity-50 scale-[0.99]' : ''}`}
      >
        <div className="flex flex-col">
          {/* Step Number */}
          <div className="font-semibold text-xs sm:text-sm mb-2 text-white/60 tracking-wide uppercase">
            Step {task.stepNumber}
          </div>
          
          {/* Main content row (image + content) */}
          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
            {/* Image/Icon */}
            {task.imageUrl ? (
              <div className="flex-shrink-0">
                <div className="relative group">
                  <div className={`${styles.imageSize} ${styles.imageFrame} rounded-lg overflow-hidden relative border border-white/10`}>
                    <img
                      src={task.imageUrl}
                      alt={task.title}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={handleRemoveImage}
                      className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/90"
                      title="Remove image"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <button
                      onClick={handleUploadClick}
                      className="absolute top-1 left-1 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/90"
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
                  className={`${styles.imageSize} border-2 border-dashed border-white/20 rounded-lg bg-white/5 hover:border-white/40 hover:bg-white/10 transition-all flex flex-col items-center justify-center gap-1.5 text-white/60 hover:text-white group`}
                  title="Add image"
                >
                  <Upload className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-medium uppercase">Add Image</span>
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
                    <h3 className={`${styles.title} m-0 inline-block align-middle text-white break-words` }>
                      {task.title}
                    </h3>
                  </div>
                  {task.description && (
                    <p className={`${styles.description} line-clamp-2 text-white/70`}>
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
                          ? 'text-amber-300 hover:text-amber-200 bg-white/10 hover:bg-white/20'
                          : 'text-white/50 hover:text-white bg-white/5 hover:bg-white/10'
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
                      className="transition-all p-1.5 rounded text-red-400 hover:text-red-200 hover:bg-red-500/20"
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
                className="text-sm font-semibold uppercase tracking-wide text-white/80 underline underline-offset-4 hover:text-white"
              >
                Add/Edit Details
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="bg-[#1F1F20] text-white border border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Delete Task</DialogTitle>
            <DialogDescription className="text-white/70">
              Are you sure you want to delete "{task.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
              className="bg-transparent border border-white/20 text-white hover:bg-white/10"
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

