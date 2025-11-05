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
  );
}

