
export function SettingsPage() {
  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">设置</h1>
        <p className="text-gray-600 mt-1">配置应用首选项和选项</p>
      </div>

      <div className="flex-1 p-6 overflow-auto">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">设置页面开发中</h3>
          <p className="text-gray-500">即将支持编辑器、导出和系统配置</p>
        </div>
      </div>
    </div>
  );
}