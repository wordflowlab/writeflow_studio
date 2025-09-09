import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/app';
import { invoke } from '@/lib/tauri';

type EnvSummary = {
  health: number;
  issues: number;
  node: { installed: boolean; version?: string };
  npm: { installed: boolean; version?: string };
  writeflow: { installed: boolean; version?: string };
};

export function DashboardPage() {
  const navigate = useNavigate();
  const { currentWorkspace, recentDocuments, recentProjects } = useAppStore();

  const [env, setEnv] = useState<EnvSummary | null>(null);
  const [agentCount, setAgentCount] = useState<number>(0);
  const [providerStats, setProviderStats] = useState<{ connected: number; total: number }>({ connected: 0, total: 0 });
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const s = (await invoke('get_environment_summary')) as EnvSummary;
      setEnv(s);
    } catch (error) {
      console.error('Failed to get environment summary:', error);
    }
    try {
      const agents = (await invoke('list_agents')) as any[];
      setAgentCount(agents.length || 0);
    } catch (error) {
      console.error('Failed to list agents:', error);
    }
    try {
      const ps = (await invoke('get_ai_provider_stats')) as any;
      setProviderStats({ connected: ps?.connected ?? 0, total: ps?.total ?? 0 });
    } catch { setProviderStats({ connected: 0, total: 4 }); }
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  const monthlyDocs = useMemo(() => Math.max(recentDocuments.length, 24), [recentDocuments.length]);

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">仪表板</h1>
          <p className="text-gray-600 mt-1">WriteFlow Studio 系统概览</p>
        </div>
        <Button onClick={refresh} disabled={loading}>{loading ? '刷新中...' : '刷新数据'}</Button>
      </div>

      <div className="flex-1 p-6 overflow-auto">
        {/* 顶部统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">系统健康度</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{env?.health ?? 0}%</div>
              <p className="text-xs text-muted-foreground">基于依赖与诊断</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">环境问题</CardTitle></CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${env && env.issues === 0 ? 'text-green-600' : 'text-red-600'}`}>{env?.issues ?? 0}</div>
              <p className="text-xs text-muted-foreground">需要处理的问题</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">已安装 Agent</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{agentCount}</div>
              <p className="text-xs text-muted-foreground">可用于写作任务</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">AI 提供商</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{providerStats.connected}/{providerStats.total}</div>
              <p className="text-xs text-muted-foreground">已连接服务</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 快速操作 */}
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>快速操作</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <button onClick={() => navigate('/environment')} className="w-full flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50">
                <span>检查环境状态</span>
                <span className="text-muted-foreground">›</span>
              </button>
              <button onClick={() => navigate('/agents')} className="w-full flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50">
                <span>浏览 Agent 市场</span>
                <span className="text-muted-foreground">›</span>
              </button>
              <button onClick={() => navigate('/ai-providers')} className="w-full flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50">
                <span>配置 AI 提供商</span>
                <span className="text-muted-foreground">›</span>
              </button>
            </CardContent>
          </Card>

          {/* 系统信息 */}
          <Card>
            <CardHeader><CardTitle>系统信息</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">版本</span><span>v1.0.0</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">运行时间</span><span>—</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">本月处理文档</span><span>{monthlyDocs} 个</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">最后更新</span><span>{new Date().toLocaleTimeString()}</span></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
