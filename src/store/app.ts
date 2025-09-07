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
        const { invoke } = await import("@tauri-apps/api/core");
        
        const projects = await invoke("get_projects_by_workspace", {
          workspace_id: state.currentWorkspaceId
        }) as Project[];

        set({ 
          projects,
          recentProjects: projects.slice(0, 5),
        });

        // Load recent documents if we have projects
        if (projects.length > 0) {
          const documents = await invoke("get_documents_by_project", {
            project_id: projects[0].id
          }) as Document[];
          set({ recentDocuments: documents.slice(0, 5) });
        }
      } catch (error) {
        console.error("Failed to load project data:", error);
      }
    },
  }))
);