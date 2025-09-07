
export function DashboardPage() {
  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">仪表板</h1>
        <p className="text-gray-600 mt-1">WriteFlow Studio 工作台</p>
      </div>

      <div className="flex-1 p-6 overflow-auto">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">仪表板开发中</h3>
          <p className="text-gray-500">即将展示项目统计、最近文档和快捷操作</p>
        </div>
      </div>
    </div>
  );
}