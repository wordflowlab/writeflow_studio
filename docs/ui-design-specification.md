# WriteFlow Studio - UI 设计规范

> **Version**: 1.0.0  
> **Date**: 2025-09-07  
> **Author**: WriteFlow Team

## 1. 设计系统概览

### 1.1 设计理念

WriteFlow Studio 的 UI 设计遵循现代化、简洁、高效的设计原则：

- **简洁优雅**：去除冗余元素，专注核心功能
- **直观易用**：符合用户心理模型，降低学习成本  
- **一致性**：统一的视觉语言和交互模式
- **响应式**：适配不同屏幕尺寸和分辨率
- **可访问性**：支持键盘导航和屏幕阅读器

### 1.2 技术基础

- **UI 框架**: shadcn/ui + Radix UI + Tailwind CSS
- **图标系统**: Lucide React Icons
- **字体系统**: Inter (西文) + 苹方/微软雅黑 (中文)
- **主题系统**: CSS 变量 + Tailwind CSS 动态主题
- **响应式**: Tailwind CSS 响应式断点

## 2. 色彩系统

### 2.1 主色彩

```css
:root {
  /* Primary - WriteFlow 品牌蓝 */
  --primary-50: #eff6ff;
  --primary-100: #dbeafe;
  --primary-200: #bfdbfe;
  --primary-300: #93c5fd;
  --primary-400: #60a5fa;
  --primary-500: #3b82f6;  /* 主色 */
  --primary-600: #2563eb;
  --primary-700: #1d4ed8;
  --primary-800: #1e40af;
  --primary-900: #1e3a8a;
  
  /* Accent - 辅助色 */
  --accent-50: #f0fdf4;
  --accent-100: #dcfce7;
  --accent-200: #bbf7d0;
  --accent-300: #86efac;
  --accent-400: #4ade80;
  --accent-500: #22c55e;  /* 成功色 */
  --accent-600: #16a34a;
  --accent-700: #15803d;
  --accent-800: #166534;
  --accent-900: #14532d;
}
```

### 2.2 语义色彩

```css
:root {
  /* 功能色彩 */
  --success: #22c55e;
  --warning: #f59e0b;
  --error: #ef4444;
  --info: #3b82f6;
  
  /* 状态色彩 */
  --connected: #22c55e;
  --disconnected: #6b7280;
  --testing: #f59e0b;
  --error: #ef4444;
}
```

### 2.3 主题系统

#### 明亮主题 (Light Theme)

```css
[data-theme="light"] {
  /* 背景色 */
  --background: #ffffff;
  --surface: #f8fafc;
  --surface-elevated: #ffffff;
  
  /* 文字色 */
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-muted: #94a3b8;
  
  /* 边框色 */
  --border: #e2e8f0;
  --border-focus: #3b82f6;
  
  /* 阴影 */
  --shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
}
```

#### 暗黑主题 (Dark Theme)

```css
[data-theme="dark"] {
  /* 背景色 */
  --background: #0f172a;
  --surface: #1e293b;
  --surface-elevated: #334155;
  
  /* 文字色 */
  --text-primary: #f1f5f9;
  --text-secondary: #cbd5e1;
  --text-muted: #64748b;
  
  /* 边框色 */
  --border: #334155;
  --border-focus: #3b82f6;
  
  /* 阴影 */
  --shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.3);
}
```

## 3. 字体系统

### 3.1 字体族

```css
:root {
  /* 主字体 - 界面文字 */
  --font-sans: "Inter", "SF Pro Display", "苹方", "Microsoft YaHei", 
               -apple-system, BlinkMacSystemFont, sans-serif;
  
  /* 等宽字体 - 代码、配置 */
  --font-mono: "Fira Code", "SF Mono", "Cascadia Code", 
               "JetBrains Mono", Consolas, monospace;
  
  /* 数字字体 - 数据展示 */
  --font-numeric: "Inter", "SF Pro Display", sans-serif;
}
```

### 3.2 字体尺寸

