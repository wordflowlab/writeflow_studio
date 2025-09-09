import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { invoke } from '@/lib/invokeCompat';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  project?: any;
  onUpdated?: (project: any) => void;
}

export default function ProjectEditDialog({ open, onOpenChange, project, onUpdated }: Props) {
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (project) setForm({ name: project.name, description: project.description || '' });
  }, [project]);

  const submit = async () => {
    if (!project) return;
    if (!form.name.trim()) {
      toast({ title: '请输入项目名称', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const updated = { ...project, name: form.name.trim(), description: form.description.trim() };
      await invoke('update_project', { projectId: project.id, projectData: updated });
      toast({ title: '项目已保存' });
      onOpenChange(false);
      onUpdated?.(updated);
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
          <DialogTitle>编辑项目</DialogTitle>
        </DialogHeader>
        <div className="pt-2 space-y-3">
          <div className="space-y-2">
            <Label htmlFor="p-name-edit">名称</Label>
            <Input id="p-name-edit" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-desc-edit">描述</Label>
            <Textarea id="p-desc-edit" value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} rows={3} />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>取消</Button>
            <Button onClick={submit} disabled={loading}>{loading ? '保存中...' : '保存'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
