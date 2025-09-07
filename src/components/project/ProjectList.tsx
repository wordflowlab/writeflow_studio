import { useState, useEffect } from 'react';
import { Plus, Heart, Edit, Copy, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useAppStore } from '@/store/app';
import { invoke } from '@/lib/tauri';
import { ProjectCreateDialog } from './ProjectCreateDialog';

interface Project {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  status: 'Active' | 'Completed' | 'Archived';
  progress: number;
  documents_count: number;
  words_count: number;
  workspace_id: string;
  created_at: string;
  updated_at: string;
}

interface ProjectListProps {
  workspaceId?: string | null;
}

export function ProjectList({ workspaceId }: ProjectListProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast } = useToast();
  const { currentWorkspace } = useAppStore();

  // 加载项目列表
  const loadProjects = async () => {
    try {
      setLoading(true);
      let projectList: Project[];
      
      if (workspaceId === 'all') {
        projectList = await invoke('get_projects');
      } else {
        const wid = workspaceId || currentWorkspace?.id;
        if (!wid) {
          projectList = await invoke('get_projects');
        } else {
          projectList = await invoke('get_projects_by_workspace', { workspace_id: wid });
        }
      }
      
      setProjects(projectList || []);
    } catch (error) {
      console.error('加载项目失败:', error);
      toast({
        title: "错误",
        description: "加载项目失败，请重试",
        variant: "destructive"
      });
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [workspaceId]);

  const handleProjectCreated = (newProject: Project) => {
    setProjects(prev => [newProject, ...prev]);
  };

  const handleEditProject = (project: Project) => {
    // TODO: 实现项目编辑功能
    console.log('编辑项目:', project.id);
  };

  const handleDuplicateProject = (project: Project) => {
    // TODO: 实现项目复制功能
    console.log('复制项目:', project.id);
  };

  const handleDeleteProject = async (project: Project) => {
    if (!confirm(`确定要删除项目"${project.name}"吗？此操作无法撤销。`)) {
      return;
    }

    try {
      await invoke('delete_project', { project_id: project.id });
      setProjects(prev => prev.filter(p => p.id !== project.id));
      toast({
        title: "成功",
        description: "项目删除成功"
      });
    } catch (error) {
      console.error('删除项目失败:', error);
      toast({
        title: "错误",
        description: "删除项目失败，请重试",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Completed':
        return 'bg-blue-100 text-blue-800';
      case 'Archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      'academic': '学术论文',
      'business': '商业文档',
      'creative': '创意写作',
      'technical': '技术文档',
      'blog': '博客文章',
      'report': '报告'
    };
    return typeMap[type] || type;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return '今天';
    } else if (diffDays === 1) {
      return '昨天';
    } else if (diffDays < 7) {
      return `${diffDays} 天前`;
    } else {
      return date.toLocaleDateString('zh-CN');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 项目操作栏 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">项目管理</h2>
          <p className="text-sm text-gray-600">
            共 {projects.length} 个项目
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>新建项目</span>
        </Button>
      </div>

      {/* 项目列表 */}
      {projects.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Plus className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">还没有项目</h3>
          <p className="text-gray-500 mb-4">创建您的第一个项目开始写作</p>
          <Button onClick={() => setShowCreateDialog(true)}>
            创建项目
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
                      style={{ backgroundColor: project.color }}
                    >
                      {/* 这里可以根据icon显示对应的图标 */}
                      📁
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{project.name}</h3>
                      <Badge variant="secondary" className={getStatusColor(project.status)}>
                        {project.status}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 h-auto"
                  >
                    <Heart className="w-4 h-4 text-gray-400" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {project.description || '暂无描述'}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span>{formatDate(project.updated_at)}</span>
                  <span>{project.documents_count} 个文档</span>
                </div>
                
                {/* 进度条 */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-600">进度</span>
                    <span className="text-gray-600">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-blue-600 h-1.5 rounded-full transition-all"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
                
                {/* 操作按钮 */}
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEditProject(project)}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    编辑
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDuplicateProject(project)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteProject(project)}
                    className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 项目创建对话框 */}
      <ProjectCreateDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        workspaceId={(workspaceId && workspaceId !== 'all') ? workspaceId : (currentWorkspace?.id || undefined)}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
}
