import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  PlayCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Book,
  FileText,
  Settings,
  Brain,
  Lightbulb,
  Target
} from "lucide-react";

interface InteractiveTutorialProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
  action?: string;
  completed?: boolean;
}

// 教程内容定义
const TUTORIAL_MODULES = [
  {
    id: 'basics',
    name: '基础操作',
    icon: Book,
    color: 'bg-blue-100 text-blue-700',
    steps: [
      {
        id: 'create-project',
        title: '创建第一个项目',
        description: '学习如何创建和管理写作项目',
        content: (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">📁 项目是什么？</h3>
              <p className="text-sm text-gray-700 mb-3">
                项目是您所有相关文档的容器。比如一本书、一篇论文、一个网站的内容都可以作为一个项目。
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mr-2" />
                  <span>点击侧边栏的"项目管理"</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mr-2" />
                  <span>点击"新建项目"按钮</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mr-2" />
                  <span>选择项目模板（学术、商务、创意等）</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mr-2" />
                  <span>填写项目名称和描述</span>
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
              <p className="text-sm text-yellow-800">
                💡 <strong>小贴士：</strong>项目名称要清晰明了，方便后期查找。描述可以包含项目的目标和主要内容。
              </p>
            </div>
          </div>
        ),
        action: '去创建项目'
      },
      {
        id: 'create-document',
        title: '创建和编辑文档',
        description: '在项目中创建文档并进行编辑',
        content: (
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">📝 文档编辑器</h3>
              <p className="text-sm text-gray-700 mb-3">
                WriteFlow 使用 Markdown 格式，支持实时预览，让您专注于内容创作。
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">基本语法：</h4>
                  <div className="bg-gray-100 p-2 rounded font-mono text-xs space-y-1">
                    <div># 一级标题</div>
                    <div>## 二级标题</div>
                    <div>**粗体文本**</div>
                    <div>*斜体文本*</div>
                    <div>`代码`</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">高级功能：</h4>
                  <div className="space-y-1 text-xs">
                    <div>• 实时预览</div>
                    <div>• 自动保存</div>
                    <div>• 文档大纲导航</div>
                    <div>• AI 写作助手</div>
                    <div>• 多格式导出</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ),
        action: '开始编辑'
      }
    ]
  },
  {
    id: 'ai-features',
    name: 'AI 功能',
    icon: Brain,
    color: 'bg-purple-100 text-purple-700',
    steps: [
      {
        id: 'setup-ai',
        title: '配置 AI 提供商',
        description: '设置您的 AI 写作助手',
        content: (
          <div className="space-y-4">
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">🤖 AI 提供商配置</h3>
              <p className="text-sm text-gray-700 mb-3">
                配置 AI 提供商后，您就可以使用智能写作功能了。
              </p>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-white p-2 rounded border">
                    <div className="font-medium">OpenAI</div>
                    <div className="text-xs text-gray-600">通用性强，质量稳定</div>
                  </div>
                  <div className="bg-white p-2 rounded border">
                    <div className="font-medium">Claude</div>
                    <div className="text-xs text-gray-600">擅长长文本处理</div>
                  </div>
                  <div className="bg-white p-2 rounded border">
                    <div className="font-medium">DeepSeek</div>
                    <div className="text-xs text-gray-600">代码和技术文档</div>
                  </div>
                  <div className="bg-white p-2 rounded border">
                    <div className="font-medium">Kimi</div>
                    <div className="text-xs text-gray-600">中文优化，联网搜索</div>
                  </div>
                </div>
                <div className="bg-blue-100 p-3 rounded">
                  <p className="text-sm text-blue-800">
                    <strong>配置步骤：</strong> 侧边栏 → AI 提供商 → 添加提供商 → 选择模板 → 输入 API 密钥 → 测试连接
                  </p>
                </div>
              </div>
            </div>
          </div>
        ),
        action: '配置 AI'
      },
      {
        id: 'use-ai',
        title: '使用 AI 写作助手',
        description: '在编辑器中调用 AI 进行写作',
        content: (
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">✨ AI 写作功能</h3>
              <div className="space-y-3 text-sm">
                <div className="space-y-2">
                  <h4 className="font-medium">快捷调用方式：</h4>
                  <div className="bg-white p-2 rounded border space-y-1">
                    <div><kbd className="bg-gray-100 px-2 py-1 rounded text-xs">Ctrl + K</kbd> 打开 AI 命令面板</div>
                    <div><kbd className="bg-gray-100 px-2 py-1 rounded text-xs">Ctrl + Enter</kbd> 快速生成内容</div>
                    <div><kbd className="bg-gray-100 px-2 py-1 rounded text-xs">Ctrl + R</kbd> 重写选中文本</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">常用功能：</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white p-2 rounded border text-center">
                      <div className="font-medium text-xs">内容生成</div>
                      <div className="text-xs text-gray-600">续写文章</div>
                    </div>
                    <div className="bg-white p-2 rounded border text-center">
                      <div className="font-medium text-xs">文本改写</div>
                      <div className="text-xs text-gray-600">优化表达</div>
                    </div>
                    <div className="bg-white p-2 rounded border text-center">
                      <div className="font-medium text-xs">智能校对</div>
                      <div className="text-xs text-gray-600">检查错误</div>
                    </div>
                    <div className="bg-white p-2 rounded border text-center">
                      <div className="font-medium text-xs">内容总结</div>
                      <div className="text-xs text-gray-600">提取要点</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ),
        action: '体验 AI'
      }
    ]
  },
  {
    id: 'advanced',
    name: '高级功能',
    icon: Settings,
    color: 'bg-orange-100 text-orange-700',
    steps: [
      {
        id: 'export-share',
        title: '导出和分享',
        description: '将您的作品导出为多种格式',
        content: (
          <div className="space-y-4">
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">📤 导出功能</h3>
              <p className="text-sm text-gray-700 mb-3">
                支持多种格式导出，满足不同场景需求。
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-white p-3 rounded border">
                  <div className="flex items-center mb-2">
                    <FileText className="w-4 h-4 mr-2" />
                    <span className="font-medium">Markdown</span>
                  </div>
                  <p className="text-xs text-gray-600">保留原始格式，适合技术分享</p>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="flex items-center mb-2">
                    <FileText className="w-4 h-4 mr-2" />
                    <span className="font-medium">PDF</span>
                  </div>
                  <p className="text-xs text-gray-600">专业排版，适合正式文档</p>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="flex items-center mb-2">
                    <FileText className="w-4 h-4 mr-2" />
                    <span className="font-medium">Word</span>
                  </div>
                  <p className="text-xs text-gray-600">兼容性好，便于后续编辑</p>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="flex items-center mb-2">
                    <FileText className="w-4 h-4 mr-2" />
                    <span className="font-medium">HTML</span>
                  </div>
                  <p className="text-xs text-gray-600">网页格式，便于在线分享</p>
                </div>
              </div>
            </div>
          </div>
        ),
        action: '尝试导出'
      },
      {
        id: 'customization',
        title: '个性化设置',
        description: '根据您的习惯定制工作环境',
        content: (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">⚙️ 个性化配置</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="font-medium mb-2">写作偏好：</h4>
                  <div className="bg-white p-2 rounded border space-y-1">
                    <div>• 选择默认写作风格（正式/轻松/学术/创意）</div>
                    <div>• 设置 AI 创意程度和正式程度</div>
                    <div>• 配置编辑器主题和字体大小</div>
                    <div>• 开启/关闭自动保存和拼写检查</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">快捷键：</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><kbd>Ctrl + S</kbd> 保存文档</div>
                    <div><kbd>Ctrl + K</kbd> AI 命令</div>
                    <div><kbd>Ctrl + P</kbd> 预览模式</div>
                    <div><kbd>Ctrl + /</kbd> 帮助</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ),
        action: '个性化设置'
      }
    ]
  }
];

