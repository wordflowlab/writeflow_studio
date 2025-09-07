import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { 
  Download, 
  Upload, 
  FileText, 
  File, 
  FileType, 
  Globe
} from "lucide-react";

interface ImportExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'import' | 'export';
  document?: {
    id: string;
    title: string;
    content: string;
  };
  onImport?: (content: string, format: string) => void;
}

// 支持的导出格式
const EXPORT_FORMATS = [
  {
    id: 'markdown',
    name: 'Markdown (.md)',
    description: '标准 Markdown 格式',
    icon: FileText,
    extension: 'md'
  },
  {
    id: 'html',
    name: 'HTML (.html)',
    description: '网页格式，支持样式',
    icon: Globe,
    extension: 'html'
  },
  {
    id: 'pdf',
    name: 'PDF (.pdf)',
    description: '便携式文档格式',
    icon: File,
    extension: 'pdf'
  },
  {
    id: 'docx',
    name: 'Word (.docx)',
    description: 'Microsoft Word 文档',
    icon: FileType,
    extension: 'docx'
  },
  {
    id: 'txt',
    name: '纯文本 (.txt)',
    description: '纯文本格式，无格式',
    icon: FileText,
    extension: 'txt'
  }
];

// 支持的导入格式
const IMPORT_FORMATS = [
  {
    id: 'markdown',
    name: 'Markdown (.md)',
    accept: '.md,.markdown',
    icon: FileText
  },
  {
    id: 'txt',
    name: '纯文本 (.txt)',
    accept: '.txt',
    icon: FileText
  },
  {
    id: 'html',
    name: 'HTML (.html)',
    accept: '.html,.htm',
    icon: Globe
  },
  {
    id: 'docx',
    name: 'Word (.docx)',
    accept: '.docx',
    icon: FileType
  }
];

// 导出样式模板
const EXPORT_STYLES = [
  {
    id: 'default',
    name: '默认样式',
    description: '简洁的默认样式'
  },
  {
    id: 'academic',
    name: '学术论文',
    description: '适合学术论文的格式'
  },
  {
    id: 'business',
    name: '商务报告',
    description: '商务报告专用样式'
  },
  {
    id: 'book',
    name: '图书格式',
    description: '适合长篇内容的格式'
  }
];

