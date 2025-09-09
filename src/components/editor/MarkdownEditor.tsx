import { useRef, useState, memo, useCallback, useMemo, forwardRef, useImperativeHandle } from 'react';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { cn } from '@/lib/utils';
import { 
  Eye,
  EyeOff
} from 'lucide-react';

export interface MarkdownEditorHandle {
  scrollToLine: (line: number) => void;
}

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  readOnly?: boolean;
}

const MarkdownEditor = memo(forwardRef<MarkdownEditorHandle, MarkdownEditorProps>(function MarkdownEditor({
  value,
  onChange,
  className,
  placeholder = "开始写作...",
  readOnly = false
}: MarkdownEditorProps, ref) {
  const [showPreview, setShowPreview] = useState(false);
  const editorRef = useRef<any>(null);

  const handleEditorChange = useCallback((newValue: string | undefined) => {
    onChange(newValue || '');
  }, [onChange]);

  useImperativeHandle(ref, () => ({
    scrollToLine(line: number) {
      if (editorRef.current) {
        const editor = editorRef.current as any;
        editor.revealLineInCenter(line);
        editor.setPosition({ lineNumber: line, column: 1 });
        editor.focus();
      }
    },
  }));

  return (
    <div className={cn('flex flex-col h-full bg-white', className)}>

      {/* 编辑器内容区 */}
      <div className="flex-1 flex min-h-0">
        {/* Markdown 编辑器 */}
        <div className={cn(
          "flex flex-col min-h-0",
          showPreview ? "w-1/2 border-r border-gray-200" : "w-full"
        )}>
          <Editor
            key="markdown-editor"
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
          <div className="w-1/2 bg-gray-50 overflow-y-auto flex flex-col">
            <div className="p-6 flex-1">
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
}));

export default MarkdownEditor;
