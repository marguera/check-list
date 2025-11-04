import { useLocation } from 'react-router-dom';
import { useProjects } from './useProjects';

export function useBreadcrumbs() {
  const location = useLocation();
  const { projects } = useProjects();

  const items: Array<{ label: string; path: string }> = [];

  if (location.pathname.startsWith('/knowledge')) {
    // For knowledge base, we don't need to show "Projects" in breadcrumbs
    // The home icon will link to /projects, but we show "Knowledge Base" as the current page
    items.push({ label: 'Knowledge Base', path: '/knowledge' });
    return items;
  }

  // Always show "Projects" in breadcrumbs for project-related pages
  items.push({ label: 'Projects', path: '/projects' });

  // Parse the pathname to extract projectId and workflowId
  // Format: /projects/:projectId or /projects/:projectId/workflows/:workflowId
  const pathMatch = location.pathname.match(/^\/projects\/([^/]+)(?:\/workflows\/([^/]+))?$/);
  
  if (pathMatch) {
    const projectId = pathMatch[1];
    const workflowId = pathMatch[2];

    // Find the project
    const project = projects.find(p => p.id === projectId);
    if (project) {
      items.push({ label: project.title, path: `/projects/${projectId}` });

      // If we have a workflow ID
      if (workflowId) {
        const workflow = project.workflows.find(w => w.id === workflowId);
        if (workflow) {
          items.push({ 
            label: workflow.title, 
            path: `/projects/${projectId}/workflows/${workflowId}` 
          });
        } else {
          // Workflow not found, but we're on that route, so show the ID as fallback
          items.push({ 
            label: `Workflow ${workflowId.slice(-8)}`, 
            path: `/projects/${projectId}/workflows/${workflowId}` 
          });
        }
      }
    } else {
      // Project not found, but we're on that route, so show the ID as fallback
      items.push({ label: `Project ${projectId.slice(-8)}`, path: `/projects/${projectId}` });
    }
  }

  return items;
}

