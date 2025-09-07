import { useState } from 'react';
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
  onCreated?: (workspace: any) => void;
}

export default function WorkspaceCreateDialog({ open, onOpenChange, onCreated }: Props) {
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const submit = async () => {
    if (!form.name.trim()) {
      toast({ title: '请输入工作区名称', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const ws = await invoke('create_workspace', { workspace_data: { name: form.name.trim(), description: form.description.trim() } });
      toast({ title: '创建成功' });
      onOpenChange(false);
      onCreated?.(ws);
      setForm({ name: '', description: '' });
    } catch (e: any) {
      toast({ title: '创建失败', description: String(e?.message || e), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>新建工作区</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          <div className="space-y-2">
            <Label htmlFor="ws-name">名称</Label>
            <Input id="ws-name" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="例如：个人工作区" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ws-desc">描述</Label>
            <Textarea id="ws-desc" value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} placeholder="可选" rows={3} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>取消</Button>
            <Button onClick={submit} disabled={loading}>{loading ? '创建中...' : '创建'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

