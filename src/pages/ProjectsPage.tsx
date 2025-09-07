import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/app';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ProjectList } from '@/components/project/ProjectList';
import { invoke } from '@/lib/tauri';
import { ProjectCreateDialog } from '@/components/project/ProjectCreateDialog';
import WorkspaceCreateDialog from '@/components/workspace/WorkspaceCreateDialog';
import WorkspaceEditDialog from '@/components/workspace/WorkspaceEditDialog';

export function ProjectsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const { workspaces, currentWorkspace, setCurrentWorkspace } = useAppStore();
  const [showWorkspaceSelector, setShowWorkspaceSelector] = useState(false);
  const [stats, setStats] = useState<{ total: number; active: number; completed: number; this_week: number }>({ total: 0, active: 0, completed: 0, this_week: 0 });
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const [editWorkspace, setEditWorkspace] = useState<any | null>(null);
  const [listKey, setListKey] = useState(0);
  const [query, setQuery] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const s = await invoke('get_project_stats');
        setStats(s as any);
      } catch {}
    })();
  }, [currentWorkspace]);

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">项目管理</h1>
            <p className="text-gray-600 mt-1">管理写作项目和工作区</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setShowCreateWorkspace(true)}>新建工作区</Button>
            <Button onClick={() => setShowCreateProject(true)}>新建项目</Button>
          </div>
        </div>

        {/* 当前工作区卡片 + 选择器 */}
        <div className="mt-4">
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">🗂</div>
                <div>
                  <div className="text-sm text-gray-600">当前工作区</div>
                  <div className="font-medium text-gray-900">{currentWorkspace?.name || '未选择'}</div>
                </div>
              </div>
              <div>
                <Button variant="outline" onClick={() => setShowWorkspaceSelector(v => !v)}>
                  {currentWorkspace?.name || '选择工作区'}
                </Button>
              </div>
            </CardContent>
            {showWorkspaceSelector && (
              <CardContent className="pt-0 pb-4">
                <div className="grid gap-2">
                  {workspaces.map(ws => (
                    <div key={ws.id} className={`flex items-center justify-between p-3 rounded-md border ${currentWorkspace?.id===ws.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <button onClick={() => { setCurrentWorkspace(ws.id); setShowWorkspaceSelector(false); setListKey(k=>k+1); }} className="text-left flex-1">
                        <div className="font-medium text-sm">{ws.name}</div>
                        <div className="text-xs text-gray-500">{ws.projects_count} 个项目</div>
                      </button>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setEditWorkspace(ws)}>编辑</Button>
                        <Button variant="outline" size="sm" className="text-red-600" onClick={async () => { if (confirm('确定删除该工作区？此操作不可恢复')) { await invoke('delete_workspace', { workspace_id: ws.id }); setListKey(k=>k+1); } }}>删除</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-auto">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm">总项目数</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm">进行中</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{stats.active}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm">已完成</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.completed}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm">本周新增</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-blue-600">{stats.this_week}</div></CardContent></Card>
        </div>

        {/* 搜索与操作 */}
        <div className="flex items-center justify-between mb-4">
          <Input placeholder="搜索项目..." className="max-w-sm" value={query} onChange={(e) => setQuery(e.target.value)} />
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowCreateProject(true)}>新建项目</Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">全部项目</TabsTrigger>
            <TabsTrigger value="active">进行中</TabsTrigger>
            <TabsTrigger value="completed">已完成</TabsTrigger>
            <TabsTrigger value="archived">已归档</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            {/* 全部项目显示所有，但创建将落在当前工作区，由 ProjectList 内部处理 */}
            <ProjectList key={`list-${listKey}-all`} workspaceId="all" query={query} status="all" />
          </TabsContent>
          
          <TabsContent value="active" className="mt-6">
            <ProjectList key={`list-${listKey}-${currentWorkspace?.id || 'none'}`} workspaceId={currentWorkspace?.id} query={query} status="Active" />
          </TabsContent>
          
          <TabsContent value="completed" className="mt-6">
            <ProjectList key={`list-${listKey}-completed`} workspaceId={currentWorkspace?.id} query={query} status="Completed" />
          </TabsContent>
          
          <TabsContent value="archived" className="mt-6">
            <ProjectList key={`list-${listKey}-archived`} workspaceId={currentWorkspace?.id} query={query} status="Archived" />
          </TabsContent>
        </Tabs>
      </div>

      {/* 新建项目对话框 */}
      <ProjectCreateDialog
        open={showCreateProject}
        onOpenChange={setShowCreateProject}
        workspaceId={currentWorkspace?.id}
        onProjectCreated={() => setListKey(k => k + 1)}
      />
      <WorkspaceCreateDialog
        open={showCreateWorkspace}
        onOpenChange={setShowCreateWorkspace}
        onCreated={(ws) => { setCurrentWorkspace(ws.id); setListKey(k=>k+1); }}
      />
      <WorkspaceEditDialog
        open={!!editWorkspace}
        onOpenChange={(v) => !v && setEditWorkspace(null)}
        workspace={editWorkspace}
        onUpdated={() => setListKey(k=>k+1)}
      />
    </div>
  );
}
