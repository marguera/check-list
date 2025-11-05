import { useParams, Navigate } from 'react-router-dom';
import { useProjects } from '../../hooks/useProjects';
import { ManageWorkflowView } from '../../components/manage-mode/WorkflowView';

export function ProjectWorkflowsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { projects, knowledgeItems, addWorkflow, updateWorkflow, deleteWorkflow, updateProject } = useProjects();

  if (!projectId) {
    return <Navigate to="/projects" replace />;
  }

  const project = projects.find(p => p.id === projectId);

  if (!project) {
    return <Navigate to="/projects" replace />;
  }

  return (
    <ManageWorkflowView
      project={project}
      onBack={() => {}}
      onUpdateProject={(updates) => updateProject(projectId, updates)}
      onAddWorkflow={(workflow) => addWorkflow(projectId, workflow)}
      onUpdateWorkflow={(pId, wId, workflow) => updateWorkflow(pId, wId, workflow)}
      onDeleteWorkflow={(pId, wId) => deleteWorkflow(pId, wId)}
      knowledgeItems={knowledgeItems}
    />
  );
}

