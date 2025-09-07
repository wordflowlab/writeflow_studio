import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { invoke } from "@/lib/tauri";
import {
  DocumentTextIcon,
  PlusIcon,
  FolderIcon,
} from "@heroicons/react/24/outline";
import { useAppStore } from "@/store/app";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export default function ProjectView() {
  const { projectId } = useParams<{ projectId: string }>();
  const { 
    projects, 
    currentProject, 
    setCurrentProject, 
    documents, 
    setDocuments 
  } = useAppStore();
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (projectId && projects.length > 0) {
      const project = projects.find(p => p.id === projectId);
      if (project) {
        setCurrentProject(project);
        loadDocuments(project.id);
      }
    }
  }, [projectId, projects, setCurrentProject]);

  const loadDocuments = async (id: string) => {
    try {
      setLoading(true);
      const projectDocuments = await invoke("get_documents_by_project", {
        projectId: id,
      });
      setDocuments(projectDocuments);
    } catch (error) {
      console.error("Failed to load documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDocument = async () => {
    if (!currentProject) return;
    try {
      await invoke("create_document", {
        document_data: {
          project_id: currentProject.id,
          title: "新文档",
          content: "",
          folder_path: null,
        },
      });
      // 打开编辑器
      window.location.assign(`/editor/${currentProject.id}`);
    } catch (e) {
      console.error(e);
      window.location.assign(`/editor/${currentProject.id}`);
    }
  };

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">项目未找到</h2>
          <p className="text-muted-foreground">请检查项目ID是否正确</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-6 space-y-6">
      {/* Project Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: currentProject.color }}
          />
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FolderIcon className="h-6 w-6" />
              {currentProject.name}
            </h1>
            <p className="text-muted-foreground">{currentProject.description}</p>
          </div>
        </div>

        <Button onClick={handleCreateDocument} className="flex items-center gap-2">
          <PlusIcon className="h-4 w-4" />
          新建文档
        </Button>
      </div>

      {/* Project Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">文档数量</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentProject.documents_count}</div>
            <p className="text-xs text-muted-foreground mt-1">个文档</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">总字数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentProject.words_count.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">字</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">项目进度</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentProject.progress}%</div>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${currentProject.progress}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>项目文档</CardTitle>
          <CardDescription>
            {documents.length > 0 
              ? `共 ${documents.length} 个文档` 
              : "暂无文档"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              加载中...
            </div>
          ) : documents.length > 0 ? (
            <div className="space-y-3">
              {documents.map((document) => (
                <Link
                  key={document.id}
                  to={`/editor/${currentProject.id}`}
                  className="flex items-center gap-3 p-4 rounded-md border hover:bg-accent/50 transition-colors"
                >
                  <DocumentTextIcon className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm mb-1">{document.title}</div>
                    <div className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {document.content.substring(0, 100)}
                      {document.content.length > 100 ? '...' : ''}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{document.word_count} 字</span>
                      <span className="px-2 py-1 bg-muted rounded-full">
                        {document.status}
                      </span>
                      <span>{formatDate(document.updated_at)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <DocumentTextIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">暂无文档</h3>
              <p className="text-muted-foreground text-sm mb-4">
                开始创建第一个文档来记录您的想法
              </p>
              <Button onClick={handleCreateDocument}>
                <PlusIcon className="h-4 w-4 mr-2" />
                创建文档
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
