import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  FolderOpen, 
  FileText, 
  Settings,
  Bot,
  Brain,
  Server,
  Sliders
} from 'lucide-react';

const coreNavigation = [
  {
    name: '仪表板',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    name: '项目管理',
    href: '/projects',
    icon: FolderOpen,
  },
  {
    name: '文档编辑',
    href: '/documents',
    icon: FileText,
    disabled: true,
  },
  {
    name: '环境管理',
    href: '/environment',
    icon: Settings,
    disabled: false,
  },
  {
    name: 'Agent 管理',
    href: '/agents',
    icon: Bot,
    disabled: false,
  },
  {
    name: 'AI 提供商',
    href: '/ai-providers',
    icon: Brain,
    disabled: false,
  },
];

const configNavigation = [
  {
    name: 'MCP 服务器',
    href: '/mcp-servers',
    icon: Server,
    disabled: false,
  },
  {
    name: '写作偏好',
    href: '/writing-preferences',
    icon: Sliders,
    disabled: false,
  },
  {
    name: '配置管理',
    href: '/config',
    icon: Settings,
    disabled: true,
  },
];

interface SidebarProps {
  className?: string;
}

const NavigationSection = ({ title, items }: { title: string; items: any[] }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigation = (href: string, disabled?: boolean) => {
    if (disabled) return;
    navigate(href);
  };

  return (
    <div className="mb-6">
      <div className="px-4 mb-3">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </div>
      </div>
      <nav>
        {items.map((item) => {
          const isActive = location.pathname === item.href || (item.href === '/' && location.pathname === '/dashboard');
          return (
            <button
              key={item.name}
              onClick={() => handleNavigation(item.href, item.disabled)}
              disabled={item.disabled}
              className={cn(
                'w-full flex items-center px-4 py-2.5 text-sm text-slate-600 cursor-pointer transition-colors text-left',
                isActive
                  ? 'bg-blue-600 text-white'
                  : item.disabled
                  ? 'text-slate-400 cursor-not-allowed'
                  : 'hover:bg-slate-200 hover:text-slate-900'
              )}
            >
              <item.icon
                className={cn(
                  'mr-3 h-4 w-4 flex-shrink-0',
                  isActive
                    ? 'text-white'
                    : item.disabled
                    ? 'text-slate-400'
                    : 'text-slate-600'
                )}
              />
              {item.name}
              {item.disabled && (
                <span className="ml-auto text-xs text-slate-400">敬请期待</span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default function Sidebar({ className }: SidebarProps) {
  return (
    <div className={cn('flex flex-col w-70 bg-slate-50 border-r border-slate-200', className)}>
      {/* Navigation */}
      <div className="flex-1 pt-6 overflow-y-auto">
        <NavigationSection title="核心功能" items={coreNavigation} />
        <NavigationSection title="配置管理" items={configNavigation} />
      </div>
    </div>
  );
}
