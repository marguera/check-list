import { useParams, Navigate } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects';
import { WorkflowView } from '../components/workflow/WorkflowView';

export function WorkflowTasksPage() {
  const { projectId, workflowId } = useParams<{ projectId: string; workflowId: string }>();
  const { projects, knowledgeItems, updateWorkflow } = useProjects();

  if (!projectId || !workflowId) {
    return <Navigate to="/projects" replace />;
  }

  const project = projects.find(p => p.id === projectId);
  if (!project) {
    return <Navigate to="/projects" replace />;
  }

  const workflow = project.workflows.find(w => w.id === workflowId);
  if (!workflow) {
    return <Navigate to={`/projects/${projectId}`} replace />;
  }

  return (
    <WorkflowView
      project={project}
      onBack={() => {}}
      onUpdateProject={() => {}}
      onAddWorkflow={() => {}}
      onUpdateWorkflow={(pId, wId, updates) => updateWorkflow(pId, wId, updates)}
      onDeleteWorkflow={() => {}}
      knowledgeItems={knowledgeItems}
      selectedWorkflow={workflow}
      onWorkflowSelect={() => {}}
      onBackToWorkflows={() => {}}
    />
  );
}

