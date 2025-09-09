import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export interface Config {
  general: {
    language: string;
    auto_save: boolean;
    auto_save_interval: number;
    backup_enabled: boolean;
    backup_interval: number;
    default_workspace: string | null;
    recent_files_limit: number;
  };
  editor: {
    theme: string;
    font_family: string;
    font_size: number;
    line_height: number;
    word_wrap: boolean;
    show_line_numbers: boolean;
    show_minimap: boolean;
    tab_size: number;
    vim_mode: boolean;
    spell_check: boolean;
    grammar_check: boolean;
    live_preview: boolean;
  };
  ui: {
    sidebar_width: number;
    preview_width: number;
    show_sidebar: boolean;
    show_preview: boolean;
    show_toolbar: boolean;
    show_status_bar: boolean;
    compact_mode: boolean;
    color_scheme: string;
  };
  export: {
    default_format: string;
    pdf_options: any;
    html_options: any;
    markdown_options: any;
  };
  writeflow: {
    cli_path: string | null;
    auto_sync: boolean;
    sync_interval: number;
    default_template: string | null;
    custom_commands: Record<string, any>;
  };
  ai_providers: {
    providers: Record<string, AIProvider>;
    default_provider: string | null;
  };
  mcp_servers: {
    servers: Record<string, MCPServer>;
  };
  writing_preferences: {
    language: string;
    writing_style: string;
    tone: string;
    target_audience: string;
    scenarios: Record<string, WritingScenario>;
    custom_prompts: Record<string, string>;
  };
  plugins: {
    enabled_plugins: string[];
    plugin_settings: Record<string, any>;
  };
  updated_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  description: string;
  projects_count: number;
  status: string;
  created_at: string;
  updated_at: string;
  last_accessed: string;
}

export interface SystemInfo {
  platform: string;
  arch: string;
  version: string;
}

export interface AIProvider {
  name: string;
  provider_type: string;
  api_key?: string;
  api_base?: string;
  model?: string;
  max_tokens?: number;
  temperature?: number;
  enabled: boolean;
}

export interface MCPServer {
  name: string;
  connection_type: 'Stdio' | 'SSE';
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  url?: string;
  enabled: boolean;
}

export interface WritingScenario {
  name: string;
  description: string;
  system_prompt: string;
  temperature: number;
  max_tokens: number;
}

interface Project {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  status: string;
  progress: number;
  documents_count: number;
  words_count: number;
  workspace_id: string;
  created_at: string;
  updated_at: string;
}

interface Document {
  id: string;
  title: string;
  content: string;
  content_type: string;
  status: string;
  word_count: number;
  char_count: number;
  project_id: string;
  folder_path: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
  last_accessed: string;
}

interface AppStore {
  // UI State
  sidebarCollapsed: boolean;
  focusMode: boolean;
  loading: boolean;

  // App Data
  config: Config | null;
  workspaces: Workspace[];
  systemInfo: SystemInfo | null;
  currentWorkspaceId: string | null;
  projects: Project[];
  recentProjects: Project[];
  recentDocuments: Document[];
  currentProject: Project | null;
  documents: Document[];

  // Computed getters
  currentWorkspace: Workspace | null;

  // Actions
  setSidebarCollapsed: (collapsed: boolean) => void;
  setFocusMode: (focusMode: boolean) => void;
  setLoading: (loading: boolean) => void;
  initializeApp: (data: { config: Config; workspaces: Workspace[]; systemInfo: SystemInfo }) => void;
  setCurrentWorkspace: (workspaceId: string) => void;
  setProjects: (projects: Project[]) => void;
  setCurrentProject: (project: Project) => void;
  setDocuments: (documents: Document[]) => void;
  updateConfig: (config: Partial<Config>) => void;
  loadProjectData: () => Promise<void>;
  refreshWorkspaces: () => Promise<void>;
  // Configuration management
  saveConfig: (config: Config) => Promise<void>;
  testAIProvider: (provider: AIProvider) => Promise<boolean>;
  testMCPServer: (server: MCPServer) => Promise<boolean>;
  resetConfig: () => Promise<void>;
}

export const useAppStore = create<AppStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial State
    sidebarCollapsed: false,
    focusMode: false,
    loading: true,
    config: null,
    workspaces: [],
    systemInfo: null,
    currentWorkspaceId: null,
    projects: [],
    recentProjects: [],
    recentDocuments: [],
    currentProject: null,
    documents: [],

    // Computed getters
    get currentWorkspace() {
      const state = get();
      return state.workspaces.find(w => w.id === state.currentWorkspaceId) || null;
    },

    // Actions
    setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
    setFocusMode: (focusMode) => set({ focusMode }),
    setLoading: (loading) => set({ loading }),
    
    initializeApp: (data) => set({
      config: data.config,
      workspaces: data.workspaces,
      systemInfo: data.systemInfo,
      currentWorkspaceId: data.workspaces[0]?.id || null,
      loading: false,
    }),

    setCurrentWorkspace: (workspaceId) => {
      set({ currentWorkspaceId: workspaceId });
      get().loadProjectData();
    },

    setProjects: (projects) => set({ 
      projects,
      recentProjects: projects.slice(0, 5),
    }),

    setCurrentProject: (project) => set({ currentProject: project }),

    setDocuments: (documents) => set({ documents }),

    updateConfig: (newConfig) => set((state) => ({
      config: state.config ? { ...state.config, ...newConfig } : null
    })),

    loadProjectData: async () => {
      try {
        const state = get();
        if (!state.currentWorkspaceId) return;

        // Import invoke dynamically to avoid issues during build
        const { invoke } = await import("@/lib/invokeCompat");
        
        const wid = state.currentWorkspaceId;
        const projects = await invoke("get_projects_by_workspace", {
          workspaceId: wid,
        } as any) as Project[];

        set({ 
          projects,
          recentProjects: projects.slice(0, 5),
        });

        // Load recent documents if we have projects
        if (projects.length > 0) {
          const documents = await invoke("get_documents_by_project", {
            projectId: projects[0].id
          }) as Document[];
          set({ recentDocuments: documents.slice(0, 5) });
        }
      } catch (error) {
        console.error("Failed to load project data:", error);
      }
    },

    refreshWorkspaces: async () => {
      try {
        const { invoke } = await import("@tauri-apps/api/core");
        const list = await invoke("get_workspaces") as Workspace[];
        set({ workspaces: list });
      } catch (error) {
        console.error("Failed to load workspaces:", error);
      }
    },

    saveConfig: async (config) => {
      try {
        const { invoke } = await import("@tauri-apps/api/core");
        await invoke("save_config", { config });
        set({ config });
      } catch (error) {
        console.error("Failed to save config:", error);
        throw error;
      }
    },

    testAIProvider: async (provider) => {
      try {
        const { invoke } = await import("@tauri-apps/api/core");
        return await invoke("test_ai_provider", { provider }) as boolean;
      } catch (error) {
        console.error("Failed to test AI provider:", error);
        return false;
      }
    },

    testMCPServer: async (server) => {
      try {
        const { invoke } = await import("@tauri-apps/api/core");
        return await invoke("test_mcp_server", { server }) as boolean;
      } catch (error) {
        console.error("Failed to test MCP server:", error);
        return false;
      }
    },

    resetConfig: async () => {
      try {
        const { invoke } = await import("@tauri-apps/api/core");
        const defaultConfig = await invoke("reset_config") as Config;
        set({ config: defaultConfig });
      } catch (error) {
        console.error("Failed to reset config:", error);
        throw error;
      }
    },
  }))
);
