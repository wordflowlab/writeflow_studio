# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

输出中文

## Project Overview

WriteFlow Studio 是基于 Tauri + React + shadcn/ui 构建的 **完整写作平台**，集项目管理、文档编辑、AI 写作助手、环境配置于一体的桌面应用程序。为用户提供从创意构思到最终发布的完整写作工作流，通过现代化的图形界面和强大的 AI 集成，为所有用户群体提供零门槛的专业写作体验。

**当前状态**: 
- ✅ **规划设计阶段完成**：完整的产品需求文档、技术架构设计、UI设计规范
- ✅ **HTML 原型完成**：2277行的完整功能原型，包含项目管理、文档编辑、配置管理等所有核心功能
- ✅ **Phase 1 基础架构完成**：Tauri 2.0 + React 18 项目结构搭建完成，核心数据模型和服务层实现
- ✅ **Phase 2 前端开发完成**：UI组件库集成完成，布局系统匹配HTML原型，核心页面功能就绪
- ✅ **Phase 3 文档编辑系统完成**：Monaco Editor集成，实时预览，文档树管理，CRUD操作完整
- ✅ **Phase 4 AI配置管理完成**：12+AI提供商支持，MCP服务器管理，写作偏好设置
- ✅ **Phase 5 高级功能完成**：新手引导系统，搜索命令面板，多格式导入导出，性能优化
- 🚧 **Phase 6 待开始**：最终优化与发布准备

## Architecture & Technology Stack

- **应用框架**: Tauri 2.0 - 跨平台桌面应用框架
- **前端**: React 18 + TypeScript 5.0+ - 现代化前端开发
- **UI 框架**: shadcn/ui + Tailwind CSS - 高质量组件库和样式系统  
- **状态管理**: Zustand - 轻量级状态管理解决方案
- **构建工具**: Vite 5.0+ - 快速的前端构建工具
- **后端**: Rust + Tauri Backend - 高性能原生后端
- **数据存储**: SQLite + serde - 本地数据管理和序列化
- **网络通信**: reqwest + tokio - 异步网络请求和文件操作
- **编辑器**: Monaco Editor / CodeMirror - 高性能 Markdown 编辑器
- **AI 集成**: WriteFlow CLI 兼容的 AI 提供商接口

## Project Structure (Planned)

```
writeflow-studio/
├── src/                        # React frontend source
│   ├── components/             # React components
│   │   ├── ui/                # shadcn/ui base components
│   │   ├── layout/            # Layout components (三栏布局系统)
│   │   ├── project/           # 项目管理组件
│   │   ├── document/          # 文档编辑组件
│   │   │   ├── editor/        # 编辑器核心组件
│   │   │   ├── preview/       # 预览组件
│   │   │   ├── outline/       # 大纲组件
│   │   │   └── toolbar/       # 工具栏组件
│   │   ├── agent/             # Agent 相关组件
│   │   ├── environment/       # 环境管理组件
│   │   └── forms/             # 表单组件
│   ├── pages/                 # Page components
│   │   ├── Dashboard/         # 仪表板页面
│   │   ├── ProjectManager/    # 项目管理页面
│   │   │   ├── ProjectList/   # 项目列表
│   │   │   ├── ProjectDetail/ # 项目详情
│   │   │   └── WorkspaceSelector/ # 工作区选择器
│   │   ├── DocumentEditor/    # 文档编辑页面
│   │   │   ├── EditorLayout/  # 编辑器布局
│   │   │   ├── DocumentTree/  # 文档树
│   │   │   └── MarkdownEditor/ # Markdown 编辑器
│   │   ├── AIProviders/       # AI 提供商配置
│   │   ├── MCPServers/        # MCP 服务器设置
│   │   └── Settings/          # 应用设置
│   ├── hooks/                 # Custom React hooks
│   ├── stores/                # Zustand state management
│   │   ├── projectStore.ts    # 项目管理状态
│   │   ├── documentStore.ts   # 文档编辑状态
│   │   ├── workspaceStore.ts  # 工作区状态
│   │   ├── environmentStore.ts# 环境状态
│   │   ├── agentStore.ts      # Agent 状态
│   │   └── configStore.ts     # 配置状态
│   ├── services/              # API service layer
│   └── types/                 # TypeScript type definitions
├── src-tauri/                 # Rust backend source
│   ├── src/
│   │   ├── commands/          # Tauri command handlers
│   │   │   ├── project.rs     # 项目管理命令
│   │   │   ├── document.rs    # 文档操作命令
│   │   │   ├── workspace.rs   # 工作区管理命令
│   │   │   └── config.rs      # 配置管理命令
│   │   ├── services/          # Business logic services
│   │   │   ├── project_service.rs  # 项目管理服务
│   │   │   ├── document_service.rs # 文档服务
│   │   │   └── workspace_manager.rs # 工作区管理
│   │   ├── models/            # Data models
│   │   └── utils/             # Utility functions
│   └── Cargo.toml
├── docs/                      # Comprehensive documentation
│   ├── PRD.md                # ✅ 产品需求文档 (已更新)
│   ├── technical-architecture.md # ✅ 技术架构设计 (已更新)
│   ├── ui-design-specification.md # ✅ UI设计规范
│   └── development-roadmap.md # ✅ 开发实施计划 (已更新)
├── writeflow-studio-prototype.html # ✅ 完整功能原型 (2277行)
├── CLAUDE.md                  # ✅ Claude Code 指南 (本文档)
└── package.json
```

