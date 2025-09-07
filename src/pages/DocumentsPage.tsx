import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/app';
import { Button } from '@/components/ui/button';

export default function DocumentsPage() {
  const navigate = useNavigate();
  const { currentWorkspace, projects, currentProject, setCurrentProject, loadProjectData } = useAppStore();

  useEffect(() => {
    if (!projects || projects.length === 0) {
      loadProjectData().catch(() => {});
    }
  }, [loadProjectData, projects]);

  useEffect(() => {
    if (currentProject) {
      navigate(`/editor/${currentProject.id}`);
    }
  }, [currentProject, navigate]);

  if (!currentWorkspace) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">没有选择工作空间</h2>
          <p className="text-muted-foreground">请先在侧边栏选择一个工作空间</p>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">暂无项目</h2>
          <p className="text-muted-foreground mb-4">请在“项目管理”中创建项目后开始编辑文档</p>
          <Button onClick={() => navigate('/projects')}>前往项目管理</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">文档编辑</h1>
      <p className="text-muted-foreground mb-4">选择一个项目进入编辑器</p>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <button
            key={p.id}
            onClick={() => { setCurrentProject(p); navigate(`/editor/${p.id}`); }}
            className="p-4 border rounded-md text-left hover:bg-accent/50 transition-colors"
          >
            <div className="font-medium mb-1">{p.name}</div>
            <div className="text-xs text-muted-foreground">{p.documents_count} 个文档 · {p.words_count} 字</div>
          </button>
        ))}
      </div>
    </div>
  );
}

