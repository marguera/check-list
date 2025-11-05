import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects';
import { ViewWorkflowView } from '../components/view-mode/WorkflowView';
import { Project } from '../types';

export function ViewWorkflowTasksPage() {
  const { workflowId } = useParams<{ workflowId: string }>();
  const { 
    projects, 
    knowledgeItems, 
    getOrCreateWorkflowExecution,
    completeTaskInExecution,
    isTaskCompleted,
    getCompletedTaskIds,
    undoLastCompletedTask,
  } = useProjects();
  const navigate = useNavigate();

  if (!workflowId) {
    return <Navigate to="/projects" replace />;
  }

  // Find the workflow across all projects
  let workflow = null as Project['workflows'][0] | null;
  let project = null as Project | null;
  
  for (const p of projects) {
    const w = p.workflows.find(w => w.id === workflowId);
    if (w) {
      workflow = w;
      project = p;
      break;
    }
  }

  if (!project || !workflow) {
    return <Navigate to="/projects" replace />;
  }

  return (
    <ViewWorkflowView
      selectedWorkflow={workflow}
      knowledgeItems={knowledgeItems}
      onBackToWorkflows={() => {
        navigate('/');
      }}
      getOrCreateWorkflowExecution={getOrCreateWorkflowExecution}
      completeTaskInExecution={completeTaskInExecution}
      isTaskCompleted={isTaskCompleted}
      getCompletedTaskIds={getCompletedTaskIds}
      undoLastCompletedTask={undoLastCompletedTask}
    />
  );
}

