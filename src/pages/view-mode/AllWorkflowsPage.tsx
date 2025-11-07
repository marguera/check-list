import { useNavigate } from 'react-router-dom';
import { useProjects } from '../../hooks/useProjects';
import { FolderOpen, ListTodo } from 'lucide-react';
import { MobileViewHeader } from '../../components/ui/MobileViewHeader';
import { MobileViewContainer } from '../../components/ui/MobileViewContainer';

export function AllWorkflowsPage() {
  const { projects, getCompletedTaskIds } = useProjects();
  const navigate = useNavigate();

  // Collect all workflows across all projects with progress calculation
  const allWorkflows = projects.flatMap(project =>
    project.workflows.map(workflow => {
      const totalTasks = workflow.tasks.length;
      // Get completion from execution state (latest version)
      const workflowVersion = workflow.version || 1;
      const completedTaskIds = getCompletedTaskIds ? getCompletedTaskIds(workflow.id, workflowVersion) : [];
      const completedTasks = completedTaskIds.length;
      const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return {
        ...workflow,
        projectTitle: project.title,
        projectId: project.id,
        totalTasks,
        completedTasks,
        progressPercentage,
      };
    })
  );

  return (
    <div className="w-full h-screen flex flex-col fixed inset-0 bg-[#19191A] text-white">
      {/* Header matching dialog style - full width */}
      <MobileViewHeader title="Workflows: Select a workflow to view and check tasks" />

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto min-h-0 py-4">
        <MobileViewContainer>
          {allWorkflows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center border border-white/20 bg-white/5 mx-4">
              <ListTodo className="h-16 w-16 text-white/30 mb-4" />
              <h3 className="text-lg font-semibold text-white/60 uppercase mb-2">
                No workflows yet
              </h3>
              <p className="text-white/70">
                Workflows will appear here once they are created
              </p>
            </div>
          ) : (
            <div className="[&>div:last-child]:border-b-0">
              {allWorkflows.map((workflow) => (
                <div
                  key={workflow.id}
                  className="py-4 px-4 border-b border-white/20 bg-transparent cursor-pointer transition-colors hover:bg-white/5"
                  onClick={() => navigate(`/${workflow.id}`)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="mb-1">
                        <span data-slot="badge" className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-sm w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 [&>svg]:pointer-events-none overflow-hidden border-transparent gap-1.5 bg-blue-500/10 text-blue-400">
                          <FolderOpen size={24} className="text-blue-500" /> {workflow.projectTitle}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-white uppercase">
                        {workflow.title}
                      </h3>
                      {workflow.description && (
                        <p className="text-sm text-white/70 mb-3 line-clamp-2">{workflow.description}</p>
                      )}

                      {/* Progress Bar */}
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-white/70">
                            {workflow.completedTasks} of {workflow.totalTasks} tasks completed
                          </span>
                          <span className="font-semibold text-white">
                            {workflow.progressPercentage}%
                          </span>
                        </div>
                        <div className="w-full bg-white/20 h-2">
                          <div
                            className="bg-white h-2 transition-all duration-300"
                            style={{ width: `${workflow.progressPercentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </MobileViewContainer>
      </div>
    </div>
  );
}

