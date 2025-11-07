import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Project, Task } from "../../types";
import { MobileViewHeader } from "../ui/MobileViewHeader";
import { MobileViewContainer } from "../ui/MobileViewContainer";
import { ViewTaskList } from "./TaskList";
import { ViewTaskDialog } from "./TaskDialog";

interface ViewWorkflowViewProps {
  selectedWorkflow: Project["workflows"][0];
  knowledgeItems: any[];
  onBackToWorkflows?: () => void;
  // Execution-related props
  getOrCreateWorkflowExecution?: (
    workflowId: string,
    workflowVersion: number
  ) => any;
  completeTaskInExecution?: (executionId: string, taskId: string) => void;
  isTaskCompleted?: (
    workflowId: string,
    workflowVersion: number,
    taskId: string
  ) => boolean;
  getCompletedTaskIds?: (
    workflowId: string,
    workflowVersion: number
  ) => string[];
  undoLastCompletedTask?: (
    workflowId: string,
    workflowVersion: number,
    taskId?: string
  ) => void;
}

export function ViewWorkflowView({
  selectedWorkflow,
  knowledgeItems,
  onBackToWorkflows,
  getOrCreateWorkflowExecution,
  completeTaskInExecution,
  isTaskCompleted,
  getCompletedTaskIds,
  undoLastCompletedTask,
}: ViewWorkflowViewProps) {
  const navigate = useNavigate();
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);

  const handleBackToWorkflows = () => {
    if (onBackToWorkflows) {
      onBackToWorkflows();
    } else {
      navigate("/");
    }
  };

  const handleViewTaskDetails = (task: Task) => {
    const latestTask =
      selectedWorkflow.tasks.find((t) => t.id === task.id) || task;
    setCurrentTask(latestTask);
    setTaskDialogOpen(true);
  };

  const handleCompleteTask = () => {
    if (
      currentTask &&
      selectedWorkflow &&
      completeTaskInExecution &&
      getOrCreateWorkflowExecution
    ) {
      const workflowVersion = selectedWorkflow.version || 1;
      const execution = getOrCreateWorkflowExecution(
        selectedWorkflow.id,
        workflowVersion
      );
      completeTaskInExecution(execution.id, currentTask.id);
    }
  };

  const totalTasks = selectedWorkflow.tasks.length;
  let completedTasks = 0;
  let completedIds: string[] = [];
  if (getCompletedTaskIds && selectedWorkflow.version) {
    completedIds = getCompletedTaskIds(
      selectedWorkflow.id,
      selectedWorkflow.version
    );
    completedTasks = completedIds.length;
  }
  const progressPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Find the current step (first incomplete task)
  let currentStepTaskId: string | null = null;
  if (isTaskCompleted && selectedWorkflow.version) {
    const sortedTasks = [...selectedWorkflow.tasks].sort(
      (a, b) => a.stepNumber - b.stepNumber
    );
    for (const task of sortedTasks) {
      if (
        !isTaskCompleted(selectedWorkflow.id, selectedWorkflow.version, task.id)
      ) {
        currentStepTaskId = task.id;
        break;
      }
    }
  }

  // Find the last completed task ID
  let lastCompletedTaskId: string | null = null;
  if (isTaskCompleted && selectedWorkflow.version && completedIds.length > 0) {
    const sortedTasks = [...selectedWorkflow.tasks].sort(
      (a, b) => a.stepNumber - b.stepNumber
    );
    for (let i = sortedTasks.length - 1; i >= 0; i--) {
      const task = sortedTasks[i];
      if (
        isTaskCompleted(selectedWorkflow.id, selectedWorkflow.version, task.id)
      ) {
        lastCompletedTaskId = task.id;
        break;
      }
    }
  }

  const handleUndo = () => {
    if (
      undoLastCompletedTask &&
      selectedWorkflow.version &&
      lastCompletedTaskId
    ) {
      undoLastCompletedTask(
        selectedWorkflow.id,
        selectedWorkflow.version,
        lastCompletedTaskId
      );
    }
  };

  return (
    <div className="w-full h-screen flex flex-col fixed inset-0 bg-[#19191A] text-white">
      <MobileViewHeader
        title={`Workflow: ${selectedWorkflow.title}`}
        onBack={handleBackToWorkflows}
        showBackButton={true}
      />

      <div className="flex-1 overflow-y-auto min-h-0 py-4">
        <MobileViewContainer>
          {selectedWorkflow.description && (
            <p className="text-lg text-white/70 mb-4 px-4">
              {selectedWorkflow.description}
            </p>
          )}

          <div className="mb-6 px-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-white/70">
                {completedTasks} of {totalTasks} tasks completed
              </span>
              <span className="font-semibold text-white">
                {progressPercentage}%
              </span>
            </div>
            <div className="w-full bg-white/20 h-2">
              <div
                className="bg-white h-2 transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          <ViewTaskList
            tasks={selectedWorkflow.tasks}
            onTaskEdit={handleViewTaskDetails}
            workflowId={selectedWorkflow.id}
            workflowVersion={selectedWorkflow.version || 1}
            isTaskCompleted={isTaskCompleted}
            currentStepTaskId={currentStepTaskId}
            lastCompletedTaskId={lastCompletedTaskId}
            onUndo={handleUndo}
          />

          <div className="min-h-screen" />
        </MobileViewContainer>
      </div>

      <ViewTaskDialog
        open={taskDialogOpen}
        onOpenChange={(open) => {
          setTaskDialogOpen(open);
          if (!open) {
            setCurrentTask(null);
          }
        }}
        task={
          currentTask
            ? selectedWorkflow.tasks.find((t) => t.id === currentTask.id) ||
              currentTask
            : null
        }
        knowledgeItems={knowledgeItems}
        isCurrentStep={
          currentTask ? currentStepTaskId === currentTask.id : false
        }
        isCompleted={
          currentTask && selectedWorkflow.version && isTaskCompleted
            ? isTaskCompleted(
                selectedWorkflow.id,
                selectedWorkflow.version,
                currentTask.id
              )
            : false
        }
        onComplete={handleCompleteTask}
      />
    </div>
  );
}
