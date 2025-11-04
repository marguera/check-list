import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Project } from '../../types';
import { Button } from '../ui/button';
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
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Projects</h1>
          <p className="text-slate-600">
            Create and manage your projects with workflows and tasks
          </p>
        </div>
        <Button onClick={handleAdd} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-slate-200 rounded-lg bg-slate-50">
          <FolderOpen className="h-16 w-16 text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            No projects yet
          </h3>
          <p className="text-slate-600 mb-4">
            Get started by creating your first project
          </p>
          <Button onClick={handleAdd} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create First Project
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="border border-slate-200 rounded-lg p-5 bg-white hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    {project.title}
                  </h3>
                  <p className="text-slate-600 mb-3">{project.description}</p>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span>{project.workflows.length} workflow{project.workflows.length !== 1 ? 's' : ''}</span>
                    <span>
                      {project.workflows.reduce((sum, w) => sum + w.tasks.length, 0)} total task{project.workflows.reduce((sum, w) => sum + w.tasks.length, 0) !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="flex items-center gap-2"
                  >
                    Open Project
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(project)}
                    className="flex items-center gap-2"
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

