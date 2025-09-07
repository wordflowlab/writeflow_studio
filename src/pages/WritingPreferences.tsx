import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { Save, RefreshCw, Settings, Eye, Zap, Globe, Brain } from "lucide-react";

interface WritingPreferences {
  // 基础设置
  defaultLanguage: string;
  writingStyle: string;
  outputLength: string;
  temperature: number;
  maxTokens: number;
  
  // 高级设置
  streamOutput: boolean;
  enableAutoSave: boolean;
  showWordCount: boolean;
  enableSpellCheck: boolean;
  
  // 写作模式
  writingMode: string;
  creativityLevel: number;
  formalityLevel: number;
  
  // 场景配置
  scenarioPresets: Record<string, any>;
  currentScenario: string;
  
  // UI 偏好
  fontSize: number;
  lineHeight: number;
  theme: string;
  editorWidth: string;
}

// 场景预设
const SCENARIO_PRESETS = {
  'academic': {
    name: '学术写作',
    writingStyle: 'academic',
    outputLength: 'long',
    temperature: 0.3,
    formalityLevel: 0.9,
    creativityLevel: 0.4,
    description: '严谨的学术论文、研究报告写作'
  },
  'business': {
    name: '商务文档',
    writingStyle: 'business',
    outputLength: 'medium',
    temperature: 0.4,
    formalityLevel: 0.8,
    creativityLevel: 0.3,
    description: '商业计划书、报告、邮件等商务文档'
  },
  'creative': {
    name: '创意写作',
    writingStyle: 'creative',
    outputLength: 'medium',
    temperature: 0.8,
    formalityLevel: 0.3,
    creativityLevel: 0.9,
    description: '小说、故事、创意内容写作'
  },
  'technical': {
    name: '技术文档',
    writingStyle: 'technical',
    outputLength: 'long',
    temperature: 0.2,
    formalityLevel: 0.7,
    creativityLevel: 0.2,
    description: '技术文档、API 文档、开发指南'
  },
  'casual': {
    name: '日常写作',
    writingStyle: 'casual',
    outputLength: 'short',
    temperature: 0.6,
    formalityLevel: 0.4,
    creativityLevel: 0.6,
    description: '博客、社交媒体、日常文档'
  }
};

