import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Bot, Plus, RefreshCw, Trash2, Power, PowerOff, Download } from 'lucide-react';
import { invoke } from '@/lib/tauri';

type Agent = {
  id: string;
  name: string;
  category: string;
  version: string;
  enabled: boolean;
  description?: string;
  tags?: string[];
};

const PRESETS: Agent[] = [
  { id: 'a1', name: '论文写作助手', category: '学术写作', version: '1.2.0', enabled: true, tags: ['结构', '引用'], description: '论文结构与引用格式辅助' },
  { id: 'a2', name: '商业计划书助手', category: '商务文档', version: '1.1.0', enabled: false, tags: ['大纲', '指标'], description: '商业计划书大纲与指标建议' },
  { id: 'a3', name: '技术文档助手', category: '技术文档', version: '0.9.5', enabled: true, tags: ['API', '示例'], description: 'API 文档结构与示例生成' },
];

export default function Agents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const list = await invoke('list_agents');
        setAgents(list as Agent[]);
      } catch (e) {
        // 初始无数据时，用预设填充便于演示
        setAgents(PRESETS);
      }
    })();
  }, []);

  const filtered = agents.filter(a =>
    [a.name, a.category, a.description].join(' ').includes(keyword)
  );

  const toggle = (id: string) => {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
    const agent = agents.find(a => a.id === id);
    if (agent) {
      (async () => { try { await invoke('set_agent_enabled', { id, enabled: !agent.enabled }); } catch {} })();
      toast({ title: `${agent.enabled ? '已禁用' : '已启用'}`, description: agent.name });
    }
  };

  const remove = (id: string) => {
    const agent = agents.find(a => a.id === id);
    if (!agent) return;
    if (confirm(`确定卸载 ${agent.name} 吗？`)) {
      (async () => { try { await invoke('uninstall_agent', { id }); } catch {} })();
      setAgents(prev => prev.filter(a => a.id !== id));
      toast({ title: '已卸载', description: agent.name });
    }
  };

  const add = (preset?: Agent) => {
    const base = preset || { id: '', name: '新 Agent', category: '工具效率', version: '0.1.0', enabled: true } as Agent;
    (async () => {
      try {
        const created = await invoke('install_agent', { input: { name: base.name, category: base.category, version: base.version, description: base.description || null, tags: base.tags || [] } });
        setAgents(prev => [created as Agent, ...prev]);
      } catch {
        setAgents(prev => [{ ...base, id: `agent-${Date.now()}` }, ...prev]);
      }
    })();
    setShowAdd(false);
    toast({ title: '安装成功', description: base.name });
  };

  const update = (id: string) => {
    (async () => { try { await invoke('update_agent_version', { id, version: 'latest' }); } catch {} })();
    toast({ title: '已更新', description: `Agent ${id} 已更新到最新版本` });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Agent 管理</h1>
          <p className="text-gray-600 mt-1">安装、启用、更新和卸载写作 Agent</p>
        </div>
        <div className="flex items-center gap-2">
          <Input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="搜索 Agent" className="w-56" />
          <Dialog open={showAdd} onOpenChange={setShowAdd}>
            <DialogTrigger asChild>
              <Button className="flex items-center"><Plus className="w-4 h-4 mr-2" />安装 Agent</Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>从市场安装</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 gap-3">
                {PRESETS.map(p => (
                  <Card key={p.id}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-gray-500">{p.category} · v{p.version}</div>
                      </div>
                      <Button size="sm" onClick={() => add(p)}><Download className="w-4 h-4 mr-2" />安装</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(agent => (
          <Card key={agent.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{agent.name}</CardTitle>
                    <div className="text-xs text-gray-500">{agent.category} · v{agent.version}</div>
                  </div>
                </div>
                <Badge variant={agent.enabled ? 'default' : 'outline'}>
                  {agent.enabled ? '启用中' : '已禁用'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-gray-600 min-h-[40px]">{agent.description || '—'}</div>
              <div className="flex gap-2">
                {agent.tags?.map(t => (
                  <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Button variant={agent.enabled ? 'outline' : 'default'} size="sm" onClick={() => toggle(agent.id)}>
                  {agent.enabled ? <PowerOff className="w-4 h-4 mr-2" /> : <Power className="w-4 h-4 mr-2" />}
                  {agent.enabled ? '禁用' : '启用'}
                </Button>
                <Button variant="outline" size="sm" onClick={() => update(agent.id)}>
                  <RefreshCw className="w-4 h-4 mr-2" />更新
                </Button>
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => remove(agent.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <Card className="p-12 text-center">
          <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无 Agent</h3>
          <p className="text-gray-600 mb-4">安装第一个 Agent 以开始高效写作</p>
          <Button onClick={() => setShowAdd(true)}><Plus className="w-4 h-4 mr-2" />安装 Agent</Button>
        </Card>
      )}
    </div>
  );
}
