import { useState, useEffect } from "react";
import { invoke } from "@/lib/tauri";
import { useAppStore } from "@/store/app";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Download, Upload, RotateCcw } from "lucide-react";

export default function Settings() {
  const { config, updateConfig, resetConfig } = useAppStore();
  const { toast } = useToast();
  
  const [localConfig, setLocalConfig] = useState(config);
  const [isSaving, setIsSaving] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const handleSave = async () => {
    if (!localConfig) return;
    
    try {
      setIsSaving(true);
      await invoke("save_config", { config: localConfig });
      updateConfig(localConfig);
      
      toast({
        title: "设置已保存",
        description: "您的设置已成功保存",
      });
    } catch (error) {
      console.error("Failed to save config:", error);
      toast({
        title: "保存失败",
        description: "无法保存设置，请重试",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (config) {
      setLocalConfig(config);
      toast({
        title: "设置已重置",
        description: "设置已还原到上次保存的状态",
      });
    }
  };

  const updateLocalConfig = (path: string[], value: any) => {
    if (!localConfig) return;
    
    setLocalConfig(prev => {
      if (!prev) return prev;
      
      const newConfig = { ...prev };
      let current: any = newConfig;
      
      for (let i = 0; i < path.length - 1; i++) {
        current[path[i]] = { ...current[path[i]] };
        current = current[path[i]];
      }
      
      current[path[path.length - 1]] = value;
      return newConfig;
    });
  };

  const handleExport = async () => {
    if (!config) return;

    try {
      setIsExporting(true);
      
      // 暂时使用固定路径，稍后可以改为文件对话框
      const filePath = "/tmp/writeflow-config.json";
      
      await invoke("export_config", { config, filePath });
      toast({
        title: "导出成功",
        description: `配置已导出到 ${filePath}`,
      });
    } catch (error) {
      toast({
        title: "导出失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    try {
      setIsImporting(true);
      
      // 暂时使用固定路径，稍后可以改为文件对话框
      const filePath = "/tmp/writeflow-config.json";
      
      const importedConfig = await invoke("import_config", { filePath }) as typeof config;
      
      if (importedConfig) {
        setLocalConfig(importedConfig);
        updateConfig(importedConfig as any);
        
        toast({
          title: "导入成功",
          description: `配置已从 ${filePath} 导入`,
        });
      }
    } catch (error) {
      toast({
        title: "导入失败", 
        description: error instanceof Error ? error.message : "请检查文件格式是否正确",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleFactoryReset = async () => {
    try {
      setIsResetting(true);
      
      await resetConfig();
      
      // 重新获取最新的配置
      const newConfig = await invoke("get_config") as typeof config;
      setLocalConfig(newConfig);
      if (newConfig) {
        updateConfig(newConfig as any);
      }
      
      toast({
        title: "重置成功",
        description: "所有设置已恢复为默认值",
      });
    } catch (error) {
      toast({
        title: "重置失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  if (!localConfig) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">加载设置中...</h2>
          <p className="text-muted-foreground">请稍候</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">设置</h1>
        <p className="text-muted-foreground">管理您的应用程序设置和偏好</p>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle>通用设置</CardTitle>
          <CardDescription>基本应用程序设置</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="language">语言</Label>
              <Select
                value={localConfig.general.language}
                onValueChange={(value) => updateLocalConfig(['general', 'language'], value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zh-CN">中文（简体）</SelectItem>
                  <SelectItem value="en-US">English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recent-files-limit">最近文件显示数量</Label>
              <Input
                id="recent-files-limit"
                type="number"
                value={localConfig.general.recent_files_limit}
                onChange={(e) => updateLocalConfig(['general', 'recent_files_limit'], parseInt(e.target.value) || 10)}
                min="1"
                max="50"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>自动保存</Label>
              <p className="text-sm text-muted-foreground">
                自动保存您的更改
              </p>
            </div>
            <Switch
              checked={localConfig.general.auto_save}
              onCheckedChange={(checked) => updateLocalConfig(['general', 'auto_save'], checked)}
            />
          </div>

          {localConfig.general.auto_save && (
            <div className="space-y-2">
              <Label htmlFor="auto-save-interval">自动保存间隔（秒）</Label>
              <Input
                id="auto-save-interval"
                type="number"
                value={localConfig.general.auto_save_interval}
                onChange={(e) => updateLocalConfig(['general', 'auto_save_interval'], parseInt(e.target.value) || 30)}
                min="5"
                max="300"
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>自动备份</Label>
              <p className="text-sm text-muted-foreground">
                定期备份您的文档
              </p>
            </div>
            <Switch
              checked={localConfig.general.backup_enabled}
              onCheckedChange={(checked) => updateLocalConfig(['general', 'backup_enabled'], checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Editor Settings */}
      <Card>
        <CardHeader>
          <CardTitle>编辑器设置</CardTitle>
          <CardDescription>自定义您的写作体验</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="font-family">字体</Label>
              <Select
                value={localConfig.editor.font_family}
                onValueChange={(value) => updateLocalConfig(['editor', 'font_family'], value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Monaco">Monaco</SelectItem>
                  <SelectItem value="Menlo">Menlo</SelectItem>
                  <SelectItem value="Consolas">Consolas</SelectItem>
                  <SelectItem value="Source Code Pro">Source Code Pro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="font-size">字体大小</Label>
              <Input
                id="font-size"
                type="number"
                value={localConfig.editor.font_size}
                onChange={(e) => updateLocalConfig(['editor', 'font_size'], parseInt(e.target.value) || 14)}
                min="8"
                max="24"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>显示行号</Label>
                <p className="text-sm text-muted-foreground">在编辑器中显示行号</p>
              </div>
              <Switch
                checked={localConfig.editor.show_line_numbers}
                onCheckedChange={(checked) => updateLocalConfig(['editor', 'show_line_numbers'], checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>自动换行</Label>
                <p className="text-sm text-muted-foreground">长行自动换行显示</p>
              </div>
              <Switch
                checked={localConfig.editor.word_wrap}
                onCheckedChange={(checked) => updateLocalConfig(['editor', 'word_wrap'], checked)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>实时预览</Label>
              <p className="text-sm text-muted-foreground">
                在编辑时显示实时预览
              </p>
            </div>
            <Switch
              checked={localConfig.editor.live_preview}
              onCheckedChange={(checked) => updateLocalConfig(['editor', 'live_preview'], checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* UI Settings */}
      <Card>
        <CardHeader>
          <CardTitle>界面设置</CardTitle>
          <CardDescription>自定义应用程序界面</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="color-scheme">颜色主题</Label>
            <Select
              value={localConfig.ui.color_scheme}
              onValueChange={(value) => updateLocalConfig(['ui', 'color_scheme'], value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Light">浅色</SelectItem>
                <SelectItem value="Dark">深色</SelectItem>
                <SelectItem value="Auto">跟随系统</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sidebar-width">侧边栏宽度</Label>
              <Input
                id="sidebar-width"
                type="number"
                value={localConfig.ui.sidebar_width}
                onChange={(e) => updateLocalConfig(['ui', 'sidebar_width'], parseInt(e.target.value) || 280)}
                min="200"
                max="500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preview-width">预览栏宽度</Label>
              <Input
                id="preview-width"
                type="number"
                value={localConfig.ui.preview_width}
                onChange={(e) => updateLocalConfig(['ui', 'preview_width'], parseInt(e.target.value) || 400)}
                min="300"
                max="600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>显示工具栏</Label>
              </div>
              <Switch
                checked={localConfig.ui.show_toolbar}
                onCheckedChange={(checked) => updateLocalConfig(['ui', 'show_toolbar'], checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>显示状态栏</Label>
              </div>
              <Switch
                checked={localConfig.ui.show_status_bar}
                onCheckedChange={(checked) => updateLocalConfig(['ui', 'show_status_bar'], checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Management */}
      <Card>
        <CardHeader>
          <CardTitle>配置管理</CardTitle>
          <CardDescription>导入、导出和重置您的配置设置</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={handleImport}
              disabled={isImporting}
              className="flex items-center gap-2"
            >
              {isImporting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-500 border-t-transparent" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {isImporting ? "导入中..." : "导入配置"}
            </Button>

            <Button
              variant="outline"
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2"
            >
              {isExporting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-500 border-t-transparent" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {isExporting ? "导出中..." : "导出配置"}
            </Button>

            <Button
              variant="outline"
              onClick={handleFactoryReset}
              disabled={isResetting}
              className="flex items-center gap-2"
            >
              {isResetting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-500 border-t-transparent" />
              ) : (
                <RotateCcw className="h-4 w-4" />
              )}
              {isResetting ? "重置中..." : "恢复默认"}
            </Button>
          </div>

          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>导入配置:</strong> 从 JSON 文件导入配置设置</p>
            <p><strong>导出配置:</strong> 将当前配置保存到 JSON 文件</p>
            <p><strong>恢复默认:</strong> 将所有设置重置为默认值（此操作不可撤销）</p>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Action buttons */}
      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={isSaving}
        >
          重置
        </Button>
        <Button
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? "保存中..." : "保存设置"}
        </Button>
      </div>
    </div>
  );
}