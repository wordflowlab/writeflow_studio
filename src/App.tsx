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
import { ProjectsPage } from "@/pages/ProjectsPage";
import { WorkspacePage } from "@/pages/WorkspacePage";
import { useAppStore, Config, Workspace, SystemInfo } from "@/store/app";

function App() {
  const { initializeApp, setLoading } = useAppStore();

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        
        // Load initial configuration
        const config = await invoke("get_config") as Config;
        const workspaces = await invoke("get_workspaces") as Workspace[];
        const systemInfo = await invoke("get_system_info") as SystemInfo;
        
        initializeApp({ config, workspaces, systemInfo });
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
            <Route path="workspace" element={<WorkspacePage />} />
            <Route path="project/:projectId" element={<ProjectView />} />
            <Route path="settings" element={<Settings />} />
            <Route path="ai-providers" element={<AIProviders />} />
            <Route path="mcp-servers" element={<MCPServers />} />
            <Route path="writing-preferences" element={<WritingPreferences />} />
          </Route>
          {/* 文档编辑器使用独立布局 */}
          <Route path="project/:projectId/editor" element={<DocumentEditor />} />
          <Route path="document/:documentId" element={<DocumentEditor />} />
        </Routes>
        <Toaster />
      </div>
    </ThemeProvider>
  );
}

export default App;