---

## Key Development Commands

```bash
# 项目初始化
npm create tauri-app@latest writeflow-studio --template react-ts
cd writeflow-studio

# 开发模式
npm run tauri dev

# 生产构建
npm run tauri build

# 测试
npm run test              # Frontend tests
cargo test                # Backend tests  
npm run test:e2e          # End-to-end tests

# 代码质量
npm run lint
npm run format
cargo clippy
cargo fmt

# 跨平台构建
npm run build:windows
npm run build:macos
npm run build:linux
```

## Documentation References

- **Product Requirements**: See `docs/PRD.md` for complete feature specifications
- **Technical Architecture**: See `docs/technical-architecture.md` for system design
- **UI Design**: See `docs/ui-design-specification.md` for design system
- **Development Plan**: See `docs/development-roadmap.md` for implementation timeline

## Important Notes

1. **Configuration Compatibility**: Must maintain 100% compatibility with existing WriteFlow CLI configuration files (~/.writeflow.json)

2. **Security**: API keys and sensitive data must be stored securely using system keyring, never in plain text

3. **Cross-platform**: Target Windows 10+, macOS 10.15+, and Linux Ubuntu 18.04+

4. **User Experience**: Focus on zero-configuration startup for non-technical users while providing advanced options for power users

5. **Incremental Development**: Follow the 11-week development plan with clear milestones and deliverables

6. **Testing Strategy**: Implement comprehensive testing including unit tests, integration tests, and cross-platform compatibility tests

## Getting Started (When Implementing)

1. Initialize Tauri project: `npm create tauri-app@latest writeflow-studio`
2. Set up React + TypeScript + Vite frontend
3. Install and configure shadcn/ui components
4. Set up Zustand state management
5. Implement Rust backend services
6. Create database schema and migrations
7. Follow the development roadmap in `docs/development-roadmap.md`

## Target Users

- **专业写作者 (45%)**：学术写作者、创意写作者、商务文档作者、内容创作者
- **团队协作用户 (35%)**：团队写作项目、教育机构、企业内容团队、出版机构  
- **技术用户 (20%)**：技术写作者、系统管理者、高级用户、企业用户

界面设计对新手友好，同时为高级用户提供强大的配置选项。

### 版本控制策略

- **主版本**: 重大功能完成 (1.0.0, 2.0.0)
- **次版本**: 功能增加 (1.1.0, 1.2.0)  
- **修订版本**: Bug 修复 (1.0.1, 1.0.2)

**开发原则**: 
- 🎯 严格按照 HTML 原型实现功能
- 📋 每完成一个任务立即更新进度
- 🔄 持续集成和测试
- 📝 记录重要决策和变更