export default function WritingPreferences() {
  const [preferences, setPreferences] = useState<WritingPreferences>({
    defaultLanguage: 'zh-CN',
    writingStyle: 'casual',
    outputLength: 'medium',
    temperature: 0.6,
    maxTokens: 4096,
    streamOutput: true,
    enableAutoSave: true,
    showWordCount: true,
    enableSpellCheck: true,
    writingMode: 'mixed',
    creativityLevel: 0.6,
    formalityLevel: 0.5,
    scenarioPresets: SCENARIO_PRESETS,
    currentScenario: 'casual',
    fontSize: 14,
    lineHeight: 1.6,
    theme: 'light',
    editorWidth: 'wide'
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 监听偏好变化
  useEffect(() => {
    setHasChanges(true);
  }, [preferences]);

  // 应用场景预设
  const applyScenarioPreset = (scenarioKey: string) => {
    const preset = SCENARIO_PRESETS[scenarioKey as keyof typeof SCENARIO_PRESETS];
    if (!preset) return;

    setPreferences(prev => ({
      ...prev,
      currentScenario: scenarioKey,
      writingStyle: preset.writingStyle,
      outputLength: preset.outputLength,
      temperature: preset.temperature,
      formalityLevel: preset.formalityLevel,
      creativityLevel: preset.creativityLevel
    }));

    toast({
      title: "场景已应用",
      description: `已切换到 ${preset.name} 模式`
    });
  };

  // 保存偏好设置
  const savePreferences = async () => {
    setIsSaving(true);
    try {
      // 这里调用 Tauri 后端保存配置
      // await invoke("save_writing_preferences", { preferences });
      
      // 模拟保存
      setTimeout(() => {
        setIsSaving(false);
        setHasChanges(false);
        toast({
          title: "保存成功",
          description: "写作偏好设置已保存"
        });
      }, 1000);
    } catch (error) {
      setIsSaving(false);
      console.error("保存偏好失败:", error);
      toast({
        title: "保存失败",
        description: "无法保存偏好设置，请重试",
        variant: "destructive"
      });
    }
  };

  // 重置到默认设置
  const resetToDefaults = () => {
    if (confirm("确定要重置到默认设置吗？这将清除所有自定义配置。")) {
      setPreferences({
        defaultLanguage: 'zh-CN',
        writingStyle: 'casual',
        outputLength: 'medium',
        temperature: 0.6,
        maxTokens: 4096,
        streamOutput: true,
        enableAutoSave: true,
        showWordCount: true,
        enableSpellCheck: true,
        writingMode: 'mixed',
        creativityLevel: 0.6,
        formalityLevel: 0.5,
        scenarioPresets: SCENARIO_PRESETS,
        currentScenario: 'casual',
        fontSize: 14,
        lineHeight: 1.6,
        theme: 'light',
        editorWidth: 'wide'
      });

      toast({
        title: "已重置",
        description: "偏好设置已重置到默认值"
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题和操作 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">写作偏好</h1>
          <p className="text-gray-600 mt-1">配置你的写作风格和偏好设置</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={resetToDefaults}>
            <RefreshCw className="w-4 h-4 mr-2" />
            重置
          </Button>
          <Button onClick={savePreferences} disabled={!hasChanges || isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? '保存中...' : '保存设置'}
          </Button>
        </div>
      </div>

      {/* 场景快速切换 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="w-5 h-5 mr-2" />
            快速场景切换
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {Object.entries(SCENARIO_PRESETS).map(([key, preset]) => (
              <div
                key={key}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  preferences.currentScenario === key
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => applyScenarioPreset(key)}
              >
                <h3 className="font-medium text-gray-900">{preset.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{preset.description}</p>
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                  <span>创意: {Math.round(preset.creativityLevel * 100)}%</span>
                  <span>正式: {Math.round(preset.formalityLevel * 100)}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 基础设置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              基础设置
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="defaultLanguage">默认语言</Label>
              <Select value={preferences.defaultLanguage} onValueChange={(value) => setPreferences(prev => ({ ...prev, defaultLanguage: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="选择默认语言" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zh-CN">中文（简体）</SelectItem>
                  <SelectItem value="zh-TW">中文（繁体）</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ja">日本語</SelectItem>
                  <SelectItem value="ko">한국어</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="writingStyle">写作风格</Label>
              <Select value={preferences.writingStyle} onValueChange={(value) => setPreferences(prev => ({ ...prev, writingStyle: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="选择写作风格" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="formal">正式</SelectItem>
                  <SelectItem value="casual">休闲</SelectItem>
                  <SelectItem value="academic">学术</SelectItem>
                  <SelectItem value="creative">创意</SelectItem>
                  <SelectItem value="business">商务</SelectItem>
                  <SelectItem value="technical">技术</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="outputLength">输出长度</Label>
              <Select value={preferences.outputLength} onValueChange={(value) => setPreferences(prev => ({ ...prev, outputLength: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="选择输出长度" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">简短</SelectItem>
                  <SelectItem value="medium">中等</SelectItem>
                  <SelectItem value="long">详细</SelectItem>
                  <SelectItem value="auto">自动</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="writingMode">写作模式</Label>
              <Select value={preferences.writingMode} onValueChange={(value) => setPreferences(prev => ({ ...prev, writingMode: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="选择写作模式" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="creative">创意模式</SelectItem>
                  <SelectItem value="analytical">分析模式</SelectItem>
                  <SelectItem value="technical">技术模式</SelectItem>
                  <SelectItem value="mixed">混合模式</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 高级参数 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="w-5 h-5 mr-2" />
              高级参数
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>创意程度</Label>
                <span className="text-sm text-gray-600">{Math.round(preferences.creativityLevel * 100)}%</span>
              </div>
              <Slider
                value={[preferences.creativityLevel]}
                onValueChange={([value]) => setPreferences(prev => ({ ...prev, creativityLevel: value }))}
                max={1}
                min={0}
                step={0.1}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>正式程度</Label>
                <span className="text-sm text-gray-600">{Math.round(preferences.formalityLevel * 100)}%</span>
              </div>
              <Slider
                value={[preferences.formalityLevel]}
                onValueChange={([value]) => setPreferences(prev => ({ ...prev, formalityLevel: value }))}
                max={1}
                min={0}
                step={0.1}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>温度参数</Label>
                <span className="text-sm text-gray-600">{preferences.temperature}</span>
              </div>
              <Slider
                value={[preferences.temperature]}
                onValueChange={([value]) => setPreferences(prev => ({ ...prev, temperature: value }))}
                max={1}
                min={0}
                step={0.1}
                className="w-full"
              />
            </div>

            <div>
              <Label htmlFor="maxTokens">最大 Token 数</Label>
              <Input
                id="maxTokens"
                type="number"
                value={preferences.maxTokens}
                onChange={(e) => setPreferences(prev => ({ ...prev, maxTokens: parseInt(e.target.value) || 4096 }))}
                min={100}
                max={32000}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 编辑器和 UI 设置 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="w-5 h-5 mr-2" />
              编辑器设置
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>字体大小</Label>
                <span className="text-sm text-gray-600">{preferences.fontSize}px</span>
              </div>
              <Slider
                value={[preferences.fontSize]}
                onValueChange={([value]) => setPreferences(prev => ({ ...prev, fontSize: value }))}
                max={20}
                min={10}
                step={1}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>行高</Label>
                <span className="text-sm text-gray-600">{preferences.lineHeight}</span>
              </div>
              <Slider
                value={[preferences.lineHeight]}
                onValueChange={([value]) => setPreferences(prev => ({ ...prev, lineHeight: value }))}
                max={2}
                min={1}
                step={0.1}
                className="w-full"
              />
            </div>

            <div>
              <Label htmlFor="editorWidth">编辑器宽度</Label>
              <Select value={preferences.editorWidth} onValueChange={(value) => setPreferences(prev => ({ ...prev, editorWidth: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="选择编辑器宽度" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="narrow">窄屏（600px）</SelectItem>
                  <SelectItem value="medium">中等（800px）</SelectItem>
                  <SelectItem value="wide">宽屏（1000px）</SelectItem>
                  <SelectItem value="full">全宽</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="theme">界面主题</Label>
              <Select value={preferences.theme} onValueChange={(value) => setPreferences(prev => ({ ...prev, theme: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="选择主题" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">浅色</SelectItem>
                  <SelectItem value="dark">深色</SelectItem>
                  <SelectItem value="auto">跟随系统</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 功能开关 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              功能开关
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>流式输出</Label>
                <p className="text-sm text-gray-600">实时显示 AI 生成的内容</p>
              </div>
              <Switch
                checked={preferences.streamOutput}
                onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, streamOutput: checked }))}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label>自动保存</Label>
                <p className="text-sm text-gray-600">自动保存文档更改</p>
              </div>
              <Switch
                checked={preferences.enableAutoSave}
                onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, enableAutoSave: checked }))}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label>显示字数统计</Label>
                <p className="text-sm text-gray-600">在状态栏显示字数</p>
              </div>
              <Switch
                checked={preferences.showWordCount}
                onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, showWordCount: checked }))}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label>拼写检查</Label>
                <p className="text-sm text-gray-600">启用实时拼写检查</p>
              </div>
              <Switch
                checked={preferences.enableSpellCheck}
                onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, enableSpellCheck: checked }))}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}