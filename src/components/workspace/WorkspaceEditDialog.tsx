import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { invoke } from '@/lib/tauri';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  workspace?: { id: string; name: string; description: string } | null;
  onUpdated?: (workspace: any) => void;
}

export default function WorkspaceEditDialog({ open, onOpenChange, workspace, onUpdated }: Props) {
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (workspace) setForm({ name: workspace.name, description: workspace.description || '' });
  }, [workspace]);

  const submit = async () => {
    if (!workspace) return;
    if (!form.name.trim()) {
      toast({ title: '请输入工作区名称', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const ws = await invoke('update_workspace', { workspace_id: workspace.id, name: form.name.trim(), description: form.description.trim() });
      toast({ title: '已保存' });
      onOpenChange(false);
      onUpdated?.(ws);
    } catch (e: any) {
      toast({ title: '保存失败', description: String(e?.message || e), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>编辑工作区</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          <div className="space-y-2">
            <Label htmlFor="ws-name-edit">名称</Label>
            <Input id="ws-name-edit" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ws-desc-edit">描述</Label>
            <Textarea id="ws-desc-edit" value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} rows={3} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>取消</Button>
            <Button onClick={submit} disabled={loading}>{loading ? '保存中...' : '保存'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

