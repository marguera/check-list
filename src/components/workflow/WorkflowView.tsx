import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Project, Task, TaskImportance } from '../../types';
import { Button } from '../ui/button';
import { Plus, Edit, Trash2, ListTodo, ArrowLeft, ArrowRight } from 'lucide-react';
import { WorkflowDialog } from './WorkflowDialog';
import { TaskList } from '../checklist/TaskList';
import { TaskDialog } from '../dialogs/TaskDialog';
import { TaskCompletionDialog } from '../checklist/TaskCompletionDialog';

interface WorkflowViewProps {
  project: Project;
  onBack: () => void;
  onUpdateProject: (updates: Partial<Project>) => void;
  onAddWorkflow: (workflow: Omit<Project['workflows'][0], 'id' | 'projectId' | 'tasks' | 'version'>) => void;
  onUpdateWorkflow: (projectId: string, workflowId: string, workflow: Partial<Project['workflows'][0]>) => void;
  onDeleteWorkflow: (projectId: string, workflowId: string) => void;
  knowledgeItems: any[];
  selectedWorkflow?: Project['workflows'][0] | null;
  onWorkflowSelect?: (workflow: Project['workflows'][0]) => void;
  onBackToWorkflows?: () => void;
  readOnly?: boolean;
  // Execution-related props (for view/user/check mode)
  getOrCreateWorkflowExecution?: (workflowId: string, workflowVersion: number) => any;
  completeTaskInExecution?: (executionId: string, taskId: string) => void;
  isTaskCompleted?: (workflowId: string, workflowVersion: number, taskId: string) => boolean;
  getCompletedTaskIds?: (workflowId: string, workflowVersion: number) => string[];
  undoLastCompletedTask?: (workflowId: string, workflowVersion: number, taskId?: string) => void;
}