```css
:root {
  /* 标题字体 */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */
  
  /* 行高 */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
}
```

### 3.3 字体权重

```css
:root {
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
}
```

## 4. 间距系统

### 4.1 空间单位

采用 8px 网格系统，提供一致的视觉节奏：

```css
:root {
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-5: 1.25rem;  /* 20px */
  --space-6: 1.5rem;   /* 24px */
  --space-8: 2rem;     /* 32px */
  --space-10: 2.5rem;  /* 40px */
  --space-12: 3rem;    /* 48px */
  --space-16: 4rem;    /* 64px */
  --space-20: 5rem;    /* 80px */
  --space-24: 6rem;    /* 96px */
}
```

### 4.2 组件内边距

```css
/* 按钮内边距 */
.btn-sm { padding: var(--space-2) var(--space-3); }
.btn-md { padding: var(--space-3) var(--space-4); }
.btn-lg { padding: var(--space-4) var(--space-6); }

/* 卡片内边距 */
.card-sm { padding: var(--space-4); }
.card-md { padding: var(--space-6); }
.card-lg { padding: var(--space-8); }

/* 输入框内边距 */
.input-sm { padding: var(--space-2) var(--space-3); }
.input-md { padding: var(--space-3) var(--space-4); }
.input-lg { padding: var(--space-4) var(--space-5); }
```

### 4.3 布局间距

```css
/* 组件间距 */
.gap-sm { gap: var(--space-2); }
.gap-md { gap: var(--space-4); }
.gap-lg { gap: var(--space-6); }
.gap-xl { gap: var(--space-8); }

/* 区块间距 */
.section-gap { margin-bottom: var(--space-12); }
.subsection-gap { margin-bottom: var(--space-8); }
.item-gap { margin-bottom: var(--space-4); }
```

## 5. 圆角系统

```css
:root {
  --radius-none: 0;
  --radius-sm: 0.125rem;   /* 2px */
  --radius-md: 0.25rem;    /* 4px */
  --radius-lg: 0.5rem;     /* 8px */
  --radius-xl: 0.75rem;    /* 12px */
  --radius-2xl: 1rem;      /* 16px */
  --radius-full: 9999px;   /* 圆形 */
}

/* 组件圆角 */
.card { border-radius: var(--radius-lg); }
.button { border-radius: var(--radius-md); }
.input { border-radius: var(--radius-md); }
.badge { border-radius: var(--radius-full); }
.avatar { border-radius: var(--radius-full); }
```

## 6. 阴影系统

```css
:root {
  /* 阴影层级 */
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1);
  --shadow-2xl: 0 25px 50px rgba(0, 0, 0, 0.25);
  
  /* 内阴影 */
  --shadow-inner: inset 0 2px 4px rgba(0, 0, 0, 0.06);
  
  /* 焦点阴影 */
  --shadow-focus: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

/* 组件阴影 */
.card { box-shadow: var(--shadow-sm); }
.card:hover { box-shadow: var(--shadow-md); }
.modal { box-shadow: var(--shadow-xl); }
.dropdown { box-shadow: var(--shadow-lg); }
.button:focus { box-shadow: var(--shadow-focus); }
```

## 7. 核心组件设计

### 7.1 按钮组件

#### 按钮变体

```tsx
// 主要按钮
<Button variant="primary" size="md">
  保存配置
</Button>

// 次要按钮
<Button variant="secondary" size="md">
  取消
</Button>

// 危险按钮
<Button variant="destructive" size="md">
  删除配置
</Button>

// 幽灵按钮
<Button variant="ghost" size="sm">
  <Edit className="w-4 h-4 mr-2" />
  编辑
</Button>
```

#### 按钮状态

```tsx
// 加载状态
<Button loading={isLoading} disabled={isLoading}>
  {isLoading ? "保存中..." : "保存配置"}
</Button>

// 成功状态
<Button variant="primary" className="bg-success">
  <Check className="w-4 h-4 mr-2" />
  已保存
</Button>
```

### 7.2 卡片组件

#### 配置卡片

