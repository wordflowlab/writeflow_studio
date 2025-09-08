# WriteFlow Studio 图标资源

本目录包含 WriteFlow Studio 应用程序的所有图标资源文件。

## 图标文件结构

```
icons/
├── README.md                          # 本说明文件
├── writeflow-studio-icon.svg          # 主图标源文件（完整版本）
├── writeflow-studio-icon.min.svg      # 主图标源文件（压缩版本）
├── writeflow-studio-icon-small.svg    # 小尺寸优化版本
├── generate-icons.sh                  # 图标生成脚本
├── png/                               # PNG 格式图标
│   ├── icon-16.png                    # 16x16 像素
│   ├── icon-32.png                    # 32x32 像素
│   ├── icon-64.png                    # 64x64 像素
│   ├── icon-128.png                   # 128x128 像素
│   ├── icon-256.png                   # 256x256 像素
│   └── icon-512.png                   # 512x512 像素
├── writeflow-studio.ico               # Windows 图标文件
├── WriteFlowStudio.icns               # macOS 图标文件
└── WriteFlowStudio.iconset/           # macOS 图标集源文件
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

### 自动生成
使用提供的脚本可以自动生成所有尺寸的图标：

```bash
cd src-tauri/icons
bash generate-icons.sh
```

### 生成步骤
1. **SVG 优化**（可选）：使用 svgo 优化 SVG 文件
2. **PNG 生成**：使用 ImageMagick 生成多种尺寸的 PNG 文件
   - 小尺寸（16px, 32px）使用简化版 SVG
   - 大尺寸（64px+）使用完整版 SVG
3. **ICO 生成**：生成 Windows 专用的 ICO 文件
4. **ICNS 生成**：生成 macOS 专用的 ICNS 文件

## 依赖工具

### 必需工具
- **ImageMagick**：PNG、ICO、ICNS 文件生成
  ```bash
  # macOS
  brew install imagemagick
  
  # Ubuntu/Debian
  sudo apt install imagemagick
  ```

### 可选工具
- **svgo**：SVG 文件优化
  ```bash
  npm install -g svgo
  ```

## 使用方法

1) **安装依赖工具**

```bash
brew install imagemagick   # macOS
npm i -g svgo              # 可选；脚本会在缺失时跳过优化
```

2) **生成图标**

```bash
cd src-tauri/icons
chmod +x generate-icons.sh
bash generate-icons.sh
```

3) **构建应用** - `tauri.conf.json` 已正确引用生成的图标文件

## 平台兼容性

### Windows
- 使用 `writeflow-studio.ico` 文件
- 包含多种尺寸：16x16, 32x32, 48x48, 256x256

### macOS
- 使用 `WriteFlowStudio.icns` 文件
- 包含 Retina 显示屏支持的所有尺寸

### Linux
- 使用 PNG 文件
- 支持标准的图标尺寸规范

## 维护指南

### 修改图标
1. 编辑 `writeflow-studio-icon.svg` 源文件
2. 如需优化小尺寸显示，同步修改 `writeflow-studio-icon-small.svg`
3. 运行生成脚本更新所有格式
4. 测试应用构建确认效果

### 质量检查
- 确保小尺寸（16px, 32px）图标清晰可识别
- 验证不同背景下的显示效果
- 测试 Retina 显示屏的高分辨率显示

## 更新日志

- **v1.0** (2024-09): 初始版本，建立完整的图标资源体系
  - 支持所有主要平台的图标格式
  - 优化小尺寸显示效果  
  - 建立自动化生成流程

