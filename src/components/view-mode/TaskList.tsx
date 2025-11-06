import { Task } from '../../types';
import { ViewTaskItem } from './TaskItem';

interface ViewTaskListProps {
  tasks: Task[];
  onTaskEdit: (task: Task) => void;
  workflowId?: string;
  workflowVersion?: number;
  isTaskCompleted?: (workflowId: string, workflowVersion: number, taskId: string) => boolean;
  currentStepTaskId?: string | null;
  lastCompletedTaskId?: string | null;
  onUndo?: () => void;
}

export function ViewTaskList({
  tasks,
  onTaskEdit,
  workflowId,
  workflowVersion,
  isTaskCompleted,
  currentStepTaskId,
  lastCompletedTaskId,
  onUndo,
}: ViewTaskListProps) {
  // Helper to check if a task is non-highlighted (low importance)
  const isNonHighlighted = (task: Task): boolean => {
    return task.importance !== 'high';
  };

  return (
    <>
      <div className="[&>div:last-child>div>div[data-task-id]]:border-b-0">
        {tasks.map((task, index) => {
          // Show divider if current item is non-highlighted and previous item was also non-highlighted
          const showDivider = index > 0 && isNonHighlighted(task) && isNonHighlighted(tasks[index - 1]);
          
          return (
            <div key={task.id}>
              {showDivider && (
                <div className="h-[1px] bg-white/10 mb-[2px]" />
              )}
              <ViewTaskItem
                task={task}
                onEdit={() => onTaskEdit(task)}
                workflowId={workflowId}
                workflowVersion={workflowVersion}
                isTaskCompleted={isTaskCompleted}
                currentStepTaskId={currentStepTaskId}
                lastCompletedTaskId={lastCompletedTaskId}
                onUndo={onUndo}
              />
            </div>
          );
        })}
      </div>
    </>
  );
}

