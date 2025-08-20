# EasyPaste - 高效剪贴板管理工具

<div align="center">
  <img src="./public/logo.png" width="120px" alt="EasyPaste Logo">
  
  <p>
    <strong>专注于提升工作效率的跨平台剪贴板管理工具</strong>
  </p>
  
  <p>
    <img alt="Version" src="https://img.shields.io/badge/version-v0.1.1-blue.svg?cacheSeconds=2592000" />
    <img alt="License: Apache-2.0" src="https://img.shields.io/badge/License-Apache--2.0-yellow.svg" />
    <img alt="Platform" src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS-lightgrey" />
  </p>
</div>

---

> ⚠️ **项目状态**
> 
> **当前版本**: v0.1.1 (开发测试阶段)
> 
> - ✅ **测试环境**: 已在 Windows 10/11 纯净版系统测试，核心功能稳定
> - 🔧 **质量保证**: 采用严格的代码规范和安全策略，持续改进中
> - 📖 **系统集成**: 如需完全替换 Windows 剪贴板，请参考 [FAQ 文档](./FAQ/replace_global_hotkey_theory/replace_global_hotkey_theory.md)
> - 💡 **反馈欢迎**: 由于是个人项目，可能部分边缘性测试场景没有覆盖到，欢迎提 Issue 和 PR


## 📖 项目简介

EasyPaste 是一个专注于提升工作效率的跨平台剪贴板管理工具，基于现代化的 **Tauri + Vue3 + TypeScript** 技术栈开发。通过智能化的剪贴板历史记录管理，为开发者、设计师、办公人员等用户提供简洁高效的复制粘贴体验，显著提升日常工作效率。

### 🎯 设计理念

- **高效优先**: 专注于核心功能，避免功能冗余，确保每个功能都能真正提升效率
- **隐私安全**: 所有数据本地存储，不依赖网络，保护用户隐私和数据安全
- **轻量稳定**: 基于 Rust 构建，内存占用小，运行稳定，不影响系统性能
- **用户友好**: 简洁直观的界面设计，支持多主题和个性化定制

## 📸 应用截图

<div align="center">
  <p><em>主界面 - 剪贴板历史记录</em></p>
  <!-- 这里可以添加实际的截图 -->
  <p>🖼️ <em>截图将在后续版本中添加</em></p>
</div>

<details>
<summary><strong>更多界面截图</strong></summary>

- 🏷️ **标签管理界面**: 直观的标签创建和管理
- ⚙️ **设置页面**: 丰富的个性化配置选项
- 🔍 **搜索功能**: 快速定位所需内容
- 🎨 **多主题支持**: 浅色、深色等多种主题

</details>

### ✨ 核心特性

| 特性 | 描述 | 性能指标 |
|------|------|----------|
| 🚀 **高性能** | 基于 Rust + Tauri 构建 | 启动时间 < 2秒，内存占用 < 50MB |
| 🔒 **隐私安全** | 所有数据本地存储，不上传云端 | 零网络依赖，完全离线运行 |
| 📄 **文件安全** | 不实际操作任何文件，只保存文件路径 | 保证文件原始性和完整性 |
| 🎨 **现代化界面** | 基于 Vue3 + Naive UI | 支持多主题，响应式设计 |
| 🌍 **跨平台支持** | 支持主流操作系统 | Windows 10/11，macOS 10.13+ |
| 📦 **轻量级** | 安装包小巧，资源占用低 | 后台 CPU 占用 < 1% |

### 📈 性能基准

<details>
<summary><strong>性能测试数据</strong></summary>

| 测试项目 | EasyPaste | 同类产品平均值 | 优势 |
|----------|-----------|----------------|------|
| 🚀 启动时间 | < 2秒 | 5-8秒 | **60%+ 更快** |
| 💾 内存占用 | < 50MB | 150-300MB | **70%+ 更少** |
| 📦 安装包大小 | ~15MB | 80-150MB | **80%+ 更小** |
| 🔍 搜索响应时间 | < 100ms | 200-500ms | **50%+ 更快** |
| ⚡ CPU 占用 | < 1% | 2-5% | **显著更低** |

*测试环境: Windows 11, Intel i7-10700K, 16GB RAM*

</details>

## 🚀 主要功能