```tsx
interface ConfigCardProps {
  title: string
  description?: string
  status?: 'connected' | 'disconnected' | 'testing' | 'error'
  statusText?: string
  icon?: React.ComponentType
  actions?: React.ReactNode
  children: React.ReactNode
  onClick?: () => void
}

<ConfigCard
  title="OpenAI GPT-4"
  description="OpenAI 官方 GPT-4 模型"
  status="connected"
  statusText="已连接"
  icon={Bot}
  actions={
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>编辑</DropdownMenuItem>
        <DropdownMenuItem>测试连接</DropdownMenuItem>
        <DropdownMenuItem>删除</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  }
>
  <div className="space-y-2">
    <div className="flex justify-between text-sm">
      <span className="text-muted">模型</span>
      <span>gpt-4-turbo</span>
    </div>
    <div className="flex justify-between text-sm">
      <span className="text-muted">Token 限制</span>
      <span>128,000</span>
    </div>
  </div>
</ConfigCard>
```

### 7.3 状态指示器

#### 连接状态

```tsx
interface StatusIndicatorProps {
  status: 'connected' | 'disconnected' | 'testing' | 'error'
  text?: string
  showIcon?: boolean
}

<StatusIndicator status="connected" text="已连接" showIcon />
<StatusIndicator status="testing" text="连接中..." showIcon />
<StatusIndicator status="error" text="连接失败" showIcon />
```

#### 状态颜色

```css
.status-connected {
  color: var(--success);
  background-color: color-mix(in srgb, var(--success) 10%, transparent);
}

.status-disconnected {
  color: var(--text-muted);
  background-color: var(--surface);
}

.status-testing {
  color: var(--warning);
  background-color: color-mix(in srgb, var(--warning) 10%, transparent);
}

.status-error {
  color: var(--error);
  background-color: color-mix(in srgb, var(--error) 10%, transparent);
}
```

### 7.4 表单组件

#### 配置表单

```tsx
interface ConfigFormProps<T> {
  title: string
  description?: string
  initialData?: T
  schema: z.ZodSchema<T>
  onSubmit: (data: T) => Promise<void>
  onCancel?: () => void
}

<ConfigForm
  title="AI 提供商配置"
  description="配置您的 AI 模型提供商信息"
  schema={ModelProfileSchema}
  onSubmit={handleSubmit}
>
  <FormField name="name">
    <FormLabel>模型名称</FormLabel>
    <FormControl>
      <Input placeholder="输入模型名称" />
    </FormControl>
    <FormMessage />
  </FormField>
  
  <FormField name="provider">
    <FormLabel>提供商</FormLabel>
    <FormControl>
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="选择提供商" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="openai">OpenAI</SelectItem>
          <SelectItem value="anthropic">Anthropic</SelectItem>
          <SelectItem value="deepseek">DeepSeek</SelectItem>
        </SelectContent>
      </Select>
    </FormControl>
    <FormMessage />
  </FormField>
</ConfigForm>
```

### 7.5 导航组件

#### 侧边栏导航

```tsx
interface NavigationItem {
  id: string
  label: string
  icon: React.ComponentType
  href: string
  badge?: string
  disabled?: boolean
}

const navigationItems: NavigationItem[] = [
  {
    id: 'ai-providers',
    label: 'AI 提供商',
    icon: Bot,
    href: '/ai-providers',
    badge: '3'
  },
  {
    id: 'mcp-servers',
    label: 'MCP 服务器',
    icon: Server,
    href: '/mcp-servers'
  },
  {
    id: 'preferences',
    label: '写作偏好',
    icon: Settings,
    href: '/preferences'
  }
]

<Navigation items={navigationItems} />
```

## 8. 布局系统

### 8.1 应用布局

