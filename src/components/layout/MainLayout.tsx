import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import WelcomeWizard from "../onboarding/WelcomeWizard";
import InteractiveTutorial from "../onboarding/InteractiveTutorial";
import CommandPalette from "../search/CommandPalette";

interface UserProfile {
  identity: string;
  writingType: string[];
  frequency: string;
  collaboration: string;
  techLevel: string;
  preferredAI: string[];
  preferredAgents: string[];
  writingStyle: string;
}

export default function MainLayout() {
  const [showWelcomeWizard, setShowWelcomeWizard] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  // 检查是否是首次使用
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('writeflow-welcome-seen');
    if (!hasSeenWelcome) {
      setShowWelcomeWizard(true);
    }
  }, []);

  const handleWelcomeComplete = (profile: UserProfile) => {
    localStorage.setItem('writeflow-welcome-seen', 'true');
    localStorage.setItem('writeflow-user-profile', JSON.stringify(profile));
    
    // 根据用户选择可能显示教程
    if (profile.techLevel === 'beginner') {
      setTimeout(() => {
        setShowTutorial(true);
      }, 1000);
    }
  };

  // 全局快捷键监听
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K 或 Cmd+K 打开命令面板
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <div className="w-70 h-full fixed left-0 top-0">
        <Sidebar />
      </div>

      {/* Main content area */}
      <div className="flex-1 ml-70 h-full overflow-auto">
        <main className="p-6">
          <Outlet />
        </main>
      </div>

      {/* 新手引导对话框 */}
      <WelcomeWizard
        open={showWelcomeWizard}
        onOpenChange={setShowWelcomeWizard}
        onComplete={handleWelcomeComplete}
      />

      {/* 交互式教程 */}
      <InteractiveTutorial
        open={showTutorial}
        onOpenChange={setShowTutorial}
      />

      {/* 命令面板（仍保留快捷键支持）*/}
      <CommandPalette open={showCommandPalette} onOpenChange={setShowCommandPalette} />
    </div>
  );
}
