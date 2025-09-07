import { Routes, Route } from 'react-router-dom';
import { DashboardPage } from '@/pages/DashboardPage';
import { ProjectsPage } from '@/pages/ProjectsPage';
import { WorkspacePage } from '@/pages/WorkspacePage';
import { SettingsPage } from '@/pages/SettingsPage';
import ProjectView from '@/pages/ProjectView';
import DocumentEditor from '@/pages/DocumentEditor';
import AIProviders from '@/pages/AIProviders';
import MCPServers from '@/pages/MCPServers';
import WritingPreferences from '@/pages/WritingPreferences';
import EnvironmentPage from '@/pages/Environment';
import Agents from '@/pages/Agents';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/projects" element={<ProjectsPage />} />
      <Route path="/project/:projectId" element={<ProjectView />} />
      <Route path="/editor/:projectId" element={<DocumentEditor />} />
      <Route path="/ai-providers" element={<AIProviders />} />
      <Route path="/mcp-servers" element={<MCPServers />} />
      <Route path="/writing-preferences" element={<WritingPreferences />} />
      <Route path="/environment" element={<EnvironmentPage />} />
      <Route path="/agents" element={<Agents />} />
      <Route path="/workspace" element={<WorkspacePage />} />
      <Route path="/settings" element={<SettingsPage />} />
      
      {/* 默认重定向到仪表板 */}
      <Route path="*" element={<DashboardPage />} />
    </Routes>
  );
}
