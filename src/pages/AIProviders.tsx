import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Plus, Brain, Trash2, TestTube, Check, AlertCircle, Loader2 } from "lucide-react";

interface AIProvider {
  id: string;
  name: string;
  modelName: string;
  apiKey: string;
  baseUrl?: string;
  icon: string;
  bgColor: string;
  status: 'connected' | 'testing' | 'error' | 'disconnected';
  statusText: string;
  maxTokens: number;
  contextLength: number;
  lastTested: string;
  description?: string;
  priority?: number; // 用于模型指针排序
  modelPointer?: 'main' | 'task' | 'inference' | null; // 模型指针类型
}

// 支持的 AI 提供商模板 - 基于 PRD.md 需求的 12+ 提供商
const PROVIDER_TEMPLATES = [
  {
    name: "OpenAI",
    icon: "brain",
    bgColor: "bg-green-600",
    defaultModel: "gpt-4",
    maxTokens: 4096,
    contextLength: 128000,
    baseUrl: "https://api.openai.com/v1",
    description: "OpenAI GPT 系列模型"
  },
  {
    name: "Anthropic",
    icon: "brain", 
    bgColor: "bg-orange-600",
    defaultModel: "claude-3-sonnet-20240229",
    maxTokens: 4096,
    contextLength: 200000,
    baseUrl: "https://api.anthropic.com",
    description: "Anthropic Claude 系列模型"
  },
  {
    name: "DeepSeek",
    icon: "brain",
    bgColor: "bg-blue-600", 
    defaultModel: "deepseek-chat",
    maxTokens: 4096,
    contextLength: 32768,
    baseUrl: "https://api.deepseek.com/v1",
    description: "DeepSeek 深度求索模型"
  },
  {
    name: "Kimi",
    icon: "brain",
    bgColor: "bg-purple-600",
    defaultModel: "moonshot-v1-8k",
    maxTokens: 4096,
    contextLength: 8192,
    baseUrl: "https://api.moonshot.cn/v1",
    description: "Kimi 月之暗面模型"
  },
  {
    name: "BigDream",
    icon: "brain",
    bgColor: "bg-indigo-600",
    defaultModel: "bigdream-chat",
    maxTokens: 4096,
    contextLength: 16384,
    baseUrl: "https://api.bigdream.ai/v1",
    description: "BigDream AI 模型"
  },
  {
    name: "Gemini",
    icon: "brain",
    bgColor: "bg-blue-500",
    defaultModel: "gemini-pro",
    maxTokens: 4096,
    contextLength: 30720,
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    description: "Google Gemini 模型"
  },
  {
    name: "Qwen",
    icon: "brain",
    bgColor: "bg-red-600",
    defaultModel: "qwen-turbo",
    maxTokens: 4096,
    contextLength: 8192,
    baseUrl: "https://dashscope.aliyuncs.com/api/v1",
    description: "阿里巴巴通义千问模型"
  },
  {
    name: "ChatGLM",
    icon: "brain",
    bgColor: "bg-teal-600",
    defaultModel: "glm-4",
    maxTokens: 4096,
    contextLength: 128000,
    baseUrl: "https://open.bigmodel.cn/api/paas/v4",
    description: "智谱 ChatGLM 模型"
  },
  {
    name: "Baichuan",
    icon: "brain",
    bgColor: "bg-amber-600",
    defaultModel: "baichuan2-turbo",
    maxTokens: 4096,
    contextLength: 32768,
    baseUrl: "https://api.baichuan-ai.com/v1",
    description: "百川智能模型"
  },
  {
    name: "Hunyuan",
    icon: "brain",
    bgColor: "bg-cyan-600",
    defaultModel: "hunyuan-lite",
    maxTokens: 4096,
    contextLength: 32768,
    baseUrl: "https://hunyuan.tencentcloudapi.com/v1",
    description: "腾讯混元模型"
  },
  {
    name: "Spark",
    icon: "brain",
    bgColor: "bg-violet-600",
    defaultModel: "generalv3",
    maxTokens: 4096,
    contextLength: 8192,
    baseUrl: "https://spark-api.xf-yun.com/v3.1",
    description: "讯飞星火模型"
  },
  {
    name: "Yi",
    icon: "brain",
    bgColor: "bg-emerald-600",
    defaultModel: "yi-large",
    maxTokens: 4096,
    contextLength: 32768,
    baseUrl: "https://api.lingyiwanwu.com/v1",
    description: "零一万物 Yi 系列模型"
  },
  {
    name: "自定义",
    icon: "brain",
    bgColor: "bg-gray-600",
    defaultModel: "",
    maxTokens: 4096,
    contextLength: 32768,
    baseUrl: "",
    description: "自定义 AI 提供商配置"
  }
];

