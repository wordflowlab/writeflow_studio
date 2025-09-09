import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FolderIcon,
  DocumentTextIcon,
  PlusIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { useAppStore } from "@/store/app";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { ProjectCreateDialog } from "@/components/project/ProjectCreateDialog";
import { invoke } from "@/lib/tauri";

interface Stats {
  totalProjects: number;
  totalDocuments: number;
  totalWords: number;
  recentActivity: number;
}

export default function Dashboard() {
  const {
    currentWorkspace,
    projects,
    recentProjects,
    recentDocuments,
    setCurrentProject,
    setProjects,
  } = useAppStore();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState<Stats>({
    totalProjects: 0,
    totalDocuments: 0,
    totalWords: 0,
    recentActivity: 0,
  });
  const [showCreateProject, setShowCreateProject] = useState(false);

  useEffect(() => {
    if (currentWorkspace) {
      loadDashboardStats();
    }
  }, [currentWorkspace]);

  const loadDashboardStats = async () => {
    try {
      const totalWords = projects.reduce((sum, project) => sum + project.words_count, 0);
      const totalDocs = projects.reduce((sum, project) => sum + project.documents_count, 0);
      
      setStats({
        totalProjects: projects.length,
        totalDocuments: totalDocs,
        totalWords,
        recentActivity: recentDocuments.length + recentProjects.length,
      });
    } catch (error) {
      console.error("Failed to load dashboard stats:", error);
    }
  };

  const handleCreateProject = async () => {
    setShowCreateProject(true);
  };

  const handleCreateDocument = async () => {
    // 在当前（或第一个）项目中创建文档并打开编辑器
    const targetProject = projects[0];
    if (!targetProject) return;
    try {
      await invoke("create_document", {
        documentData: {
          project_id: targetProject.id,
          title: "新文档",
          content: "",
          folder_path: null,
        },
      });
      navigate(`/editor/${targetProject.id}`);
    } catch (e) {
      console.error("Create document failed", e);
      navigate(`/editor/${targetProject.id}`); // 仍然导航到编辑器
    }
  };

  if (!currentWorkspace) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-center">
          <h2 className="mb-2 text-lg font-semibold">没有选择工作空间</h2>
          <p className="text-muted-foreground">请在侧边栏中选择一个工作空间</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-auto p-6 space-y-6 h-full">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">欢迎回来！</h1>
        <p className="text-muted-foreground">
          正在使用工作空间: <span className="font-medium">{currentWorkspace.name}</span>
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">总项目数</CardTitle>
            <FolderIcon className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">活跃项目</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">总文档数</CardTitle>
            <DocumentTextIcon className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDocuments}</div>
            <p className="text-xs text-muted-foreground">所有文档</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">总字数</CardTitle>
            <DocumentTextIcon className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalWords.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">已写字数</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">最近活动</CardTitle>
            <ClockIcon className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentActivity}</div>
            <p className="text-xs text-muted-foreground">最近使用</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <Button onClick={handleCreateProject} className="flex gap-2 items-center">
          <PlusIcon className="w-4 h-4" />
          新建项目
        </Button>
        <Button variant="outline" onClick={handleCreateDocument} className="flex gap-2 items-center">
          <PlusIcon className="w-4 h-4" />
          新建文档
        </Button>
      </div>

      {/* Recent Projects and Documents */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <CardTitle>最近项目</CardTitle>
            <CardDescription>您最近访问的项目</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentProjects.length > 0 ? (
              recentProjects.slice(0, 5).map((project) => (
                <div
                  key={project.id}
                  className="flex gap-3 items-center p-3 rounded-md transition-colors cursor-pointer hover:bg-accent/50"
                  onClick={() => setCurrentProject(project)}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: project.color }}
                  />
                  <FolderIcon className="w-4 h-4" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{project.name}</div>
                    <div className="text-xs truncate text-muted-foreground">
                      {project.documents_count} 个文档 · {project.words_count} 字
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(project.updated_at)}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-4 text-center text-muted-foreground">
                暂无最近项目
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Documents */}
        <Card>
          <CardHeader>
            <CardTitle>最近文档</CardTitle>
            <CardDescription>您最近编辑的文档</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentDocuments.length > 0 ? (
              recentDocuments.slice(0, 5).map((document) => (
                <Link
                  key={document.id}
                  to={`/editor/${document.project_id}/${document.id}`}
                  className="flex gap-3 items-center p-3 rounded-md transition-colors hover:bg-accent/50"
                >
                  <DocumentTextIcon className="w-4 h-4" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{document.title}</div>
                    <div className="text-xs truncate text-muted-foreground">
                      {document.word_count} 字 · {document.status}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(document.updated_at)}
                  </div>
                </Link>
              ))
            ) : (
              <div className="py-4 text-center text-muted-foreground">
                暂无最近文档
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Project Dialog */}
      <ProjectCreateDialog
        open={showCreateProject}
        onOpenChange={setShowCreateProject}
        workspaceId={currentWorkspace?.id}
        onProjectCreated={(project) => {
          setProjects([project, ...projects]);
        }}
      />
    </div>
  );
}

// 附加：创建项目对话框（渲染在页面底部以便管理状态）
export function DashboardWithDialogs() {
  return null;
}
