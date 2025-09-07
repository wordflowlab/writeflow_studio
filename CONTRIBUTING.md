# 贡献指南

感谢您对 WriteFlow Studio 项目的关注！我们非常欢迎各种形式的贡献，包括但不限于：

- 🐛 Bug 报告和修复
- ✨ 新功能建议和实现
- 📖 文档改进
- 🎨 UI/UX 优化
- 🧪 测试用例编写
- 🌐 国际化翻译

## 🚀 快速开始

### 开发环境准备

1. **系统要求**
   - Node.js 18+ 
   - Rust 1.70+
   - Git 2.0+

2. **克隆项目**
   ```bash
   git clone https://github.com/your-repo/writeflow-studio.git
   cd writeflow-studio
   ```

3. **安装依赖**
   ```bash
   npm install
   ```

4. **启动开发模式**
   ```bash
   npm run tauri:dev
   ```

### 项目结构了解

```
writeflow-studio/
├── src/                 # React 前端源码
├── src-tauri/          # Rust 后端源码
├── docs/               # 项目文档
├── CLAUDE.md          # AI 助手指南
└── README.md          # 项目说明
```

## 🔄 开发流程

### 1. 创建功能分支

```bash
git checkout -b feature/your-feature-name
# 或
git checkout -b bugfix/issue-number
# 或  
git checkout -b docs/update-readme
```

### 2. 开发和测试

```bash
# 前端开发
npm run dev

# 后端测试
cargo test

# 代码质量检查
npm run lint
cargo clippy

# 格式化代码
npm run format  
cargo fmt
```

### 3. 提交变更

我们使用 [Conventional Commits](https://www.conventionalcommits.org/zh-hans/v1.0.0/) 规范：

```bash
git commit -m "feat: 添加新的项目模板功能"
git commit -m "fix: 修复文档编辑器预览问题"
git commit -m "docs: 更新API文档"
git commit -m "style: 优化项目列表布局"
git commit -m "refactor: 重构配置管理服务"
git commit -m "test: 添加项目创建测试用例"
```

### 4. 推送和 PR

```bash
git push origin feature/your-feature-name
```

然后在 GitHub 上创建 Pull Request。

## 📝 代码规范

### TypeScript/React 规范

- 使用 TypeScript 严格模式
- 遵循 ESLint 和 Prettier 配置
- 组件使用 React Hooks
- 状态管理使用 Zustand
- 样式使用 Tailwind CSS

### Rust 规范

- 遵循 Rust 官方代码风格
- 使用 `cargo clippy` 检查代码质量
- 使用 `cargo fmt` 格式化代码
- 错误处理使用 `anyhow` 或 `Result<T, E>`
- 异步操作使用 `tokio`

### 文档规范

- README 使用中文编写
- 代码注释使用英文
- API 文档使用 JSDoc 或 Rustdoc
- 变更记录更新 CHANGELOG.md

## 🐛 Bug 报告

提交 Bug 报告时请包含：

### Bug 描述
- 清晰简洁的问题描述
- 期望的行为 vs 实际行为

### 重现步骤
1. 第一步操作
2. 第二步操作  
3. 观察到的错误

### 环境信息
- 操作系统: (macOS 13.0, Windows 11, Ubuntu 22.04)
- 应用版本: (0.1.0)
- Node.js 版本: (18.0.0)
- Rust 版本: (1.70.0)

### 附加信息
- 截图或录屏
- 控制台日志
- 相关配置文件

## ✨ 功能建议

提交功能建议时请包含：

### 功能描述
- 希望添加的功能
- 解决的问题或改善的体验

### 使用场景
- 具体的使用情况
- 目标用户群体

### 实现思路
- 可能的技术方案
- 参考的类似实现

## 🧪 测试指南

### 前端测试

```bash
# 单元测试
npm run test

# 测试覆盖率
npm run test:coverage

# UI 测试
npm run test:ui
```

### 后端测试

```bash
# Rust 单元测试
cargo test

# 集成测试
cargo test --test integration

# 基准测试
cargo bench
```

### 手动测试

1. **功能测试**: 验证新功能按预期工作
2. **回归测试**: 确保不破坏现有功能
3. **跨平台测试**: 在不同操作系统上测试
4. **性能测试**: 检查内存和 CPU 占用

## 📋 PR 检查清单

提交 PR 前请确认：

### 代码质量
- [ ] TypeScript 编译通过 (`npm run build`)
- [ ] ESLint 检查通过 (`npm run lint`)
- [ ] Rust 编译通过 (`cargo build`)
- [ ] Clippy 检查通过 (`cargo clippy`)

### 测试
- [ ] 新功能有对应测试用例
- [ ] 现有测试全部通过
- [ ] 手动测试验证功能正常

### 文档
- [ ] README 或文档已更新
- [ ] CHANGELOG 已记录变更
- [ ] API 文档已更新

### Git 提交
- [ ] Commit 消息符合规范
- [ ] 分支命名规范
- [ ] 没有不必要的文件变更

## 🎯 贡献领域

我们特别欢迎以下领域的贡献：

### 🔧 技术改进
- 性能优化
- 代码重构
- 测试覆盖
- CI/CD 改进

### 🎨 用户体验
- UI 界面优化
- 交互体验改善
- 新手引导完善
- 快捷键功能

### 🌐 国际化
- 多语言翻译
- 本地化适配
- 文档翻译
- 文化差异考虑

### 📖 文档
- 使用教程
- 开发指南  
- API 文档
- 最佳实践

### 🧪 质量保证
- 单元测试
- 集成测试
- 端到端测试
- 性能基准测试

## 👥 社区

### 讨论
- [GitHub Discussions](https://github.com/your-repo/writeflow-studio/discussions)
- [Issues](https://github.com/your-repo/writeflow-studio/issues)

### 沟通原则
- 保持友善和尊重
- 专注于技术讨论
- 欢迎不同意见和建议
- 帮助新贡献者快速上手

### 行为准则
- 使用包容性语言
- 尊重不同观点和经验
- 优雅地接受建设性批评
- 专注于对社区最好的事情

## 🏆 贡献者认可

我们会在以下方式认可贡献者：

- 在 README 中列出贡献者
- 在 CHANGELOG 中标注贡献者
- 通过 GitHub 的贡献者统计
- 在项目发布中感谢贡献者

## ❓ 获得帮助

如果您在贡献过程中遇到问题：

1. 查看现有的 [Issues](https://github.com/your-repo/writeflow-studio/issues)
2. 搜索 [Discussions](https://github.com/your-repo/writeflow-studio/discussions)
3. 创建新的 Issue 或 Discussion
4. 联系项目维护者

感谢您的贡献！🎉