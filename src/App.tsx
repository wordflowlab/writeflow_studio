import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import MainLayout from "@/components/layout/MainLayout";
import Dashboard from "@/pages/Dashboard";
import ProjectView from "@/pages/ProjectView";
import DocumentEditor from "@/pages/DocumentEditor";
import Settings from "@/pages/Settings";
import AIProviders from "@/pages/AIProviders";
import MCPServers from "@/pages/MCPServers";  
import WritingPreferences from "@/pages/WritingPreferences";
import EnvironmentPage from "@/pages/Environment";
import Agents from "@/pages/Agents";
import { ProjectsPage } from "@/pages/ProjectsPage";
import DocumentsPage from "@/pages/DocumentsPage";
import { WorkspacePage } from "@/pages/WorkspacePage";
import { useAppStore, Config, Workspace, SystemInfo } from "@/store/app";

function App() {
  const { initializeApp, setLoading, loadProjectData } = useAppStore();

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        
        // Load initial configuration
        const config = await invoke("get_config") as Config;
        const workspaces = await invoke("get_workspaces") as Workspace[];
        const systemInfo = await invoke("get_system_info") as SystemInfo;
        
        initializeApp({ config, workspaces, systemInfo });
        // 初始加载当前工作区的项目数据，避免进入页面空白
        await loadProjectData();
      } catch (error) {
        console.error("Failed to initialize app:", error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [initializeApp, setLoading]);

  return (
    <ThemeProvider defaultTheme="system" storageKey="writeflow-ui-theme">
      <div className="min-h-screen bg-background font-sans antialiased">
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="workspace" element={<WorkspacePage />} />
            <Route path="project/:projectId" element={<ProjectView />} />
            <Route path="settings" element={<Settings />} />
            <Route path="ai-providers" element={<AIProviders />} />
            <Route path="mcp-servers" element={<MCPServers />} />
            <Route path="writing-preferences" element={<WritingPreferences />} />
            <Route path="environment" element={<EnvironmentPage />} />
            <Route path="agents" element={<Agents />} />
          </Route>
          {/* 文档编辑器使用独立布局 */}
          <Route path="project/:projectId/editor" element={<DocumentEditor />} />
          <Route path="document/:documentId" element={<DocumentEditor />} />
          <Route path="editor/:projectId" element={<DocumentEditor />} />
          <Route path="editor/:projectId/:docId" element={<DocumentEditor />} />
        </Routes>
        <Toaster />
      </div>
    </ThemeProvider>
  );
}

export default App;
