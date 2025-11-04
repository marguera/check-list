import { useProjects } from '../hooks/useProjects';
import { ProjectView } from '../components/project/ProjectView';

export function ProjectsPage() {
  const {
    projects,
    addProject,
    updateProject,
    deleteProject,
  } = useProjects();

  return (
    <ProjectView
      projects={projects}
      onAdd={addProject}
      onUpdate={updateProject}
      onDelete={deleteProject}
    />
  );
}

