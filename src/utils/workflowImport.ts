import * as yaml from 'js-yaml';
import { ParsedWorkflow, ParsedTask, WorkflowImportResult } from '../types/workflowImport';
import { Task, KnowledgeItem } from '../types';

/**
 * Replace image placeholders in HTML instructions with actual image tags
 */
function replaceImagePlaceholders(
  instructions: string,
  imagePlaceholders: string[],
  imageMap: Map<string, string>
): string {
  let result = instructions;
  
  for (const placeholder of imagePlaceholders) {
    const imageDataUrl = imageMap.get(placeholder);
    if (imageDataUrl) {
      // Replace [IMAGE:placeholder] with <img> tag
      const regex = new RegExp(`\\[IMAGE:${placeholder}\\]`, 'gi');
      result = result.replace(
        regex,
        `<img src="${imageDataUrl}" alt="Image" />`
      );
      console.log(`Replaced [IMAGE:${placeholder}] with image (${imageDataUrl.substring(0, 50)}...)`);
    } else {
      console.warn(`Image placeholder "${placeholder}" not found in imageMap. Available keys:`, Array.from(imageMap.keys()));
    }
  }
  
  return result;
}

/**
 * Parse YAML workflow import format and convert to workflow structure
 * Note: knowledgeItems parameter is kept for backward compatibility but not used
 */
export function parseWorkflowImport(
  yamlText: string,
  _knowledgeItems: KnowledgeItem[], // Unused - kept for backward compatibility
  imageMap: Map<string, string>
): WorkflowImportResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  
  try {
    // Parse YAML
    const parsed = yaml.load(yamlText) as any;
    
    if (!parsed || typeof parsed !== 'object') {
      errors.push('Invalid YAML format: root must be an object');
      throw new Error('Invalid YAML format');
    }
    
    if (!parsed.workflow || !parsed.workflow.title) {
      errors.push('Missing required field: workflow.title');
      throw new Error('Missing workflow title');
    }
    
    if (!parsed.tasks || !Array.isArray(parsed.tasks)) {
      errors.push('Missing or invalid tasks array');
      throw new Error('Missing tasks');
    }
    
    const workflow: ParsedWorkflow = {
      title: String(parsed.workflow.title),
      description: parsed.workflow.description ? String(parsed.workflow.description) : '',
      tasks: [],
    };
    
    // Process tasks
    for (let i = 0; i < parsed.tasks.length; i++) {
      const taskData = parsed.tasks[i];
      
      if (!taskData.title) {
        errors.push(`Task ${i + 1}: Missing required field 'title'`);
        continue;
      }
      
      const step = taskData.step !== undefined ? Number(taskData.step) : i + 1;
      const importance = taskData.importance === 'high' || taskData.importance === 'low' 
        ? taskData.importance 
        : undefined;
      
      let instructions = taskData.instructions ? String(taskData.instructions) : '';
      
      // Replace image placeholders in instructions
      // Extract placeholders automatically from instructions (format: [IMAGE:placeholder-name])
      if (instructions.includes('[IMAGE:')) {
        const placeholderMatches = instructions.match(/\[IMAGE:([^\]]+)\]/g);
        if (placeholderMatches) {
          const placeholders = placeholderMatches.map(m => 
            m.replace(/\[IMAGE:(.+)\]/, '$1')
          );
          
          // Debug: log placeholders and imageMap contents
          console.log('Found placeholders in instructions:', placeholders);
          console.log('Available imageMap keys:', Array.from(imageMap.keys()));
          
          instructions = replaceImagePlaceholders(instructions, placeholders, imageMap);
          
          // Check if any placeholders weren't replaced
          const remainingPlaceholders = instructions.match(/\[IMAGE:([^\]]+)\]/g);
          if (remainingPlaceholders && remainingPlaceholders.length > 0) {
            console.warn('Some placeholders were not replaced:', remainingPlaceholders);
            console.warn('ImageMap size:', imageMap.size);
          }
        }
      }
      
      // Knowledge links are not supported in import for now
      // Skip any knowledgeLinks in the YAML
      
      const parsedTask: ParsedTask = {
        step,
        title: String(taskData.title),
        description: taskData.description ? String(taskData.description) : '',
        importance,
        instructions,
        knowledgeLinks: undefined, // Not supported in import
        imagePlaceholders: undefined, // Not needed - extracted automatically from instructions
        image: taskData.image ? String(taskData.image) : undefined, // Placeholder reference (e.g., "image-1")
      };
      
      // Validate image placeholder reference if provided
      if (parsedTask.image && parsedTask.image.startsWith('image-')) {
        if (!imageMap.has(parsedTask.image)) {
          warnings.push(`Task "${taskData.title}": image placeholder "${parsedTask.image}" not found in imageMap`);
        }
      }
      
      workflow.tasks.push(parsedTask);
    }
    
    // Sort tasks by step number
    workflow.tasks.sort((a, b) => a.step - b.step);
    
    // Renumber steps to ensure they're sequential
    workflow.tasks.forEach((task, index) => {
      task.step = index + 1;
    });
    
    return {
      workflow,
      warnings,
      errors: errors.length > 0 ? errors : [],
    };
  } catch (error: any) {
    if (errors.length === 0) {
      errors.push(`Parse error: ${error.message || 'Unknown error'}`);
    }
    return {
      workflow: {
        title: '',
        description: '',
        tasks: [],
      },
      warnings,
      errors,
    };
  }
}

/**
 * Convert parsed workflow to Task array for creating workflow
 */
export function convertParsedWorkflowToTasks(
  parsedWorkflow: ParsedWorkflow,
  workflowId: string,
  imageMap: Map<string, string>
): Task[] {
  return parsedWorkflow.tasks.map((parsedTask, index) => {
    // Resolve image placeholder to actual image URL
    let imageUrl: string | undefined = undefined;
    if (parsedTask.image) {
      const imageValue = String(parsedTask.image);
      if (imageValue.startsWith('image-')) {
        const resolvedUrl = imageMap.get(imageValue);
        if (resolvedUrl) {
          imageUrl = resolvedUrl;
        }
      } else {
        // Assume it's already a data URL (backward compatibility)
        imageUrl = imageValue;
      }
    }
    
    const task: Task = {
      id: `task-${Date.now()}-${index}`,
      workflowId,
      stepNumber: parsedTask.step,
      title: parsedTask.title,
      description: parsedTask.description,
      instructions: parsedTask.instructions || '',
      knowledgeDatabaseLinks: [], // Knowledge links not supported in import
      importance: parsedTask.importance,
      imageUrl, // Resolved image URL from placeholder reference
    };
    
    return task;
  });
}

