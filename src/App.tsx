import { ReactNode } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ModeHeader } from './components/navigation/ModeHeader';
import { AppHeader } from './components/manage-mode/navigation/AppHeader';
import { Breadcrumbs } from './components/manage-mode/navigation/Breadcrumbs';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectWorkflowsPage } from './pages/ProjectWorkflowsPage';
import { WorkflowTasksPage } from './pages/WorkflowTasksPage';
import { KnowledgeBasePage } from './pages/KnowledgeBasePage';
import { AllWorkflowsPage } from './pages/AllWorkflowsPage';
import { ViewWorkflowTasksPage } from './pages/ViewWorkflowTasksPage';
import { useBreadcrumbs } from './hooks/useBreadcrumbs';

function AppLayout({ children }: { children: ReactNode }) {
  const breadcrumbs = useBreadcrumbs();
  const location = useLocation();
  // Root and single-segment workflow routes are view mode (no header/breadcrumbs)
  // Exclude known edit routes
  const isEditRoute = location.pathname.startsWith('/projects') || location.pathname.startsWith('/knowledge');
  const isViewMode = !isEditRoute && (location.pathname === '/' || /^\/[^/]+$/.test(location.pathname));

  return (
    <div className={`min-h-screen ${isViewMode ? 'bg-[#19191A] text-white' : 'bg-slate-50'}`}>
      <ModeHeader />
      {!isViewMode && (
        <>
          <AppHeader />
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Breadcrumbs items={breadcrumbs} />
            {children}
          </div>
        </>
      )}
      {isViewMode && (
        <div className="container mx-auto px-4 max-w-4xl text-white">
          {children}
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <AppLayout>
      <Routes>
        {/* Edit/Manage mode routes - with header and breadcrumbs (must come before catch-all routes) */}
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:projectId" element={<ProjectWorkflowsPage />} />
        <Route path="/projects/:projectId/workflows/:workflowId" element={<WorkflowTasksPage />} />
        <Route path="/knowledge" element={<KnowledgeBasePage />} />
        {/* View/Check mode routes - no header, no breadcrumbs */}
        <Route path="/" element={<AllWorkflowsPage />} />
        <Route path="/:workflowId" element={<ViewWorkflowTasksPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}

export default App;