export function WorkflowView({
  project,
  onBack: _onBack,
  onUpdateProject: _onUpdateProject,
  onAddWorkflow,
  onUpdateWorkflow,
  onDeleteWorkflow,
  knowledgeItems,
  selectedWorkflow: selectedWorkflowProp,
  onWorkflowSelect,
  onBackToWorkflows,
  readOnly = false,
  getOrCreateWorkflowExecution,
  completeTaskInExecution,
  isTaskCompleted,
  getCompletedTaskIds,
  undoLastCompletedTask,
}: WorkflowViewProps) {
  const navigate = useNavigate();
  // All hooks must be called unconditionally at the top level
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentWorkflow, setCurrentWorkflow] = useState<Project['workflows'][0] | null>(null);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [localSelectedWorkflow] = useState<Project['workflows'][0] | null>(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [completionDialogOpen, setCompletionDialogOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [taskDialogMode, setTaskDialogMode] = useState<'add' | 'edit' | 'view'>('add');
  const [insertIndex, setInsertIndex] = useState<number | null>(null);
  const [listMode, setListMode] = useState<'edit' | 'view'>(readOnly ? 'view' : 'edit');
  
  // Use prop if provided, otherwise use local state
  const actualSelectedWorkflow = selectedWorkflowProp || localSelectedWorkflow;
  
  const handleBackToWorkflows = () => {
    if (onBackToWorkflows) {
      onBackToWorkflows();
    } else {
      if (readOnly) {
        navigate('/');
      } else {
        navigate(`/projects/${project.id}`);
      }
    }
  };

  const handleAdd = () => {
    setCurrentWorkflow(null);
    setDialogMode('add');
    setDialogOpen(true);
  };

  const handleEdit = (workflow: Project['workflows'][0]) => {
    setCurrentWorkflow(workflow);
    setDialogMode('edit');
    setDialogOpen(true);
  };

  const handleSave = (workflowData: Partial<Project['workflows'][0]>) => {
    if (dialogMode === 'add') {
      onAddWorkflow({
        title: workflowData.title || '',
        description: workflowData.description || '',
      });
    } else if (currentWorkflow) {
      onUpdateWorkflow(project.id, currentWorkflow.id, workflowData);
    }
    setDialogOpen(false);
    setCurrentWorkflow(null);
  };

  const handleInsertTask = (index: number) => {
    if (!actualSelectedWorkflow) return;
    setCurrentTask(null);
    setInsertIndex(index);
    setTaskDialogMode('add');
    setTaskDialogOpen(true);
  };

  const handleViewTaskDetails = (task: Task) => {
    if (!actualSelectedWorkflow) return;
    // Find the latest version of the task from the workflow
    const latestTask = actualSelectedWorkflow.tasks.find(t => t.id === task.id) || task;
    setCurrentTask(latestTask);
    setTaskDialogMode(readOnly || listMode === 'view' ? 'view' : 'edit');
    setTaskDialogOpen(true);
  };

  const handleSaveTask = (taskData: Partial<Task>) => {
    if (!actualSelectedWorkflow) return;
    if (readOnly || taskDialogMode === 'view') return;
    
    if (taskDialogMode === 'add') {
      const taskPayload = {
        title: taskData.title || '',
        description: taskData.description || '',
        instructions: taskData.instructions || '',
        knowledgeDatabaseLinks: taskData.knowledgeDatabaseLinks || [],
        imageUrl: taskData.imageUrl,
        importance: taskData.importance || 'low',
      };
      
      // This will be handled by the parent component
      // For now, we'll need to update the workflow
      const updatedWorkflow = { ...actualSelectedWorkflow };
      const newTask: Task = {
        ...taskPayload,
        id: `task-${Date.now()}`,
        workflowId: actualSelectedWorkflow.id,
        stepNumber: insertIndex !== null ? insertIndex + 1 : actualSelectedWorkflow.tasks.length + 1,
      };
      
      if (insertIndex !== null) {
        updatedWorkflow.tasks.splice(insertIndex, 0, newTask);
        updatedWorkflow.tasks = updatedWorkflow.tasks.map((t, idx) => ({
          ...t,
          stepNumber: idx + 1,
        }));
      } else {
        updatedWorkflow.tasks.push(newTask);
      }
      
      onUpdateWorkflow(project.id, actualSelectedWorkflow.id, { tasks: updatedWorkflow.tasks });
      setInsertIndex(null);
    } else if (currentTask) {
      const updatedWorkflow = { ...actualSelectedWorkflow };
      const taskIndex = updatedWorkflow.tasks.findIndex(t => t.id === currentTask.id);
      if (taskIndex !== -1) {
        updatedWorkflow.tasks[taskIndex] = {
          ...updatedWorkflow.tasks[taskIndex],
          ...taskData,
        };
        onUpdateWorkflow(project.id, actualSelectedWorkflow.id, { tasks: updatedWorkflow.tasks });
      }
    }
  };

  const handleTaskImageUpdate = (taskId: string, imageUrl: string | null) => {
    if (!actualSelectedWorkflow || readOnly) return;
    const updatedWorkflow = { ...actualSelectedWorkflow };
    const taskIndex = updatedWorkflow.tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      updatedWorkflow.tasks[taskIndex] = {
        ...updatedWorkflow.tasks[taskIndex],
        imageUrl: imageUrl || undefined,
      };
      onUpdateWorkflow(project.id, actualSelectedWorkflow.id, { tasks: updatedWorkflow.tasks });
    }
  };

  const handleTaskImportanceChange = (taskId: string, importance: TaskImportance) => {
    if (!actualSelectedWorkflow || readOnly) return;
    const updatedWorkflow = { ...actualSelectedWorkflow };
    const taskIndex = updatedWorkflow.tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      updatedWorkflow.tasks[taskIndex] = {
        ...updatedWorkflow.tasks[taskIndex],
        importance,
      };
      onUpdateWorkflow(project.id, actualSelectedWorkflow.id, { tasks: updatedWorkflow.tasks });
    }
  };

  const handleDeleteTask = (taskId: string) => {
    if (!actualSelectedWorkflow) return;
    const updatedWorkflow = { ...actualSelectedWorkflow };
    updatedWorkflow.tasks = updatedWorkflow.tasks
      .filter(t => t.id !== taskId)
      .map((t, idx) => ({ ...t, stepNumber: idx + 1 }));
    onUpdateWorkflow(project.id, actualSelectedWorkflow.id, { tasks: updatedWorkflow.tasks });
  };

  const handleCompleteTask = (task: Task) => {
    setCurrentTask(task);
    setCompletionDialogOpen(true);
  };

  const handleConfirmCompletion = () => {
    if (currentTask && actualSelectedWorkflow && completeTaskInExecution && getOrCreateWorkflowExecution) {
      const workflowVersion = actualSelectedWorkflow.version || 1;
      const execution = getOrCreateWorkflowExecution(actualSelectedWorkflow.id, workflowVersion);
      completeTaskInExecution(execution.id, currentTask.id);
    }
    setCompletionDialogOpen(false);
  };

  const handleReorderTasks = (taskIds: string[]) => {
    if (!actualSelectedWorkflow) return;
    const updatedWorkflow = { ...actualSelectedWorkflow };
    const taskMap = new Map(updatedWorkflow.tasks.map(t => [t.id, t]));
    updatedWorkflow.tasks = taskIds
      .map((id, index) => {
        const task = taskMap.get(id);
        return task ? { ...task, stepNumber: index + 1 } : null;
      })
      .filter((task): task is Task => task !== null);
    onUpdateWorkflow(project.id, actualSelectedWorkflow.id, { tasks: updatedWorkflow.tasks });
  };

  if (actualSelectedWorkflow) {
    const totalTasks = actualSelectedWorkflow.tasks.length;
    // Calculate completed tasks from execution state if available
    let completedTasks = 0;
    let completedIds: string[] = [];
    if (readOnly && getCompletedTaskIds && actualSelectedWorkflow.version) {
      completedIds = getCompletedTaskIds(actualSelectedWorkflow.id, actualSelectedWorkflow.version);
      completedTasks = completedIds.length;
    }
    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Find the current step (first incomplete task)
    // Tasks must be completed in order, so current step is the first task that isn't completed
    let currentStepTaskId: string | null = null;
    if (readOnly && isTaskCompleted && actualSelectedWorkflow.version) {
      const sortedTasks = [...actualSelectedWorkflow.tasks].sort((a, b) => a.stepNumber - b.stepNumber);
      for (const task of sortedTasks) {
        if (!isTaskCompleted(actualSelectedWorkflow.id, actualSelectedWorkflow.version, task.id)) {
          currentStepTaskId = task.id;
          break;
        }
      }
    }

    // Find the last completed task ID (for showing undo button)
    // Find the task with the highest stepNumber that is completed
    let lastCompletedTaskId: string | null = null;
    if (readOnly && isTaskCompleted && actualSelectedWorkflow.version && completedIds.length > 0) {
      const sortedTasks = [...actualSelectedWorkflow.tasks].sort((a, b) => a.stepNumber - b.stepNumber);
      // Iterate in reverse to find the last completed task by stepNumber
      for (let i = sortedTasks.length - 1; i >= 0; i--) {
        const task = sortedTasks[i];
        if (isTaskCompleted(actualSelectedWorkflow.id, actualSelectedWorkflow.version, task.id)) {
          lastCompletedTaskId = task.id;
          break;
        }
      }
    }

    const handleUndo = () => {
      if (undoLastCompletedTask && actualSelectedWorkflow.version && lastCompletedTaskId) {
        // Pass the specific taskId to remove, ensuring we uncheck the correct task
        undoLastCompletedTask(actualSelectedWorkflow.id, actualSelectedWorkflow.version, lastCompletedTaskId);
      }
    };

    return (
      <div>
        {readOnly && (
          <div className="mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackToWorkflows}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </div>
        )}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              {!readOnly ? `Workflow: ${actualSelectedWorkflow.title}` : actualSelectedWorkflow.title}
            </h1>
            <p className="text-slate-600 mb-3">{actualSelectedWorkflow.description}</p>
            
            {/* Progress Bar - only show in view/user/check mode (readOnly) */}
            {readOnly && (
              <div className="mb-2">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-600">
                    {completedTasks} of {totalTasks} tasks completed
                  </span>
                  <span className="font-semibold text-slate-900">
                    {progressPercentage}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-slate-900 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          {!readOnly && (
            <div className="flex gap-2">
              <Button
                variant={listMode === 'edit' ? 'default' : 'outline'}
                onClick={() => setListMode('edit')}
                size="sm"
              >
                Edit
              </Button>
              <Button
                variant={listMode === 'view' ? 'default' : 'outline'}
                onClick={() => setListMode('view')}
                size="sm"
              >
                Preview
              </Button>
            </div>
          )}
        </div>

        <TaskList
          tasks={actualSelectedWorkflow.tasks}
          onTaskEdit={handleViewTaskDetails}
          onTaskDelete={readOnly ? () => {} : handleDeleteTask}
          onTaskComplete={readOnly ? handleCompleteTask : () => {}} // Disable completion in manage mode
          onTaskImageUpdate={readOnly ? undefined : handleTaskImageUpdate}
          onTaskImportanceChange={readOnly ? undefined : handleTaskImportanceChange}
          onReorderTasks={readOnly ? () => {} : handleReorderTasks}
          onInsertTask={readOnly ? () => {} : handleInsertTask}
          mode={readOnly ? 'view' : listMode}
          workflowId={actualSelectedWorkflow.id}
          workflowVersion={actualSelectedWorkflow.version || 1}
          isTaskCompleted={isTaskCompleted}
          currentStepTaskId={readOnly ? currentStepTaskId : null}
          lastCompletedTaskId={readOnly ? lastCompletedTaskId : null}
          onUndo={readOnly ? handleUndo : undefined}
        />

        <TaskDialog
          open={taskDialogOpen}
          onOpenChange={(open) => {
            setTaskDialogOpen(open);
            if (!open) {
              setInsertIndex(null);
              setCurrentTask(null);
            }
          }}
          task={currentTask ? (actualSelectedWorkflow.tasks.find(t => t.id === currentTask.id) || currentTask) : null}
          knowledgeItems={knowledgeItems}
          onSave={handleSaveTask}
          mode={taskDialogMode}
        />

        <TaskCompletionDialog
          open={completionDialogOpen}
          onOpenChange={setCompletionDialogOpen}
          task={currentTask}
          onConfirm={handleConfirmCompletion}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {!readOnly ? `Project: ${project.title}` : project.title}
          </h1>
          <p className="text-slate-600">{project.description}</p>
        </div>
        {!readOnly && (
          <Button onClick={handleAdd} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Workflow
          </Button>
        )}
      </div>

      {project.workflows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-slate-200 rounded-lg bg-slate-50">
          <ListTodo className="h-16 w-16 text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            No workflows yet
          </h3>
          <p className="text-slate-600 mb-4">
            Get started by creating your first workflow
          </p>
          {!readOnly && (
            <Button onClick={handleAdd} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create First Workflow
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {project.workflows.map((workflow) => (
            <div
              key={workflow.id}
              className="border border-slate-200 rounded-lg p-5 bg-white hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    {workflow.title}
                  </h3>
                  <p className="text-slate-600 mb-3">{workflow.description}</p>
                  <div className="text-sm text-slate-500">
                    {workflow.tasks.length} task{workflow.tasks.length !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      if (readOnly) {
                        navigate(`/${workflow.id}`);
                      } else {
                        navigate(`/projects/${project.id}/workflows/${workflow.id}`);
                      }
                    }}
                    className="flex items-center gap-2"
                  >
                    Open Workflow
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  {!readOnly && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(workflow)}
                        className="flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDeleteWorkflow(project.id, workflow.id)}
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <WorkflowDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        workflow={currentWorkflow}
        onSave={handleSave}
        mode={dialogMode}
      />
    </div>
  );
}

