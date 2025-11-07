import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Project, Task, TaskImportance } from '../../types';
import { Button } from '../ui/button';
import { Plus, Edit, Trash2, ListTodo, ArrowRight } from 'lucide-react';
import { WorkflowDialog } from './workflow/WorkflowDialog';
import { ManageTaskList } from './TaskList';
import { ManageTaskDialog } from './TaskDialog';
import { PreviewDialog } from './PreviewDialog';
import { MobileViewHeader } from '../ui/MobileViewHeader';
import { MobileViewContainer } from '../ui/MobileViewContainer';

interface ManageWorkflowViewProps {
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
}

export function ManageWorkflowView({
  project,
  onBack: _onBack,
  onUpdateProject: _onUpdateProject,
  onAddWorkflow,
  onUpdateWorkflow,
  onDeleteWorkflow,
  knowledgeItems,
  selectedWorkflow: selectedWorkflowProp,
  onWorkflowSelect: _onWorkflowSelect,
  onBackToWorkflows: _onBackToWorkflows,
}: ManageWorkflowViewProps) {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentWorkflow, setCurrentWorkflow] = useState<Project['workflows'][0] | null>(null);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [localSelectedWorkflow] = useState<Project['workflows'][0] | null>(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [taskDialogMode, setTaskDialogMode] = useState<'add' | 'edit'>('add');
  const [insertIndex, setInsertIndex] = useState<number | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);

  const actualSelectedWorkflow = selectedWorkflowProp || localSelectedWorkflow;

  const handleBackNavigation = () => {
    if (actualSelectedWorkflow) {
      if (_onBackToWorkflows) {
        _onBackToWorkflows();
        return;
      }
      navigate(`/projects/${project.id}`);
      return;
    }

    if (_onBack) {
      _onBack();
      return;
    }

    navigate('/projects');
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
    const latestTask = actualSelectedWorkflow.tasks.find(t => t.id === task.id) || task;
    setCurrentTask(latestTask);
    setTaskDialogMode('edit');
    setTaskDialogOpen(true);
  };

  const handleSaveTask = (taskData: Partial<Task>) => {
    if (!actualSelectedWorkflow) return;

    if (taskDialogMode === 'add') {
      const taskPayload = {
        title: taskData.title || '',
        description: taskData.description || '',
        instructions: taskData.instructions || '',
        knowledgeDatabaseLinks: taskData.knowledgeDatabaseLinks || [],
        imageUrl: taskData.imageUrl,
        importance: taskData.importance || 'low',
      };

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
    if (!actualSelectedWorkflow) return;
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
    if (!actualSelectedWorkflow) return;
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

  const headerTitle = actualSelectedWorkflow
    ? `Workflow: ${actualSelectedWorkflow.title}`
    : `Project: ${project.title}`;

  return (
    <div className="w-full h-screen flex flex-col fixed inset-0 bg-[#19191A] text-white">
      <MobileViewHeader
        title={headerTitle}
        onBack={handleBackNavigation}
        showBackButton={Boolean(actualSelectedWorkflow)}
      >
        {actualSelectedWorkflow ? (
          <Button
            onClick={() => setPreviewDialogOpen(true)}
            size="sm"
            className="bg-white/10 border border-white/10 text-white hover:bg-white/20 hover:text-white"
          >
            Preview
          </Button>
        ) : (
          <Button
            onClick={handleAdd}
            size="sm"
            className="bg-white/10 border border-white/10 text-white hover:bg-white/20 hover:text-white flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Workflow
          </Button>
        )}
      </MobileViewHeader>

      <div className="flex-1 overflow-y-auto min-h-0 py-4">
        <MobileViewContainer className="px-4">
          {actualSelectedWorkflow ? (
            <div className="space-y-6">
              {actualSelectedWorkflow.description && (
                <p className="text-white/70 text-base">
                  {actualSelectedWorkflow.description}
                </p>
              )}

              <ManageTaskList
                tasks={actualSelectedWorkflow.tasks}
                onTaskEdit={handleViewTaskDetails}
                onTaskDelete={handleDeleteTask}
                onTaskImageUpdate={handleTaskImageUpdate}
                onTaskImportanceChange={handleTaskImportanceChange}
                onReorderTasks={handleReorderTasks}
                onInsertTask={handleInsertTask}
              />
            </div>
          ) : (
            <div className="space-y-6">
              {project.description && (
                <p className="text-white/70 text-base">
                  {project.description}
                </p>
              )}

              {project.workflows.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border border-white/10 rounded-lg bg-white/5">
                  <ListTodo className="h-16 w-16 text-white/30 mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    No workflows yet
                  </h3>
                  <p className="text-white/60 mb-4">
                    Get started by creating your first workflow
                  </p>
                  <Button
                    onClick={handleAdd}
                    className="flex items-center gap-2 bg-white/10 border border-white/10 text-white hover:bg-white/20 hover:text-white"
                  >
                    <Plus className="w-4 h-4" />
                    Create First Workflow
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {project.workflows.map((workflow) => (
                    <div
                      key={workflow.id}
                      className="border border-white/10 rounded-lg p-5 bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-semibold text-white mb-2">
                            {workflow.title}
                          </h3>
                          {workflow.description && (
                            <p className="text-white/70 mb-3">{workflow.description}</p>
                          )}
                          <div className="text-sm text-white/60">
                            {workflow.tasks.length} task{workflow.tasks.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/projects/${project.id}/workflows/${workflow.id}`)}
                            className="flex items-center gap-2 text-white bg-white/10 border border-white/10 hover:bg-white/20"
                          >
                            Open Workflow
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(workflow)}
                            className="flex items-center gap-2 text-white bg-white/5 border border-white/10 hover:bg-white/15"
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
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </MobileViewContainer>
      </div>

      {actualSelectedWorkflow && (
        <ManageTaskDialog
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
      )}

      {actualSelectedWorkflow && (
        <PreviewDialog
          open={previewDialogOpen}
          onOpenChange={setPreviewDialogOpen}
          workflow={actualSelectedWorkflow}
          knowledgeItems={knowledgeItems}
        />
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

