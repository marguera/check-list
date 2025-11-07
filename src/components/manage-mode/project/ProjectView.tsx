import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Project } from '../../../types';
import { Button } from '../../ui/button';
import { Plus, Edit, Trash2, FolderOpen, ArrowRight } from 'lucide-react';
import { ProjectDialog } from './ProjectDialog';

interface ProjectViewProps {
  projects: Project[];
  onAdd: (project: Omit<Project, 'id' | 'workflows'>) => void;
  onUpdate: (id: string, project: Partial<Project>) => void;
  onDelete: (id: string) => void;
}

export function ProjectView({
  projects,
  onAdd,
  onUpdate,
  onDelete,
}: ProjectViewProps) {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');

  const handleAdd = () => {
    setCurrentProject(null);
    setDialogMode('add');
    setDialogOpen(true);
  };

  const handleEdit = (project: Project) => {
    setCurrentProject(project);
    setDialogMode('edit');
    setDialogOpen(true);
  };

  const handleSave = (projectData: Partial<Project>) => {
    if (dialogMode === 'add') {
      onAdd({
        title: projectData.title || '',
        description: projectData.description || '',
      });
    } else if (currentProject) {
      onUpdate(currentProject.id, projectData);
    }
    setDialogOpen(false);
    setCurrentProject(null);
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold uppercase text-white">Projects</h1>
          <p className="text-white/70 max-w-2xl">
            Create and manage your projects with workflows and tasks
          </p>
        </div>
        <Button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-white/10 border border-white/20 text-white hover:bg-white/20"
        >
          <Plus className="w-4 h-4" />
          Add Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-white/10 rounded-lg bg-white/5">
          <FolderOpen className="h-16 w-16 text-white/30 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            No projects yet
          </h3>
          <p className="text-white/60 mb-4">
            Get started by creating your first project
          </p>
          <Button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-white/10 border border-white/20 text-white hover:bg-white/20"
          >
            <Plus className="w-4 h-4" />
            Create First Project
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="border border-white/10 rounded-lg p-5 bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-semibold text-white mb-2">{project.title}</h3>
                  {project.description && (
                    <p className="text-white/70 mb-3">{project.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-white/60 uppercase tracking-wide">
                    <span>{project.workflows.length} workflow{project.workflows.length !== 1 ? 's' : ''}</span>
                    <span>
                      {project.workflows.reduce((sum, w) => sum + w.tasks.length, 0)} total task{project.workflows.reduce((sum, w) => sum + w.tasks.length, 0) !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="flex items-center gap-2 text-white bg-white/10 border border-white/20 hover:bg-white/20"
                  >
                    Open Project
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(project)}
                    className="flex items-center gap-2 text-white bg-white/5 border border-white/10 hover:bg-white/15"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(project.id)}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ProjectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        project={currentProject}
        onSave={handleSave}
        mode={dialogMode}
      />
    </div>
  );
}

