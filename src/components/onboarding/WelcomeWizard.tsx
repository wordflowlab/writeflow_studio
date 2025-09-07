import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  GraduationCap, 
  Briefcase, 
  Code, 
  PenTool,
  BookOpen,
  FileText,
  Brain,
  Settings,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles
} from "lucide-react";

interface WelcomeWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (profile: UserProfile) => void;
}

interface UserProfile {
  identity: string;
  writingType: string[];
  frequency: string;
  collaboration: string;
  techLevel: string;
  preferredAI: string[];
  preferredAgents: string[];
  writingStyle: string;
}

// 用户身份选项
const USER_IDENTITIES = [
  {
    id: 'student',
    name: '学生',
    icon: GraduationCap,
    description: '在校学生，需要写作业、论文、报告',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    scenarios: ['学术论文', '课程作业', '研究报告']
  },
  {
    id: 'writer',
    name: '创意写作者',
    icon: PenTool,
    description: '小说家、剧本作者、内容创作者',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    scenarios: ['小说创作', '剧本写作', '创意内容']
  },
  {
    id: 'business',
    name: '商务人士',
    icon: Briefcase,
    description: '需要写商业计划书、报告、提案',
    color: 'bg-green-100 text-green-700 border-green-200',
    scenarios: ['商业计划书', '项目提案', '会议纪要']
  },
  {
    id: 'developer',
    name: '技术人员',
    icon: Code,
    description: '程序员、技术作家、文档工程师',
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    scenarios: ['API 文档', '技术规范', '开发指南']
  }
];

// 写作类型选项
const WRITING_TYPES = [
  { id: 'academic', name: '学术写作', icon: GraduationCap },
  { id: 'creative', name: '创意写作', icon: PenTool },
  { id: 'business', name: '商务文档', icon: Briefcase },
  { id: 'technical', name: '技术文档', icon: Code },
  { id: 'blog', name: '博客文章', icon: FileText },
  { id: 'report', name: '报告总结', icon: BookOpen }
];

// AI 提供商推荐
const AI_RECOMMENDATIONS = {
  student: ['OpenAI', 'Claude', 'DeepSeek'],
  writer: ['Claude', 'OpenAI', 'Kimi'],
  business: ['OpenAI', 'DeepSeek', 'ChatGLM'],
  developer: ['Claude', 'OpenAI', 'DeepSeek']
};

// Agent 推荐
const AGENT_RECOMMENDATIONS = {
  student: ['论文写作助手', '文献综述生成器', '学术格式校对器'],
  writer: ['小说情节助手', '角色设定生成器', '对话优化工具'],
  business: ['PPT 大纲生成器', '商业计划书助手', '会议纪要整理'],
  developer: ['API 文档生成', '代码注释优化', '技术博客助手']
};

