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
  return (
    <>
      <style>{`
        /* Show divider only when a completed non-highlighted item is followed by another completed non-highlighted item */
        [data-completed-non-highlighted="true"] + [data-completed-non-highlighted="true"] {
          border-top: 1px solid rgba(255, 255, 255, 0.2) !important;
        }
      `}</style>
      <div className="[&>div:last-child>div>div[data-task-id]]:border-b-0">
        {tasks.map((task) => (
          <ViewTaskItem
            key={task.id}
            task={task}
            onEdit={() => onTaskEdit(task)}
            workflowId={workflowId}
            workflowVersion={workflowVersion}
            isTaskCompleted={isTaskCompleted}
            currentStepTaskId={currentStepTaskId}
            lastCompletedTaskId={lastCompletedTaskId}
            onUndo={onUndo}
          />
        ))}
      </div>
    </>
  );
}

