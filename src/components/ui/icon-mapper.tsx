import React from 'react';
import {
  GraduationCap,
  Briefcase,
  PenTool,
  Code,
  Edit3,
  FileText,
  Folder,
} from 'lucide-react';

export type IconName =
  | 'graduation-cap'
  | 'briefcase'
  | 'pen-tool'
  | 'code'
  | 'edit-3'
  | 'file-text'
  | 'folder'
  | string;

export function normalizeIconName(name?: string): string {
  if (!name) return 'folder';
  const n = name.trim().toLowerCase().replace(/[_\s]+/g, '-');
  return n;
}

export function validateIconName(name?: string): IconName {
  const n = normalizeIconName(name);
  // tolerate common typos or variants
  if (n.includes('graduat') || n.includes('aduation')) return 'graduation-cap';
  if (n.includes('brief')) return 'briefcase';
  if (n.includes('pen') || n.includes('write') || n.includes('edit-3')) return 'pen-tool';
  if (n.includes('code')) return 'code';
  if (n.includes('edit-3')) return 'edit-3';
  if (n.includes('file') || n.includes('document') || n.includes('doc')) return 'file-text';
  if (n.includes('folder')) return 'folder';
  // fallback
  switch (n) {
    case 'graduation-cap':
    case 'briefcase':
    case 'pen-tool':
    case 'code':
    case 'edit-3':
    case 'file-text':
    case 'folder':
      return n as IconName;
    default:
      return 'folder';
  }
}

export default function IconMapper({ name, className = 'w-4 h-4', color }: { name?: string; className?: string; color?: string }) {
  const n = validateIconName(name);
  const props = { className, color } as any;
  switch (n) {
    case 'graduation-cap':
      return <GraduationCap {...props} />;
    case 'briefcase':
      return <Briefcase {...props} />;
    case 'pen-tool':
      return <PenTool {...props} />;
    case 'code':
      return <Code {...props} />;
    case 'edit-3':
      return <Edit3 {...props} />;
    case 'file-text':
      return <FileText {...props} />;
    case 'folder':
    default:
      return <Folder {...props} />;
  }
}

