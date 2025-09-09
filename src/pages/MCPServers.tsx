import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useAppStore, MCPServer } from "@/store/app";
import { Server, Download, Search, Database, FileText, GitBranch, Globe, Code2, Terminal } from "lucide-react";

type MCPServerCatalog = {
  id: string;
  name: string;
  category: string;
  description: string;
  isInstalled: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  template: MCPServer;
};

// 精选 MCP 服务器目录
const MCP_CATALOG_PRESETS: MCPServerCatalog[] = [
  {
    id: 'filesystem',
    name: '文件系统服务器',
    category: '文件管理',
    description: '访问和管理本地文件系统，支持文件读取、写入和搜索功能',
    isInstalled: false,
    icon: FileText,
    template: {
      name: "文件系统服务器",
      connection_type: "Stdio",
      command: "npx",
      args: ["@modelcontextprotocol/server-filesystem", "./"],
      enabled: true,
    },
  },
  {
    id: 'git',
    name: 'Git 版本控制',
    category: '版本控制',
    description: '集成 Git 版本控制系统，支持代码提交、分支管理和历史查看',
    isInstalled: false,
    icon: GitBranch,
    template: {
      name: "Git 版本控制",
      connection_type: "Stdio",
      command: "npx",
      args: ["@modelcontextprotocol/server-git"],
      enabled: true,
    },
  },
  {
    id: 'sqlite',
    name: 'SQLite 数据库',
    category: '数据管理',
    description: '连接和查询 SQLite 数据库，支持数据检索和统计分析',
    isInstalled: true,
    icon: Database,
    template: {
      name: "SQLite 数据库",
      connection_type: "Stdio",
      command: "npx",
      args: ["@modelcontextprotocol/server-sqlite", "./data.db"],
      enabled: true,
    },
  },
  {
    id: 'web-search',
    name: 'Web 搜索服务',
    category: '信息检索',
    description: '集成网络搜索功能，帮助查找最新信息和资料引用',
    isInstalled: false,
    icon: Globe,
    template: {
      name: "Web 搜索服务",
      connection_type: "SSE",
      url: "http://localhost:3001/search",
      enabled: true,
    },
  },
  {
    id: 'code-analysis',
    name: '代码分析工具',
    category: '开发工具',
    description: '分析和理解代码结构，支持多种编程语言的代码审查',
    isInstalled: false,
    icon: Code2,
    template: {
      name: "代码分析工具",
      connection_type: "Stdio",
      command: "npx",
      args: ["@modelcontextprotocol/server-code-analysis"],
      enabled: true,
    },
  },
  {
    id: 'terminal',
    name: '终端执行器',
    category: '系统工具',
    description: '执行系统命令和脚本，支持自动化任务和环境配置',
    isInstalled: true,
    icon: Terminal,
    template: {
      name: "终端执行器",
      connection_type: "Stdio",
      command: "npx",
      args: ["@modelcontextprotocol/server-terminal"],
      enabled: true,
    },
  },
];

export default function MCPServers() {
  const { config, saveConfig } = useAppStore();
  const [catalog, setCatalog] = useState<MCPServerCatalog[]>(MCP_CATALOG_PRESETS);
  const [keyword, setKeyword] = useState('');

  const servers = config?.mcp_servers?.servers || {};
  const serversList = Object.entries(servers);

  // 从后端获取已安装列表，与本地目录合并状态
  useEffect(() => {
    const installedNames = new Set(serversList.map(([_, server]) => server.name));
    setCatalog((prev) =>
      prev.map((item) => ({
        ...item,
        isInstalled: installedNames.has(item.template.name),
      }))
    );
  }, [config]);

  const filtered = useMemo(
    () =>
      catalog.filter((item) =>
        `${item.name} ${item.category} ${item.description}`.toLowerCase().includes(keyword.toLowerCase())
      ),
    [catalog, keyword]
  );

  const install = async (id: string) => {
    const target = catalog.find((item) => item.id === id);
    if (!target || !config) return;

    try {
      const serverId = `${target.id}_${Date.now()}`;
      const newServer = { ...target.template };

      const updatedConfig = {
        ...config,
        mcp_servers: {
          ...config.mcp_servers,
          servers: {
            ...config.mcp_servers.servers,
            [serverId]: newServer,
          },
        },
      };

      await saveConfig(updatedConfig);
      setCatalog((prev) => prev.map((item) => (item.id === id ? { ...item, isInstalled: true } : item)));
      
      toast({
        title: "安装成功",
        description: `MCP 服务器 "${target.name}" 已添加`,
      });
    } catch (error) {
      toast({
        title: "安装失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive",
      });
    }
  };

  const uninstall = async (id: string) => {
    const target = catalog.find((item) => item.id === id);
    if (!target || !config) return;

    try {
      // 查找并删除匹配的服务器
      const matchingServers = serversList.filter(([_, server]) => server.name === target.template.name);
      const updatedServers = { ...config.mcp_servers.servers };
      
      matchingServers.forEach(([serverId]) => {
        delete updatedServers[serverId];
      });

      const updatedConfig = {
        ...config,
        mcp_servers: {
          ...config.mcp_servers,
          servers: updatedServers,
        },
      };

      await saveConfig(updatedConfig);
      setCatalog((prev) => prev.map((item) => (item.id === id ? { ...item, isInstalled: false } : item)));
      
      toast({
        title: "已卸载",
        description: `MCP 服务器 "${target.name}" 已删除`,
      });
    } catch (error) {
      toast({
        title: "卸载失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">MCP 服务器市场</h1>
          <p className="text-gray-600 mt-1">安装和管理精选的 Model Context Protocol 服务器</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索 MCP 服务器..."
              className="pl-9 w-64"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => {
          const Icon = item.icon || Server;
          return (
            <Card key={item.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold text-gray-900">
                      {item.name}
                    </CardTitle>
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600 inline-block mt-1">
                      {item.category}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4">{item.description}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {item.isInstalled && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">已安装</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!item.isInstalled ? (
                    <Button onClick={() => install(item.id)} className="flex items-center">
                      <Download className="w-4 h-4 mr-2" />安装
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => uninstall(item.id)}
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      卸载
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <Card className="p-12 text-center">
          <Server className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">未找到匹配的 MCP 服务器</h3>
          <p className="text-gray-600">请调整关键词后重试</p>
        </Card>
      )}
    </div>
  );
}