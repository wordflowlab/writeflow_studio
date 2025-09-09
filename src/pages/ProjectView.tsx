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
        documentData: {
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
      <div className="flex justify-center items-center h-full">
        <div className="text-center">
          <h2 className="mb-2 text-lg font-semibold">项目未找到</h2>
          <p className="text-muted-foreground">请检查项目ID是否正确</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-auto p-6 space-y-6 h-full">
      {/* Project Header */}
      <div className="flex justify-between items-center">
        <div className="flex gap-4 items-center">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: currentProject.color }}
          />
          <div>
            <h1 className="flex gap-2 items-center text-2xl font-bold">
              <FolderIcon className="w-6 h-6" />
              {currentProject.name}
            </h1>
            <p className="text-muted-foreground">{currentProject.description}</p>
          </div>
        </div>

        <Button onClick={handleCreateDocument} className="flex gap-2 items-center">
          <PlusIcon className="w-4 h-4" />
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
            <p className="mt-1 text-xs text-muted-foreground">个文档</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">总字数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentProject.words_count.toLocaleString()}</div>
            <p className="mt-1 text-xs text-muted-foreground">字</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">项目进度</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentProject.progress}%</div>
            <div className="mt-2 w-full h-2 rounded-full bg-muted">
              <div 
                className="h-2 rounded-full transition-all bg-primary"
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
            <div className="py-8 text-center text-muted-foreground">
              加载中...
            </div>
          ) : documents.length > 0 ? (
            <div className="space-y-3">
              {documents.map((document) => (
                <Link
                  key={document.id}
                  to={`/editor/${currentProject.id}/${document.id}`}
                  className="flex gap-3 items-center p-4 rounded-md border transition-colors hover:bg-accent/50"
                >
                  <DocumentTextIcon className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <div className="mb-1 text-sm font-medium">{document.title}</div>
                    <div className="mb-2 text-xs text-muted-foreground line-clamp-2">
                      {document.content.substring(0, 100)}
                      {document.content.length > 100 ? '...' : ''}
                    </div>
                    <div className="flex gap-4 items-center text-xs text-muted-foreground">
                      <span>{document.word_count} 字</span>
                      <span className="px-2 py-1 rounded-full bg-muted">
                        {document.status}
                      </span>
                      <span>{formatDate(document.updated_at)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <DocumentTextIcon className="mx-auto mb-4 w-12 h-12 text-muted-foreground" />
              <h3 className="mb-2 font-medium">暂无文档</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                开始创建第一个文档来记录您的想法
              </p>
              <Button onClick={handleCreateDocument}>
                <PlusIcon className="mr-2 w-4 h-4" />
                创建文档
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
