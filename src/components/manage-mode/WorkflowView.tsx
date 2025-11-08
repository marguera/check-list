import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Project, Task, TaskImportance } from '../../types';
import { Button } from '../ui/button';
import { Plus, Edit, Trash2, ListTodo, ArrowRight } from 'lucide-react';
import { WorkflowDialog } from './workflow/WorkflowDialog';
import { ManageTaskList } from './TaskList';
import { ManageTaskDialog } from './TaskDialog';
import { PreviewDialog } from './PreviewDialog';

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
  const pendingImportTasks = useRef<{ workflowTitle: string; workflowDescription: string; tasks: Task[] } | null>(null);

  const actualSelectedWorkflow = selectedWorkflowProp || localSelectedWorkflow;

  // Handle pending workflow imports
  useEffect(() => {
    if (pendingImportTasks.current) {
      const { workflowTitle, workflowDescription, tasks } = pendingImportTasks.current;
      // Find the workflow that matches and has no tasks
      const targetWorkflow = project.workflows.find(
        w => w.title === workflowTitle && 
        w.description === workflowDescription &&
        w.tasks.length === 0
      );
      
      if (targetWorkflow) {
        const tasksWithIds = tasks.map((task, index) => ({
          ...task,
          id: `task-${Date.now()}-${index}`,
          workflowId: targetWorkflow.id,
          stepNumber: index + 1,
        }));
        onUpdateWorkflow(project.id, targetWorkflow.id, { tasks: tasksWithIds });
        pendingImportTasks.current = null;
      }
    }
  }, [project.workflows, project.id, onUpdateWorkflow]);

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
      // Check if tasks are provided (import case)
      if (workflowData.tasks && workflowData.tasks.length > 0) {
        // Create workflow first
        onAddWorkflow({
          title: workflowData.title || '',
          description: workflowData.description || '',
        });
        
        // Store tasks to be added after workflow is created
        pendingImportTasks.current = {
          workflowTitle: workflowData.title || '',
          workflowDescription: workflowData.description || '',
          tasks: workflowData.tasks,
        };
      } else {
        // Normal create without tasks
        onAddWorkflow({
          title: workflowData.title || '',
          description: workflowData.description || '',
        });
      }
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

  return (
    <div className="space-y-6">
      {actualSelectedWorkflow ? (
        <>
          {/* Task List View Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold uppercase text-white">{actualSelectedWorkflow.title}</h1>
              {actualSelectedWorkflow.description && (
                <p className="text-white/70 max-w-2xl mt-2">
                  {actualSelectedWorkflow.description}
                </p>
              )}
            </div>
            <Button
              onClick={() => setPreviewDialogOpen(true)}
              className="flex items-center gap-2 bg-white/10 border border-white/20 text-white hover:bg-white/20"
            >
              Preview
            </Button>
          </div>

          <ManageTaskList
            tasks={actualSelectedWorkflow.tasks}
            onTaskEdit={handleViewTaskDetails}
            onTaskDelete={handleDeleteTask}
            onTaskImageUpdate={handleTaskImageUpdate}
            onTaskImportanceChange={handleTaskImportanceChange}
            onReorderTasks={handleReorderTasks}
            onInsertTask={handleInsertTask}
          />
        </>
      ) : (
        <>
          {/* Workflows List View Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold uppercase text-white">{project.title}</h1>
              {project.description && (
                <p className="text-white/70 max-w-2xl mt-2">
                  {project.description}
                </p>
              )}
            </div>
            <Button
              onClick={handleAdd}
              className="flex items-center gap-2 bg-white/10 border border-white/20 text-white hover:bg-white/20"
            >
              <Plus className="w-4 h-4" />
              Add Workflow
            </Button>
          </div>

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
                className="flex items-center gap-2 bg-white/10 border border-white/20 text-white hover:bg-white/20"
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
            </>
          )}

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
        knowledgeItems={knowledgeItems}
        projectId={project.id}
        onImportWorkflow={(workflowData, tasks) => {
          // Use handleSave which will create workflow and update with tasks
          handleSave({
            ...workflowData,
            tasks,
          });
        }}
      />
    </div>
  );
}

