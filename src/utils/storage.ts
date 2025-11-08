import { Checklist, KnowledgeItem, Project, WorkflowExecution } from '../types';

const STORAGE_KEY = 'checklist-app-data';
const PROJECTS_STORAGE_KEY = 'projects-data';
const KNOWLEDGE_STORAGE_KEY = 'knowledge-items-data';
const WORKFLOW_EXECUTIONS_STORAGE_KEY = 'workflow-executions-data';

export const saveChecklist = (checklist: Checklist): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checklist));
  } catch (error) {
    console.error('Error saving checklist:', error);
  }
};

export const loadChecklist = (): Checklist | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data) as Checklist;
  } catch (error) {
    console.error('Error loading checklist:', error);
    return null;
  }
};

export const clearChecklist = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing checklist:', error);
  }
};

export const saveKnowledgeItems = (items: KnowledgeItem[]): void => {
  try {
    localStorage.setItem(KNOWLEDGE_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Error saving knowledge items:', error);
  }
};

export const loadKnowledgeItems = (): KnowledgeItem[] | null => {
  try {
    const data = localStorage.getItem(KNOWLEDGE_STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data) as KnowledgeItem[];
  } catch (error) {
    console.error('Error loading knowledge items:', error);
    return null;
  }
};

export const saveProjects = (projects: Project[]): void => {
  try {
    const data = JSON.stringify(projects);
    localStorage.setItem(PROJECTS_STORAGE_KEY, data);
  } catch (error: any) {
    console.error('Error saving projects:', error);
    
    // If it's a quota exceeded error, provide helpful feedback
    if (error.name === 'QuotaExceededError' || error.code === 22) {
      const dataSize = JSON.stringify(projects).length;
      const sizeInMB = (dataSize / (1024 * 1024)).toFixed(2);
      console.error(
        `Storage quota exceeded. Total data size: ${sizeInMB}MB. ` +
        `Consider removing some workflows or compressing images further.`
      );
      
      // Try to show an alert to the user
      if (typeof window !== 'undefined') {
        alert(
          `Storage limit exceeded (${sizeInMB}MB). ` +
          `The workflow contains too much data. ` +
          `Try importing with fewer images or remove some existing workflows.`
        );
      }
    }
  }
};

export const loadProjects = (): Project[] | null => {
  try {
    const data = localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data) as Project[];
  } catch (error) {
    console.error('Error loading projects:', error);
    return null;
  }
};

export const saveWorkflowExecutions = (executions: WorkflowExecution[]): void => {
  try {
    localStorage.setItem(WORKFLOW_EXECUTIONS_STORAGE_KEY, JSON.stringify(executions));
  } catch (error) {
    console.error('Error saving workflow executions:', error);
  }
};

export const loadWorkflowExecutions = (): WorkflowExecution[] | null => {
  try {
    const data = localStorage.getItem(WORKFLOW_EXECUTIONS_STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data) as WorkflowExecution[];
  } catch (error) {
    console.error('Error loading workflow executions:', error);
    return null;
  }
};


