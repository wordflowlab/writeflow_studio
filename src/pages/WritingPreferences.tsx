import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useAppStore, WritingScenario } from "@/store/app";
import { Save, RefreshCw, Settings, Eye, Zap, Globe, Brain, Plus, Edit2, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

// 场景预设
const SCENARIO_PRESETS = {
  'academic': {
    name: '学术写作',
    description: '严谨的学术论文、研究报告写作',
    system_prompt: '你是一个专业的学术写作助手。请使用严谨、准确的学术语言，注重逻辑性和证据支撑。',
    temperature: 0.3,
    max_tokens: 4096,
  },
  'business': {
    name: '商务文档',
    description: '商业计划书、报告、邮件等商务文档',
    system_prompt: '你是一个专业的商务写作助手。请使用正式、简洁的商务语言，突出要点和结果。',
    temperature: 0.4,
    max_tokens: 3000,
  },
  'creative': {
    name: '创意写作',
    description: '小说、故事、创意内容写作',
    system_prompt: '你是一个富有创意的写作助手。请发挥想象力，使用生动的语言和丰富的细节。',
    temperature: 0.8,
    max_tokens: 4096,
  },
  'technical': {
    name: '技术文档',
    description: '技术文档、API 文档、开发指南',
    system_prompt: '你是一个专业的技术写作助手。请使用准确、清晰的技术语言，注重实用性和可操作性。',
    temperature: 0.2,
    max_tokens: 4096,
  },
  'casual': {
    name: '日常写作',
    description: '博客、社交媒体、日常文档',
    system_prompt: '你是一个友好的写作助手。请使用自然、易懂的语言，保持亲切的语调。',
    temperature: 0.6,
    max_tokens: 2048,
  }
};

interface ScenarioFormData {
  name: string;
  description: string;
  system_prompt: string;
  temperature: number;
  max_tokens: number;
}

export default function WritingPreferences() {
  const { config, saveConfig } = useAppStore();
  const [isSaving, setIsSaving] = useState(false);
  const [scenarioDialogOpen, setScenarioDialogOpen] = useState(false);
  const [editingScenario, setEditingScenario] = useState<string | null>(null);
  
  const [scenarioFormData, setScenarioFormData] = useState<ScenarioFormData>({
    name: "",
    description: "",
    system_prompt: "",
    temperature: 0.7,
    max_tokens: 2048,
  });

  // 获取当前写作偏好配置
  const writingPrefs = config?.writing_preferences || {
    language: "zh-CN",
    writing_style: "professional",
    tone: "neutral",
    target_audience: "general",
    scenarios: {},
    custom_prompts: {},
  };

  const scenarios = writingPrefs.scenarios || {};
  const scenariosList = Object.entries(scenarios);

  // 保存配置
  const handleSave = async () => {
    if (!config) return;

    try {
      setIsSaving(true);
      
      const updatedConfig = {
        ...config,
        writing_preferences: writingPrefs,
      };

      await saveConfig(updatedConfig);
      
      toast({
        title: "保存成功",
        description: "写作偏好设置已保存",
      });
    } catch (error) {
      toast({
        title: "保存失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // 更新写作偏好
  const updateWritingPrefs = (key: keyof typeof writingPrefs, value: any) => {
    if (!config) return;

    const updatedConfig = {
      ...config,
      writing_preferences: {
        ...writingPrefs,
        [key]: value,
      },
    };

    // 直接保存到 store，这样 UI 会立即更新
    saveConfig(updatedConfig).catch(error => {
      toast({
        title: "更新失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive",
      });
    });
  };

  // 应用预设场景
  const applyPresetScenario = async (presetKey: string) => {
    const preset = SCENARIO_PRESETS[presetKey as keyof typeof SCENARIO_PRESETS];
    if (!preset || !config) return;

    try {
      const scenarioId = `preset_${presetKey}`;
      const newScenario: WritingScenario = {
        name: preset.name,
        description: preset.description,
        system_prompt: preset.system_prompt,
        temperature: preset.temperature,
        max_tokens: preset.max_tokens,
      };

      const updatedConfig = {
        ...config,
        writing_preferences: {
          ...writingPrefs,
          scenarios: {
            ...scenarios,
            [scenarioId]: newScenario,
          },
        },
      };

      await saveConfig(updatedConfig);
      
      toast({
        title: "场景已添加",
        description: `${preset.name} 场景已添加到您的偏好设置`,
      });
    } catch (error) {
      toast({
        title: "添加失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive",
      });
    }
  };

  // 创建或编辑场景
  const handleScenarioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;

    try {
      const scenarioId = editingScenario || `custom_${Date.now()}`;
      const newScenario: WritingScenario = {
        name: scenarioFormData.name,
        description: scenarioFormData.description,
        system_prompt: scenarioFormData.system_prompt,
        temperature: scenarioFormData.temperature,
        max_tokens: scenarioFormData.max_tokens,
      };

      const updatedConfig = {
        ...config,
        writing_preferences: {
          ...writingPrefs,
          scenarios: {
            ...scenarios,
            [scenarioId]: newScenario,
          },
        },
      };

      await saveConfig(updatedConfig);
      
      toast({
        title: editingScenario ? "更新成功" : "创建成功",
        description: `场景 "${scenarioFormData.name}" ${editingScenario ? "已更新" : "已创建"}`,
      });

      setScenarioDialogOpen(false);
      resetScenarioForm();
    } catch (error) {
      toast({
        title: "操作失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive",
      });
    }
  };

  // 删除场景
  const deleteScenario = async (scenarioId: string, scenarioName: string) => {
    if (!config) return;

    try {
      const { [scenarioId]: removed, ...remainingScenarios } = scenarios;
      
      const updatedConfig = {
        ...config,
        writing_preferences: {
          ...writingPrefs,
          scenarios: remainingScenarios,
        },
      };

      await saveConfig(updatedConfig);
      
      toast({
        title: "删除成功",
        description: `场景 "${scenarioName}" 已删除`,
      });
    } catch (error) {
      toast({
        title: "删除失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive",
      });
    }
  };

  // 编辑场景
  const editScenario = (scenarioId: string, scenario: WritingScenario) => {
    setScenarioFormData({
      name: scenario.name,
      description: scenario.description,
      system_prompt: scenario.system_prompt,
      temperature: scenario.temperature,
      max_tokens: scenario.max_tokens,
    });
    setEditingScenario(scenarioId);
    setScenarioDialogOpen(true);
  };

  const resetScenarioForm = () => {
    setScenarioFormData({
      name: "",
      description: "",
      system_prompt: "",
      temperature: 0.7,
      max_tokens: 2048,
    });
    setEditingScenario(null);
  };

  if (!config) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">加载设置中...</h2>
          <p className="text-muted-foreground">请稍候</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">写作偏好</h2>
          <p className="text-muted-foreground">
            配置您的写作风格、语言偏好和场景设置
          </p>
        </div>
      </div>

      {/* 基础设置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            基础设置
          </CardTitle>
          <CardDescription>设置默认的语言和写作风格</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="language">默认语言</Label>
              <Select
                value={writingPrefs.language}
                onValueChange={(value) => updateWritingPrefs('language', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zh-CN">中文</SelectItem>
                  <SelectItem value="en-US">English</SelectItem>
                  <SelectItem value="ja-JP">日本語</SelectItem>
                  <SelectItem value="ko-KR">한국어</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="writing-style">写作风格</Label>
              <Select
                value={writingPrefs.writing_style}
                onValueChange={(value) => updateWritingPrefs('writing_style', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">专业</SelectItem>
                  <SelectItem value="casual">随意</SelectItem>
                  <SelectItem value="academic">学术</SelectItem>
                  <SelectItem value="creative">创意</SelectItem>
                  <SelectItem value="technical">技术</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tone">语调风格</Label>
              <Select
                value={writingPrefs.tone}
                onValueChange={(value) => updateWritingPrefs('tone', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="neutral">中性</SelectItem>
                  <SelectItem value="friendly">友好</SelectItem>
                  <SelectItem value="formal">正式</SelectItem>
                  <SelectItem value="enthusiastic">热情</SelectItem>
                  <SelectItem value="authoritative">权威</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target-audience">目标受众</Label>
              <Select
                value={writingPrefs.target_audience}
                onValueChange={(value) => updateWritingPrefs('target_audience', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">一般用户</SelectItem>
                  <SelectItem value="expert">专业人士</SelectItem>
                  <SelectItem value="student">学生</SelectItem>
                  <SelectItem value="business">商务人士</SelectItem>
                  <SelectItem value="technical">技术人员</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 预设场景 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            预设场景
          </CardTitle>
          <CardDescription>快速应用常用的写作场景设置</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(SCENARIO_PRESETS).map(([key, preset]) => (
              <Card key={key} className="p-4 hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{preset.name}</h4>
                    <Badge variant="outline">
                      T: {preset.temperature}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{preset.description}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => applyPresetScenario(key)}
                    className="w-full"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    添加场景
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 自定义场景 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              自定义场景
            </CardTitle>
            <CardDescription>管理您的自定义写作场景</CardDescription>
          </div>
          <Dialog open={scenarioDialogOpen} onOpenChange={(open) => {
            setScenarioDialogOpen(open);
            if (!open) resetScenarioForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                创建场景
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingScenario ? "编辑场景" : "创建场景"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleScenarioSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">场景名称 *</Label>
                    <Input
                      id="name"
                      value={scenarioFormData.name}
                      onChange={(e) => setScenarioFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">描述</Label>
                    <Input
                      id="description"
                      value={scenarioFormData.description}
                      onChange={(e) => setScenarioFormData(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="system-prompt">系统提示 *</Label>
                  <Textarea
                    id="system-prompt"
                    value={scenarioFormData.system_prompt}
                    onChange={(e) => setScenarioFormData(prev => ({ ...prev, system_prompt: e.target.value }))}
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="temperature">创意度: {scenarioFormData.temperature}</Label>
                    <Slider
                      value={[scenarioFormData.temperature]}
                      onValueChange={([value]) => setScenarioFormData(prev => ({ ...prev, temperature: value }))}
                      max={1}
                      min={0}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max-tokens">最大输出长度</Label>
                    <Input
                      id="max-tokens"
                      type="number"
                      value={scenarioFormData.max_tokens}
                      onChange={(e) => setScenarioFormData(prev => ({ ...prev, max_tokens: parseInt(e.target.value) || 2048 }))}
                      min="100"
                      max="8000"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setScenarioDialogOpen(false)}>
                    取消
                  </Button>
                  <Button type="submit">
                    {editingScenario ? "更新" : "创建"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {scenariosList.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>暂无自定义场景</p>
                <p className="text-sm">创建您的第一个写作场景</p>
              </div>
            ) : (
              scenariosList.map(([scenarioId, scenario]) => (
                <Card key={scenarioId} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{scenario.name}</h4>
                        <Badge variant="outline">
                          T: {scenario.temperature}
                        </Badge>
                        <Badge variant="outline">
                          {scenario.max_tokens} tokens
                        </Badge>
                      </div>
                      {scenario.description && (
                        <p className="text-sm text-muted-foreground">{scenario.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground bg-muted p-2 rounded">
                        {scenario.system_prompt}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => editScenario(scenarioId, scenario)}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteScenario(scenarioId, scenario.name)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}