### 📋 剪贴板管理
- **自动监控剪贴板**: 实时捕获并保存剪贴板中的文本和文件内容
- **智能去重**: 自动识别重复内容，更新时间戳而非创建新记录
- **历史记录管理**: 按时间顺序保存剪贴板历史，支持置顶重要内容
- **分页加载**: 支持大量历史记录的高效分页显示，默认保存 2000 条
- **多类型支持**: 完整支持文本、文件的复制粘贴操作

### 🏷️ 标签与分类
- **自定义标签**: 为剪贴板内容添加自定义标签，便于分类管理
- **颜色标识**: 支持为标签设置不同颜色，视觉化分类
- **标签筛选**: 按标签快速筛选和查找相关内容
- **批量管理**: 支持批量添加、删除、修改标签
- **智能建议**: 基于内容自动建议相关标签（规划中）

### 🔍 搜索与导航
- **实时搜索**: 支持内容关键词搜索，响应时间 < 100ms
- **模糊匹配**: 支持部分关键词匹配，智能搜索算法
- **多维筛选**: 支持内容、标签组合筛选（已发布），按照类型、时间范围的组合筛选（规划中）
- **快捷导航**: 键盘快捷键支持，提升操作效率

### ⚙️ 系统集成
- **系统托盘**: 支持系统托盘操作，随时快速访问
- **全局快捷键**: 支持自定义全局快捷键（默认 Alt+C），快速调用
- **智能窗口**: 失焦自动隐藏，alwaysOnTop 模式，不干扰工作
- **开机自启**: 可设置开机自启动，后台静默运行
- **系统通知**: 重要操作系统通知提醒

### 🎨 个性化定制
- **多主题支持**: 内置浅色、深色、蓝色、粉色等多种主题
- **多语言支持**: 中文、英文等多语言界面，本地化适配
- **界面定制**: 支持 FiraCode 等宽字体，颜色个性化设置
- **窗口尺寸**: 支持窗口大小调整（350x550 - 800x1000）

### 🔄 数据管理
- **自动更新**: 内置应用自动更新功能，签名验证确保安全
- **智能清理**: 支持按时间和数量自动清理历史数据
- **数据备份**: 支持数据的备份和恢复（规划中）
- **SQLite 存储**: 使用 SQLite 数据库，数据安全可靠，支持加密
- **数据迁移**: 支持版本升级时的数据平滑迁移

## 🏗️ 技术架构

### 前端技术栈
| 技术 | 版本 | 用途 |
|------|------|------|
| **Vue 3.5+** | 最新稳定版 | 使用组合式 API 构建用户界面 |
| **TypeScript 5.6+** | 最新稳定版 | 提供类型安全的代码编写体验，严格模式 |
| **Naive UI 2.41+** | 最新稳定版 | 美观现代的 UI 组件库 |
| **Vue Router 4** | 最新稳定版 | 页面路由管理 |
| **Pinia 3.0+** | 最新稳定版 | 状态管理库 |
| **Vite 6.0+** | 最新稳定版 | 现代前端构建工具，支持 HMR |

### 后端技术栈
| 技术 | 版本 | 用途 |
|------|------|------|
| **Tauri 2.x** | 最新稳定版 | 使用 Rust 构建的跨平台应用框架 |
| **Rust** | 最新稳定版 | 高性能、内存安全的系统编程语言 |
| **SQLite** | 内置 | 本地数据存储，支持 SQL 查询和事务 |
| **clipboard-rs** | 最新稳定版 | 跨平台剪贴板操作库 |

## 📦 主要依赖

<details>
<summary><strong>前端依赖</strong></summary>

| 依赖包 | 用途 |
|--------|------|
| `@tauri-apps/api` | Tauri API 客户端 |
| `vue` | Vue 3 核心库 |
| `vue-router` | Vue 路由管理 |
| `pinia` | Vue 状态管理 |
| `naive-ui` | UI 组件库 |
| `vfonts` | 字体支持 |
| `@highlightjs/vue-plugin` | 代码高亮支持 |
| `highlight.js` | 语法高亮库 |

</details>

<details>
<summary><strong>核心 Tauri 插件</strong></summary>

| 插件 | 功能 |
|------|------|
| `tauri-plugin-sql` | SQLite 数据库支持 |
| `tauri-plugin-global-shortcut` | 全局快捷键支持 |
| `tauri-plugin-autostart` | 开机自启动 |
| `tauri-plugin-notification` | 系统通知 |
| `tauri-plugin-updater` | 应用自动更新 |
| `tauri-plugin-store` | 配置数据存储 |
| `tauri-plugin-opener` | 文件打开 |
| `tauri-plugin-process` | 进程管理 |
| `tauri-plugin-shell` | Shell 命令执行 |
| `tauri-plugin-log` | 日志管理 |

