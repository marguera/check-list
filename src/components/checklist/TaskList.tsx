import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus } from 'lucide-react';
import { Task, TaskImportance } from '../../types';
import { TaskItem } from './TaskItem';

interface SortableTaskItemProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onComplete: () => void;
  onImageUpdate?: (imageUrl: string | null) => void;
  onImportanceChange?: (importance: TaskImportance) => void;
  mode: 'edit' | 'view';
  workflowId?: string;
  workflowVersion?: number;
  isTaskCompleted?: (workflowId: string, workflowVersion: number, taskId: string) => boolean;
  currentStepTaskId?: string | null;
  lastCompletedTaskId?: string | null;
  onUndo?: () => void;
}

function SortableTaskItem({
  task,
  onEdit,
  onDelete,
  onComplete,
  onImageUpdate,
  onImportanceChange,
  mode,
  workflowId,
  workflowVersion,
  isTaskCompleted,
  currentStepTaskId,
  lastCompletedTaskId,
  onUndo,
}: SortableTaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Filter listeners to exclude clicks on buttons and other interactive elements
  // Also disable drag in view mode
  const filteredListeners = mode === 'view' ? {} : {
    ...listeners,
    onPointerDown: (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      // Don't activate drag if clicking on a button, link, or any interactive element
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') ||
        target.closest('a')
      ) {
        return;
      }
      listeners?.onPointerDown?.(e);
    },
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div
        {...attributes}
        {...filteredListeners}
        className={mode === 'view' ? '' : 'cursor-move'}
      >
        <TaskItem
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
          onComplete={onComplete}
          onImageUpdate={onImageUpdate}
          onImportanceChange={onImportanceChange}
          isDragging={isDragging}
          mode={mode}
          workflowId={workflowId}
          workflowVersion={workflowVersion}
          isTaskCompleted={isTaskCompleted}
          currentStepTaskId={currentStepTaskId}
          lastCompletedTaskId={lastCompletedTaskId}
          onUndo={onUndo}
        />
      </div>
    </div>
  );
}

interface AddTaskButtonProps {
  onClick: () => void;
}

function AddTaskButton({ onClick }: AddTaskButtonProps) {
  return (
    <div className="flex justify-center my-1">
      <button
        onClick={onClick}
        className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors"
        title="Add task"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>add task</span>
      </button>
    </div>
  );
}

interface TaskListProps {
  tasks: Task[];
  onTaskEdit: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskComplete: (task: Task) => void;
  onTaskImageUpdate?: (taskId: string, imageUrl: string | null) => void;
  onTaskImportanceChange?: (taskId: string, importance: TaskImportance) => void;
  onReorderTasks: (taskIds: string[]) => void;
  onInsertTask: (index: number) => void;
  mode: 'edit' | 'view';
  workflowId?: string;
  workflowVersion?: number;
  isTaskCompleted?: (workflowId: string, workflowVersion: number, taskId: string) => boolean;
  currentStepTaskId?: string | null;
  lastCompletedTaskId?: string | null;
  onUndo?: () => void;
}

export function TaskList({
  tasks,
  onTaskEdit,
  onTaskDelete,
  onTaskComplete,
  onTaskImageUpdate,
  onTaskImportanceChange,
  onReorderTasks,
  onInsertTask,
  mode,
  workflowId,
  workflowVersion,
  isTaskCompleted,
  currentStepTaskId,
  lastCompletedTaskId,
  onUndo,
}: TaskListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = tasks.findIndex((task) => task.id === active.id);
      const newIndex = tasks.findIndex((task) => task.id === over.id);
      const newTasks = arrayMove(tasks, oldIndex, newIndex);
      onReorderTasks(newTasks.map((task) => task.id));
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={tasks.map((task) => task.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className={mode === 'view' ? '[&>div:last-child>div>div[data-task-id]]:border-b-0' : ''}>
          {mode === 'edit' && <AddTaskButton onClick={() => onInsertTask(0)} />}
          {tasks.map((task, index) => (
            <div key={task.id}>
              <SortableTaskItem
                  task={task}
                  onEdit={() => onTaskEdit(task)}
                  onDelete={() => onTaskDelete(task.id)}
                  onComplete={() => onTaskComplete(task)}
                  onImageUpdate={onTaskImageUpdate ? (imageUrl) => onTaskImageUpdate(task.id, imageUrl) : undefined}
                  onImportanceChange={onTaskImportanceChange ? (importance) => onTaskImportanceChange(task.id, importance) : undefined}
                  mode={mode}
                  workflowId={workflowId}
                  workflowVersion={workflowVersion}
                  isTaskCompleted={isTaskCompleted}
                  currentStepTaskId={currentStepTaskId}
                  lastCompletedTaskId={lastCompletedTaskId}
                  onUndo={onUndo}
                />
              {mode === 'edit' && <AddTaskButton onClick={() => onInsertTask(index + 1)} />}
            </div>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}


