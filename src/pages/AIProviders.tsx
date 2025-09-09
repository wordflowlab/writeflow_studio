import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useAppStore, AIProvider } from "@/store/app";
import { Brain, Download, Search, Sparkles, Zap, Bot, Star, Globe } from "lucide-react";

type AIProviderCatalog = {
  id: string;
  name: string;
  category: string;
  description: string;
  isInstalled: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  template: AIProvider;
};

// 精选 AI 提供商目录
const AI_CATALOG_PRESETS: AIProviderCatalog[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    category: '通用 AI',
    description: '业界领先的大语言模型，支持 GPT-4 系列，适合各种写作任务',
    isInstalled: false,
    icon: Sparkles,
    template: {
      name: "OpenAI",
      provider_type: "openai",
      api_base: "https://api.openai.com/v1",
      model: "gpt-4",
      max_tokens: 4096,
      temperature: 0.7,
      enabled: true,
    },
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    category: '安全 AI',
    description: 'Claude 系列模型，擅长长文本处理和逻辑推理，写作质量优秀',
    isInstalled: true,
    icon: Brain,
    template: {
      name: "Anthropic",
      provider_type: "anthropic",
      api_base: "https://api.anthropic.com",
      model: "claude-3-sonnet-20240229",
      max_tokens: 4096,
      temperature: 0.7,
      enabled: true,
    },
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    category: '中文优化',
    description: '专为中文优化的大语言模型，在中文写作和代码生成方面表现出色',
    isInstalled: false,
    icon: Zap,
    template: {
      name: "DeepSeek",
      provider_type: "deepseek",
      api_base: "https://api.deepseek.com/v1",
      model: "deepseek-chat",
      max_tokens: 4096,
      temperature: 0.7,
      enabled: true,
    },
  },
  {
    id: 'kimi',
    name: 'Kimi (月之暗面)',
    category: '长文本',
    description: '支持超长上下文的 AI 模型，适合处理大型文档和复杂写作项目',
    isInstalled: true,
    icon: Star,
    template: {
      name: "Kimi",
      provider_type: "kimi",
      api_base: "https://api.moonshot.cn/v1",
      model: "moonshot-v1-8k",
      max_tokens: 8000,
      temperature: 0.7,
      enabled: true,
    },
  },
  {
    id: 'qwen',
    name: '通义千问',
    category: '中文优化',
    description: '阿里巴巴推出的中文大语言模型，在中文理解和生成方面表现优异',
    isInstalled: false,
    icon: Globe,
    template: {
      name: "通义千问",
      provider_type: "qwen",
      api_base: "https://dashscope.aliyuncs.com/api/v1",
      model: "qwen-turbo",
      max_tokens: 2000,
      temperature: 0.7,
      enabled: true,
    },
  },
  {
    id: 'zhipu',
    name: '智谱 GLM',
    category: '多模态',
    description: '支持文本和图像理解的多模态 AI，适合需要图文结合的写作场景',
    isInstalled: false,
    icon: Bot,
    template: {
      name: "智谱 GLM",
      provider_type: "zhipu",
      api_base: "https://open.bigmodel.cn/api/paas/v4",
      model: "glm-4",
      max_tokens: 4096,
      temperature: 0.7,
      enabled: true,
    },
  },
];

export default function AIProviders() {
  const { config, saveConfig, testAIProvider } = useAppStore();
  const [catalog, setCatalog] = useState<AIProviderCatalog[]>(AI_CATALOG_PRESETS);
  const [keyword, setKeyword] = useState('');
  const [apiKeyDialog, setApiKeyDialog] = useState<{ open: boolean; providerId: string | null }>({
    open: false,
    providerId: null,
  });
  const [apiKey, setApiKey] = useState('');

  const providers = config?.ai_providers?.providers || {};
  const providersList = Object.entries(providers);

  // 从后端获取已安装列表，与本地目录合并状态
  useEffect(() => {
    const installedNames = new Set(providersList.map(([_, provider]) => provider.name));
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

  const handleInstallClick = (id: string) => {
    setApiKeyDialog({ open: true, providerId: id });
    setApiKey('');
  };

  const install = async () => {
    const { providerId } = apiKeyDialog;
    if (!providerId || !apiKey.trim()) return;

    const target = catalog.find((item) => item.id === providerId);
    if (!target || !config) return;

    try {
      const providerInstanceId = `${target.id}_${Date.now()}`;
      const newProvider = { 
        ...target.template,
        api_key: apiKey.trim(),
      };

      const updatedConfig = {
        ...config,
        ai_providers: {
          ...config.ai_providers,
          providers: {
            ...config.ai_providers.providers,
            [providerInstanceId]: newProvider,
          },
        },
      };

      await saveConfig(updatedConfig);
      setCatalog((prev) => prev.map((item) => (item.id === providerId ? { ...item, isInstalled: true } : item)));
      
      toast({
        title: "安装成功",
        description: `AI 提供商 "${target.name}" 已添加`,
      });

      setApiKeyDialog({ open: false, providerId: null });
      setApiKey('');
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
      // 查找并删除匹配的提供商
      const matchingProviders = providersList.filter(([_, provider]) => provider.name === target.template.name);
      const updatedProviders = { ...config.ai_providers.providers };
      
      matchingProviders.forEach(([providerId]) => {
        delete updatedProviders[providerId];
      });

      const updatedConfig = {
        ...config,
        ai_providers: {
          ...config.ai_providers,
          providers: updatedProviders,
          default_provider: config.ai_providers.default_provider && 
                           matchingProviders.some(([pid]) => pid === config.ai_providers.default_provider)
                           ? null : config.ai_providers.default_provider,
        },
      };

      await saveConfig(updatedConfig);
      setCatalog((prev) => prev.map((item) => (item.id === id ? { ...item, isInstalled: false } : item)));
      
      toast({
        title: "已卸载",
        description: `AI 提供商 "${target.name}" 已删除`,
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
          <h1 className="text-2xl font-semibold text-gray-900">AI 提供商市场</h1>
          <p className="text-gray-600 mt-1">安装和管理精选的 AI 写作服务提供商</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索 AI 提供商..."
              className="pl-9 w-64"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => {
          const Icon = item.icon || Brain;
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
                    <Button onClick={() => handleInstallClick(item.id)} className="flex items-center">
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
          <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">未找到匹配的 AI 提供商</h3>
          <p className="text-gray-600">请调整关键词后重试</p>
        </Card>
      )}

      {/* API Key 输入对话框 */}
      <Dialog open={apiKeyDialog.open} onOpenChange={(open) => setApiKeyDialog({ open, providerId: null })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              添加 {catalog.find(item => item.id === apiKeyDialog.providerId)?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api_key">API Key *</Label>
              <Input
                id="api_key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="请输入您的 API Key"
                autoFocus
              />
              <p className="text-sm text-muted-foreground">
                API Key 将安全存储在本地配置中
              </p>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setApiKeyDialog({ open: false, providerId: null })}>
                取消
              </Button>
              <Button onClick={install} disabled={!apiKey.trim()}>
                安装
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}