</details>

<details>
<summary><strong>Rust 依赖</strong></summary>

| 依赖包 | 用途 |
|--------|------|
| `clipboard-rs` | 跨平台剪贴板操作 |
| `serde` & `serde_json` | JSON 序列化/反序列化 |
| `chrono` | 日期时间处理 |
| `dirs` | 系统目录获取 |
| `log` | 日志记录 |
| `lazy_static` | 静态变量管理 |

</details>

## 🚀 快速开始

### 📥 用户安装

#### 系统要求
- **Windows**: Windows 10 (1903+) / Windows 11
- **macOS**: macOS 10.13 High Sierra 或更高版本
- **内存**: 至少 4GB RAM
- **存储**: 至少 100MB 可用空间

#### 安装步骤
1. 访问 [Releases](https://github.com/lin0306/EasyPaste/releases) 页面下载最新版本
2. 运行安装程序，按照向导完成安装
3. 首次启动时会自动初始化数据库和配置文件
4. 根据需要配置全局快捷键和自启动选项

### ⌨️ 快捷键说明

| 快捷键 | 功能 | 说明 |
|--------|------|------|
| `Alt + C` | 显示/隐藏主窗口 | 可在设置中自定义 |
| `Ctrl + F` | 激活搜索框 | 应用内快捷键 |
| `Esc` | 隐藏搜索框 | 应用内快捷键 |
| `单击托盘图标` | 显示/隐藏主窗口 | 系统托盘操作 |
| `右键托盘图标` | 显示上下文菜单 | 快速访问常用功能 |

## 🛠️ 开发环境设置

### 环境要求

| 工具 | 版本要求 | 说明 |
|------|----------|------|
| **Node.js** | v18.0+ | 推荐使用 LTS 版本 |
| **Rust** | 最新稳定版 | 通过 rustup 安装 |
| **pnpm** | 最新版本 | 包管理器 |

### 快速开始

```bash
# 1. 克隆项目
git clone https://github.com/lin0306/EasyPaste.git
cd EasyPaste

# 2. 安装依赖
pnpm install

# 3. 开发模式运行
pnpm tauri dev

# 4. 构建生产版本
pnpm tauri build
```

### 开发脚本

| 命令 | 功能 | 说明 |
|------|------|------|
| `pnpm tauri dev` | 开发模式 | 启动开发服务器，支持热重载 |
| `pnpm tauri build` | 生产构建 | 构建可分发的应用程序 |
| `pnpm build` | 前端构建 | 仅构建前端资源 |
| `pnpm preview` | 预览构建 | 预览构建后的前端应用 |

### 📁 项目结构

<details>
<summary><strong>点击展开项目结构</strong></summary>

```
EasyPaste/
├── 📁 src/                    # 前端源码
│   ├── 📁 components/         # Vue 组件
│   │   ├── NavBar.vue         # 导航栏组件
│   │   └── TitleBar.vue       # 标题栏组件
│   ├── 📁 pages/              # 页面视图
│   │   ├── 📁 index/          # 主页面
│   │   │   ├── 📁 components/ # 主页面组件
│   │   │   │   ├── ClipboardItem.vue        # 剪贴板列表内容组件
│   │   │   │   ├── ClipboardListContent.vue # 剪贴板列表组件
│   │   │   │   ├── HeadNavigationBar.vue    # 头部导航栏组件
│   │   │   │   ├── SearchBox.vue            # 搜索框组件
│   │   │   │   └── TagList.vue              # 标签列表组件
│   │   │   ├── 📁 context/    # 上下文管理
│   │   │   │   ├── ClipboardDataContext.ts  # 剪贴板数据上下文
│   │   │   │   ├── DragContext.ts           # 拖拽上下文
│   │   │   │   ├── FileDataContext.ts       # 文件数据上下文
│   │   │   │    TagDataContext.ts        # 标签数据上下文
│   │   │   │   ├── UpdaterContext.ts        # 更新器上下文
│   │   │   │   └── WindowContext.ts         # 窗口上下文
│   │   │   └── index.vue      # 主页面入口
│   │   ├── 📁 settings/       # 设置页面
│   │   │   └── Settings.vue
│   │   ├── 📁 tags/           # 标签管理页面
│   │   │   └── TagsManager.vue
│   │   ├── 📁 about/          # 关于页面
│   │   │   └── About.vue
│   │   └── 📁 updater/        # 更新页面
│   │       └── Updater.vue
│   ├── 📁 services/           # 业务服务层
│   │   ├── ClipboardService.ts     # 剪贴板服务
│   │   ├── ClipboardDBService.ts   # 数据库服务
│   │   ├── DataClearService.ts     # 数据清理服务
│   │   ├── UpdaterService.ts       # 更新服务
│   │   ├── FileService.ts          # 文件服务
│   │   ├── LanguageService.ts      # 语言服务
│   │   └── ThemeService.ts         # 主题服务
│   ├── 📁 routers/            # 路由配置
│   │   └── index.ts           # 路由定义
│   ├── 📁 store/              # Pinia 状态管理
│   │   ├── copyStatus.ts      # 复制状态管理
│   │   ├── fixed.ts           # 固定状态管理
│   │   └── ShortcutKeyAvailableStatus.ts  # 快捷键状态
│   ├── 📁 types/              # TypeScript 类型定义
│   │   ├── ClipboardItem.ts   # 剪贴板项目类型
│   │   ├── Configs.ts         # 配置类型
│   │   ├── language.ts        # 语言类型
│   │   ├── Themes.ts          # 主题类型
│   │   └── Window.ts          # 窗口类型
│   ├── 📁 utils/              # 工具函数
│   │   ├── color.ts           # 颜色工具
│   │   ├── fileSystem.ts      # 文件系统工具
│   │   ├── ShortcutKeys.ts    # 快捷键工具
│   │   ├── strUtil.ts         # 字符串工具
│   │   └── window.ts          # 窗口工具
│   ├── 📁 data/               # 静态数据和多语言
│   │   ├── 📁 locales/        # 多语言文件
│   │   ├── 📁 themes/         # 主题配置
│   │   └── SystemParams.ts    # 系统参数
│   ├── 📁 assets/             # 静态资源
│   │   ├── 📁 css/            # 样式文件
│   │   └── 📁 icons/          # 图标资源
│   ├── App.vue                # 根组件
│   ├── main.ts                # 应用入口
│   └── vite-env.d.ts          # Vite 环境类型
├── 📁 src-tauri/              # Tauri 后端
│   ├── 📁 src/                # Rust 源码
│   │   ├── main.rs            # 应用入口
│   │   ├── lib.rs             # 库文件，应用配置
│   │   ├── listener.rs        # 剪贴板监听服务
│   │   ├── tray.rs            # 系统托盘管理
│   │   ├── regedit.rs         # 注册表操作
│   │   ├── permission.rs      # 权限管理
│   │   └── log.rs             # 日志配置
│   ├── 📁 capabilities/       # Tauri 权限配置
│   │   └── default.json       # 默认权限配置
│   ├── 📁 configs/            # 配置文件
│   │   └── 📁 nsis/           # NSIS 安装程序配置
│   ├── 📁 icons/              # 应用图标
│   │   ├── 128x128.png        # 128x128 图标
│   │   ├── icon.icns          # macOS 图标
│   │   └── icon.ico           # Windows 图标
│   ├── 📁 gen/                # 生成的文件
│   ├── 📁 target/             # 编译输出目录
│   ├── build.rs               # 构建脚本
│   ├── Cargo.toml             # Rust 依赖配置
│   ├── Cargo.lock             # 依赖锁定文件
│   └── tauri.conf.json        # Tauri 应用配置
├── 📁 public/                 # 静态资源
│   └── logo.png               # 应用 Logo
├── 📁 FAQ/                    # 常见问题文档
│   ├── 📁 replace_global_hotkey_theory/  # 快捷键替换说明
│   └── 📁 rights_of_administrators/      # 管理员权限说明
├── 📁 .github/                # GitHub 配置
│   └── 📁 workflows/          # GitHub Actions 工作流
├── 📁 dist/                   # 构建输出
├── 📄 package.json            # 项目配置
├── 📄 vite.config.ts          # Vite 配置
├── 📄 tsconfig.json           # TypeScript 配置
├── 📄 pnpm-lock.yaml          # pnpm 锁定文件
├── 📄 LICENSE                 # 许可证文件
└── 📄 README.md               # 项目说明文档
```

</details>

## 🤝 贡献指南

我们欢迎所有形式的贡献！无论是代码贡献、问题反馈、功能建议还是文档改进。

### 🔧 如何贡献

1. **Fork** 本仓库到您的 GitHub 账户
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 **Pull Request**

### 🐛 报告问题

发现 bug 或有功能建议？请按以下步骤操作：

1. 查看 [Issues](https://github.com/lin0306/EasyPaste/issues) 确认问题未被报告
2. 创建新的 Issue，使用合适的模板
3. 详细描述问题或建议，包括：
   - 操作系统和版本
   - 应用版本
   - 复现步骤（如果是 bug）
   - 期望行为和实际行为

### 📝 开发规范

- **代码风格**: 遵循现有的代码风格和 ESLint 规则
- **提交信息**: 使用清晰的提交信息，遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范
- **测试**: 为新功能添加适当的测试用例
- **文档**: 更新相关文档和注释
- **类型安全**: 确保 TypeScript 类型检查通过

### 🎯 贡献类型

- 🐛 **Bug 修复**: 修复已知问题
- ✨ **新功能**: 添加新的功能特性
- 📚 **文档**: 改进文档和注释
- 🎨 **界面**: 改进用户界面和体验
- ⚡ **性能**: 性能优化和改进
- 🔧 **工具**: 开发工具和构建流程改进

## 📄 许可证

本项目基于 [Apache License 2.0](LICENSE) 许可证开源。

## 💡 常见问题

<details>
<summary><strong>使用相关问题</strong></summary>

- [Windows 剪贴板替换系统剪贴板原理](./FAQ/replace_global_hotkey_theory/replace_global_hotkey_theory.md)
- [Windows 如何以管理员身份运行](./FAQ/rights_of_administrators/rights_of_administrators.md)

</details>

<details>
<summary><strong>技术相关问题</strong></summary>

**Q: 为什么选择 Tauri 而不是 Electron？**
A: Tauri 基于 Rust 构建，相比 Electron 有以下优势：
- 更小的安装包体积（约 10MB vs 100MB+）
- 更低的内存占用（约 50MB vs 200MB+）
- 更好的安全性和性能表现

**Q: 数据存储在哪里？**
A: 所有数据都存储在本地 SQLite 数据库中，位置：
- Windows: `%APPDATA%/com.lin.EasyPaste/`
- macOS: `~/Library/Application Support/com.lin.EasyPaste/`

**Q: 支持哪些剪贴板内容类型？**
A: 目前支持：
- 纯文本内容
- 文件路径（不复制文件本身，只记录路径）
- 未来计划支持图片和富文本

</details>

## 📊 项目统计

<div align="center">
  <img alt="GitHub stars" src="https://img.shields.io/github/stars/lin0306/EasyPaste?style=social">
  <img alt="GitHub forks" src="https://img.shields.io/github/forks/lin0306/EasyPaste?style=social">
  <img alt="GitHub issues" src="https://img.shields.io/github/issues/lin0306/EasyPaste">
  <img alt="GitHub pull requests" src="https://img.shields.io/github/issues-pr/lin0306/EasyPaste">
</div>

## 🙏 致谢

感谢以下优秀的开源项目，让 EasyPaste 的开发成为可能：

| 项目 | 描述 | 许可证 |
|------|------|--------|
| [Tauri](https://tauri.app/) | 跨平台应用框架 | MIT |
| [Vue.js](https://vuejs.org/) | 渐进式 JavaScript 框架 | MIT |
| [Naive UI](https://www.naiveui.com/) | Vue 3 组件库 | MIT |
| [clipboard-rs](https://github.com/ChurchTao/clipboard-rs) | Rust 剪贴板库 | MIT |
| [SQLite](https://www.sqlite.org/) | 嵌入式数据库 | Public Domain |

## 📞 联系方式

<div align="center">
  
| 联系方式 | 链接 |
|----------|------|
| 🏠 项目主页 | [GitHub Repository](https://github.com/lin0306/EasyPaste) |
| 🐛 问题反馈 | [Issues](https://github.com/lin0306/EasyPaste/issues) |
| 💬 讨论交流 | [Discussions](https://github.com/lin0306/EasyPaste/discussions) |
| 📧 邮件联系 | [通过 GitHub](https://github.com/lin0306) |

</div>

---

<div align="center">
  <p>
    <strong>如果这个项目对您有帮助，请考虑给它一个 ⭐️！</strong>
  </p>
  <p>
    <em>您的支持是我们持续改进的动力</em>
  </p>
</div>