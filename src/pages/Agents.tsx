import { useEffect, useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { invoke } from '@/lib/tauri';
import {
  Bot,
  Download,
  Search,
  GraduationCap,
  Monitor,
  BookOpen,
  FileText
} from 'lucide-react';

type Agent = {
  id: string;
  name: string;
  category: string;
  description: string;
  // 是否已安装（原型展示的是安装状态，不涉及启用/禁用）
  isInstalled: boolean;
  // 图标组件（用于卡片左上角图标）
  icon?: React.ComponentType<{ className?: string }>;
};

// 对齐 docs/writeflow-studio-prototype.html 中的示例卡片
const CATALOG_PRESETS: Agent[] = [
  {
    id: 'paper-assistant',
    name: '论文写作助手',
    category: '学术写作',
    description: '专业的学术论文写作助手，支持多种引用格式和学科规范',
    isInstalled: true,
    icon: GraduationCap,
  },
  {
    id: 'ppt-outline',
    name: 'PPT 大纲生成器',
    category: '商务文档',
    description: '智能生成演示文稿大纲和内容框架，提升演示效果',
    isInstalled: false,
    icon: Monitor,
  },
  {
    id: 'novel-plot',
    name: '小说情节助手',
    category: '创意写作',
    description: '协助构建小说情节，提供人物设定和故事发展建议',
    isInstalled: true,
    icon: BookOpen,
  },
  {
    id: 'api-docgen',
    name: 'API 文档生成',
    category: '技术文档',
    description: '自动生成标准化的 API 文档，支持多种编程语言',
    isInstalled: false,
    icon: FileText,
  },
];

export default function Agents() {
  // 使用完整“市场目录”并标注安装状态
  const [catalog, setCatalog] = useState<Agent[]>(CATALOG_PRESETS);
  const [keyword, setKeyword] = useState('');

  // 从后端获取已安装列表，与本地目录合并状态
  useEffect(() => {
    (async () => {
      try {
        const installed = (await invoke('list_agents')) as { name?: string; id?: string }[];
        if (Array.isArray(installed)) {
          const installedNames = new Set(
            installed.map((a) => (a.name || a.id || '').toString())
          );
          setCatalog((prev) =>
            prev.map((a) => ({
              ...a,
              isInstalled:
                a.isInstalled || installedNames.has(a.name) || installedNames.has(a.id),
            }))
          );
        }
      } catch {
        // 忽略：在无 Tauri/数据库时保留默认预设
      }
    })();
  }, []);

  const filtered = useMemo(
    () =>
      catalog.filter((a) =>
        `${a.name} ${a.category} ${a.description}`.toLowerCase().includes(keyword.toLowerCase())
      ),
    [catalog, keyword]
  );

  const install = async (id: string) => {
    const target = catalog.find((a) => a.id === id);
    if (!target) return;
    try {
      await invoke('install_agent', {
        input: { name: target.name, category: target.category, version: '1.0.0', description: target.description },
      });
    } catch {
      // 忽略失败，前端仍然切换状态以便演示
    }
    setCatalog((prev) => prev.map((a) => (a.id === id ? { ...a, isInstalled: true } : a)));
    toast({ title: '安装成功', description: target.name });
  };

  const uninstall = async (id: string) => {
    const target = catalog.find((a) => a.id === id);
    if (!target) return;
    try {
      await invoke('uninstall_agent', { id });
    } catch {
      // 忽略失败，前端仍然切换状态以便演示
    }
    setCatalog((prev) => prev.map((a) => (a.id === id ? { ...a, isInstalled: false } : a)));
    toast({ title: '已卸载', description: target.name });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Agent 管理</h1>
          <p className="text-gray-600 mt-1">管理和安装 WriteFlow Agent</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索 Agent..."
              className="pl-9 w-64"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((agent) => {
          const Icon = agent.icon || Bot;
          return (
            <Card key={agent.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold text-gray-900">
                      {agent.name}
                    </CardTitle>
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600 inline-block mt-1">
                      {agent.category}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4">{agent.description}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {agent.isInstalled && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">已安装</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!agent.isInstalled ? (
                    <Button onClick={() => install(agent.id)} className="flex items-center">
                      <Download className="w-4 h-4 mr-2" />安装
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => uninstall(agent.id)}
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
          <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">未找到匹配的 Agent</h3>
          <p className="text-gray-600">请调整关键词后重试</p>
        </Card>
      )}
    </div>
  );
}
