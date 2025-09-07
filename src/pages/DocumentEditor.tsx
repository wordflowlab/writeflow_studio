import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import { useAppStore } from "@/store/app";
import MarkdownEditor from "@/components/editor/MarkdownEditor";
import DocumentTree from "@/components/document/DocumentTree";
import ImportExportDialog from "@/components/document/ImportExportDialog";

interface Document {
  id: string;
  title: string;
  content: string;
  project_id: string;
  folder_path?: string;
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

export default function DocumentEditor() {
  const { projectId } = useParams<{ projectId: string }>();
  const { 
    currentProject
  } = useAppStore();
  
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [content, setContent] = useState("");
  const [isModified, setIsModified] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showImportExportDialog, setShowImportExportDialog] = useState(false);
  const [importExportMode, setImportExportMode] = useState<'import' | 'export'>('export');

  // 自动保存函数
  const debouncedSave = useCallback(
    debounce(async (documentId: string, content: string) => {
      try {
        setIsSaving(true);
        await invoke("update_document_content", {
          document_id: documentId,
          content,
        });
        setIsModified(false);
      } catch (error) {
        console.error("Failed to save document:", error);
      } finally {
        setIsSaving(false);
      }
    }, 2000),
    []
  );

  // 加载项目文档
  useEffect(() => {
    const loadDocuments = async () => {
      if (!projectId) return;
      
      try {
        setLoading(true);
        const projectDocuments = await invoke("get_documents_by_project", {
          project_id: projectId
        }) as Document[];
        
        setDocuments(projectDocuments);
        
        // 如果有文档，选择第一个
        if (projectDocuments.length > 0 && !selectedDocument) {
          handleDocumentSelect(projectDocuments[0]);
        }
      } catch (error) {
        console.error("Failed to load documents:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();
  }, [projectId, selectedDocument]);

  // 文档选择处理
  const handleDocumentSelect = (document: Document) => {
    // 如果有未保存的修改，先保存
    if (isModified && selectedDocument) {
      debouncedSave(selectedDocument.id, content);
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
      debouncedSave(selectedDocument.id, newContent);
    }
  };

  // 创建新文档
  const handleDocumentCreate = async (parentId?: string) => {
    if (!currentProject) return;
    
    try {
      const newDocument = await invoke("create_document", {
        project_id: currentProject.id,
        title: "新文档",
        content: "",
        folder_path: parentId?.startsWith('folder-') ? parentId.replace('folder-', '') : null
      }) as Document;
      
      setDocuments([...documents, newDocument]);
      handleDocumentSelect(newDocument);
    } catch (error) {
      console.error("Failed to create document:", error);
    }
  };

  // 删除文档
  const handleDocumentDelete = async (documentId: string) => {
    try {
      await invoke("delete_document", { document_id: documentId });
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
      debouncedSave(selectedDocument.id, content);
    } else {
      // 创建新文档
      handleDocumentCreateWithContent(content, format);
    }
  };

  // 创建文档并设置内容
  const handleDocumentCreateWithContent = async (content: string, format: string) => {
    if (!currentProject) return;
    
    try {
      const newDocument = await invoke("create_document", {
        project_id: currentProject.id,
        title: `导入的文档.${format}`,
        content: content,
        folder_path: null
      }) as Document;
      
      setDocuments([...documents, newDocument]);
      handleDocumentSelect(newDocument);
    } catch (error) {
      console.error("Failed to create document:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-muted-foreground">加载文档中...</p>
        </div>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">项目未找到</h2>
          <p className="text-muted-foreground">请先选择一个项目</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* 编辑器专用标题栏 */}
      <div className="h-16 border-b border-slate-300 bg-gradient-to-b from-slate-50 to-slate-200 flex items-center justify-center px-4 flex-shrink-0">
        <div className="text-sm font-medium text-slate-700 flex-1 text-center">
          WriteFlow Studio
        </div>
      </div>

      {/* 编辑器主体 */}
      <div className="flex-1 flex bg-white">
        {/* 文档树侧边栏 */}
        <div className="w-80 border-r border-gray-200 bg-gray-50">
          <div className="h-12 border-b border-gray-200 bg-white flex items-center px-4">
            <h2 className="font-medium text-sm truncate">{currentProject.name}</h2>
          </div>
          <DocumentTree
            documents={documents}
            selectedDocumentId={selectedDocument?.id}
            onDocumentSelect={handleDocumentSelect}
            onDocumentCreate={handleDocumentCreate}
            onDocumentDelete={handleDocumentDelete}
            className="h-full"
          />
        </div>

      {/* 编辑器区域 */}
      <div className="flex-1 flex flex-col">
        {selectedDocument ? (
          <>
            {/* 文档头部信息 */}
            <div className="h-12 border-b border-gray-200 bg-white flex items-center justify-between px-4">
              <div className="flex items-center gap-4">
                <h2 className="font-medium text-sm">{selectedDocument.title}</h2>
                <div className="flex items-center gap-2 text-xs text-gray-500">
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
              <div className="flex items-center gap-2">
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
            <div className="flex-1">
              <MarkdownEditor
                value={content}
                onChange={handleContentChange}
                placeholder="开始写作..."
                className="h-full"
              />
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">选择文档开始编辑</h3>
              <p className="text-gray-500 mb-4">从左侧文档树中选择一个文档</p>
              {documents.length === 0 && (
                <button
                  onClick={() => handleDocumentCreate()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  创建第一个文档
                </button>
              )}
            </div>
          </div>
        )}
        </div>
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