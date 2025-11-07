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
import { ManageTaskItem } from './TaskItem';
import { ViewTaskList as ViewModeTaskList } from '../view-mode/TaskList';

interface SortableTaskItemProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onImageUpdate?: (imageUrl: string | null) => void;
  onImportanceChange?: (importance: TaskImportance) => void;
}

function SortableTaskItem({
  task,
  onEdit,
  onDelete,
  onImageUpdate,
  onImportanceChange,
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

  const filteredListeners = {
    ...listeners,
    onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') ||
        target.closest('a')
      ) {
        return;
      }
      if (listeners?.onPointerDown) {
        listeners.onPointerDown(e);
      }
    },
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div
        {...attributes}
        {...filteredListeners}
        className="cursor-move"
      >
        <ManageTaskItem
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
          onImageUpdate={onImageUpdate}
          onImportanceChange={onImportanceChange}
          isDragging={isDragging}
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
    <div className="flex justify-center my-2">
      <button
        onClick={onClick}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white/60 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-full"
        title="Add task"
      >
        <Plus className="w-3.5 h-3.5" />
        <span className="uppercase">add task</span>
      </button>
    </div>
  );
}

interface ManageTaskListProps {
  tasks: Task[];
  onTaskEdit: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskImageUpdate?: (taskId: string, imageUrl: string | null) => void;
  onTaskImportanceChange?: (taskId: string, importance: TaskImportance) => void;
  onReorderTasks: (taskIds: string[]) => void;
  onInsertTask: (index: number) => void;
  previewMode?: boolean; // When true, use view-mode styling but keep manage functionality
}

export function ManageTaskList({
  tasks,
  onTaskEdit,
  onTaskDelete,
  onTaskImageUpdate,
  onTaskImportanceChange,
  onReorderTasks,
  onInsertTask,
  previewMode = false,
}: ManageTaskListProps) {
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

  // If in preview mode, use view-mode components (view styling but no completion tracking)
  if (previewMode) {
    return (
      <ViewModeTaskList
        tasks={tasks}
        onTaskEdit={onTaskEdit}
      />
    );
  }

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
        <div>
          <AddTaskButton onClick={() => onInsertTask(0)} />
          {tasks.map((task, index) => (
            <div key={task.id}>
              <SortableTaskItem
                task={task}
                onEdit={() => onTaskEdit(task)}
                onDelete={() => onTaskDelete(task.id)}
                onImageUpdate={onTaskImageUpdate ? (imageUrl) => onTaskImageUpdate(task.id, imageUrl) : undefined}
                onImportanceChange={onTaskImportanceChange ? (importance) => onTaskImportanceChange(task.id, importance) : undefined}
              />
              <AddTaskButton onClick={() => onInsertTask(index + 1)} />
            </div>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

