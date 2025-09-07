import { useState } from 'react';
import { FolderPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { invoke } from '@/lib/tauri';

interface ProjectType {
  value: string;
  label: string;
  icon: string;
  color: string;
}

const PROJECT_TYPES: ProjectType[] = [
  { value: 'academic', label: '学术论文', icon: 'graduation-cap', color: '#10b981' },
  { value: 'business', label: '商业文档', icon: 'briefcase', color: '#3b82f6' },
  { value: 'creative', label: '创意写作', icon: 'pen-tool', color: '#ec4899' },
  { value: 'technical', label: '技术文档', icon: 'code', color: '#8b5cf6' },
  { value: 'blog', label: '博客文章', icon: 'edit-3', color: '#f59e0b' },
  { value: 'report', label: '报告', icon: 'file-text', color: '#6b7280' },
];

interface ProjectCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId?: string;
  onProjectCreated?: (project: any) => void;
}

interface CreateProjectData {
  name: string;
  description: string;
  project_type: string;
  workspace_id: string;
  icon: string;
  color: string;
}

export function ProjectCreateDialog({
  open,
  onOpenChange,
  workspaceId = 'workspace-1',
  onProjectCreated
}: ProjectCreateDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'academic',
    description: ''
  });
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const handleTypeChange = (value: string) => {
    setFormData(prev => ({ ...prev, type: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "错误",
        description: "请输入项目名称",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    
    try {
      const selectedType = PROJECT_TYPES.find(t => t.value === formData.type)!;
      
      const projectData: CreateProjectData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        project_type: formData.type,
        workspace_id: workspaceId,
        icon: selectedType.icon,
        color: selectedType.color
      };

      const newProject = await invoke('create_project', { project_data: projectData });
      
      toast({
        title: "成功",
        description: "项目创建成功"
      });
      
      // 重置表单
      setFormData({
        name: '',
        type: 'academic',
        description: ''
      });
      
      // 关闭对话框
      onOpenChange(false);
      
      // 回调通知父组件
      if (onProjectCreated) {
        onProjectCreated(newProject);
      }
      
    } catch (error) {
      console.error('创建项目失败:', error);
      toast({
        title: "错误",
        description: "创建项目失败，请重试",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    // 重置表单
    setFormData({
      name: '',
      type: 'academic',
      description: ''
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FolderPlus className="w-5 h-5" />
            <span>新建项目</span>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-4">
            {/* 项目名称 */}
            <div className="space-y-2">
              <Label htmlFor="name">项目名称</Label>
              <Input
                id="name"
                type="text"
                placeholder="输入项目名称"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full"
                disabled={isCreating}
              />
            </div>

            {/* 项目类型 */}
            <div className="space-y-2">
              <Label htmlFor="type">项目类型</Label>
              <Select
                value={formData.type}
                onValueChange={handleTypeChange}
                disabled={isCreating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择项目类型" />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 项目描述 */}
            <div className="space-y-2">
              <Label htmlFor="description">项目描述</Label>
              <Textarea
                id="description"
                placeholder="描述项目内容和目标"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full h-20 resize-none"
                disabled={isCreating}
              />
            </div>
          </div>

          {/* 按钮组 */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isCreating}
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={isCreating}
            >
              {isCreating ? '创建中...' : '创建项目'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}