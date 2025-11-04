export interface Project {
  id: string;
  title: string;
  description: string;
  workflows: Workflow[];
}

export interface Workflow {
  id: string;
  projectId: string;
  title: string;
  description: string;
  tasks: Task[];
  version: number; // Version number for workflow definitions
}

export type TaskImportance = 'low' | 'high';

export interface Task {
  id: string;
  workflowId: string;
  stepNumber: number;
  title: string;
  description: string;
  instructions: string; // HTML content from TipTap
  knowledgeDatabaseLinks: string[]; // IDs of linked knowledge items
  imageUrl?: string;
  importance?: TaskImportance; // Defaults to 'medium' if not specified
  // Note: completed property removed - completion state is tracked separately in WorkflowExecution
}

// WorkflowExecution represents a user's execution/checklist instance of a workflow
// This tracks completion state based on a specific workflow version
export interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflowVersion: number; // The version of the workflow this execution is based on
  completedTaskIds: string[]; // Array of task IDs that have been completed
  createdAt: number; // Timestamp when execution started
  updatedAt: number; // Timestamp of last update
}

export interface KnowledgeItem {
  id: string;
  title: string;
  description: string;
  content: string;
}

// Legacy Checklist interface for backward compatibility during migration
export interface Checklist {
  id: string;
  title: string;
  description: string;
  tasks: Task[];
}


