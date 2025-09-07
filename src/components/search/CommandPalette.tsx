import { useState, useEffect, useCallback, useMemo } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { 
  Search,
  FileText,
  FolderOpen,
  Settings,
  Brain,
  Server,
  Sliders,
  Download,
  Upload,
  Plus,
  Command,
  ArrowRight,
  Hash,
  Clock
} from "lucide-react";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Command {
  id: string;
  title: string;
  description?: string;
  icon: React.ComponentType<any>;
  category: string;
  keywords: string[];
  action: () => void;
  shortcut?: string;
}

export default function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  // 使用 useMemo 缓存命令列表
  const commands: Command[] = useMemo(() => [
    // 导航命令
    {
      id: "nav-dashboard",
      title: "打开仪表板",
      description: "查看系统概览和快捷操作",
      icon: FolderOpen,
      category: "导航",
      keywords: ["dashboard", "仪表板", "首页", "概览"],
      action: () => navigate("/"),
      shortcut: "Ctrl+1"
    },
    {
      id: "nav-projects",
      title: "项目管理",
      description: "管理写作项目和工作区",
      icon: FolderOpen,
      category: "导航",
      keywords: ["projects", "项目", "管理", "工作区"],
      action: () => navigate("/projects"),
      shortcut: "Ctrl+2"
    },
    {
      id: "nav-ai-providers",
      title: "AI 提供商",
      description: "配置和管理 AI 模型提供商",
      icon: Brain,
      category: "导航",
      keywords: ["ai", "providers", "提供商", "模型", "配置"],
      action: () => navigate("/ai-providers"),
      shortcut: "Ctrl+3"
    },
    {
      id: "nav-mcp-servers",
      title: "MCP 服务器",
      description: "Model Context Protocol 服务器管理",
      icon: Server,
      category: "导航",
      keywords: ["mcp", "server", "服务器", "协议"],
      action: () => navigate("/mcp-servers"),
      shortcut: "Ctrl+4"
    },
    {
      id: "nav-preferences",
      title: "写作偏好",
      description: "配置写作风格和偏好设置",
      icon: Sliders,
      category: "导航",
      keywords: ["preferences", "偏好", "设置", "风格", "配置"],
      action: () => navigate("/writing-preferences"),
      shortcut: "Ctrl+5"
    },

    // 文档操作
    {
      id: "doc-new",
      title: "创建新文档",
      description: "在当前项目中创建新文档",
      icon: Plus,
      category: "文档",
      keywords: ["new", "create", "document", "新建", "创建", "文档"],
      action: () => {
        // 这里需要集成到项目上下文中
        console.log("创建新文档");
      },
      shortcut: "Ctrl+N"
    },
    {
      id: "doc-export",
      title: "导出文档",
      description: "将当前文档导出为多种格式",
      icon: Download,
      category: "文档",
      keywords: ["export", "download", "导出", "下载", "pdf", "word"],
      action: () => {
        console.log("导出文档");
      },
      shortcut: "Ctrl+E"
    },
    {
      id: "doc-import",
      title: "导入文档",
      description: "从文件导入文档内容",
      icon: Upload,
      category: "文档",
      keywords: ["import", "upload", "导入", "上传", "文件"],
      action: () => {
        console.log("导入文档");
      },
      shortcut: "Ctrl+I"
    },

    // 系统操作
    {
      id: "sys-search",
      title: "全局搜索",
      description: "搜索文档内容、项目和设置",
      icon: Search,
      category: "系统",
      keywords: ["search", "find", "搜索", "查找", "全文"],
      action: () => {
        console.log("打开全局搜索");
      },
      shortcut: "Ctrl+F"
    },
    {
      id: "sys-settings",
      title: "系统设置",
      description: "应用设置和配置选项",
      icon: Settings,
      category: "系统",
      keywords: ["settings", "config", "设置", "配置", "选项"],
      action: () => navigate("/settings"),
      shortcut: "Ctrl+,"
    }
  ], [navigate]);

  // 使用 useMemo 优化过滤命令
  const filteredCommands = useMemo(() => {
    if (!query) return commands;
    
    const searchTerm = query.toLowerCase();
    return commands.filter(command => 
      command.title.toLowerCase().includes(searchTerm) ||
      command.description?.toLowerCase().includes(searchTerm) ||
      command.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm))
    );
  }, [commands, query]);

  // 使用 useMemo 优化按类别分组
  const groupedCommands = useMemo(() => {
    return filteredCommands.reduce((groups, command) => {
      const category = command.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(command);
      return groups;
    }, {} as Record<string, Command[]>);
  }, [filteredCommands]);

  // 键盘导航
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!open) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          onOpenChange(false);
          setQuery("");
        }
        break;
      case 'Escape':
        onOpenChange(false);
        setQuery("");
        break;
    }
  }, [open, filteredCommands, selectedIndex, onOpenChange]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // 重置选择索引当查询改变时
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);


  const handleCommandSelect = (command: Command) => {
    command.action();
    onOpenChange(false);
    setQuery("");
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "导航": return FolderOpen;
      case "文档": return FileText;
      case "系统": return Settings;
      default: return Hash;
    }
  };

  let commandIndex = 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex items-center px-4 py-3">
            <Command className="w-4 h-4 text-gray-400 mr-3" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索命令或功能..."
              className="border-0 focus:ring-0 bg-transparent text-base placeholder-gray-500"
              autoFocus
            />
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">↑↓</kbd>
              <span>导航</span>
              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Enter</kbd>
              <span>选择</span>
              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Esc</kbd>
              <span>取消</span>
            </div>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {Object.keys(groupedCommands).length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>未找到匹配的命令</p>
              <p className="text-sm mt-1">尝试不同的关键词</p>
            </div>
          ) : (
            <div className="py-2">
              {Object.entries(groupedCommands).map(([category, categoryCommands]) => {
                const CategoryIcon = getCategoryIcon(category);
                return (
                  <div key={category} className="mb-4">
                    <div className="flex items-center px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <CategoryIcon className="w-3 h-3 mr-2" />
                      {category}
                    </div>
                    <div>
                      {categoryCommands.map((command) => {
                        const isSelected = commandIndex === selectedIndex;
                        commandIndex++;
                        
                        return (
                          <div
                            key={command.id}
                            className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors ${
                              isSelected ? 'bg-blue-50 border-l-2 border-l-blue-500' : 'hover:bg-gray-50'
                            }`}
                            onClick={() => handleCommandSelect(command)}
                          >
                            <div className="flex items-center flex-1">
                              <command.icon 
                                className={`w-4 h-4 mr-3 ${
                                  isSelected ? 'text-blue-600' : 'text-gray-400'
                                }`} 
                              />
                              <div>
                                <div className={`font-medium ${
                                  isSelected ? 'text-blue-900' : 'text-gray-900'
                                }`}>
                                  {command.title}
                                </div>
                                {command.description && (
                                  <div className="text-sm text-gray-600 mt-0.5">
                                    {command.description}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {command.shortcut && (
                                <kbd className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                  {command.shortcut}
                                </kbd>
                              )}
                              <ArrowRight className={`w-3 h-3 ${
                                isSelected ? 'text-blue-500' : 'text-gray-300'
                              }`} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Command className="w-3 h-3" />
                <span>命令面板</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>最近使用的命令将显示在顶部</span>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <kbd className="px-1.5 py-0.5 bg-white border rounded">Ctrl</kbd>
              <span>+</span>
              <kbd className="px-1.5 py-0.5 bg-white border rounded">K</kbd>
              <span>打开</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}