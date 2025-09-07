interface HeaderProps {
  onShowTutorial?: () => void;
  onShowCommandPalette?: () => void;
}

export default function Header({ onShowTutorial, onShowCommandPalette }: HeaderProps) {
  return (
    <header className="h-16 border-b border-slate-300 bg-gradient-to-b from-slate-50 to-slate-200 flex items-center justify-between px-4">
      <div className="text-sm font-medium text-slate-700">
        WriteFlow Studio
      </div>
      
      <div className="flex items-center space-x-2">
        {onShowCommandPalette && (
          <button
            onClick={onShowCommandPalette}
            className="flex items-center space-x-1 px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-300 rounded transition-colors"
            title="命令面板 (Ctrl+K)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>搜索</span>
          </button>
        )}
        
        {onShowTutorial && (
          <button
            onClick={onShowTutorial}
            className="flex items-center space-x-1 px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-300 rounded transition-colors"
            title="查看教程"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>帮助</span>
          </button>
        )}
      </div>
    </header>
  );
}