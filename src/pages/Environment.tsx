import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw } from 'lucide-react';
import { invoke } from '@/lib/tauri';

type EnvStatus = {
  health: number; // 0-100
  issues: number;
  node: { installed: boolean; version?: string };
  writeflow: { installed: boolean; version?: string };
  npm: { installed: boolean; version?: string };
};

export default function EnvironmentPage() {
  const [status, setStatus] = useState<EnvStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const result = await invoke('get_environment_summary');
      setStatus(result as EnvStatus);
    } catch (e) {
      console.error(e);
      setStatus({
        health: 60,
        issues: 1,
        node: { installed: true, version: 'mock' },
        writeflow: { installed: false },
        npm: { installed: true, version: 'mock' },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const indicator = (ok: boolean) => (
    <span className={`inline-block w-2 h-2 rounded-full ${ok ? 'bg-green-500' : 'bg-red-500'}`} />
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">环境管理</h1>
        <Button onClick={load} variant="outline" disabled={loading}>
          <RefreshCw className="w-4 h-4 mr-2" />
          {loading ? '检测中...' : '重新检测'}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">系统健康度</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{status?.health ?? 0}%</div>
            <p className="text-xs text-muted-foreground">基于依赖与诊断</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">环境问题</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${status && status.issues === 0 ? 'text-green-600' : 'text-red-600'}`}>{status?.issues ?? 0}</div>
            <p className="text-xs text-muted-foreground">需要处理的问题</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">已安装 Agent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">示例数据</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">AI 提供商</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3/4</div>
            <p className="text-xs text-muted-foreground">示例数据</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>依赖检测</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {indicator(!!status?.node.installed)}
              <span>Node.js</span>
            </div>
            <div>
              {status?.node.installed ? (
                <Badge variant="secondary">{status.node.version}</Badge>
              ) : (
                <Badge variant="destructive">未安装</Badge>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {indicator(!!status?.npm.installed)}
              <span>npm</span>
            </div>
            <div>
              {status?.npm.installed ? (
                <Badge variant="secondary">{status.npm.version}</Badge>
              ) : (
                <Badge variant="destructive">未安装</Badge>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {indicator(!!status?.writeflow.installed)}
              <span>WriteFlow CLI</span>
            </div>
            <div>
              {status?.writeflow.installed ? (
                <Badge variant="secondary">{status.writeflow.version}</Badge>
              ) : (
                <Badge variant="destructive">未安装</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
