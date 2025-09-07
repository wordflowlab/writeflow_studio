import { useState, useMemo, memo } from 'react';
import { cn } from '@/lib/utils';
import {
  FileText,
  Folder,
  FolderOpen,
  Plus,
  MoreHorizontal
} from 'lucide-react';

interface Document {
  id: string;
  title: string;
  content: string;
  project_id: string;
  folder_path?: string;
  created_at: string;
  updated_at: string;
}

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
          "group flex items-center justify-between px-2 py-1 cursor-pointer rounded-md transition-colors",
          isSelected 
            ? "bg-blue-100 text-blue-700" 
            : "hover:bg-gray-100 text-gray-700"
        )}
        style={{ paddingLeft: `${8 + level * 16}px` }}
        onClick={handleClick}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          {node.type === 'folder' ? (
            isExpanded ? (
              <FolderOpen className="h-4 w-4 flex-shrink-0" />
            ) : (
              <Folder className="h-4 w-4 flex-shrink-0" />
            )
          ) : (
            <FileText className="h-4 w-4 flex-shrink-0" />
          )}
          <span className="text-sm truncate">{node.name}</span>
        </div>

        {/* 操作按钮 */}
        {(showActions || isSelected) && (
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {node.type === 'folder' && onDocumentCreate && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDocumentCreate(node.id);
                }}
                className="p-1 hover:bg-gray-200 rounded"
                title="新建文档"
              >
                <Plus className="h-3 w-3" />
              </button>
            )}
            <button
              className="p-1 hover:bg-gray-200 rounded"
              title="更多操作"
            >
              <MoreHorizontal className="h-3 w-3" />
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
    <div className={cn('h-full overflow-auto', className)}>
      <div className="p-2">
        {tree.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">暂无文档</p>
            {onDocumentCreate && (
              <button
                onClick={() => onDocumentCreate()}
                className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
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