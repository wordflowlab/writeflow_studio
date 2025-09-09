import { useState, useMemo, memo } from 'react';
import { cn } from '@/lib/utils';
import { Document } from '@/types/document';
import {
  FileText,
  Folder,
  FolderOpen,
  Plus,
  MoreHorizontal
} from 'lucide-react';

interface DocumentNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: DocumentNode[];
  document?: Document;
}

interface DocumentTreeProps {
  documents: Document[];
  selectedDocumentId?: string;
  onDocumentSelect: (document: Document) => void;
  onDocumentCreate?: (parentId?: string) => void;
  onDocumentDelete?: (documentId: string) => void;
  className?: string;
}

// 将扁平的文档列表转换为树状结构
function buildDocumentTree(documents: Document[]): DocumentNode[] {
  const tree: DocumentNode[] = [];
  const folderMap = new Map<string, DocumentNode>();

  documents.forEach(doc => {
    const node: DocumentNode = {
      id: doc.id,
      name: doc.title,
      type: 'file',
      document: doc
    };

    if (doc.folder_path) {
      // 处理文件夹路径
      const folders = doc.folder_path.split('/').filter(Boolean);
      let currentPath = '';
      let currentParent = tree;

      folders.forEach((folderName: string) => {
        currentPath = currentPath ? `${currentPath}/${folderName}` : folderName;
        
        if (!folderMap.has(currentPath)) {
          const folderNode: DocumentNode = {
            id: `folder-${currentPath}`,
            name: folderName,
            type: 'folder',
            children: []
          };
          
          folderMap.set(currentPath, folderNode);
          currentParent.push(folderNode);
        }
        
        const folder = folderMap.get(currentPath)!;
        currentParent = folder.children!;
      });

      currentParent.push(node);
    } else {
      tree.push(node);
    }
  });

  return tree;
}

const TreeNode = memo(function TreeNode({ 
  node, 
  selectedDocumentId, 
  onDocumentSelect, 
  onDocumentCreate,
  onDocumentDelete,
  level = 0 
}: {
  node: DocumentNode;
  selectedDocumentId?: string;
  onDocumentSelect: (document: Document) => void;
  onDocumentCreate?: (parentId?: string) => void;
  onDocumentDelete?: (documentId: string) => void;
  level?: number;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showActions, setShowActions] = useState(false);

  const handleClick = () => {
    if (node.type === 'folder') {
      setIsExpanded(!isExpanded);
    } else if (node.document) {
      onDocumentSelect(node.document);
    }
  };

  const isSelected = node.type === 'file' && node.document?.id === selectedDocumentId;

  return (
    <div>
      <div
        className={cn(
          "flex justify-between items-center px-2 py-1 rounded-md transition-colors cursor-pointer group",
          isSelected 
            ? "text-blue-700 bg-blue-100" 
            : "text-gray-700 hover:bg-gray-100"
        )}
        style={{ paddingLeft: `${8 + level * 16}px` }}
        onClick={handleClick}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <div className="flex flex-1 items-center space-x-2 min-w-0">
          {node.type === 'folder' ? (
            isExpanded ? (
              <FolderOpen className="flex-shrink-0 w-4 h-4" />
            ) : (
              <Folder className="flex-shrink-0 w-4 h-4" />
            )
          ) : (
            <FileText className="flex-shrink-0 w-4 h-4" />
          )}
          <span className="text-sm truncate">{node.name}</span>
        </div>

        {/* 操作按钮 */}
        {(showActions || isSelected) && (
          <div className="flex items-center space-x-1 opacity-0 transition-opacity group-hover:opacity-100">
            {node.type === 'folder' && onDocumentCreate && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDocumentCreate(node.id);
                }}
                className="p-1 rounded hover:bg-gray-200"
                title="新建文档"
              >
                <Plus className="w-3 h-3" />
              </button>
            )}
            <button
              className="p-1 rounded hover:bg-gray-200"
              title="更多操作"
            >
              <MoreHorizontal className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* 子节点 */}
      {node.type === 'folder' && isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              selectedDocumentId={selectedDocumentId}
              onDocumentSelect={onDocumentSelect}
              onDocumentCreate={onDocumentCreate}
              onDocumentDelete={onDocumentDelete}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
});

export default function DocumentTree({
  documents,
  selectedDocumentId,
  onDocumentSelect,
  onDocumentCreate,
  onDocumentDelete,
  className
}: DocumentTreeProps) {
  const tree = useMemo(() => buildDocumentTree(documents), [documents]);

  return (
    <div className={cn('overflow-auto h-full', className)}>
      <div className="p-2">
        {tree.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            <FileText className="mx-auto mb-2 w-8 h-8 opacity-50" />
            <p className="text-sm">暂无文档</p>
            {onDocumentCreate && (
              <button
                onClick={() => onDocumentCreate()}
                className="mt-2 text-sm text-blue-600 hover:text-blue-700"
              >
                创建第一个文档
              </button>
            )}
          </div>
        ) : (
          tree.map((node) => (
            <TreeNode
              key={node.id}
              node={node}
              selectedDocumentId={selectedDocumentId}
              onDocumentSelect={onDocumentSelect}
              onDocumentCreate={onDocumentCreate}
              onDocumentDelete={onDocumentDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}