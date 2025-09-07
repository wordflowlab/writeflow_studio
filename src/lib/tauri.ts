// Mock Tauri API for development
export const invoke = async (command: string, args?: Record<string, any>): Promise<any> => {
  console.log(`Mock invoke: ${command}`, args);
  
  switch (command) {
    case "get_config":
      return {
        general: {
          language: "zh-CN",
          auto_save: true,
          auto_save_interval: 30,
          backup_enabled: true,
          backup_interval: 10,
          default_workspace: null,
          recent_files_limit: 10,
        },
        editor: {
          theme: "default",
          font_family: "Monaco",
          font_size: 14,
          line_height: 1.5,
          word_wrap: true,
          show_line_numbers: true,
          show_minimap: false,
          tab_size: 2,
          vim_mode: false,
          spell_check: true,
          grammar_check: false,
          live_preview: true,
        },
        ui: {
          sidebar_width: 280,
          preview_width: 400,
          show_sidebar: true,
          show_preview: true,
          show_toolbar: true,
          show_status_bar: true,
          compact_mode: false,
          color_scheme: "Auto",
        },
        export: {
          default_format: "pdf",
          pdf_options: {
            page_size: "A4",
            margins: "2cm",
            include_toc: true,
            include_page_numbers: true,
            custom_css: null,
          },
          html_options: {
            include_css: true,
            standalone: true,
            custom_template: null,
          },
          markdown_options: {
            format: "CommonMark",
            include_metadata: true,
            line_ending: "LF",
          },
        },
        writeflow: {
          cli_path: null,
          auto_sync: false,
          sync_interval: 5,
          default_template: null,
          custom_commands: {},
        },
        plugins: {
          enabled_plugins: [],
          plugin_settings: {},
        },
        updated_at: new Date().toISOString(),
      };
      
    case "get_workspaces":
      return [
        {
          id: "workspace-1",
          name: "我的工作空间",
          description: "默认工作空间",
          projects_count: 3,
          status: "Active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_accessed: new Date().toISOString(),
        },
      ];
      
    case "get_system_info":
      return {
        platform: "darwin",
        arch: "x86_64",
        version: "0.1.0",
      };
      
    case "get_projects_by_workspace": {
      const workspaceId = args?.workspace_id || args?.workspaceId || "workspace-1";
      const allProjectsForWorkspace = [
        {
          id: "project-1",
          name: "示例项目",
          description: "这是一个示例项目",
          icon: "📝",
          color: "#3b82f6",
          status: "Active",
          progress: 75,
          documents_count: 5,
          words_count: 12000,
          workspace_id: "workspace-1",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "project-2",
          name: "技术文档",
          description: "技术文档项目",
          icon: "⚙️",
          color: "#10b981",
          status: "Active",
          progress: 45,
          documents_count: 8,
          words_count: 18500,
          workspace_id: "workspace-1",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
      return allProjectsForWorkspace.filter(p => p.workspace_id === workspaceId);
    }

    case "get_projects":
      return [
        {
          id: "project-1",
          name: "示例项目",
          description: "这是一个示例项目",
          icon: "📝",
          color: "#3b82f6",
          status: "Active",
          progress: 75,
          documents_count: 5,
          words_count: 12000,
          workspace_id: "workspace-1",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "project-2", 
          name: "技术文档",
          description: "技术文档项目",
          icon: "⚙️",
          color: "#10b981",
          status: "Active",
          progress: 45,
          documents_count: 8,
          words_count: 18500,
          workspace_id: "workspace-1",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "project-3",
          name: "个人博客",
          description: "我的个人技术博客项目",
          icon: "✍️",
          color: "#f59e0b",
          status: "Completed",
          progress: 100,
          documents_count: 12,
          words_count: 25000,
          workspace_id: "workspace-1",
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];
      
    case "get_project_by_id": {
      const projectId = args?.project_id;
      const projects = [
        {
          id: "project-1",
          name: "示例项目",
          description: "这是一个示例项目",
          icon: "📝",
          color: "#3b82f6",
          status: "Active",
          progress: 75,
          documents_count: 5,
          words_count: 12000,
          workspace_id: "workspace-1",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "project-2",
          name: "技术文档",
          description: "技术文档项目", 
          icon: "⚙️",
          color: "#10b981",
          status: "Active",
          progress: 45,
          documents_count: 8,
          words_count: 18500,
          workspace_id: "workspace-1",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
      return projects.find(p => p.id === projectId) || null;
    }
      
    case "get_project_stats":
      return {
        total: 3,
        active: 2,
        completed: 1,
        archived: 0,
        this_week: 1,
      };

    case "create_project": {
      const newProject = {
        id: `project-${Date.now()}`,
        name: args?.project_data?.name || "新项目",
        description: args?.project_data?.description || "",
        icon: args?.project_data?.icon || "📁",
        color: args?.project_data?.color || "#6b7280",
        status: "Active",
        progress: 0,
        documents_count: 0,
        words_count: 0,
        workspace_id: args?.project_data?.workspace_id || "workspace-1",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      console.log("Created new project:", newProject);
      return newProject;
    }
      
    case "update_project":
      console.log("Updated project:", args?.project_id, args?.project_data);
      return null;
      
    case "delete_project":
      console.log("Deleted project:", args?.project_id);
      return null;
      
    case "get_documents_by_project":
      return [
        {
          id: "doc-1",
          title: "项目介绍",
          content: "# 项目介绍\n\n这是一个示例文档。\n\n## 功能特性\n\n- 支持 Markdown 编辑\n- 实时预览\n- 项目管理\n\n## 开始使用\n\n1. 创建新项目\n2. 添加文档\n3. 开始写作",
          content_type: "Markdown",
          status: "Draft",
          word_count: 45,
          char_count: 120,
          project_id: args?.project_id || args?.projectId || "project-1",
          folder_path: null,
          tags: ["介绍", "文档"],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_accessed: new Date().toISOString(),
        },
        {
          id: "doc-2",
          title: "用户手册",
          content: "# 用户手册\n\n## 安装\n\n请按照以下步骤安装：\n\n1. 下载安装包\n2. 运行安装程序\n3. 完成配置",
          content_type: "Markdown",
          status: "InProgress",
          word_count: 32,
          char_count: 85,
          project_id: args?.project_id || args?.projectId || "project-1",
          folder_path: null,
          tags: ["手册", "安装"],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_accessed: new Date().toISOString(),
        },
      ];
    
    case "create_document": {
      const d = args?.document_data || args;
      const newDoc = {
        id: `doc-${Date.now()}`,
        title: d?.title || "新文档",
        content: d?.content ?? "",
        project_id: d?.project_id || "project-1",
        folder_path: d?.folder_path || null,
        content_type: "Markdown",
        status: "Draft",
        word_count: (d?.content || "").length,
        char_count: (d?.content || "").length,
        tags: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_accessed: new Date().toISOString(),
      };
      return newDoc;
    }
      
    case "save_config":
    case "update_document_content":
      return null;
      
    default:
      throw new Error(`Unknown command: ${command}`);
  }
};
