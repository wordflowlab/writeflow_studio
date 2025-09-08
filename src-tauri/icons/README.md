# WriteFlow Studio 图标资源

本目录包含 WriteFlow Studio 应用程序的所有图标资源文件。

## 图标文件结构

```
icons/
├── README.md                                    # 本说明文件  
├── writeflow-studio-icon-compact.svg           # 主图标源文件（用于生成）
├── generate-icons.sh                           # 图标生成脚本（优先使用 Tauri CLI）
├── 32x32.png                                   # 32x32 像素 PNG
├── 64x64.png                                   # 64x64 像素 PNG  
├── 128x128.png                                 # 128x128 像素 PNG
├── 128x128@2x.png                              # 高分辨率 PNG (256x256)
├── icon.png                                    # 通用图标文件 (主图标)
├── icon.ico                                    # Windows 图标文件
└── icon.icns                                   # macOS 图标文件
```

## 设计说明

### 主要元素
- **背景**：蓝紫色渐变，体现现代科技感
- **主图标**：文档符号，代表写作功能
- **装饰元素**：横线和蓝色圆点，代表文本内容
- **折角**：文档右上角折角效果，增强立体感

### 颜色规范
- **主渐变**：#3B82F6 (蓝色) 到 #8B5CF6 (紫色)
- **文档颜色**：#FFFFFF (白色)
- **装饰点**：#3B82F6 (蓝色)
- **文本线**：#9CA3AF (灰色)

## 生成流程

### 推荐方法（使用 Tauri CLI）
```bash
# 安装 Tauri CLI
npm install -g @tauri-apps/cli

# 生成所有平台图标
cd src-tauri/icons
tauri icon writeflow-studio-icon-compact.svg
```

### 备用方法（使用生成脚本）
如果没有 Tauri CLI，可以使用提供的脚本：

```bash
cd src-tauri/icons  
bash generate-icons.sh
```

### 生成步骤
1. **优先检查 Tauri CLI**：脚本自动检测并使用官方工具
2. **备用方案**：使用 ImageMagick 生成各平台格式
3. **自动优化**：根据尺寸选择合适的 SVG 版本

## 依赖工具

### 推荐工具
- **Tauri CLI**：官方图标生成工具（推荐）
  ```bash
  npm install -g @tauri-apps/cli
  ```

### 备用工具（可选）
- **ImageMagick**：图像格式转换
  ```bash  
  # macOS
  brew install imagemagick
  ```

## 使用方法

**简单方式**：
```bash
# 安装 Tauri CLI 并生成图标
npm install -g @tauri-apps/cli
cd src-tauri/icons
tauri icon writeflow-studio-icon-compact.svg
```

**备用方式**：
```bash
# 使用生成脚本（自动检测工具）
cd src-tauri/icons
./generate-icons.sh
```

## 平台兼容性

### Windows
- 使用 `icon.ico` 文件
- 自动包含多种尺寸支持

### macOS  
- 使用 `icon.icns` 文件
- 包含 Retina 显示屏支持

### Linux
- 使用标准 PNG 文件 (32x32, 64x64, 128x128)
- 支持系统图标主题

## 维护指南

### 修改图标
1. 编辑 `writeflow-studio-icon-compact.svg` 源文件
2. 使用 `tauri icon` 命令重新生成所有格式
3. 测试应用构建确认效果

### 最佳实践
- 保持 100x100 背景尺寸以匹配 macOS 视觉标准
- 确保在小尺寸下图标仍清晰可识别
- 使用简洁的设计元素

### 质量检查
- 确保小尺寸（16px, 32px）图标清晰可识别
- 验证不同背景下的显示效果
- 测试 Retina 显示屏的高分辨率显示

## 更新日志

- **v1.1** (2024-09-08): 简化目录结构，优化图标尺寸
  - 清理冗余文件，只保留核心必要文件
  - 优化图标尺寸到 100x100 背景，匹配 macOS 视觉标准
  - 优先使用 Tauri 官方工具生成图标
  - 更新文档和生成脚本

- **v1.0** (2024-09): 初始版本，建立完整的图标资源体系
  - 支持所有主要平台的图标格式
  - 优化小尺寸显示效果  
  - 建立自动化生成流程