export default function AIProviders() {
  const [providers, setProviders] = useState<AIProvider[]>([
    {
      id: "1",
      name: "OpenAI GPT-4",
      modelName: "gpt-4",
      apiKey: "sk-***", 
      icon: "brain",
      bgColor: "bg-green-600",
      status: "connected",
      statusText: "已连接",
      maxTokens: 4096,
      contextLength: 128000,
      lastTested: "刚刚"
    },
    {
      id: "2", 
      name: "Claude 3 Sonnet",
      modelName: "claude-3-sonnet-20240229",
      apiKey: "sk-ant-***",
      icon: "brain",
      bgColor: "bg-orange-600", 
      status: "error",
      statusText: "连接失败",
      maxTokens: 4096,
      contextLength: 200000,
      lastTested: "5分钟前"
    }
  ]);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newProvider, setNewProvider] = useState({
    name: "",
    apiKey: "",
    modelName: "",
    baseUrl: "",
    template: "",
    description: "",
    modelPointer: null as 'main' | 'task' | 'inference' | null
  });

  // 测试提供商连接
  const testProviderConnection = async (provider: AIProvider) => {
    setProviders(prev => prev.map(p => 
      p.id === provider.id 
        ? { ...p, status: 'testing', statusText: '测试中...' }
        : p
    ));

    toast({
      title: "测试连接",
      description: `正在测试 ${provider.name} 连接...`
    });

    try {
      // 模拟 API 调用
      setTimeout(() => {
        const success = Math.random() > 0.3;
        setProviders(prev => prev.map(p => 
          p.id === provider.id 
            ? { 
                ...p, 
                status: success ? 'connected' : 'error',
                statusText: success ? '已连接' : '连接失败',
                lastTested: '刚刚'
              }
            : p
        ));

        toast({
          title: success ? "连接成功" : "连接失败",
          description: `${provider.name} ${success ? '连接成功' : '连接失败，请检查 API 密钥'}`,
          variant: success ? "default" : "destructive"
        });
      }, 2000);
    } catch (error) {
      console.error("测试连接失败:", error);
      toast({
        title: "测试失败",
        description: "网络错误，请稍后重试",
        variant: "destructive"
      });
    }
  };

  // 删除提供商
  const deleteProvider = (providerId: string) => {
    const provider = providers.find(p => p.id === providerId);
    if (!provider) return;

    if (confirm(`确定要删除 ${provider.name} 吗？`)) {
      setProviders(prev => prev.filter(p => p.id !== providerId));
      toast({
        title: "删除成功",
        description: `${provider.name} 已删除`
      });
    }
  };

  // 添加新提供商
  const addProvider = () => {
    if (!newProvider.name || !newProvider.apiKey) {
      toast({
        title: "表单验证失败",
        description: "请填写必要信息",
        variant: "destructive"
      });
      return;
    }

    const template = PROVIDER_TEMPLATES.find(t => t.name === newProvider.template) || PROVIDER_TEMPLATES[PROVIDER_TEMPLATES.length - 1];
    
    const provider: AIProvider = {
      id: Date.now().toString(),
      name: newProvider.name,
      modelName: newProvider.modelName || template.defaultModel,
      apiKey: newProvider.apiKey,
      baseUrl: newProvider.baseUrl || template.baseUrl,
      icon: template.icon,
      bgColor: template.bgColor,
      status: 'testing',
      statusText: '测试中...',
      maxTokens: template.maxTokens,
      contextLength: template.contextLength,
      lastTested: '从未',
      description: newProvider.description || template.description,
      modelPointer: newProvider.modelPointer,
      priority: providers.length + 1
    };

    setProviders(prev => [...prev, provider]);
    setShowAddDialog(false);
    setNewProvider({ name: "", apiKey: "", modelName: "", baseUrl: "", template: "", description: "", modelPointer: null });

    toast({
      title: "添加成功",
      description: "AI 提供商已添加，正在测试连接..."
    });

    // 自动测试连接
    setTimeout(() => {
      testProviderConnection(provider);
    }, 1000);
  };

  // 处理模板选择
  const handleTemplateChange = (templateName: string) => {
    const template = PROVIDER_TEMPLATES.find(t => t.name === templateName);
    if (template) {
      setNewProvider(prev => ({
        ...prev,
        template: templateName,
        name: template.name === "自定义" ? "" : `${template.name} 配置`,
        modelName: template.defaultModel,
        baseUrl: template.baseUrl || "",
        description: template.description || ""
      }));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <Check className="w-4 h-4 text-green-600" />;
      case 'testing':
        return <Loader2 className="w-4 h-4 text-purple-600 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'text-green-600';
      case 'testing':
        return 'text-purple-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">AI 提供商</h1>
          <p className="text-gray-600 mt-1">配置和管理 AI 模型提供商</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>添加提供商</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>添加 AI 提供商</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="template">选择提供商模板</Label>
                  <Select value={newProvider.template} onValueChange={handleTemplateChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择一个模板" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROVIDER_TEMPLATES.map((template) => (
                        <SelectItem key={template.name} value={template.name}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="name">配置名称</Label>
                  <Input 
                    id="name"
                    value={newProvider.name}
                    onChange={(e) => setNewProvider(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="输入配置名称"
                  />
                </div>

                <div>
                  <Label htmlFor="apiKey">API 密钥</Label>
                  <Input 
                    id="apiKey"
                    type="password"
                    value={newProvider.apiKey}
                    onChange={(e) => setNewProvider(prev => ({ ...prev, apiKey: e.target.value }))}
                    placeholder="输入 API 密钥"
                  />
                </div>

                <div>
                  <Label htmlFor="modelName">模型名称</Label>
                  <Input 
                    id="modelName"
                    value={newProvider.modelName}
                    onChange={(e) => setNewProvider(prev => ({ ...prev, modelName: e.target.value }))}
                    placeholder="例如: gpt-4-turbo"
                  />
                </div>

                <div>
                  <Label htmlFor="baseUrl">Base URL（可选）</Label>
                  <Input 
                    id="baseUrl"
                    value={newProvider.baseUrl}
                    onChange={(e) => setNewProvider(prev => ({ ...prev, baseUrl: e.target.value }))}
                    placeholder="自定义 API 端点，留空使用默认值"
                  />
                </div>

                <div>
                  <Label htmlFor="modelPointer">模型指针（可选）</Label>
                  <Select value={newProvider.modelPointer || ''} onValueChange={(value) => setNewProvider(prev => ({ ...prev, modelPointer: (value as "main" | "task" | "inference") || null }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择模型指针类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">无指针</SelectItem>
                      <SelectItem value="main">主模型</SelectItem>
                      <SelectItem value="task">任务模型</SelectItem>
                      <SelectItem value="inference">推理模型</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description">描述（可选）</Label>
                  <Textarea 
                    id="description"
                    value={newProvider.description}
                    onChange={(e) => setNewProvider(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="添加描述信息"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  取消
                </Button>
                <Button onClick={addProvider}>
                  添加提供商
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 提供商网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {providers.map((provider) => (
          <Card key={provider.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${provider.bgColor}`}>
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{provider.name}</CardTitle>
                    <p className="text-sm text-gray-600">{provider.modelName}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(provider.status)}
                  <Badge variant="outline" className={getStatusColor(provider.status)}>
                    {provider.statusText}
                  </Badge>
                  {provider.modelPointer && (
                    <Badge variant="secondary" className="ml-1">
                      {provider.modelPointer === 'main' && '主'}
                      {provider.modelPointer === 'task' && '任务'}  
                      {provider.modelPointer === 'inference' && '推理'}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">最大 Token</span>
                  <span className="text-gray-900">{provider.maxTokens.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">上下文长度</span>
                  <span className="text-gray-900">{provider.contextLength.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">最后测试</span>
                  <span className="text-gray-900">{provider.lastTested}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => testProviderConnection(provider)}
                  disabled={provider.status === 'testing'}
                  className="flex-1"
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  {provider.status === 'testing' ? '测试中...' : '测试连接'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => deleteProvider(provider.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 空状态 */}
      {providers.length === 0 && (
        <Card className="p-12 text-center">
          <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无 AI 提供商</h3>
          <p className="text-gray-600 mb-4">添加第一个 AI 提供商开始使用写作功能</p>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                添加提供商
              </Button>
            </DialogTrigger>
          </Dialog>
        </Card>
      )}
    </div>
  );
}