# WriteFlow Studio

基于 Tauri 2 + React 18 + TypeScript + Tailwind 的跨平台写作工作室，集项目管理、Markdown 编辑、AI 集成与本地存储于一体。

## 功能亮点
- 项目/文档管理与三栏编辑体验（编辑/预览）
- AI 提供商与 MCP 服务器配置（多场景写作）
- 本地优先：Rust 后端 + SQLite 存储
- 跨平台桌面应用（macOS/Windows/Linux）

## 技术栈
- 前端：React, Vite, Tailwind, Zustand, shadcn/ui
- 桌面：Tauri 2（Rust）
- 测试与质量：Vitest, ESLint, Prettier

## 目录结构
```
src/                 # 前端源码（components, pages, hooks, lib, store）
src-tauri/           # Rust 后端（src/commands, models, services, utils, main.rs）
docs/                # 文档
data/                # 本地样例/数据
dist/                # 构建产物
index.html           # Vite 入口
```

## 快速开始
先安装 Node.js 18+、Rust 工具链、Tauri CLI。

```bash
npm i
# Web 开发
npm run dev
# 桌面开发（推荐）
npm run tauri:dev
```

## 构建与发布
```bash
# Web 构建（含类型检查）
npm run build
# 桌面应用打包
npm run tauri:build
```

## 测试与规范
```bash
# 运行测试
npm run test
# 代码检查与格式化
npm run lint
npm run format
```

## 贡献
欢迎贡献！请先阅读 AGENTS.md（仓库贡献/规则）。提交 PR 前确保通过 lint、build 与测试。
