import { useNavigate } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects';
import { ListTodo } from 'lucide-react';
import { MobileViewHeader } from '../components/ui/MobileViewHeader';
import { MobileViewContainer } from '../components/ui/MobileViewContainer';

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
    <div className="w-full h-screen flex flex-col fixed inset-0 bg-slate-50">
      {/* Header matching dialog style - full width */}
      <MobileViewHeader title="Workflows" />
      
      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto min-h-0 py-4">
        <MobileViewContainer>
          <p className="text-slate-600 mb-6 px-4">Select a workflow to view and check tasks</p>

          {allWorkflows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center border border-slate-200 rounded-lg bg-slate-50 mx-4">
              <ListTodo className="h-16 w-16 text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No workflows yet
              </h3>
              <p className="text-slate-600">
                Workflows will appear here once they are created
              </p>
            </div>
          ) : (
            <div className="[&>div:last-child]:border-b-0">
              {allWorkflows.map((workflow) => (
                <div
                  key={workflow.id}
                  className="py-4 px-4 border-b border-slate-200 bg-white cursor-pointer transition-colors hover:bg-slate-50"
                  onClick={() => navigate(`/${workflow.id}`)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-slate-500 mb-1">{workflow.projectTitle}</div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">
                        {workflow.title}
                      </h3>
                      {workflow.description && (
                        <p className="text-slate-600 mb-3 line-clamp-2">{workflow.description}</p>
                      )}
                      
                      {/* Progress Bar */}
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-slate-600">
                            {workflow.completedTasks} of {workflow.totalTasks} tasks completed
                          </span>
                          <span className="font-semibold text-slate-900">
                            {workflow.progressPercentage}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-slate-900 h-2 rounded-full transition-all duration-300"
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