```tsx
interface AppLayoutProps {
  children: React.ReactNode
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-background">
      {/* 侧边栏 */}
      <aside className="w-64 bg-surface border-r border-border">
        <div className="p-6">
          <Logo />
        </div>
        <Navigation items={navigationItems} />
      </aside>
      
      {/* 主内容区 */}
      <main className="flex-1 flex flex-col">
        {/* 顶部栏 */}
        <header className="h-16 bg-surface-elevated border-b border-border px-6 flex items-center justify-between">
          <Breadcrumb />
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <UserMenu />
          </div>
        </header>
        
        {/* 内容区域 */}
        <div className="flex-1 p-6 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
```

### 8.2 页面布局

```tsx
interface PageLayoutProps {
  title: string
  description?: string
  actions?: React.ReactNode
  children: React.ReactNode
}

const PageLayout: React.FC<PageLayoutProps> = ({
  title,
  description,
  actions,
  children
}) => {
  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">{title}</h1>
          {description && (
            <p className="text-text-secondary mt-1">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center space-x-2">
            {actions}
          </div>
        )}
      </div>
      
      {/* 页面内容 */}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  )
}
```

### 8.3 响应式布局

```css
/* 响应式断点 */
@media (max-width: 768px) {
  .app-layout {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    height: auto;
    border-right: none;
    border-bottom: 1px solid var(--border);
  }
  
  .main-content {
    padding: var(--space-4);
  }
}

@media (max-width: 640px) {
  .page-header {
    flex-direction: column;
    gap: var(--space-4);
    align-items: flex-start;
  }
  
  .config-grid {
    grid-template-columns: 1fr;
  }
}
```

## 9. 动画系统

### 9.1 过渡动画

```css
:root {
  /* 过渡时间 */
  --transition-fast: 150ms;
  --transition-normal: 200ms;
  --transition-slow: 300ms;
  
  /* 缓动函数 */
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
}

/* 通用过渡 */
.transition-all {
  transition: all var(--transition-normal) var(--ease-in-out);
}

.transition-colors {
  transition: color var(--transition-normal) var(--ease-in-out),
              background-color var(--transition-normal) var(--ease-in-out);
}

.transition-transform {
  transition: transform var(--transition-normal) var(--ease-in-out);
}
```

### 9.2 交互动画

```css
/* 按钮动画 */
.button {
  transform: translateY(0);
  transition: all var(--transition-fast) var(--ease-out);
}

.button:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.button:active {
  transform: translateY(0);
}

/* 卡片动画 */
.card {
  transition: all var(--transition-normal) var(--ease-out);
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

/* 加载动画 */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

/* 淡入动画 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-in {
  animation: fadeIn var(--transition-normal) var(--ease-out);
}
```

## 10. 图标系统

### 10.1 图标规范

使用 Lucide React 图标库，保持一致的视觉风格：

```tsx
// 导入图标
import {
  Bot,           // AI 提供商
  Server,        // MCP 服务器
  Settings,      // 设置
  FileText,      // 文档
  Download,      // 下载
  Upload,        // 上传
  Check,         // 成功
  X,             // 错误/关闭
  AlertTriangle, // 警告
  Info,          // 信息
  Edit,          // 编辑
  Trash,         // 删除
  Plus,          // 添加
  Search,        // 搜索
  Filter,        // 筛选
  MoreVertical,  // 更多操作
  ChevronDown,   // 下拉
  ChevronRight,  // 展开
  ExternalLink,  // 外链
  Copy,          // 复制
  Eye,           // 查看
  EyeOff,        // 隐藏
} from 'lucide-react'

// 图标尺寸
const iconSizes = {
  xs: 'w-3 h-3',   // 12px
  sm: 'w-4 h-4',   // 16px
  md: 'w-5 h-5',   // 20px
  lg: 'w-6 h-6',   // 24px
  xl: 'w-8 h-8',   // 32px
}
```

### 10.2 状态图标

```tsx
interface StatusIconProps {
  status: 'connected' | 'disconnected' | 'testing' | 'error'
  size?: keyof typeof iconSizes
}

const StatusIcon: React.FC<StatusIconProps> = ({ status, size = 'sm' }) => {
  const iconClass = iconSizes[size]
  
  switch (status) {
    case 'connected':
      return <Check className={`${iconClass} text-success`} />
    case 'disconnected':
      return <X className={`${iconClass} text-muted`} />
    case 'testing':
      return <div className={`${iconClass} loading-spinner text-warning`} />
    case 'error':
      return <AlertTriangle className={`${iconClass} text-error`} />
  }
}
```

