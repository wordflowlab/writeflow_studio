import { memo } from 'react';
import {
  GraduationCap,
  Briefcase,
  PenTool,
  Code,
  Edit3,
  FileText,
  Folder,
  LucideIcon
} from 'lucide-react';

// 图标映射表 - 将字符串名称映射到实际的图标组件
const ICON_MAP: Record<string, LucideIcon> = {
  'graduation-cap': GraduationCap,
  'briefcase': Briefcase,
  'pen-tool': PenTool,
  'code': Code,
  'edit-3': Edit3,
  'file-text': FileText,
  'folder': Folder,
};

interface ProjectIconProps {
  iconName: string;
  className?: string;
  size?: number;
  color?: string;
}

/**
 * 项目图标组件
 * 将字符串图标名转换为实际的Lucide React图标
 */
export const ProjectIcon = memo(function ProjectIcon({ 
  iconName, 
  className = "w-4 h-4", 
  size,
  color 
}: ProjectIconProps) {
  // 获取对应的图标组件，如果找不到则使用默认的文件夹图标
  const IconComponent = ICON_MAP[iconName] || Folder;
  
  const iconProps = {
    className,
    ...(size && { size }),
    ...(color && { color }),
  };
  
  return <IconComponent {...iconProps} />;
});

/**
 * 获取图标组件（用于其他需要直接使用图标组件的场景）
 */
export function getIconComponent(iconName: string): LucideIcon {
  return ICON_MAP[iconName] || Folder;
}

/**
 * 检查图标名称是否有效
 */
export function isValidIconName(iconName: string): boolean {
  return iconName in ICON_MAP;
}

/**
 * 获取所有可用的图标名称
 */
export function getAvailableIcons(): string[] {
  return Object.keys(ICON_MAP);
}

export default ProjectIcon;