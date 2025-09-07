import { useRef, useState, memo, useCallback, useMemo } from 'react';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { cn } from '@/lib/utils';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered,
  Link,
  Image,
  Eye,
  EyeOff,
  Save
} from 'lucide-react';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  readOnly?: boolean;
}

const MarkdownEditor = memo(function MarkdownEditor({
  value,
  onChange,
  className,
  placeholder = "开始写作...",
  readOnly = false
}: MarkdownEditorProps) {
  const [showPreview, setShowPreview] = useState(false);
  const editorRef = useRef<any>(null);

  // 使用 useMemo 缓存字数计算
  const wordCount = useMemo(() => {
    const text = value.replace(/[#*`\[\]()]/g, '').trim();
    return text.length;
  }, [value]);

  const handleEditorChange = useCallback((newValue: string | undefined) => {
    const content = newValue || '';
    onChange(content);
  }, [onChange]);

  const insertMarkdown = useCallback((before: string, after = '') => {
    if (editorRef.current) {
      const editor = (editorRef.current as any);
      const selection = editor.getSelection();
      const selectedText = editor.getModel().getValueInRange(selection);
      
      const newText = `${before}${selectedText}${after}`;
      editor.executeEdits('insert-markdown', [{
        range: selection,
        text: newText
      }]);
      
      // 设置新的选择范围
      const newSelection = {
        startLineNumber: selection.startLineNumber,
        startColumn: selection.startColumn + before.length,
        endLineNumber: selection.endLineNumber,
        endColumn: selection.endColumn + before.length
      };
      editor.setSelection(newSelection);
      editor.focus();
    }
  }, []);

  return (
    <div className={cn('flex flex-col h-full bg-white', className)}>
      {/* 工具栏 */}
      <div className="h-14 border-b border-gray-200 bg-white px-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => insertMarkdown('**', '**')}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              title="加粗"
            >
              <Bold className="h-4 w-4" />
            </button>
            <button
              onClick={() => insertMarkdown('*', '*')}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              title="斜体"
            >
              <Italic className="h-4 w-4" />
            </button>
            <div className="w-px h-6 bg-gray-300" />
            <button
              onClick={() => insertMarkdown('- ')}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              title="无序列表"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => insertMarkdown('1. ')}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              title="有序列表"
            >
              <ListOrdered className="h-4 w-4" />
            </button>
            <div className="w-px h-6 bg-gray-300" />
            <button
              onClick={() => insertMarkdown('[链接文本](', ')')}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              title="插入链接"
            >
              <Link className="h-4 w-4" />
            </button>
            <button
              onClick={() => insertMarkdown('![图片描述](', ')')}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              title="插入图片"
            >
              <Image className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">{wordCount} 字</span>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={cn(
              "p-2 rounded-md transition-colors",
              showPreview 
                ? "bg-blue-100 text-blue-600" 
                : "hover:bg-gray-100 text-gray-600"
            )}
            title={showPreview ? "隐藏预览" : "显示预览"}
          >
            {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          <button
            className="p-2 hover:bg-gray-100 rounded-md transition-colors text-gray-600"
            title="保存"
          >
            <Save className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 编辑器内容区 */}
      <div className="flex-1 flex">
        {/* Markdown 编辑器 */}
        <div className={cn(
          "flex flex-col",
          showPreview ? "w-1/2 border-r border-gray-200" : "w-full"
        )}>
          <Editor
            height="100%"
            defaultLanguage="markdown"
            value={value}
            onChange={handleEditorChange}
            onMount={(editor) => {
              editorRef.current = editor;
            }}
            options={{
              minimap: { enabled: false },
              wordWrap: 'on',
              lineNumbers: 'off',
              folding: false,
              lineDecorationsWidth: 10,
              lineNumbersMinChars: 0,
              glyphMargin: false,
              scrollBeyondLastLine: false,
              fontSize: 14,
              fontFamily: 'SF Mono, Monaco, Inconsolata, "Roboto Mono", Consolas, "Courier New", monospace',
              readOnly,
              automaticLayout: true,
              padding: { top: 16, bottom: 16 },
              theme: 'light',
            }}
            loading={<div className="flex items-center justify-center h-full text-gray-500">加载编辑器...</div>}
          />
        </div>

        {/* 预览面板 */}
        {showPreview && (
          <div className="w-1/2 bg-gray-50 overflow-auto">
            <div className="p-6 h-full">
              <div className="prose prose-sm max-w-none">
                <div className="min-h-full">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                  >
                    {value || placeholder}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default MarkdownEditor;