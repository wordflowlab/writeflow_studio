import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { invoke } from "@/lib/invokeCompat";
import { useAppStore } from "@/store/app";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import MarkdownEditor, { MarkdownEditorHandle } from "@/components/editor/MarkdownEditor";
import MarkdownPreview from "@/components/editor/MarkdownPreview";
import { 
  FolderOpen, 
  FileText, 
  Plus, 
  Search, 
  MoreHorizontal,
  Eye,
  Sparkles,
  Bold,
  Italic,
  Link,
  Code,
  Save,
  Clock
} from "lucide-react";

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

// 自定义 debounce 工具函数
function debounce<T extends (...args: any[]) => any>(
  func: T, 
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// 从Markdown内容中提取第一个一级标题
function extractTitleFromContent(content: string): string | null {
  if (!content) return null;
  
  const firstLine = content.split('\n')[0].trim();
  const match = firstLine.match(/^#\s*(.+)/);
  
  if (match) {
    const title = match[1].trim();
    if (title.length > 0) {
      return title;
    }
  }
  
  return null;
}

export default function DocumentsPage() {
  
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { 
    currentWorkspace,
    workspaces,
    currentWorkspaceId,
    setCurrentWorkspace,
    projects,
    setProjects,
    loadProjectData 
  } = useAppStore();

  // 状态管理
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [content, setContent] = useState("");
  const [isModified, setIsModified] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // 搜索和筛选
  const [documentSearch, setDocumentSearch] = useState("");
  const [projectSearch, setProjectSearch] = useState("");

  const editorHandle = useRef<MarkdownEditorHandle>(null);

  // 文档大纲 - 只显示二级标题及以下（一级标题作为文档标题，不在大纲显示）
  const outline = useMemo(() => {
    const lines = content.split(/\n/);
    const items: { level: number; text: string; line: number }[] = [];
    lines.forEach((l, i) => {
      const m = l.match(/^(#{2,6})\s+(.+)$/);  // 只匹配 ## 到 ###### 
      if (m) items.push({ level: m[1].length, text: m[2], line: i + 1 });
    });
    return items;
  }, [content]);

  // 筛选后的文档和项目
  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => 
      doc.title.toLowerCase().includes(documentSearch.toLowerCase())
    );
  }, [documents, documentSearch]);

  const filteredProjects = useMemo(() => {
    return projects.filter(project => 
      project.name.toLowerCase().includes(projectSearch.toLowerCase())
    );
  }, [projects, projectSearch]);

  // 自动保存函数
  const debouncedSave = useCallback(
    debounce(async (documentId: string, content: string) => {
      try {
        setIsSaving(true);
        await invoke("update_document_content", {
          documentId: documentId,
          content,
        });
        setIsModified(false);
        
        // 更新文档的修改时间
        if (selectedDocument) {
          setSelectedDocument(prev => prev ? {
            ...prev,
            updated_at: new Date().toISOString(),
            word_count: content.split(/\s+/).filter(word => word.length > 0).length
          } : null);
        }
      } catch (error) {
        console.error("Failed to save document:", error);
        toast({
          title: "保存失败",
          description: "文档保存时出现错误",
          variant: "destructive",
        });
      } finally {
        setIsSaving(false);
      }
    }, 2000),
    [selectedDocument]
  );

  // 加载工作区数据
  useEffect(() => {
    if (!currentWorkspaceId) return;
    loadProjectData();
  }, [currentWorkspaceId, loadProjectData]);

  // 从URL参数初始化选择的项目和文档
  useEffect(() => {
    const projectId = searchParams.get('project');
    const documentId = searchParams.get('document');
    
    if (projectId && projects.length > 0) {
      const project = projects.find(p => p.id === projectId);
      if (project && project !== selectedProject) {
        handleProjectSelect(project);
      }
    }
    
    if (documentId && documents.length > 0) {
      const document = documents.find(d => d.id === documentId);
      if (document && document !== selectedDocument) {
        handleDocumentSelect(document);
      }
    }
  }, [searchParams, projects, documents]);

  // 工作区选择处理
  const handleWorkspaceSelect = (workspaceId: string) => {
    setCurrentWorkspace(workspaceId);
    setSelectedProject(null);
    setSelectedDocument(null);
    setDocuments([]);
    setContent("");
    setSearchParams({});
  };

  // 项目选择处理
  const handleProjectSelect = async (project: Project) => {
    if (project === selectedProject) return;

    try {
      setLoading(true);
      setSelectedProject(project);
      setSelectedDocument(null);
      setContent("");

      // 加载项目文档
      const projectDocuments = await invoke("get_documents_by_project", {
        projectId: project.id
      }) as Document[];

      setDocuments(projectDocuments);
      
      // 更新URL参数
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.set('project', project.id);
        newParams.delete('document');
        return newParams;
      });

    } catch (error) {
      console.error("Failed to load project documents:", error);
      toast({
        title: "加载失败",
        description: "无法加载项目文档",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // 文档选择处理
  const handleDocumentSelect = (document: Document) => {
    if (document === selectedDocument) return;

    // 如果有未保存的修改，先保存
    if (isModified && selectedDocument) {
      debouncedSave(selectedDocument.id, content);
    }

    setSelectedDocument(document);
    setContent(document.content);
    setIsModified(false);

    // 更新URL参数
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('document', document.id);
      return newParams;
    });
  };

  // 内容变化处理
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setIsModified(true);
    
    // 标题同步逻辑
    if (selectedDocument) {
      const extractedTitle = extractTitleFromContent(newContent);
      
      // 如果提取到新标题且与当前标题不同，立即更新UI
      if (extractedTitle && extractedTitle !== selectedDocument.title) {
        // 更新选中的文档状态
        const updatedDocument = { ...selectedDocument, title: extractedTitle };
        setSelectedDocument(updatedDocument);
        
        // 更新文档列表中的对应项
        setDocuments(prevDocs => 
          prevDocs.map(doc => {
            if (doc.id === selectedDocument.id) {
              return { ...doc, title: extractedTitle };
            }
            return doc;
          })
        );
      }
      
      // 自动保存
      debouncedSave(selectedDocument.id, newContent);
    }
  };

  // 创建新文档
  const handleCreateDocument = async () => {
    if (!selectedProject) return;
    
    try {
      const newDocument = await invoke("create_document", {
        documentData: {
          projectId: selectedProject.id,
          title: "新文档",
          content: "# 新文档\n\n开始编写内容...",
          contentType: "Markdown",
        }
      }) as Document;
      
      setDocuments(prev => [...prev, newDocument]);
      handleDocumentSelect(newDocument);
      
      toast({
        title: "创建成功",
        description: "新文档已创建",
      });
    } catch (error: any) {
      console.error("Failed to create document:", error);
      const msg = typeof error === 'string' ? error : (error?.message || "无法创建新文档");
      toast({
        title: "创建失败",
        description: `${msg} （请检查项目是否存在、字段是否匹配）`,
        variant: "destructive",
      });
    }
  };

  // 手动保存
  const handleManualSave = async () => {
    if (!selectedDocument || !isModified) return;
    
    try {
      setIsSaving(true);
      await invoke("update_document_content", {
        documentId: selectedDocument.id,
        content,
      });
      setIsModified(false);
      
      toast({
        title: "保存成功",
        description: "文档已保存",
      });
    } catch (error) {
      console.error("Failed to save document:", error);
      toast({
        title: "保存失败",
        description: "文档保存时出现错误",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // 如果没有工作区，显示选择提示
  if (!currentWorkspaceId || workspaces.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex gap-2 items-center">
              <FolderOpen className="w-5 h-5" />
              选择工作区
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              请先创建或选择一个工作区来开始文档编辑
            </p>
            <Button onClick={() => navigate('/workspace')} className="w-full">
              管理工作区
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* 左侧：项目和文档树 */}
      <div className="flex flex-col w-80 border-r border-border bg-muted/20">
        {/* 工作区选择 */}
        <div className="p-4 border-b border-border bg-background">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">当前工作区</span>
            </div>
            <Select value={currentWorkspaceId || ""} onValueChange={handleWorkspaceSelect}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="选择工作区" />
              </SelectTrigger>
              <SelectContent>
                {workspaces.map((workspace) => (
                  <SelectItem key={workspace.id} value={workspace.id}>
                    {workspace.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 项目列表 */}
        <div className="p-4 border-b border-border bg-background">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">项目</span>
              <span className="text-xs text-muted-foreground">
                {filteredProjects.length} 个项目
              </span>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索项目..."
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="overflow-auto space-y-1 max-h-32">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => handleProjectSelect(project)}
                  className={`
                    flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors
                    ${selectedProject?.id === project.id 
                      ? 'bg-primary/10 text-primary' 
                      : 'hover:bg-muted'
                    }
                  `}
                >
                  <div 
                    className="flex overflow-hidden flex-shrink-0 justify-center items-center w-6 h-6 text-xs rounded"
                    style={{ backgroundColor: project.color + '20', color: project.color }}
                  >
                    {project.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{project.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {project.documents_count} 个文档
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 文档树 */}
        <div className="flex flex-col flex-1">
          <div className="p-4 border-b border-border bg-background">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">文档</span>
                {selectedProject && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCreateDocument}
                    className="p-0 w-6 h-6"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                )}
              </div>
              {selectedProject && (
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索文档..."
                    value={documentSearch}
                    onChange={(e) => setDocumentSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="overflow-auto flex-1">
            {!selectedProject ? (
              <div className="p-4 text-center text-muted-foreground">
                <FileText className="mx-auto mb-2 w-8 h-8 opacity-50" />
                <p className="text-sm">选择项目查看文档</p>
              </div>
            ) : loading ? (
              <div className="p-4 text-center text-muted-foreground">
                <p className="text-sm">加载中...</p>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <FileText className="mx-auto mb-2 w-8 h-8 opacity-50" />
                <p className="mb-2 text-sm">暂无文档</p>
                <Button size="sm" onClick={handleCreateDocument}>
                  <Plus className="mr-2 w-4 h-4" />
                  创建文档
                </Button>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {filteredDocuments.map((document) => (
                  <div
                    key={document.id}
                    onClick={() => handleDocumentSelect(document)}
                    className={`
                      flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors group
                      ${selectedDocument?.id === document.id 
                        ? 'bg-primary/10 text-primary' 
                        : 'hover:bg-muted'
                      }
                    `}
                  >
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{document.title}</div>
                      <div className="text-xs truncate text-muted-foreground">
                        {document.word_count} 字 • {new Date(document.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                    {isModified && selectedDocument?.id === document.id && (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 中间：编辑器主区域 */}
      <div className="flex flex-col flex-1">
        {selectedDocument ? (
          <>
            {/* 工具栏 */}
            <div className="flex justify-between items-center px-4 h-14 border-b border-border bg-background">
              <div className="flex gap-4 items-center min-w-0">
                <div className="flex gap-2 items-center min-w-0">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium truncate">{selectedDocument.title}</span>
                  {isModified && <Badge variant="secondary" className="text-xs">未保存</Badge>}
                  {isSaving && <Badge variant="outline" className="text-xs">保存中</Badge>}
                </div>
                <Separator orientation="vertical" className="h-6" />
                <div className="flex gap-1 items-center">
                  <Button variant="ghost" size="sm" title="加粗">
                    <Bold className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" title="斜体">
                    <Italic className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" title="链接">
                    <Link className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" title="代码">
                    <Code className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                  className={showPreview ? "bg-primary/10" : ""}
                >
                  <Eye className="mr-2 w-4 h-4" />
                  预览
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleManualSave}
                  disabled={!isModified || isSaving}
                >
                  <Save className="mr-2 w-4 h-4" />
                  保存
                </Button>
                <div className="text-xs text-muted-foreground">
                  {selectedDocument.word_count} 字
                </div>
              </div>
            </div>

            {/* 编辑器内容区 */}
            <div className="flex flex-1">
              {/* Markdown 编辑器 */}
              <div className={`${showPreview ? 'w-1/2 border-r border-border' : 'w-full'}`}>
                <MarkdownEditor
                  ref={editorHandle}
                  value={content}
                  onChange={handleContentChange}
                  placeholder="开始写作..."
                  className="h-full"
                />
              </div>

              {/* 预览面板 */}
              {showPreview && (
                <div className="w-1/2 bg-muted/20">
                  <div className="overflow-auto p-4 h-full">
                    <MarkdownPreview content={content} />
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-1 justify-center items-center">
            <div className="text-center">
              <FileText className="mx-auto mb-4 w-12 h-12 opacity-50 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">选择文档开始编辑</h3>
              <p className="mb-4 text-muted-foreground">
                {!selectedProject 
                  ? "请先从左侧选择一个项目" 
                  : "从左侧文档树中选择一个文档"
                }
              </p>
              {selectedProject && (
                <Button onClick={handleCreateDocument}>
                  <Plus className="mr-2 w-4 h-4" />
                  创建新文档
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 右侧：大纲和AI助手 */}
      <div className="flex flex-col w-72 border-l border-border bg-muted/20">
        {/* 文档大纲 */}
        <div className="flex-1">
          <div className="p-4 border-b border-border bg-background">
            <h3 className="text-sm font-medium">文档大纲</h3>
          </div>
          <div className="overflow-auto p-2">
            {outline.length === 0 ? (
              <div className="p-4 text-sm text-center text-muted-foreground">
                暂无大纲
              </div>
            ) : (
              outline.map((heading, index) => (
                <button
                  key={`${heading.line}-${index}`}
                  className="block p-2 w-full text-sm text-left rounded-lg transition-colors hover:bg-muted"
                  style={{ paddingLeft: `${(heading.level - 1) * 12 + 8}px` }}
                  onClick={() => editorHandle.current?.scrollToLine(heading.line)}
                >
                  {heading.text}
                </button>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}