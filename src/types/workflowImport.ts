import { Task, KnowledgeItem } from './index';

export interface ParsedWorkflow {
  title: string;
  description: string;
  tasks: ParsedTask[];
}

export interface ParsedTask {
  step: number;
  title: string;
  description: string;
  importance?: 'low' | 'high';
  instructions: string;
  knowledgeLinks?: string[];
  imagePlaceholders?: string[];
  image?: string; // Optional image placeholder reference for task list display
}

export interface WorkflowImportResult {
  workflow: ParsedWorkflow;
  warnings: string[];
  errors: string[];
}

