import { useState, useCallback } from 'react';
import { Project, Workflow, Task, KnowledgeItem, WorkflowExecution } from '../types';
import { saveProjects, loadProjects, saveKnowledgeItems, loadKnowledgeItems, saveWorkflowExecutions, loadWorkflowExecutions } from '../utils/storage';

const defaultKnowledgeItems: KnowledgeItem[] = [
  {
    id: 'kb-1',
    title: 'Project Scope Definition',
    description: 'Guidelines for defining project scope',
    content: 'A comprehensive guide to defining project scope including stakeholder requirements, deliverables, and constraints.',
  },
  {
    id: 'kb-2',
    title: 'Development Environment Setup',
    description: 'Best practices for setting up development environments',
    content: 'Step-by-step instructions for configuring development environments with all necessary tools and dependencies.',
  },
];

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = loadProjects();
    // Ensure all workflows have versions
    if (saved) {
      return saved.map(project => ({
        ...project,
        workflows: project.workflows.map(workflow => ({
          ...workflow,
          version: workflow.version || 1,
        })),
      }));
    }
    return [];
  });

  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>(() => {
    const saved = loadKnowledgeItems();
    return saved || defaultKnowledgeItems;
  });

  const [workflowExecutions, setWorkflowExecutions] = useState<WorkflowExecution[]>(() => {
    const saved = loadWorkflowExecutions();
    return saved || [];
  });

  const updateProjects = useCallback((updater: (prev: Project[]) => Project[]) => {
    setProjects((prev) => {
      const updated = updater(prev);
      saveProjects(updated);
      return updated;
    });
  }, []);

  const updateKnowledgeItems = useCallback((updater: (prev: KnowledgeItem[]) => KnowledgeItem[]) => {
    setKnowledgeItems((prev) => {
      const updated = updater(prev);
      saveKnowledgeItems(updated);
      return updated;
    });
  }, []);

  const updateWorkflowExecutions = useCallback((updater: (prev: WorkflowExecution[]) => WorkflowExecution[]) => {
    setWorkflowExecutions((prev) => {
      const updated = updater(prev);
      saveWorkflowExecutions(updated);
      return updated;
    });
  }, []);

  // Project operations
  const addProject = useCallback((project: Omit<Project, 'id' | 'workflows'>) => {
    updateProjects((prev) => {
      const newProject: Project = {
        ...project,
        id: `project-${Date.now()}`,
        workflows: [],
      };
      return [...prev, newProject];
    });
  }, [updateProjects]);

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    updateProjects((prev) =>
      prev.map((project) => (project.id === id ? { ...project, ...updates } : project))
    );
  }, [updateProjects]);

  const deleteProject = useCallback((id: string) => {
    updateProjects((prev) => prev.filter((project) => project.id !== id));
  }, [updateProjects]);

  // Workflow operations
  const addWorkflow = useCallback((projectId: string, workflow: Omit<Workflow, 'id' | 'projectId' | 'tasks' | 'version'>) => {
    updateProjects((prev) =>
      prev.map((project) => {
        if (project.id !== projectId) return project;
        const newWorkflow: Workflow = {
          ...workflow,
          id: `workflow-${Date.now()}`,
          projectId,
          tasks: [],
          version: 1, // Start with version 1
        };
        return {
          ...project,
          workflows: [...project.workflows, newWorkflow],
        };
      })
    );
  }, [updateProjects]);

  const updateWorkflowVersion = useCallback((projectId: string, workflowId: string) => {
    updateProjects((prev) =>
      prev.map((project) => {
        if (project.id !== projectId) return project;
        return {
          ...project,
          workflows: project.workflows.map((workflow) =>
            workflow.id === workflowId
              ? { ...workflow, version: (workflow.version || 1) + 1 }
              : workflow
          ),
        };
      })
    );
  }, [updateProjects]);

  const updateWorkflow = useCallback((projectId: string, workflowId: string, updates: Partial<Workflow>) => {
    updateProjects((prev) =>
      prev.map((project) => {
        if (project.id !== projectId) return project;
        return {
          ...project,
          workflows: project.workflows.map((workflow) =>
            workflow.id === workflowId ? { ...workflow, ...updates } : workflow
          ),
        };
      })
    );
  }, [updateProjects]);

  const deleteWorkflow = useCallback((projectId: string, workflowId: string) => {
    updateProjects((prev) =>
      prev.map((project) => {
        if (project.id !== projectId) return project;
        return {
          ...project,
          workflows: project.workflows.filter((workflow) => workflow.id !== workflowId),
        };
      })
    );
  }, [updateProjects]);

  // Task operations
  const addTask = useCallback((projectId: string, workflowId: string, task: Omit<Task, 'id' | 'workflowId' | 'stepNumber'>) => {
    updateProjects((prev) =>
      prev.map((project) => {
        if (project.id !== projectId) return project;
        return {
          ...project,
          workflows: project.workflows.map((workflow) => {
            if (workflow.id !== workflowId) return workflow;
            const newTask: Task = {
              ...task,
              id: `task-${Date.now()}`,
              workflowId,
              stepNumber: workflow.tasks.length + 1,
            };
            return {
              ...workflow,
              tasks: [...workflow.tasks, newTask],
            };
          }),
        };
      })
    );
  }, [updateProjects]);

  const updateTask = useCallback((projectId: string, workflowId: string, taskId: string, updates: Partial<Task>) => {
    updateProjects((prev) =>
      prev.map((project) => {
        if (project.id !== projectId) return project;
        return {
          ...project,
          workflows: project.workflows.map((workflow) => {
            if (workflow.id !== workflowId) return workflow;
            return {
              ...workflow,
              tasks: workflow.tasks.map((task) =>
                task.id === taskId ? { ...task, ...updates } : task
              ),
            };
          }),
        };
      })
    );
  }, [updateProjects]);

  const deleteTask = useCallback((projectId: string, workflowId: string, taskId: string) => {
    updateProjects((prev) =>
      prev.map((project) => {
        if (project.id !== projectId) return project;
        return {
          ...project,
          workflows: project.workflows.map((workflow) => {
            if (workflow.id !== workflowId) return workflow;
            const filtered = workflow.tasks.filter((task) => task.id !== taskId);
            const reordered = filtered.map((task, index) => ({
              ...task,
              stepNumber: index + 1,
            }));
            return {
              ...workflow,
              tasks: reordered,
            };
          }),
        };
      })
    );
  }, [updateProjects]);

  const reorderTasks = useCallback((projectId: string, workflowId: string, taskIds: string[]) => {
    updateProjects((prev) =>
      prev.map((project) => {
        if (project.id !== projectId) return project;
        return {
          ...project,
          workflows: project.workflows.map((workflow) => {
            if (workflow.id !== workflowId) return workflow;
            const taskMap = new Map(workflow.tasks.map((task) => [task.id, task]));
            const reorderedTasks = taskIds
              .map((id, index) => {
                const task = taskMap.get(id);
                return task ? { ...task, stepNumber: index + 1 } : null;
              })
              .filter((task): task is Task => task !== null);
            return {
              ...workflow,
              tasks: reorderedTasks,
            };
          }),
        };
      })
    );
  }, [updateProjects]);

  // Knowledge item operations
  const addKnowledgeItem = useCallback((item: Omit<KnowledgeItem, 'id'>) => {
    updateKnowledgeItems((prev) => {
      const newItem: KnowledgeItem = {
        ...item,
        id: `kb-${Date.now()}`,
      };
      return [...prev, newItem];
    });
  }, [updateKnowledgeItems]);

  const updateKnowledgeItem = useCallback((id: string, updates: Partial<KnowledgeItem>) => {
    updateKnowledgeItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  }, [updateKnowledgeItems]);

  const deleteKnowledgeItem = useCallback((id: string) => {
    updateKnowledgeItems((prev) => prev.filter((item) => item.id !== id));
  }, [updateKnowledgeItems]);

  // WorkflowExecution operations
  const getOrCreateWorkflowExecution = useCallback((workflowId: string, workflowVersion: number): WorkflowExecution => {
    let execution = workflowExecutions.find(
      (e) => e.workflowId === workflowId && e.workflowVersion === workflowVersion
    );

    if (!execution) {
      execution = {
        id: `execution-${Date.now()}`,
        workflowId,
        workflowVersion,
        completedTaskIds: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      updateWorkflowExecutions((prev) => [...prev, execution!]);
      return execution;
    }

    return execution;
  }, [workflowExecutions, updateWorkflowExecutions]);

  const completeTaskInExecution = useCallback((executionId: string, taskId: string) => {
    updateWorkflowExecutions((prev) =>
      prev.map((execution) => {
        if (execution.id !== executionId) return execution;
        if (execution.completedTaskIds.includes(taskId)) return execution;
        return {
          ...execution,
          completedTaskIds: [...execution.completedTaskIds, taskId],
          updatedAt: Date.now(),
        };
      })
    );
  }, [updateWorkflowExecutions]);

  const isTaskCompleted = useCallback((workflowId: string, workflowVersion: number, taskId: string): boolean => {
    const execution = workflowExecutions.find(
      (e) => e.workflowId === workflowId && e.workflowVersion === workflowVersion
    );
    return execution ? execution.completedTaskIds.includes(taskId) : false;
  }, [workflowExecutions]);

  const getCompletedTaskIds = useCallback((workflowId: string, workflowVersion: number): string[] => {
    const execution = workflowExecutions.find(
      (e) => e.workflowId === workflowId && e.workflowVersion === workflowVersion
    );
    return execution ? execution.completedTaskIds : [];
  }, [workflowExecutions]);

  const undoLastCompletedTask = useCallback((workflowId: string, workflowVersion: number, taskId?: string) => {
    updateWorkflowExecutions((prev) =>
      prev.map((execution) => {
        if (execution.workflowId !== workflowId || execution.workflowVersion !== workflowVersion) {
          return execution;
        }
        if (execution.completedTaskIds.length === 0) {
          return execution;
        }
        // Remove the specific taskId if provided, otherwise remove the last one (backward compatibility)
        const newCompletedTaskIds = taskId
          ? execution.completedTaskIds.filter(id => id !== taskId)
          : execution.completedTaskIds.slice(0, -1);
        return {
          ...execution,
          completedTaskIds: newCompletedTaskIds,
          updatedAt: Date.now(),
        };
      })
    );
  }, [updateWorkflowExecutions]);

  return {
    projects,
    knowledgeItems,
    addProject,
    updateProject,
    deleteProject,
    addWorkflow,
    updateWorkflow,
    updateWorkflowVersion,
    deleteWorkflow,
    addTask,
    updateTask,
    deleteTask,
    reorderTasks,
    addKnowledgeItem,
    updateKnowledgeItem,
    deleteKnowledgeItem,
    getOrCreateWorkflowExecution,
    completeTaskInExecution,
    isTaskCompleted,
    getCompletedTaskIds,
    undoLastCompletedTask,
  };
}