export default function ImportExportDialog({
  open,
  onOpenChange,
  mode,
  document,
  onImport
}: ImportExportDialogProps) {
  const [selectedFormat, setSelectedFormat] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('default');
  const [fileName, setFileName] = useState(document?.title || '');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleExport = async () => {
    if (!selectedFormat || !document) {
      toast({
        title: "请选择导出格式",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const format = EXPORT_FORMATS.find(f => f.id === selectedFormat);
      if (!format) return;

      let content = document.content;
      let mimeType = 'text/plain';
      
      // 根据格式处理内容
      switch (selectedFormat) {
        case 'markdown':
          mimeType = 'text/markdown';
          break;
        case 'html':
          // 将 Markdown 转换为 HTML
          content = convertMarkdownToHtml(document.content, selectedStyle);
          mimeType = 'text/html';
          break;
        case 'pdf':
          // PDF 导出需要特殊处理
          await exportToPDF(document.content, fileName, selectedStyle);
          setIsProcessing(false);
          return;
        case 'docx':
          // Word 导出需要特殊处理
          await exportToWord(document.content, fileName, selectedStyle);
          setIsProcessing(false);
          return;
        case 'txt':
          // 移除 Markdown 格式，保留纯文本
          content = stripMarkdown(document.content);
          mimeType = 'text/plain';
          break;
      }

      // 创建下载
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = globalThis.document.createElement('a');
      a.href = url;
      a.download = `${fileName || 'document'}.${format.extension}`;
      globalThis.document.body.appendChild(a);
      a.click();
      globalThis.document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "导出成功",
        description: `文档已导出为 ${format.name} 格式`
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('导出失败:', error);
      toast({
        title: "导出失败",
        description: "导出过程中出现错误，请重试",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !onImport) return;

    setIsProcessing(true);

    try {
      const content = await readFileContent(file);
      let processedContent = content;

      // 根据文件类型处理内容
      if (file.name.endsWith('.html') || file.name.endsWith('.htm')) {
        processedContent = convertHtmlToMarkdown(content);
      } else if (file.name.endsWith('.docx')) {
        // Word 文档需要特殊处理
        processedContent = await convertDocxToMarkdown(file);
      }

      onImport(processedContent, getFileFormat(file.name));
      
      toast({
        title: "导入成功",
        description: `已导入 ${file.name}`
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('导入失败:', error);
      toast({
        title: "导入失败",
        description: "文件导入过程中出现错误，请检查文件格式",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // 工具函数
  const convertMarkdownToHtml = (markdown: string, style: string): string => {
    // 简单的 Markdown 转 HTML（实际项目中应使用专业库如 marked）
    const html = markdown
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h2>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/\n/gim, '<br>');

    // 应用样式
    const styles = getStyleCSS(style);
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${fileName}</title>
    <style>${styles}</style>
</head>
<body>
    ${html}
</body>
</html>`;
  };

  const stripMarkdown = (markdown: string): string => {
    // 移除 Markdown 格式标记
    return markdown
      .replace(/^#+\s/gm, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`(.*?)`/g, '$1')
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
  };

  const convertHtmlToMarkdown = (html: string): string => {
    // 简单的 HTML 转 Markdown（实际项目中应使用专业库）
    return html
      .replace(/<h1>(.*?)<\/h1>/g, '# $1')
      .replace(/<h2>(.*?)<\/h2>/g, '## $1')
      .replace(/<h3>(.*?)<\/h3>/g, '### $1')
      .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
      .replace(/<em>(.*?)<\/em>/g, '*$1*')
      .replace(/<br>/g, '\n')
      .replace(/<[^>]*>/g, ''); // 移除其他 HTML 标签
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const convertDocxToMarkdown = async (file: File): Promise<string> => {
    // 实际项目中需要使用专业库如 mammoth.js
    // 这里返回占位符
    return `# ${file.name}\n\n从 Word 文档导入的内容将在这里显示。\n\n*注意：Word 文档导入功能正在开发中*`;
  };

  const exportToPDF = async (_content: string, _fileName: string, _style: string) => {
    // 实际项目中需要使用 PDF 库如 jsPDF 或 Puppeteer
    toast({
      title: "功能开发中",
      description: "PDF 导出功能正在开发中，敬请期待"
    });
  };

  const exportToWord = async (_content: string, _fileName: string, _style: string) => {
    // 实际项目中需要使用 Word 库如 docx 
    toast({
      title: "功能开发中", 
      description: "Word 导出功能正在开发中，敬请期待"
    });
  };

  const getFileFormat = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    return ext || 'txt';
  };

  const getStyleCSS = (style: string): string => {
    const styles = {
      default: `
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1, h2, h3 { color: #333; }
        h1 { border-bottom: 2px solid #eee; padding-bottom: 10px; }
      `,
      academic: `
        body { font-family: "Times New Roman", serif; line-height: 1.8; max-width: 700px; margin: 0 auto; padding: 40px; }
        h1, h2, h3 { color: #000; }
        h1 { text-align: center; margin-bottom: 30px; }
      `,
      business: `
        body { font-family: Arial, sans-serif; line-height: 1.4; max-width: 900px; margin: 0 auto; padding: 30px; }
        h1 { color: #0066cc; border-left: 4px solid #0066cc; padding-left: 20px; }
        h2 { color: #333; border-bottom: 1px solid #ddd; }
      `,
      book: `
        body { font-family: Georgia, serif; line-height: 1.7; max-width: 650px; margin: 0 auto; padding: 50px; }
        h1 { text-align: center; margin: 50px 0; }
        p { text-indent: 2em; margin-bottom: 1em; }
      `
    };
    return styles[style as keyof typeof styles] || styles.default;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            {mode === 'export' ? (
              <>
                <Download className="w-5 h-5 mr-2" />
                导出文档
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 mr-2" />
                导入文档
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {mode === 'export' ? (
            // 导出模式
            <>
              <div>
                <Label>文件名</Label>
                <Input
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="输入文件名"
                />
              </div>

              <div>
                <Label>导出格式</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  {EXPORT_FORMATS.map((format) => (
                    <div
                      key={format.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        selectedFormat === format.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                      onClick={() => setSelectedFormat(format.id)}
                    >
                      <div className="flex items-center">
                        <format.icon className="w-5 h-5 mr-3 text-gray-600" />
                        <div>
                          <div className="font-medium">{format.name}</div>
                          <div className="text-sm text-gray-600">{format.description}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedFormat && ['html', 'pdf', 'docx'].includes(selectedFormat) && (
                <div>
                  <Label>样式模板</Label>
                  <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择样式模板" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPORT_STYLES.map((style) => (
                        <SelectItem key={style.id} value={style.id}>
                          <div>
                            <div className="font-medium">{style.name}</div>
                            <div className="text-sm text-gray-600">{style.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Separator />

              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  取消
                </Button>
                <Button onClick={handleExport} disabled={!selectedFormat || isProcessing}>
                  {isProcessing ? '导出中...' : '开始导出'}
                </Button>
              </div>
            </>
          ) : (
            // 导入模式
            <>
              <div>
                <Label>选择导入格式</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  {IMPORT_FORMATS.map((format) => (
                    <div key={format.id} className="p-4 border rounded-lg">
                      <div className="flex items-center mb-3">
                        <format.icon className="w-5 h-5 mr-3 text-gray-600" />
                        <span className="font-medium">{format.name}</span>
                      </div>
                      <Input
                        type="file"
                        accept={format.accept}
                        onChange={handleImport}
                        disabled={isProcessing}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">导入说明</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Markdown 和纯文本文件将直接导入</li>
                  <li>• HTML 文件会自动转换为 Markdown 格式</li>
                  <li>• Word 文档支持基本格式转换</li>
                  <li>• 大文件可能需要较长处理时间</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}