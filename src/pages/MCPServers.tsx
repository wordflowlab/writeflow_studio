import { useState } from "react";
import { useAppStore } from "@/store/app";
import { invoke } from "@tauri-apps/api/core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Plus, Server, Trash2, TestTube, Check, AlertCircle, Loader2, Power, PowerOff } from "lucide-react";

interface MCPServer {
  id: string;
  name: string;
  description: string;
  endpoint: string;
  connectionType: 'stdio' | 'sse';
  status: 'connected' | 'testing' | 'error' | 'disconnected';
  statusText: string;
  enabled: boolean;
  // stdio 配置
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  // sse 配置
  url?: string;
  authToken?: string;
  // 元数据
  lastConnected?: string;
  capabilities?: string[];
}

export default function MCPServers() {
  const [servers, setServers] = useState<MCPServer[]>([
    {
      id: "1",
      name: "文件系统服务",
      description: "本地文件系统访问和操作",
      endpoint: "/usr/local/bin/mcp-filesystem",
      connectionType: "stdio",
      status: "connected",
      statusText: "已连接",
      enabled: true,
      command: "/usr/local/bin/mcp-filesystem",
      args: ["--root", "/home/user/documents"],
      lastConnected: "刚刚",
      capabilities: ["read_file", "write_file", "list_directory"]
    },
    {
      id: "2",
      name: "数据库查询服务",
      description: "连接和查询数据库",
      endpoint: "https://db-mcp.example.com/v1",
      connectionType: "sse",
      status: "error", 
      statusText: "连接失败",
      enabled: false,
      url: "https://db-mcp.example.com/v1",
      authToken: "token-***",
      lastConnected: "5分钟前",
      capabilities: ["query_database", "schema_info"]
    }
  ]);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newServer, setNewServer] = useState({
    name: "",
    description: "",
    connectionType: "stdio" as 'stdio' | 'sse',
    // stdio 字段
    command: "",
    args: "",
    env: "",
    // sse 字段
    url: "",
    authToken: ""
  });

  // 测试服务器连接
  const testConnection = async (server: MCPServer) => {
    setServers(prev => prev.map(s => 
      s.id === server.id 
        ? { ...s, status: 'testing', statusText: '测试中...' }
        : s
    ));

    toast({
      title: "测试连接",
      description: `正在测试 ${server.name} 连接...`
    });

    try {
      // 模拟连接测试
      setTimeout(() => {
        const success = Math.random() > 0.2;
        setServers(prev => prev.map(s => 
          s.id === server.id 
            ? { 
                ...s, 
                status: success ? 'connected' : 'error',
                statusText: success ? '已连接' : '连接失败',
                lastConnected: success ? '刚刚' : s.lastConnected
              }
            : s
        ));

        toast({
          title: success ? "连接成功" : "连接失败",
          description: `${server.name} ${success ? '连接成功' : '连接失败，请检查配置'}`,
          variant: success ? "default" : "destructive"
        });
      }, 2000);
    } catch (error) {
      console.error("测试连接失败:", error);
      toast({
        title: "测试失败", 
        description: "网络错误，请稍后重试",
        variant: "destructive"
      });
    }
  };

  // 切换服务器启用状态
  const toggleServer = (serverId: string) => {
    setServers(prev => prev.map(s => 
      s.id === serverId 
        ? { ...s, enabled: !s.enabled }
        : s
    ));

    const server = servers.find(s => s.id === serverId);
    const action = server?.enabled ? '禁用' : '启用';
    
    toast({
      title: `${action}成功`,
      description: `${server?.name} 已${action}`
    });
  };

  // 删除服务器
  const deleteServer = (serverId: string) => {
    const server = servers.find(s => s.id === serverId);
    if (!server) return;

    if (confirm(`确定要删除 ${server.name} 吗？`)) {
      setServers(prev => prev.filter(s => s.id !== serverId));
      toast({
        title: "删除成功",
        description: `${server.name} 已删除`
      });
    }
  };

  // 添加新服务器
  const addServer = () => {
    if (!newServer.name || (!newServer.command && !newServer.url)) {
      toast({
        title: "表单验证失败",
        description: "请填写必要信息",
        variant: "destructive"
      });
      return;
    }

    const server: MCPServer = {
      id: Date.now().toString(),
      name: newServer.name,
      description: newServer.description,
      endpoint: newServer.connectionType === 'stdio' ? newServer.command : newServer.url,
      connectionType: newServer.connectionType,
      status: 'testing',
      statusText: '测试中...',
      enabled: true,
      lastConnected: '从未',
      capabilities: []
    };

    if (newServer.connectionType === 'stdio') {
      server.command = newServer.command;
      server.args = newServer.args ? newServer.args.split(' ').filter(Boolean) : [];
      server.env = newServer.env ? JSON.parse(newServer.env || '{}') : {};
    } else {
      server.url = newServer.url;
      server.authToken = newServer.authToken;
    }

    setServers(prev => [...prev, server]);
    setShowAddDialog(false);
    setNewServer({
      name: "",
      description: "",
      connectionType: "stdio",
      command: "",
      args: "",
      env: "",
      url: "",
      authToken: ""
    });

    toast({
      title: "添加成功",
      description: "MCP 服务器已添加，正在测试连接..."
    });

    // 自动测试连接
    setTimeout(() => {
      testConnection(server);
    }, 1000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <Check className="w-4 h-4 text-green-600" />;
      case 'testing':
        return <Loader2 className="w-4 h-4 text-purple-600 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'text-green-600';
      case 'testing':
        return 'text-purple-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">MCP 服务器</h1>
          <p className="text-gray-600 mt-1">Model Context Protocol 服务器配置和管理</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>添加服务器</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>添加 MCP 服务器</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">服务器名称</Label>
                  <Input 
                    id="name"
                    value={newServer.name}
                    onChange={(e) => setNewServer(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="输入服务器名称"
                  />
                </div>

                <div>
                  <Label htmlFor="description">描述</Label>
                  <Input 
                    id="description"
                    value={newServer.description}
                    onChange={(e) => setNewServer(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="服务器功能描述"
                  />
                </div>

                <div>
                  <Label htmlFor="connectionType">连接类型</Label>
                  <Select value={newServer.connectionType} onValueChange={(value: 'stdio' | 'sse') => setNewServer(prev => ({ ...prev, connectionType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择连接类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stdio">stdio（标准输入输出）</SelectItem>
                      <SelectItem value="sse">SSE（服务端事件）</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* stdio 配置 */}
                {newServer.connectionType === 'stdio' && (
                  <>
                    <div>
                      <Label htmlFor="command">命令路径</Label>
                      <Input 
                        id="command"
                        value={newServer.command}
                        onChange={(e) => setNewServer(prev => ({ ...prev, command: e.target.value }))}
                        placeholder="/usr/local/bin/mcp-server"
                      />
                    </div>

                    <div>
                      <Label htmlFor="args">命令参数</Label>
                      <Input 
                        id="args"
                        value={newServer.args}
                        onChange={(e) => setNewServer(prev => ({ ...prev, args: e.target.value }))}
                        placeholder="--config /path/to/config.json"
                      />
                    </div>

                    <div>
                      <Label htmlFor="env">环境变量（JSON）</Label>
                      <Textarea 
                        id="env"
                        value={newServer.env}
                        onChange={(e) => setNewServer(prev => ({ ...prev, env: e.target.value }))}
                        placeholder='{"API_KEY": "your-key", "DEBUG": "true"}'
                        rows={3}
                      />
                    </div>
                  </>
                )}

                {/* SSE 配置 */}
                {newServer.connectionType === 'sse' && (
                  <>
                    <div>
                      <Label htmlFor="url">服务器 URL</Label>
                      <Input 
                        id="url"
                        value={newServer.url}
                        onChange={(e) => setNewServer(prev => ({ ...prev, url: e.target.value }))}
                        placeholder="https://api.example.com/mcp/v1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="authToken">认证令牌</Label>
                      <Input 
                        id="authToken"
                        type="password"
                        value={newServer.authToken}
                        onChange={(e) => setNewServer(prev => ({ ...prev, authToken: e.target.value }))}
                        placeholder="Bearer token 或 API 密钥"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  取消
                </Button>
                <Button onClick={addServer}>
                  添加服务器
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 服务器列表 */}
      <div className="space-y-4">
        {servers.map((server) => (
          <Card key={server.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Server className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900">{server.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {server.connectionType.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{server.description}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-xs text-gray-500">{server.endpoint}</span>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(server.status)}
                        <span className={`text-xs font-medium ${getStatusColor(server.status)}`}>
                          {server.statusText}
                        </span>
                      </div>
                      {server.lastConnected && (
                        <span className="text-xs text-gray-500">
                          最后连接: {server.lastConnected}
                        </span>
                      )}
                    </div>
                    {server.capabilities && server.capabilities.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {server.capabilities.map((capability) => (
                          <Badge key={capability} variant="secondary" className="text-xs">
                            {capability}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => testConnection(server)}
                    disabled={server.status === 'testing'}
                  >
                    <TestTube className="w-4 h-4 mr-2" />
                    {server.status === 'testing' ? '测试中...' : '测试连接'}
                  </Button>
                  <Button 
                    variant={server.enabled ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleServer(server.id)}
                  >
                    {server.enabled ? (
                      <Power className="w-4 h-4 mr-2" />
                    ) : (
                      <PowerOff className="w-4 h-4 mr-2" />
                    )}
                    {server.enabled ? '启用中' : '已禁用'}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => deleteServer(server.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 空状态 */}
      {servers.length === 0 && (
        <Card className="p-12 text-center">
          <Server className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无 MCP 服务器</h3>
          <p className="text-gray-600 mb-4">添加第一个 MCP 服务器开始使用扩展功能</p>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                添加服务器
              </Button>
            </DialogTrigger>
          </Dialog>
        </Card>
      )}
    </div>
  );
}