## 11. 错误状态设计

### 11.1 错误提示

```tsx
interface ErrorAlertProps {
  title: string
  message: string
  actions?: React.ReactNode
}

<Alert variant="destructive">
  <AlertTriangle className="h-4 w-4" />
  <AlertTitle>配置验证失败</AlertTitle>
  <AlertDescription>
    API 密钥格式不正确，请检查后重试。
    <div className="mt-3 flex space-x-2">
      <Button size="sm" variant="outline">
        重试
      </Button>
      <Button size="sm" variant="ghost">
        查看详情
      </Button>
    </div>
  </AlertDescription>
</Alert>
```

### 11.2 空状态

```tsx
interface EmptyStateProps {
  icon: React.ComponentType
  title: string
  description: string
  action?: React.ReactNode
}

<EmptyState
  icon={Bot}
  title="暂无 AI 提供商"
  description="添加您的第一个 AI 提供商配置来开始使用 WriteFlow"
  action={
    <Button onClick={() => setShowAddDialog(true)}>
      <Plus className="w-4 h-4 mr-2" />
      添加提供商
    </Button>
  }
/>
```

## 12. 加载状态设计

### 12.1 全局加载

```tsx
<div className="flex items-center justify-center h-64">
  <div className="text-center space-y-4">
    <div className="loading-spinner w-8 h-8 mx-auto text-primary" />
    <p className="text-muted">加载配置中...</p>
  </div>
</div>
```

### 12.2 骨架屏

```tsx
<div className="space-y-4">
  {Array.from({ length: 3 }).map((_, i) => (
    <Card key={i} className="p-6">
      <div className="space-y-3">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </Card>
  ))}
</div>
```

## 13. 可访问性规范

### 13.1 键盘导航

```tsx
// 焦点管理
const handleKeyDown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'Tab':
      // 自然的 Tab 顺序
      break
    case 'Enter':
    case ' ':
      // 激活按钮/链接
      event.preventDefault()
      handleActivate()
      break
    case 'Escape':
      // 关闭对话框/下拉菜单
      handleClose()
      break
    case 'ArrowDown':
    case 'ArrowUp':
      // 列表导航
      handleListNavigation(event.key)
      break
  }
}
```

### 13.2 ARIA 标签

```tsx
// 按钮标签
<Button
  aria-label="删除 OpenAI 配置"
  aria-describedby="delete-description"
>
  <Trash className="w-4 h-4" />
</Button>

// 状态标签
<div
  role="status"
  aria-live="polite"
  aria-label={`连接状态: ${status}`}
>
  <StatusIcon status={status} />
</div>

// 表单标签
<Label htmlFor="api-key">API 密钥</Label>
<Input
  id="api-key"
  type="password"
  aria-describedby="api-key-help"
  aria-invalid={hasError}
/>
<p id="api-key-help" className="text-sm text-muted">
  您的 API 密钥将安全存储在本地
</p>
```

### 13.3 颜色对比度

确保所有文本元素符合 WCAG 2.1 AA 标准：

```css
/* 最小对比度 4.5:1 */
.text-primary { color: var(--text-primary); }  /* 对比度: 16:1 */
.text-secondary { color: var(--text-secondary); } /* 对比度: 7:1 */
.text-muted { color: var(--text-muted); }      /* 对比度: 4.5:1 */

/* 状态颜色对比度 */
.text-success { color: #16a34a; }  /* 对比度: 5.2:1 */
.text-warning { color: #d97706; }  /* 对比度: 4.6:1 */
.text-error { color: #dc2626; }    /* 对比度: 5.8:1 */
```

---

**WriteFlow Studio UI Design Specification v1.0.0**  
*构建美观、一致、易用的现代化用户界面* 🎨