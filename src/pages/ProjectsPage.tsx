import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectList } from '@/components/project/ProjectList';

export function ProjectsPage() {
  const [activeTab, setActiveTab] = useState('all');

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">项目管理</h1>
            <p className="text-gray-600 mt-1">管理您的写作项目</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">全部项目</TabsTrigger>
            <TabsTrigger value="active">进行中</TabsTrigger>
            <TabsTrigger value="completed">已完成</TabsTrigger>
            <TabsTrigger value="archived">已归档</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            <ProjectList workspaceId="all" />
          </TabsContent>
          
          <TabsContent value="active" className="mt-6">
            <ProjectList workspaceId="workspace-1" />
          </TabsContent>
          
          <TabsContent value="completed" className="mt-6">
            <div className="text-center py-12">
              <p className="text-gray-500">筛选功能开发中...</p>
            </div>
          </TabsContent>
          
          <TabsContent value="archived" className="mt-6">
            <div className="text-center py-12">
              <p className="text-gray-500">筛选功能开发中...</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}