export default function WelcomeWizard({ open, onOpenChange, onComplete }: WelcomeWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState<UserProfile>({
    identity: '',
    writingType: [],
    frequency: '',
    collaboration: '',
    techLevel: '',
    preferredAI: [],
    preferredAgents: [],
    writingStyle: ''
  });

  const totalSteps = 6;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // 根据身份自动推荐 AI 和 Agent
    const recommendedAI = AI_RECOMMENDATIONS[profile.identity as keyof typeof AI_RECOMMENDATIONS] || [];
    const recommendedAgents = AGENT_RECOMMENDATIONS[profile.identity as keyof typeof AGENT_RECOMMENDATIONS] || [];
    
    const finalProfile = {
      ...profile,
      preferredAI: recommendedAI,
      preferredAgents: recommendedAgents
    };

    onComplete(finalProfile);
    onOpenChange(false);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return profile.identity !== '';
      case 1: return profile.writingType.length > 0;
      case 2: return profile.frequency !== '';
      case 3: return profile.collaboration !== '';
      case 4: return profile.techLevel !== '';
      case 5: return profile.writingStyle !== '';
      default: return true;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">欢迎使用 WriteFlow Studio！</h2>
              <p className="text-gray-600">请选择最符合您身份的选项，我们将为您定制最佳的写作体验</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {USER_IDENTITIES.map((identity) => (
                <Card
                  key={identity.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    profile.identity === identity.id
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => setProfile(prev => ({ ...prev, identity: identity.id }))}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg ${identity.color}`}>
                        <identity.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">{identity.name}</h3>
                        <p className="text-sm text-gray-600 mb-3">{identity.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {identity.scenarios.map((scenario) => (
                            <Badge key={scenario} variant="secondary" className="text-xs">
                              {scenario}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">您主要进行哪些类型的写作？</h2>
              <p className="text-gray-600">可以选择多个选项</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {WRITING_TYPES.map((type) => (
                <Card
                  key={type.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    profile.writingType.includes(type.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => {
                    const newTypes = profile.writingType.includes(type.id)
                      ? profile.writingType.filter(t => t !== type.id)
                      : [...profile.writingType, type.id];
                    setProfile(prev => ({ ...prev, writingType: newTypes }));
                  }}
                >
                  <CardContent className="p-4 text-center">
                    <type.icon className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                    <h3 className="font-medium text-sm">{type.name}</h3>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">您的写作频次是？</h2>
              <p className="text-gray-600">了解您的使用频率有助于我们优化体验</p>
            </div>
            
            <div className="space-y-3">
              {[
                { id: 'daily', name: '每天都写', desc: '每天都有写作任务' },
                { id: 'weekly', name: '每周几次', desc: '一周写作 2-3 次' },
                { id: 'monthly', name: '每月几次', desc: '偶尔写作，主要是项目性质' },
                { id: 'rarely', name: '很少写作', desc: '只在需要时才写作' }
              ].map((option) => (
                <Card
                  key={option.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    profile.frequency === option.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => setProfile(prev => ({ ...prev, frequency: option.id }))}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{option.name}</h3>
                        <p className="text-sm text-gray-600">{option.desc}</p>
                      </div>
                      {profile.frequency === option.id && (
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">您需要协作功能吗？</h2>
              <p className="text-gray-600">是否需要与他人协同编辑和分享</p>
            </div>
            
            <div className="space-y-3">
              {[
                { id: 'team', name: '团队协作', desc: '需要与团队成员协同编辑' },
                { id: 'share', name: '偶尔分享', desc: '偶尔需要分享给他人查看' },
                { id: 'solo', name: '个人使用', desc: '主要自己使用，不需要协作' }
              ].map((option) => (
                <Card
                  key={option.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    profile.collaboration === option.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => setProfile(prev => ({ ...prev, collaboration: option.id }))}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{option.name}</h3>
                        <p className="text-sm text-gray-600">{option.desc}</p>
                      </div>
                      {profile.collaboration === option.id && (
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">您的技术水平？</h2>
              <p className="text-gray-600">帮助我们为您提供合适的功能复杂度</p>
            </div>
            
            <div className="space-y-3">
              {[
                { id: 'beginner', name: '初学者', desc: '不熟悉技术配置，希望简单易用' },
                { id: 'intermediate', name: '中级用户', desc: '有一定技术基础，可以进行基本配置' },
                { id: 'advanced', name: '高级用户', desc: '熟悉技术，希望有更多自定义选项' },
                { id: 'expert', name: '专家', desc: '技术专家，需要完全控制和定制' }
              ].map((option) => (
                <Card
                  key={option.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    profile.techLevel === option.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => setProfile(prev => ({ ...prev, techLevel: option.id }))}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{option.name}</h3>
                        <p className="text-sm text-gray-600">{option.desc}</p>
                      </div>
                      {profile.techLevel === option.id && (
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">选择您的写作风格</h2>
              <p className="text-gray-600">这将影响 AI 助手的默认输出风格</p>
            </div>
            
            <div className="space-y-3">
              {[
                { id: 'formal', name: '正式风格', desc: '严谨、规范的表达方式' },
                { id: 'casual', name: '轻松风格', desc: '自然、友好的表达方式' },
                { id: 'academic', name: '学术风格', desc: '严肃、专业的学术表达' },
                { id: 'creative', name: '创意风格', desc: '富有想象力和创新的表达' }
              ].map((option) => (
                <Card
                  key={option.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    profile.writingStyle === option.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => setProfile(prev => ({ ...prev, writingStyle: option.id }))}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{option.name}</h3>
                        <p className="text-sm text-gray-600">{option.desc}</p>
                      </div>
                      {profile.writingStyle === option.id && (
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center mb-2">
                <Sparkles className="w-5 h-5 text-green-600 mr-2" />
                <h3 className="font-medium text-green-900">个性化推荐已准备就绪</h3>
              </div>
              <p className="text-sm text-green-800 mb-3">
                基于您的选择，我们将为您推荐最适合的 AI 提供商和写作助手
              </p>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-green-900">推荐 AI 提供商：</span>
                  <span className="text-sm text-green-800 ml-2">
                    {AI_RECOMMENDATIONS[profile.identity as keyof typeof AI_RECOMMENDATIONS]?.join(', ') || '通用推荐'}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-green-900">推荐写作助手：</span>
                  <span className="text-sm text-green-800 ml-2">
                    {AGENT_RECOMMENDATIONS[profile.identity as keyof typeof AGENT_RECOMMENDATIONS]?.join(', ') || '通用推荐'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            WriteFlow Studio 新手引导
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 进度条 */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>步骤 {currentStep + 1} / {totalSteps}</span>
              <span>{Math.round(progress)}% 完成</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* 步骤内容 */}
          <div className="min-h-[400px]">
            {renderStep()}
          </div>

          {/* 导航按钮 */}
          <Separator />
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              上一步
            </Button>
            
            <div className="space-x-3">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                跳过引导
              </Button>
              {currentStep === totalSteps - 1 ? (
                <Button onClick={handleComplete} disabled={!canProceed()}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  完成设置
                </Button>
              ) : (
                <Button onClick={handleNext} disabled={!canProceed()}>
                  下一步
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}