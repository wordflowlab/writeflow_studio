import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { invoke } from "@/lib/invokeCompat";
import { useAppStore } from "@/store/app";
import MarkdownEditor, { MarkdownEditorHandle } from "@/components/editor/MarkdownEditor";
import DocumentTree from "@/components/document/DocumentTree";
import ImportExportDialog from "@/components/document/ImportExportDialog";
import { useToast } from "@/components/ui/use-toast";
import { Document, CreateDocumentData, createDefaultDocumentData } from "@/types/document";
import { ProjectIcon } from "@/components/ui/project-icon";

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


export default function DocumentEditor() {
  const { projectId, docId } = useParams<{ projectId: string; docId?: string }>();
  const navigate = useNavigate();
  const { 
    currentProject,
    setCurrentProject,
    projects,
  } = useAppStore();
  const { toast } = useToast();
  
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [content, setContent] = useState("");
  const [isModified, setIsModified] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showImportExportDialog, setShowImportExportDialog] = useState(false);
  const [importExportMode, setImportExportMode] = useState<'import' | 'export'>('export');
  const [docFilter, setDocFilter] = useState("");
  const [showOutline, setShowOutline] = useState(true);
  const [debugMode, setDebugMode] = useState(false);
  const editorHandle = useRef<MarkdownEditorHandle>(null);

  // 调试：监控 selectedDocument.title 变化
  useEffect(() => {
    console.log('📊 selectedDocument.title 已更新:', selectedDocument?.title);
  }, [selectedDocument?.title]);

  const outline = useMemo(() => {
    const lines = content.split(/\n/);
    const items: { level: number; text: string; line: number }[] = [];
    lines.forEach((l, i) => {
      const m = l.match(/^(#{1,6})\s+(.+)$/);
      if (m) items.push({ level: m[1].length, text: m[2], line: i + 1 });
    });
    return items;
  }, [content]);

  // 自动保存函数
  const debouncedSave = useCallback(
    debounce(async (documentId: string, content: string, title: string) => {
      console.log('💾 开始执行防抖保存');
      console.log('📋 保存参数 - documentId:', documentId, 'title:', title, 'content长度:', content.length);
      
      if (!selectedDocument) {
        console.warn("⚠️ 没有选中的文档，无法保存");
        return;
      }
      
      try {
        console.log('⏳ 设置保存状态为loading');
        setIsSaving(true);
        
        // 准备更新的文档数据，确保所有必需字段都存在
        const updatedDocument = {
          ...selectedDocument,
          title,
          content,
          word_count: content.split(/\s+/).filter(word => word.length > 0).length,
          char_count: content.length,
          updated_at: new Date().toISOString(),
          // 确保 metadata 字段存在且完整
          metadata: {
            author: selectedDocument.metadata?.author || undefined,
            language: selectedDocument.metadata?.language || "zh-CN",
            reading_time: Math.ceil(content.split(/\s+/).filter(word => word.length > 0).length / 200), // 假设每分钟200字
            export_formats: selectedDocument.metadata?.export_formats || ["markdown", "html", "pdf"],
            version: (selectedDocument.metadata?.version || 0) + 1
          }
        };

        console.log("📤 准备发送到后端的文档数据:", updatedDocument);

        console.log('🚀 调用后端 update_document 命令');
        await invoke("update_document", {
          document_id: documentId,
          document_data: updatedDocument,
        });
        console.log('✅ 后端调用成功');
        
        // 更新本地状态
        console.log('🔄 更新本地selectedDocument状态');
        setSelectedDocument(updatedDocument);
        setIsModified(false);
        
        // 同步更新文档列表
        console.log('📋 更新文档列表中的对应项');
        setDocuments(prevDocuments => 
          prevDocuments.map(doc => {
            if (doc.id === documentId) {
              console.log('🆔 找到匹配的文档，更新标题:', doc.title, '→', updatedDocument.title);
              return updatedDocument;
            }
            return doc;
          })
        );
        
        console.log("🎉 文档保存完全成功！标题应该已更新");
      } catch (error) {
        console.error("❌ 保存文档失败:", error);
        console.error("🔍 详细错误信息:", error);
        
        // 显示错误提示
        toast({ 
          title: "保存失败", 
          description: `文档保存时出现错误: ${error}`, 
          variant: "destructive" 
        });
      } finally {
        console.log('🏁 保存流程结束，重置loading状态');
        setIsSaving(false);
      }
    }, 500),
    [selectedDocument, toast]
  );


  // 加载项目文档
  useEffect(() => {
    const loadDocuments = async () => {
      if (!projectId) return;
      
      try {
        setLoading(true);
        const projectDocuments = await invoke("get_documents_by_project", {
          projectId: projectId
        }) as Document[];
        
        setDocuments(projectDocuments);
        
        // 只在初始加载时自动选择文档
        if (projectDocuments.length > 0 && !selectedDocument) {
          const target = (docId && projectDocuments.find(d => d.id === docId)) || projectDocuments[0];
          if (target) {
            handleDocumentSelect(target);
          }
        }
      } catch (error) {
        console.error("Failed to load documents:", error);
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();
  }, [projectId, docId]); // 保持简洁的依赖列表

  // 文档选择处理
  const handleDocumentSelect = (document: Document) => {
    // 如果有未保存的修改，先保存
    if (isModified && selectedDocument) {
      debouncedSave(selectedDocument.id, content, selectedDocument.title);
    }
    
    setSelectedDocument(document);
    setContent(document.content);
    setIsModified(false);
  };

  // 内容变化处理
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setIsModified(true);
    
    // 自动保存
    if (selectedDocument) {
      debouncedSave(selectedDocument.id, newContent, selectedDocument.title);
    }
  };

  // 创建新文档
  const handleDocumentCreate = async (parentId?: string) => {
    if (!currentProject) {
      toast({ 
        title: "请先选择项目", 
        description: "在左侧项目列表中选择一个项目后再创建文档", 
        variant: "destructive" 
      });
      return;
    }
    
    let documentData: CreateDocumentData | null = null;
    try {
      setLoading(true);
      const folderPath = parentId?.startsWith('folder-') ? parentId.replace('folder-', '') : undefined;
      documentData = createDefaultDocumentData(
        currentProject.id,
        "新文档",
        "# 新文档\n\n开始写作...",
        folderPath
      );
      
      console.log('Creating document with data:', documentData); // Debug log
      console.log('ProjectId:', currentProject.id); // Debug log
      
      const newDocument = await invoke("create_document", { documentData: documentData }) as Document;
      
      // 更新文档列表
      const updatedDocuments = [...documents, newDocument];
      setDocuments(updatedDocuments);
      
      // 自动选择新创建的文档
      handleDocumentSelect(newDocument);
      
      // 更新URL但不导航（避免页面刷新）
      window.history.replaceState(null, '', `/editor/${currentProject.id}/${newDocument.id}`);
      
      toast({ 
        title: "创建成功", 
        description: `文档 "${newDocument.title}" 已创建`,
        variant: "default"
      });
    } catch (error: any) {
      console.error("Failed to create document:", error);
      console.error("Full error object:", JSON.stringify(error, null, 2));
      console.error("Document creation context:", {
        error: error,
        errorString: String(error),
        errorMessage: error?.message,
        errorStack: error?.stack,
        currentProject: currentProject,
        documentData: documentData
      });
      
      let errorMessage = "创建文档失败";
      if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.toString) {
        errorMessage = error.toString();
      }
      
      toast({ 
        title: "创建失败", 
        description: `${errorMessage} （请检查项目是否存在、字段是否与后端一致）`,
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  // 删除文档
  const handleDocumentDelete = async (documentId: string) => {
    try {
      await invoke("delete_document", { documentId: documentId });
      setDocuments(documents.filter(doc => doc.id !== documentId));
      
      // 如果删除的是当前选中的文档，清空选择
      if (selectedDocument?.id === documentId) {
        setSelectedDocument(null);
        setContent("");
      }
    } catch (error) {
      console.error("Failed to delete document:", error);
    }
  };

  // 导出文档
  const handleExport = () => {
    if (!selectedDocument) return;
    setImportExportMode('export');
    setShowImportExportDialog(true);
  };

  // 重命名文档
  const handleRename = async () => {
    if (!selectedDocument) return;
    const title = prompt('重命名文档', selectedDocument.title);
    if (!title || title === selectedDocument.title) return;
    try {
      await invoke('update_document', {
        document_id: selectedDocument.id,
        document_data: { ...selectedDocument, title },
      });
      const updated = { ...selectedDocument, title } as Document;
      setSelectedDocument(updated);
      setDocuments(documents.map(d => d.id === updated.id ? updated : d));
    } catch (e) {
      console.error('重命名失败', e);
    }
  };

  // 导入文档
  const handleImport = () => {
    setImportExportMode('import');
    setShowImportExportDialog(true);
  };

  // 导入内容到当前文档
  const handleImportContent = (content: string, format: string) => {
    if (selectedDocument) {
      setContent(content);
      setIsModified(true);
      // 自动保存导入的内容
      debouncedSave(selectedDocument.id, content, selectedDocument.title);
    } else {
      // 创建新文档
      handleDocumentCreateWithContent(content, format);
    }
  };

  // 创建文档并设置内容
  const handleDocumentCreateWithContent = async (content: string, format: string) => {
    if (!currentProject) {
      toast({ 
        title: "请先选择项目", 
        description: "需要先选择一个项目才能创建文档", 
        variant: "destructive" 
      });
      return;
    }
    
    let documentData: CreateDocumentData | null = null;
    try {
      setLoading(true);
      documentData = createDefaultDocumentData(
        currentProject.id,
        `导入的文档.${format}`,
        content,
        undefined
      );
      
      console.log('Creating document with imported content:', documentData); // Debug log
      
      const newDocument = await invoke("create_document", { documentData: documentData }) as Document;
      
      // 更新文档列表
      const updatedDocuments = [...documents, newDocument];
      setDocuments(updatedDocuments);
      
      // 选择新创建的文档
      handleDocumentSelect(newDocument);
      
      // 更新URL
      window.history.replaceState(null, '', `/editor/${currentProject.id}/${newDocument.id}`);
      
      toast({ 
        title: "导入成功", 
        description: `文档 "${newDocument.title}" 已创建并导入内容`,
        variant: "default"
      });
    } catch (error: any) {
      console.error("Failed to create document with imported content:", error);
      const errorMessage = error?.message || error || "无法创建导入文档，请重试";
      console.error("Document import error details:", {
        error,
        currentProject: currentProject?.id,
        documentData,
        contentLength: content.length,
        format
      });
      
      toast({ 
        title: "导入失败", 
        description: typeof errorMessage === 'string' ? errorMessage : "导入文档时发生未知错误", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-sm text-center text-gray-500">加载文档中...</div>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-center">
          <h2 className="mb-2 text-lg font-semibold">项目未找到</h2>
          <p className="text-muted-foreground">请先选择一个项目</p>
        </div>
      </div>
    );
  }

  // 项目切换
  const handleSwitchProject = async (id: string) => {
    const p = projects.find(x => x.id === id);
    if (!p) return;
    
    try {
      // 如果有未保存的修改，先保存
      if (isModified && selectedDocument) {
        debouncedSave(selectedDocument.id, content, selectedDocument.title);
      }
      
      // 清理当前状态
      setSelectedDocument(null);
      setContent("");
      setDocuments([]);
      setIsModified(false);
      
      // 设置新项目
      setCurrentProject(p);
      
      // 更新URL
      window.history.replaceState(null, '', `/editor/${p.id}`);
      
      toast({ 
        title: "项目切换", 
        description: `已切换到项目 "${p.name}"`
      });
    } catch (error) {
      console.error("Failed to switch project:", error);
    }
  };

  return (
    <div className={`h-screen flex flex-col bg-white overflow-hidden document-editor-container ${debugMode ? 'debug-boundaries' : ''}`}>
      {/* 编辑器专用标题栏 */}
      <div className="flex flex-shrink-0 justify-between items-center px-4 h-16 bg-gradient-to-b border-b border-slate-300 from-slate-50 to-slate-200 document-editor-anti-overlap">
        <button 
          onClick={() => setDebugMode(!debugMode)}
          className={`px-2 py-1 text-xs rounded ${debugMode ? 'text-red-800 bg-red-200' : 'text-gray-600 bg-gray-200'} hover:opacity-80`}
          title="切换调试边界"
        >
          {debugMode ? '调试开' : '调试关'}
        </button>
        <div className="text-sm font-medium text-slate-700">
          WriteFlow Studio
        </div>
        <div className="w-12"></div> {/* 占位符保持居中 */}
      </div>

      {/* 编辑器主体 */}
      <div className="flex flex-1 bg-white" style={{ minHeight: 0 }}>
        {/* 左侧面板（320px） */}
        <div className="flex flex-col flex-shrink-0 w-80 bg-gray-50 border-r border-gray-200 sidebar-section" style={{ minHeight: 0 }}>
          {/* 项目选择区 */}
          <div className="flex items-center px-3 h-12 bg-white border-b border-gray-200">
            <h2 className="flex-1 text-sm font-medium truncate">{currentProject?.name || "未选择项目"}</h2>
          </div>
          {/* 项目列表，限制高度 */}
          <div className="relative px-3 py-2 border-b document-editor-anti-overlap">
            <div className="mb-2 text-xs text-gray-500">项目</div>
            <div className="overflow-y-auto relative max-h-32 bg-white rounded-md border">
              {projects.length === 0 ? (
                <div className="p-3 text-xs text-center text-gray-500">
                  <div className="mb-1">无项目</div>
                  <div className="text-gray-400">请先在项目管理中创建项目</div>
                </div>
              ) : (
                projects.map(p => (
                  <button 
                    key={p.id} 
                    onClick={() => handleSwitchProject(p.id)} 
                    className={`w-full text-left px-3 py-2 text-sm flex items-center transition-all duration-200 border-l-2 relative ${
                      currentProject?.id === p.id 
                        ? 'bg-blue-50 border-blue-500 text-blue-900 font-medium' 
                        : 'hover:bg-gray-50 border-transparent'
                    }`}
                    title={`切换到项目: ${p.name}`}
                  >
                    <div className="flex flex-1 items-center min-w-0">
                      <ProjectIcon 
                        iconName={p.icon} 
                        className="flex-shrink-0 mr-2 w-3 h-3" 
                        color={p.color}
                      />
                      <span className="text-left truncate">{p.name}</span>
                    </div>
                    {currentProject?.id === p.id && (
                      <svg className="flex-shrink-0 w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
          {/* 文档搜索 */}
          <div className="relative px-3 py-2 border-b document-editor-anti-overlap">
            <input
              className="w-full border rounded-md px-3 py-1.5 text-sm bg-white relative"
              placeholder="搜索文档..."
              value={docFilter}
              onChange={(e) => setDocFilter(e.target.value)}
            />
          </div>
          {/* 文档树，占用剩余空间 */}
          <div className="flex overflow-hidden flex-col flex-1">
            <DocumentTree
              documents={documents.filter(d => d.title.toLowerCase().includes(docFilter.toLowerCase()))}
              selectedDocumentId={selectedDocument?.id}
              onDocumentSelect={handleDocumentSelect}
              onDocumentCreate={handleDocumentCreate}
              onDocumentDelete={handleDocumentDelete}
              className="overflow-y-auto flex-1"
            />
            {documents.length === 0 && currentProject && (
              <div className="p-4 text-center border-t">
                <div className="mb-3 text-xs text-gray-500">暂无文档</div>
                <button 
                  onClick={() => handleDocumentCreate()} 
                  className="flex gap-1 items-center px-3 py-2 mx-auto text-xs text-white bg-blue-600 rounded-md transition-colors hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="w-3 h-3 rounded-full border border-white animate-spin border-t-transparent"></div>
                      创建中...
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      创建文档
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 编辑器区域 */}
        <div className="flex flex-col flex-1 main-editor-section" style={{ minWidth: 0, minHeight: 0 }}>
        {selectedDocument ? (
          <>
            {/* 文档头部信息 */}
            <div className="flex flex-shrink-0 justify-between items-center px-4 h-12 bg-white border-b border-gray-200">
              <div className="flex gap-4 items-center min-w-0">
                <h2 className="text-sm font-medium truncate">{selectedDocument.title}</h2>
                <div className="flex gap-2 items-center text-xs text-gray-500 whitespace-nowrap">
                  {isModified && (
                    <>
                      <span className="text-orange-500">未保存</span>
                      <span>·</span>
                    </>
                  )}
                  {isSaving && (
                    <>
                      <span className="text-blue-500">保存中...</span>
                      <span>·</span>
                    </>
                  )}
                  <span>最后修改：{new Date(selectedDocument.updated_at).toLocaleString()}</span>
                </div>
              </div>
              <div className="flex flex-shrink-0 gap-2 items-center">
                <button
                  onClick={() => setShowOutline(!showOutline)}
                  className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded transition-colors ${
                    showOutline 
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  title="切换大纲"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  大纲
                </button>
                <div className="mx-1 w-px h-4 bg-gray-300"></div>
                <button
                  onClick={handleImport}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                  title="导入文档"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  导入
                </button>
                <button
                  onClick={handleRename}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                  title="重命名文档"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5h2m-1 0v14m-7-7h14" />
                  </svg>
                  重命名
                </button>
                <button
                  onClick={handleExport}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                  title="导出文档"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  导出
                </button>
              </div>
            </div>

            {/* Markdown 编辑器 */}
            <div className="flex-1 min-h-0">
              <MarkdownEditor
                ref={editorHandle}
                value={content}
                onChange={handleContentChange}
                placeholder="开始写作..."
                className="h-full"
              />
            </div>
          </>
        ) : (
          <div className="flex justify-center items-center h-full">
            <div className="text-center">
              <h3 className="mb-2 text-lg font-semibold">选择文档开始编辑</h3>
              <p className="mb-4 text-gray-500">从左侧文档树中选择一个文档</p>
              <button
                onClick={() => handleDocumentCreate()}
                className="px-4 py-2 text-white bg-blue-600 rounded-md transition-colors hover:bg-blue-700"
              >
                创建新文档
              </button>
            </div>
          </div>
        )}
        </div>
        
        {/* 右侧面板 - 条件显示 */}
        {showOutline && (
          <div className="flex flex-col flex-shrink-0 w-80 bg-gray-50 border-l border-gray-200 right-panel-section" style={{ minHeight: 0 }}>
            {/* 面板头部 */}
            <div className="flex flex-shrink-0 items-center px-4 h-12 bg-white border-b">
              <h3 className="text-sm font-medium">文档大纲</h3>
              <button
                onClick={() => setShowOutline(false)}
                className="p-1 ml-auto rounded transition-colors hover:bg-gray-100"
                title="关闭面板"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* 大纲面板 */}
            <div className="overflow-y-auto flex-1 p-3">
              {outline.length === 0 ? (
                <div className="p-4 text-xs text-center text-gray-500">
                  <div className="mb-2">暂无大纲</div>
                  <div className="text-gray-400">在文档中添加标题 (# ## ###) 来生成大纲</div>
                </div>
              ) : (
                <div className="space-y-1">
                  {outline.map((h) => (
                    <button
                      key={`${h.line}-${h.text}`}
                      className="block px-3 py-2 w-full text-sm text-left text-gray-700 rounded transition-all hover:bg-white hover:shadow-sm"
                      style={{ paddingLeft: `${(h.level - 1) * 12 + 12}px` }}
                      onClick={() => editorHandle.current?.scrollToLine(h.line)}
                      title={`跳转到第 ${h.line} 行`}
                    >
                      <span className="mr-2 text-xs text-gray-400">H{h.level}</span>
                      <span className="truncate">{h.text}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 底部状态栏 */}
      <div className="h-6 border-t text-[11px] text-gray-600 px-3 flex items-center justify-between bg-gray-50">
        <span>WriteFlow Studio v1.0.0</span>
        <span>系统正常</span>
      </div>

      {/* 导入导出对话框 */}
      <ImportExportDialog
        open={showImportExportDialog}
        onOpenChange={setShowImportExportDialog}
        mode={importExportMode}
        document={selectedDocument ? {
          id: selectedDocument.id,
          title: selectedDocument.title,
          content: content
        } : undefined}
        onImport={handleImportContent}
      />
    </div>
  );
}