export default function InteractiveTutorial({ open, onOpenChange }: InteractiveTutorialProps) {
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const selectedModuleData = TUTORIAL_MODULES.find(m => m.id === selectedModule);
  const currentStep = selectedModuleData?.steps[currentStepIndex];

  const handleModuleSelect = (moduleId: string) => {
    setSelectedModule(moduleId);
    setCurrentStepIndex(0);
  };

  const handleNext = () => {
    if (selectedModuleData && currentStepIndex < selectedModuleData.steps.length - 1) {
      if (currentStep) {
        setCompletedSteps(prev => new Set(prev).add(currentStep.id));
      }
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleComplete = () => {
    if (currentStep) {
      setCompletedSteps(prev => new Set(prev).add(currentStep.id));
    }
    // 返回模块选择页面或关闭
    setSelectedModule('');
  };

  const getModuleProgress = (moduleId: string) => {
    const module = TUTORIAL_MODULES.find(m => m.id === moduleId);
    if (!module) return 0;
    const completed = module.steps.filter(step => completedSteps.has(step.id)).length;
    return (completed / module.steps.length) * 100;
  };

  const renderModuleSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">交互式教程</h2>
        <p className="text-gray-600">选择一个教程模块开始学习 WriteFlow Studio</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TUTORIAL_MODULES.map((module) => {
          const progress = getModuleProgress(module.id);
          const isCompleted = progress === 100;
          
          return (
            <Card
              key={module.id}
              className="cursor-pointer transition-all hover:shadow-md border-2 hover:border-blue-300"
              onClick={() => handleModuleSelect(module.id)}
            >
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg ${module.color} flex items-center justify-center mb-4`}>
                  <module.icon className="w-6 h-6" />
                </div>
                <CardTitle className="text-lg">{module.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    {module.steps.length} 个步骤
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>进度</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge variant={isCompleted ? "default" : "secondary"}>
                      {isCompleted ? '已完成' : '未开始'}
                    </Badge>
                    <Button variant="outline" size="sm">
                      {progress > 0 ? '继续学习' : '开始学习'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center">
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          稍后学习
        </Button>
      </div>
    </div>
  );

  const renderTutorialStep = () => {
    if (!selectedModuleData || !currentStep) return null;

    const progress = ((currentStepIndex + 1) / selectedModuleData.steps.length) * 100;

    return (
      <div className="space-y-6">
        {/* 模块信息和进度 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedModule('')}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回
            </Button>
            <div>
              <h2 className="text-xl font-semibold">{selectedModuleData.name}</h2>
              <p className="text-sm text-gray-600">
                步骤 {currentStepIndex + 1} / {selectedModuleData.steps.length}
              </p>
            </div>
          </div>
          <Badge variant="outline">
            {Math.round(progress)}% 完成
          </Badge>
        </div>

        <Progress value={progress} className="h-3" />

        {/* 步骤内容 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-5 h-5 mr-2" />
              {currentStep.title}
            </CardTitle>
            <p className="text-gray-600">{currentStep.description}</p>
          </CardHeader>
          <CardContent>
            {currentStep.content}
          </CardContent>
        </Card>

        {/* 导航按钮 */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            上一步
          </Button>
          
          <div className="space-x-3">
            {currentStep.action && (
              <Button variant="outline">
                <PlayCircle className="w-4 h-4 mr-2" />
                {currentStep.action}
              </Button>
            )}
            
            {currentStepIndex === selectedModuleData.steps.length - 1 ? (
              <Button onClick={handleComplete}>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                完成教程
              </Button>
            ) : (
              <Button onClick={handleNext}>
                下一步
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Lightbulb className="w-5 h-5 mr-2" />
            WriteFlow Studio 教程
          </DialogTitle>
        </DialogHeader>

        <div className="min-h-[500px]">
          {selectedModule ? renderTutorialStep() : renderModuleSelection()}
        </div>
      </DialogContent>
    </Dialog>
  );
}