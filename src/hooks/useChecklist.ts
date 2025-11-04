import { useState, useCallback } from 'react';
import { Checklist, Task, KnowledgeItem } from '../types';
import { saveChecklist, loadChecklist, saveKnowledgeItems, loadKnowledgeItems } from '../utils/storage';

const defaultChecklist: Checklist = {
  id: '1',
  title: 'Project Implementation Checklist',
  description: 'Track your progress through planning, development, and testing phases. Complete all tasks to ensure a successful project delivery.',
  tasks: [],
};

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

export function useChecklist() {
  const [checklist, setChecklist] = useState<Checklist>(() => {
    const saved = loadChecklist();
    return saved || defaultChecklist;
  });

  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>(() => {
    const saved = loadKnowledgeItems();
    return saved || defaultKnowledgeItems;
  });

  const updateKnowledgeItems = useCallback((updater: (prev: KnowledgeItem[]) => KnowledgeItem[]) => {
    setKnowledgeItems((prev) => {
      const updated = updater(prev);
      saveKnowledgeItems(updated);
      return updated;
    });
  }, []);

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

  const updateChecklist = useCallback((updater: (prev: Checklist) => Checklist) => {
    setChecklist((prev) => {
      const updated = updater(prev);
      saveChecklist(updated);
      return updated;
    });
  }, []);

  const addTask = useCallback((task: Omit<Task, 'id' | 'stepNumber'>) => {
    updateChecklist((prev) => {
      const newTask: Task = {
        ...task,
        id: `task-${Date.now()}`,
        stepNumber: prev.tasks.length + 1,
      };
      return {
        ...prev,
        tasks: [...prev.tasks, newTask],
      };
    });
  }, [updateChecklist]);

  const insertTask = useCallback((index: number, task: Omit<Task, 'id' | 'stepNumber'>) => {
    updateChecklist((prev) => {
      const newTask: Task = {
        ...task,
        id: `task-${Date.now()}`,
        stepNumber: index + 1,
      };
      const newTasks = [...prev.tasks];
      newTasks.splice(index, 0, newTask);
      // Recalculate step numbers for all tasks
      const reorderedTasks = newTasks.map((t, idx) => ({
        ...t,
        stepNumber: idx + 1,
      }));
      return {
        ...prev,
        tasks: reorderedTasks,
      };
    });
  }, [updateChecklist]);

  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    updateChecklist((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === taskId ? { ...task, ...updates } : task
      ),
    }));
  }, [updateChecklist]);

  const deleteTask = useCallback((taskId: string) => {
    updateChecklist((prev) => {
      const filtered = prev.tasks.filter((task) => task.id !== taskId);
      // Reorder step numbers
      const reordered = filtered.map((task, index) => ({
        ...task,
        stepNumber: index + 1,
      }));
      return {
        ...prev,
        tasks: reordered,
      };
    });
  }, [updateChecklist]);

  const reorderTasks = useCallback((taskIds: string[]) => {
    updateChecklist((prev) => {
      const taskMap = new Map(prev.tasks.map((task) => [task.id, task]));
      const reorderedTasks = taskIds
        .map((id, index) => {
          const task = taskMap.get(id);
          return task ? { ...task, stepNumber: index + 1 } : null;
        })
        .filter((task): task is Task => task !== null);
      return {
        ...prev,
        tasks: reorderedTasks,
      };
    });
  }, [updateChecklist]);

  const updateChecklistMetadata = useCallback((title: string, description: string) => {
    updateChecklist((prev) => ({
      ...prev,
      title,
      description,
    }));
  }, [updateChecklist]);

  return {
    checklist,
    knowledgeItems,
    addTask,
    insertTask,
    updateTask,
    deleteTask,
    reorderTasks,
    updateChecklistMetadata,
    addKnowledgeItem,
    updateKnowledgeItem,
    deleteKnowledgeItem,
  };
}


