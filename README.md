# EasyPaste - 高效剪贴板管理工具

<div align="center">
  <img src="./public/logo.png" width="120px" alt="EasyPaste Logo">

  <p>
    <strong>专注于提升工作效率的跨平台剪贴板管理工具</strong>
  </p>

  <p>

[![](https://img.shields.io/badge/GitHub%20version-v0.2.0-blue.svg?cacheSeconds=2592000)](https://github.com/lin0306/EasyPaste/releases/latest)
[![](https://img.shields.io/badge/Gitee%20version-v0.2.0-green.svg?cacheSeconds=2592000)](https://gitee.com/lin0306/EasyPaste/releases/latest)
[![](https://img.shields.io/badge/License-Apache--2.0-yellow.svg)](https://www.apache.org/licenses/LICENSE-2.0.html)
![](https://img.shields.io/badge/platform-Windows%20%7C%20macOS-lightgrey)

  </p>
</div>

---

> ⚠️ **项目状态**
>
> **当前版本**: v0.2.0 (测试版本)
>
> - ✅ **测试环境**: 已在 Windows 10/11 纯净版系统测试，核心功能稳定
> - 🔧 **质量保证**: 采用严格的代码规范和安全策略，持续改进中
> - 📖 **系统集成**: 如需完全替换 Windows 剪贴板，请打开程序设置，开启`替换全局热键`功能，功能实现逻辑请参考 [FAQ 文档](./doc/FAQ/replace_global_hotkey_theory/replace_global_hotkey_theory.md)
> - 💡 **反馈欢迎**: 由于是个人项目，可能部分边缘性测试场景没有覆盖到，欢迎提 Issue 和 PR

## 📖 项目简介

EasyPaste 是一个专注于提升工作效率的跨平台剪贴板管理工具，基于现代化的 **Tauri + Vue3 + TypeScript**
技术栈开发。通过智能化的剪贴板历史记录管理，为开发者、设计师、办公人员等用户提供简洁高效的复制粘贴体验，显著提升日常工作效率。

### 🎯 设计理念

- **高效优先**: 专注于核心功能，避免功能冗余，确保每个功能都能真正提升效率
- **隐私安全**: 所有数据本地存储，不依赖网络，保护用户隐私和数据安全，禁止其他程序捕捉，避免数据泄露
- **轻量稳定**: 基于 Rust 构建，内存占用小，运行稳定，不影响系统性能
- **用户友好**: 简洁直观的界面设计，支持多主题和个性化定制

## 📸 应用截图

<div align="center">
   <p><em>主界面 - 剪贴板历史记录</em></p>
      <img src="doc/images/main-screenshot.png" width="300px" alt="主界面截图"/>
</div>

### ✨ 核心特性

| 特性              | 描述                               | 性能指标                           |
| ----------------- | ---------------------------------- | ---------------------------------- |
| 🚀 **高性能**     | 基于 Rust + Tauri 构建             | 启动时间 < 2秒，内存占用 < 50MB    |
| 🔒 **隐私安全**   | 所有数据本地存储，不上传云端       | 零网络依赖，完全离线运行           |
| 📄 **文件安全**   | 不实际操作任何文件，只保存文件路径 | 保证文件原始性和完整性             |
| 🎨 **现代化界面** | 基于 Vue3 + Naive UI               | 支持多主题，响应式设计             |
| 🌍 **跨平台支持** | 支持主流操作系统                   | Windows 10/11，macOS 10.13+        |
| 📦 **轻量级**     | 安装包小巧，资源占用低             | 后台 CPU 占用 < 1%                 |
| 🔧 **开发友好**   | 热重载、自动导入、代码分割         | 开发体验优化，构建产物优化         |
| 🎯 **智能优化**   | 自动代码分割、资源压缩             | 生产环境移除 console，gzip 压缩    |
| 👁️ **文件预览**   | 支持多种文件类型预览               | 图片、视频、音频、文件夹、压缩包等 |

## 🚀 主要功能

### 📋 剪贴板管理

- **自动监控剪贴板**: 实时捕获并保存剪贴板中的文本和文件内容
- **智能去重**: 自动识别重复内容，更新时间戳而非创建新记录
- **历史记录管理**: 按时间顺序保存剪贴板历史，支持置顶重要内容
- **分页加载**: 支持大量历史记录的高效分页显示，默认保存 2000 条
- **多类型支持**: 完整支持文本、文件的复制粘贴操作
- **智能分类**: 可自动根据复制的文本，判断文本是否为代码，并以代码格式展示
- **文件类型识别**: 根据文件后缀显示不同图标，方便快速区分文件类型
- **文件状态监控**: 定时检查文件是否存在，避免文件被删除后仍显示可用状态
- **智能定位**: 双击复制内容后，自动跳转到内容最新位置，避免复制后找不到内容
- **文件预览功能**: 支持图片、视频、音频、文件夹、压缩包等多种文件类型的预览

### 🏷️ 标签与分类

- **自定义标签**: 为剪贴板内容添加自定义标签，便于分类管理
- **颜色标识**: 支持为标签设置不同颜色，视觉化分类
- **标签筛选**: 按标签快速筛选和查找相关内容
- **批量管理**: 支持批量添加、删除、修改标签（规划中）
- **智能建议**: 基于内容自动建议相关标签（规划中）

### 🔍 搜索与导航

- **实时搜索**: 支持内容关键词搜索，响应时间 < 100ms
- **模糊匹配**: 支持关键词匹配，可根据文本内容/文件路径进行匹配展示
- **多维筛选**: 支持内容、标签、类型组合筛选（已发布），按照类时间范围的组合筛选（规划中）
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
- **主题自定义（规划中）**：支持主题色、图标、字体颜色自定义

### 🔄 数据管理

- **自动更新**: 内置应用自动更新功能，签名验证确保安全
- **智能清理**: 支持按时间和数量自动清理历史数据
- **数据备份（规划中）**: 支持数据的备份和恢复
- **SQLite 存储**: 使用 SQLite 数据库，数据安全可靠
- **数据迁移**: 支持版本升级时的数据平滑迁移
- **性能优化**: 优化数据库查询，避免重复查询拖慢页面加载速度

## 🏗️ 技术架构

### 🎨 前端架构特性

- **组合式 API**: 使用 Vue 3 Composition API 提供更好的逻辑复用和类型推导
- **TypeScript 严格模式**: 启用所有严格类型检查，确保代码质量和运行时安全
- **自动导入**: 通过 `unplugin-auto-import` 自动导入 Vue API 和 Naive UI 组件
- **按需加载**: 组件和路由懒加载，优化首屏加载性能
- **代码分割**: 智能代码分割和 Tree Shaking，减小构建产物体积
- **热模块替换**: Vite HMR 支持，开发时实时更新无需刷新页面

### 🔧 后端架构特性

- **零成本抽象**: Rust 编译时优化，运行时性能接近 C/C++
- **内存安全**: 编译时内存安全检查，避免空指针和缓冲区溢出
- **并发安全**: Rust 所有权系统确保线程安全，避免数据竞争
- **跨平台兼容**: 统一 API 接口，自动处理平台差异
- **插件化架构**: 模块化的 Tauri 插件系统，按需加载功能

### 前端技术栈

| 技术             | 版本    | 用途                                     |
| ---------------- | ------- | ---------------------------------------- |
| **Vue 3**        | 3.5.13  | 使用组合式 API 构建响应式用户界面        |
| **TypeScript**   | 5.6.2   | 类型安全的 JavaScript 超集，启用严格模式 |
| **Naive UI**     | 2.41.0  | 基于 Vue 3 的现代化 UI 组件库            |
| **Vue Router**   | 4.x     | 官方路由管理器，支持嵌套路由和导航守卫   |
| **Pinia**        | 3.0.2   | Vue 3 官方状态管理库，替代 Vuex          |
| **Vite**         | 6.0.3   | 下一代前端构建工具，支持 HMR 和 ESM      |
| **Highlight.js** | 11.11.1 | 多语言代码语法高亮库                     |
| **Marked**       | 16.2.1  | 高性能 Markdown 解析器和编译器           |
| **FontAwesome**  | 7.2.0   | 图标字体库，提供丰富的矢量图标           |
| **Lodash-ES**    | 4.17.21 | JavaScript 实用工具库，ES 模块版本       |

### 后端技术栈

| 技术             | 版本    | 用途                               |
| ---------------- | ------- | ---------------------------------- |
| **Tauri**        | 2.x     | 基于 Rust 的跨平台桌面应用框架     |
| **Rust**         | 1.92.0+ | 系统级编程语言，内存安全且高性能   |
| **SQLite**       | 最新版  | 轻量级嵌入式关系数据库             |
| **clipboard-rs** | 0.3.2   | 跨平台剪贴板操作库                 |
| **serde**        | 1.x     | Rust 序列化/反序列化框架           |
| **chrono**       | 0.4.43  | Rust 日期时间处理库                |
| **dirs**         | 6.0.0   | 跨平台系统目录获取库               |
| **lazy_static**  | 1.5.0   | Rust 静态变量延迟初始化            |
| **reqwest**      | 0.12.28 | Rust HTTP 客户端库                 |
| **winreg**       | 0.55.0  | Windows 注册表操作库（仅 Windows） |

## 📦 主要依赖

<details>
<summary><strong>核心前端依赖</strong></summary>

| 依赖包            | 版本    | 用途                  |
| ----------------- | ------- | --------------------- |
| `@tauri-apps/api` | ^2.9.1  | Tauri 前端 API 客户端 |
| `vue`             | ^3.5.13 | Vue 3 响应式框架核心  |
| `vue-router`      | 4       | Vue 官方路由管理器    |
| `pinia`           | ^3.0.2  | Vue 3 状态管理库      |
| `naive-ui`        | ^2.41.0 | Vue 3 UI 组件库       |
| `typescript`      | ~5.6.2  | TypeScript 编译器     |
| `vite`            | ^6.0.3  | 现代前端构建工具      |
| `lodash-es`       | ^4.17.21| JavaScript 实用工具库 |

</details>

<details>
<summary><strong>文件预览相关依赖</strong></summary>

| 依赖包                    | 版本     | 用途               |
| ------------------------- | -------- | ------------------ |
| `@zip.js/zip.js`          | ^2.8.2   | ZIP 压缩文件处理   |
| `plyr`                    | ^3.8.3   | 现代化视频播放器   |
| `v-viewer`                | ^3.0.22  | 图片查看和缩放组件 |
| `wavesurfer.js`           | ^7.10.1  | 音频波形可视化     |
| `highlight.js`            | ^11.11.1 | 多语言语法高亮     |
| `marked`                  | ^16.2.1  | Markdown 解析渲染  |

</details>

<details>
<summary><strong>图标和 UI 增强依赖</strong></summary>

| 依赖包                           | 版本    | 用途                    |
| -------------------------------- | ------- | ----------------------- |
| `@fortawesome/fontawesome-svg-core` | ^7.2.0  | FontAwesome 核心库      |
| `@fortawesome/free-solid-svg-icons` | ^7.2.0  | FontAwesome 实心图标    |
| `@fortawesome/free-regular-svg-icons` | ^7.2.0  | FontAwesome 常规图标    |
| `@fortawesome/free-brands-svg-icons` | ^7.2.0  | FontAwesome 品牌图标    |
| `@fortawesome/vue-fontawesome`   | ^3.1.3  | FontAwesome Vue 组件    |

</details>

<details>
<summary><strong>开发工具依赖</strong></summary>

| 依赖包                     | 版本    | 用途                    |
| -------------------------- | ------- | ----------------------- |
| `@vitejs/plugin-vue`       | ^5.2.1  | Vite Vue 单文件组件支持 |
| `unplugin-auto-import`     | ^20.0.0 | 自动导入 API 和组件     |
| `unplugin-vue-components`  | ^29.0.0 | 按需自动注册组件        |
| `rollup-plugin-visualizer` | ^6.0.3  | 构建产物分析工具        |
| `vue-tsc`                  | ^2.1.10 | Vue TypeScript 类型检查 |
| `vfonts`                   | ^0.0.3  | Web 字体加载工具        |
| `eslint`                   | ^10.0.3 | JavaScript 代码检查工具 |
| `prettier`                 | ^3.8.1  | 代码格式化工具          |

</details>

<details>
<summary><strong>Tauri 核心插件</strong></summary>

| 插件                             | 版本   | 功能描述              |
| -------------------------------- | ------ | --------------------- |
| `tauri-plugin-sql`               | ^2.3.1 | SQLite 数据库操作支持 |
| `tauri-plugin-global-shortcut`   | ~2.3.1 | 全局快捷键注册和监听  |
| `tauri-plugin-autostart`         | ~2.5.1 | 系统开机自启动管理    |
| `tauri-plugin-notification`      | ~2.3.3 | 系统原生通知服务      |
| `tauri-plugin-updater`           | ~2.9.0 | 应用自动更新机制      |
| `tauri-plugin-store`             | ~2.4.2 | 持久化配置数据存储    |
| `tauri-plugin-opener`            | ^2.5.3 | 系统默认程序打开文件  |
| `tauri-plugin-process`           | ~2.3.1 | 应用进程生命周期管理  |
| `tauri-plugin-shell`             | ~2.3.4 | Shell 命令执行接口    |
| `tauri-plugin-log`               | ~2.8.0 | 结构化日志记录系统    |
| `tauri-plugin-clipboard-manager` | ~2.3.2 | 剪贴板内容管理        |
| `tauri-plugin-fs`                | ~2.4.5 | 文件系统安全操作      |
| `tauri-plugin-window-state`      | ~2.4.1 | 窗口状态持久化        |
| `tauri-plugin-os`                | ~2.3.2 | 操作系统信息获取      |
| `tauri-plugin-dialog`            | ~2.6.0 | 系统对话框接口        |
| `tauri-plugin-http`              | ~2.5.6 | HTTP 请求支持         |

</details>

<details>
<summary><strong>Rust 核心依赖</strong></summary>

| 依赖包         | 版本    | 用途描述                            |
| -------------- | ------- | ----------------------------------- |
| `tauri`        | 2.x     | Tauri 核心框架，支持托盘和 PNG 图像 |
| `clipboard-rs` | 0.3.2   | 跨平台剪贴板内容读写操作            |
| `serde`        | 1.x     | Rust 序列化/反序列化框架            |
| `serde_json`   | 1.x     | JSON 格式数据处理                   |
| `chrono`       | 0.4     | 日期时间解析和格式化                |
| `dirs`         | 6.0.0   | 跨平台系统目录路径获取              |
| `log`          | 0.4     | 结构化日志记录接口                  |
| `lazy_static`  | 1.5     | 编译时静态变量初始化                |
| `reqwest`      | 0.12.28 | HTTP 客户端库，用于网络请求         |

</details>

<details>
<summary><strong>平台特定依赖</strong></summary>

| 依赖包   | 版本   | 平台    | 用途描述               |
| -------- | ------ | ------- | ---------------------- |
| `winreg` | 0.55.0 | Windows | Windows 注册表读写操作 |

</details>

<details>
<summary><strong>文件处理依赖</strong></summary>

| 依赖包   | 版本   | 用途描述              |
| -------- | ------ | --------------------- |
| `unrar`  | 0.5.8  | RAR 压缩文件解压缩    |
| `tar`    | 0.4.44 | TAR 归档文件处理      |
| `flate2` | 1.1.2  | GZIP/DEFLATE 压缩算法 |

</details>

<details>
<summary><strong>构建工具依赖</strong></summary>

| 依赖包        | 版本 | 用途描述               |
| ------------- | ---- | ---------------------- |
| `tauri-build` | 2.x  | Tauri 应用构建脚本支持 |

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

| 快捷键         | 功能            | 说明             |
| -------------- | --------------- | ---------------- |
| `Alt + C`      | 显示/隐藏主窗口 | 可在设置中自定义 |
| `Ctrl + F`     | 激活搜索框      | 应用内快捷键     |
| `Esc`          | 隐藏搜索框      | 应用内快捷键     |
| `单击托盘图标` | 显示/隐藏主窗口 | 系统托盘操作     |
| `右键托盘图标` | 显示上下文菜单  | 快速访问常用功能 |

## 🛠️ 开发环境设置

### 环境要求

| 工具               | 说明                   |
| ------------------ | ---------------------- |
| **Node.js v18.0+** | 推荐使用 LTS 版本      |
| **Rust 1.92.0+**   | 通过 rustup 安装       |
| **pnpm 10.12.1+**  | 包管理器，项目指定版本 |
| **Tauri CLI ^2**   | Tauri 命令行工具       |

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

### 构建配置

项目支持多平台构建：

- **Windows**: 生成 NSIS 安装程序 (.exe)
- **macOS**: 生成 DMG 磁盘映像 (.dmg) 和 APP 包
- **自动更新**: 支持应用内自动更新，使用数字签名验证

构建产物包含：

- 安装程序（Windows: .exe, macOS: .dmg）
- 签名文件
- 更新清单文件 (latest.json)

### 开发脚本

| 命令               | 功能      | 说明                            |
| ------------------ | --------- | ------------------------------- |
| `pnpm dev`         | 前端开发  | 启动 Vite 开发服务器            |
| `pnpm tauri dev`   | 开发模式  | 启动 Tauri 开发模式，支持热重载 |
| `pnpm build`       | 前端构建  | 构建前端资源                    |
| `pnpm tauri build` | 生产构建  | 构建可分发的应用程序            |
| `pnpm preview`     | 预览构建  | 预览构建后的前端应用            |
| `pnpm tauri`       | Tauri CLI | 直接调用 Tauri 命令行工具       |
| `pnpm format`      | 代码格式化| 使用 Prettier 格式化代码        |
| `pnpm format:check`| 格式检查  | 检查代码格式是否符合规范        |

### 程序占用情况

> 暂时只在Windows中进行过测试，Mac具体占用情况暂时未知

| 进程名称       | CPU   | 内存       | 说明            |
| -------------- | ----- | ---------- | --------------- |
| EasyPaste.exe  | ~0.5% | ~5MB       | 主程序          |
| WebView2管理器 | ~0.1% | 80MB~100MB | Web页面渲染程序 |

### 📁 项目结构

<details>
<summary><strong>点击展开项目结构</strong></summary>

```
EasyPaste/
├── 📁 src/                    # 前端源码
│   ├── 📁 assets/             # 静态资源
│   │   ├── 📁 css/            # 样式文件
│   │   │   └── scrollbarGlobal.css  # 全局滚动条样式
│   │   ├── 📁 icons/          # 图标组件
│   │   │   └── UpdateIcon.vue # 更新图标组件
│   │   └── 📁 js/             # JavaScript 工具
│   │       └── registerIcon.ts # 图标注册工具
│   ├── 📁 components/         # Vue 组件
│   │   ├── 📁 composables/    # 组合式函数
│   │   │   └── AnimationComposable.ts # 动画组合函数
│   │   ├── ButtonGroup.vue    # 按钮组组件
│   │   ├── NavBar.vue         # 导航栏组件
│   │   └── TitleBar.vue       # 标题栏组件
│   ├── 📁 constants/          # 常量定义
│   │   ├── CopyStateConstant.ts    # 复制状态常量
│   │   ├── FileTypeConstatnts.ts   # 文件类型常量
│   │   ├── KeysConstants.ts        # 存储键常量
│   │   ├── PublicConstants.ts      # 公共常量
│   │   └── UserSettingsConstant.ts # 用户设置常量
│   ├── 📁 data/               # 静态数据和多语言
│   │   ├── 📁 locales/        # 多语言文件
│   │   │   ├── en.ts          # 英文语言包
│   │   │   └── zh.ts          # 中文语言包
│   │   ├── 📁 themes/         # 主题配置
│   │   │   ├── blue.ts        # 蓝色主题
│   │   │   ├── dark.ts        # 深色主题
│   │   │   ├── light.ts       # 浅色主题
│   │   │   └── pink.ts        # 粉色主题
│   │   └── SystemParams.ts    # 系统参数
│   ├── 📁 pages/              # 页面视图
│   │   ├── 📁 about/          # 关于页面
│   │   ├── 📁 list/           # 列表页面（主页面）
│   │   │   ├── 📁 components/ # 列表页面组件
│   │   │   │   ├── ClipboardFooter.vue      # 剪贴板底部组件
│   │   │   │   ├── ClipboardItem.vue        # 剪贴板项目组件
│   │   │   │   ├── ClipboardListContent.vue # 剪贴板列表内容
│   │   │   │   ├── ContextMenu.vue          # 右键菜单组件
│   │   │   │   ├── FilePreview.vue          # 文件预览组件
│   │   │   │   ├── HeadNavigationBar.vue    # 头部导航栏
│   │   │   │   ├── SearchBox.vue            # 搜索框组件
│   │   │   │   └── TagList.vue              # 标签列表组件
│   │   │   ├── 📁 composables/ # 列表页面组合函数
│   │   │   │   ├── ClipboardDataComposable.ts # 剪贴板数据管理
│   │   │   │   ├── DragComposable.ts          # 拖拽功能
│   │   │   │   ├── FileDataComposable.ts      # 文件数据管理
│   │   │   │   ├── PluginComposable.ts        # 插件功能
│   │   │   │   ├── TagDataComposable.ts       # 标签数据管理
│   │   │   │   ├── UpdaterComposable.ts       # 更新功能
│   │   │   │   └── WindowComposable.ts        # 窗口管理
│   │   │   ├── index.vue      # 列表主页面
│   │   │   └── ItemEditor.vue # 项目编辑器
│   │   ├── 📁 pluginStore/    # 插件商店页面
│   │   │   ├── 📁 components/ # 插件商店组件
│   │   │   │   ├── LocalList.vue    # 本地插件列表
│   │   │   │   ├── PluginDetail.vue # 插件详情
│   │   │   │   └── StoreList.vue    # 商店插件列表
│   │   │   ├── 📁 composables/ # 插件商店组合函数
│   │   │   │   └── PluginComponsables.ts # 插件管理功能
│   │   │   └── index.vue      # 插件商店主页面
│   │   ├── 📁 pluginView/     # 插件视图页面
│   │   │   └── index.vue      # 插件视图主页面
│   │   ├── 📁 preview/        # 预览页面
│   │   │   ├── 📁 components/ # 预览组件
│   │   │   │   ├── 📁 text/   # 文本预览组件
│   │   │   │   │   ├── MarkdownPreview.vue  # Markdown 预览
│   │   │   │   │   ├── PlainTextPreview.vue # 纯文本预览
│   │   │   │   │   ├── RTFPreview.vue       # RTF 预览
│   │   │   │   │   └── TextPreview.vue      # 文本预览
│   │   │   │   ├── AudioPreview.vue    # 音频预览
│   │   │   │   ├── CodePreview.vue     # 代码预览
│   │   │   │   ├── FolderPreview.vue   # 文件夹预览
│   │   │   │   ├── ImagePreview.vue    # 图片预览
│   │   │   │   ├── OfficePreview.vue   # Office 文档预览
│   │   │   │   ├── PackagePreview.vue  # 压缩包预览
│   │   │   │   └── VideoPreview.vue    # 视频预览
│   │   │   └── index.vue      # 预览主页面
│   │   ├── 📁 settings/       # 设置页面
│   │   │   ├── 📁 components/ # 设置组件
│   │   │   │   ├── GeneralSettings.vue     # 通用设置
│   │   │   │   ├── MainWindowSettings.vue  # 主窗口设置
│   │   │   │   ├── SettingsMenu.vue        # 设置菜单
│   │   │   │   ├── ShortcutSettings.vue    # 快捷键设置
│   │   │   │   ├── StorageSettings.vue     # 存储设置
│   │   │   │   ├── TagSettings.vue         # 标签设置
│   │   │   │   ├── ThemeSettings.vue       # 主题设置
│   │   │   │   └── UpdateSettings.vue      # 更新设置
│   │   │   ├── 📁 composables/ # 设置组合函数
│   │   │   │   └── SettingsDataComposable.ts # 设置数据管理
│   │   │   └── index.vue      # 设置主页面
│   │   ├── 📁 tags/           # 标签管理页面
│   │   │   ├── 📁 components/ # 标签组件
│   │   │   │   ├── TagForm.vue # 标签表单
│   │   │   │   └── TagList.vue # 标签列表
│   │   │   ├── 📁 composables/ # 标签组合函数
│   │   │   │   └── TagDataComposable.ts # 标签数据管理
│   │   │   └── index.vue      # 标签主页面
│   │   ├── 📁 themeEditor/    # 主题编辑器页面
│   │   │   ├── 📁 components/ # 主题编辑器组件
│   │   │   │   ├── BasicComponentPreview.vue # 基础组件预览
│   │   │   │   ├── ListPreview.vue           # 列表预览
│   │   │   │   ├── TextEditorPreview.vue     # 文本编辑器预览
│   │   │   │   ├── ThemeEditor.vue           # 主题编辑器
│   │   │   │   ├── ThemePreview.vue          # 主题预览
│   │   │   │   └── VideoPreview.vue          # 视频预览
│   │   │   ├── 📁 composables/ # 主题编辑器组合函数
│   │   │   │   └── ThemeEditorDataComposable.ts # 主题编辑器数据管理
│   │   │   └── index.vue      # 主题编辑器主页面
│   │   └── 📁 updater/        # 更新页面
│   │       └── Updater.vue    # 更新组件
│   ├── 📁 routers/            # 路由配置
│   ├── 📁 services/           # 业务服务层
│   │   ├── ClipboardDBService.ts   # 数据库服务
│   │   ├── ClipboardService.ts     # 剪贴板服务
│   │   ├── DataClearService.ts     # 数据清理服务
│   │   ├── FileService.ts          # 文件服务
│   │   ├── LanguageService.ts      # 语言服务
│   │   ├── PluginService.ts        # 插件服务
│   │   ├── ThemeService.ts         # 主题服务
│   │   ├── UpdaterService.ts       # 更新服务
│   │   └── WindowService.ts        # 窗口服务
│   ├── 📁 store/              # Pinia 状态管理
│   │   ├── CopyStatus.ts                   # 复制状态管理
│   │   ├── CustomThemeConfig.ts            # 自定义主题配置
│   │   ├── FirstRun.ts                     # 首次运行状态
│   │   ├── Fixed.ts                        # 固定状态管理
│   │   ├── Settings.ts                     # 设置状态管理
│   │   ├── ShortcutKeyAvailableStatus.ts   # 快捷键可用状态
│   │   └── ShortcutKeys.ts                 # 快捷键状态管理
│   ├── 📁 types/              # TypeScript 类型定义
│   │   ├── ButtonGroup.ts          # 按钮组类型
│   │   ├── ClipboardItem.d.ts      # 剪贴板项目类型
│   │   ├── Color.d.ts              # 颜色类型
│   │   ├── Configs.d.ts            # 配置类型
│   │   ├── ContextMenu.d.ts        # 右键菜单类型
│   │   ├── Language.d.ts           # 语言类型
│   │   ├── NavBarItem.d.ts         # 导航栏项目类型
│   │   ├── PackageInfo.d.ts        # 包信息类型
│   │   ├── PackageTreeOption.d.ts  # 包树选项类型
│   │   ├── Plugin.d.ts             # 插件类型
│   │   ├── Themes.d.ts             # 主题类型
│   │   ├── UpdaterInfo.d.ts        # 更新信息类型
│   │   └── Window.d.ts             # 窗口类型
│   ├── 📁 utils/              # 工具函数
│   │   ├── AudioUtil.ts           # 音频工具
│   │   ├── CodeUtil.ts            # 代码工具
│   │   ├── ColorUtil.ts           # 颜色工具
│   │   ├── DateUtil.ts            # 日期工具
│   │   ├── DomUtil.ts             # DOM 操作工具
│   │   ├── FileUtil.ts            # 文件系统工具
│   │   ├── ImageUtil.ts           # 图片工具
│   │   ├── LinkUtil.ts            # 链接工具
│   │   ├── MarkdownUtil.ts        # Markdown 工具
│   │   ├── OfficeUtil.ts          # Office 文档工具
│   │   ├── PackageUtil.ts         # 包管理工具
│   │   ├── ProgramUtil.ts         # 程序工具
│   │   ├── ShortcutKeysUtil.ts    # 快捷键工具
│   │   ├── TextUtil.ts            # 文本工具
│   │   ├── TreeUtil.ts            # 树形结构工具
│   │   └── VideoUtil.ts           # 视频工具
│   ├── App.vue                # 根组件
│   ├── main.ts                # 应用入口
│   └── vite-env.d.ts          # Vite 环境类型
├── 📁 src-tauri/              # Tauri 后端
│   ├── 📁 src/                # Rust 源码
│   │   ├── file.rs            # 文件操作
│   │   ├── lib.rs             # 库文件，应用配置
│   │   ├── listener.rs        # 剪贴板监听服务
│   │   ├── log.rs             # 日志配置
│   │   ├── main.rs            # 应用入口
│   │   ├── permission.rs      # 权限管理
│   │   ├── regedit.rs         # 注册表操作
│   │   ├── tray.rs            # 系统托盘管理
│   │   └── windows.rs         # 窗口管理
│   ├── 📁 capabilities/       # Tauri 权限配置
│   │   └── default.json       # 默认权限配置
│   ├── 📁 configs/            # 配置文件
│   │   └── 📁 nsis/           # NSIS 安装程序配置
│   │       └── hook.nsh       # NSIS 钩子脚本
│   ├── 📁 icons/              # 应用图标
│   │   ├── 128x128.png        # 128x128 图标
│   │   ├── 128x128@2x.png     # 256x356 高分辨率图标
│   │   ├── icon.icns          # macOS 图标
│   │   └── icon.ico           # Windows 图标
│   ├── build.rs               # 构建脚本
│   ├── Cargo.lock             # 依赖锁定文件
│   ├── Cargo.toml             # Rust 依赖配置
│   ├── tauri.conf.json        # Tauri 应用配置
│   ├── tauri.mac.conf.json    # macOS 特定配置
│   └── tauri.windows.conf.json # Windows 特定配置
├── 📁 doc/                    # 文档目录
│   ├── 📁 FAQ/                # 常见问题文档
│   │   ├── 📁 replace_global_hotkey_theory/  # 快捷键替换说明
│   │   └── 📁 rights_of_administrators/      # 管理员权限说明
│   ├── 📁 images/             # 文档图片
│   │   └── main-screenshot.png # 主界面截图
├── 📁 public/                 # 静态资源
│   ├── closedFolder.svg       # 关闭文件夹图标
│   ├── logo.png               # 应用 Logo
│   ├── logo.svg               # 应用 Logo SVG
│   ├── openedFolder.svg       # 打开文件夹图标
│   └── video.mp3              # 视频音频文件
├── 📁 .github/                # GitHub 配置
├── 📄 .gitignore              # Git 忽略文件
├── 📄 .prettierignore         # Prettier 忽略文件
├── 📄 index.html              # HTML 入口文件
├── 📄 latest.json             # 更新配置文件
├── 📄 LICENSE                 # 许可证文件
├── 📄 package.json            # 项目配置
├── 📄 pnpm-lock.yaml          # pnpm 锁定文件
├── 📄 pnpm-workspace.yaml     # pnpm 工作区配置
├── 📄 prettier.config.js      # Prettier 配置
├── 📄 README.md               # 项目说明文档
├── 📄 tsconfig.json           # TypeScript 配置
├── 📄 tsconfig.node.json      # Node.js TypeScript 配置
└── 📄 vite.config.ts          # Vite 配置
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
- **类型安全**: 确保 TypeScript 类型检查通过，启用严格模式

### 🛠️ 开发工具配置

项目集成了完整的现代化开发工具链：

#### 前端开发工具

- **自动导入**: `unplugin-auto-import` 自动导入 Vue Composition API 和 Naive UI 组件
- **组件自动注册**: `unplugin-vue-components` 按需自动注册和导入组件
- **类型检查**: Vue TypeScript 支持，包含 `.vue` 文件类型推导
- **代码高亮**: `highlight.js` 支持 190+ 编程语言语法高亮
- **构建分析**: `rollup-plugin-visualizer` 可视化分析构建产物和依赖关系
- **热模块替换**: Vite HMR 实时更新，支持状态保持
- **工作区管理**: pnpm workspace 配置，优化依赖管理和构建性能

#### 构建优化

- **代码分割**: 智能 chunk 分割，第三方库单独打包
- **资源优化**: 自动压缩 CSS/JS，支持 gzip 和 brotli 压缩
- **Tree Shaking**: 移除未使用代码，减小最终包体积
- **生产优化**: 自动移除 console 和 debugger 语句
- **构建分析**: 集成 rollup-plugin-visualizer，可视化分析构建产物
- **平台优化**: 针对不同平台优化构建目标（Windows: Chrome105, macOS/Linux: Safari15）

#### 类型安全

- **严格模式**: 启用 TypeScript 所有严格检查选项
- **类型定义**: 完整的类型定义文件，包含自定义类型
- **编译时检查**: 构建前进行完整的类型检查

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

- [Windows 剪贴板替换系统剪贴板原理](./doc/FAQ/replace_global_hotkey_theory/replace_global_hotkey_theory.md)
- [Windows 如何以管理员身份运行](./doc/FAQ/rights_of_administrators/rights_of_administrators.md)

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

- 纯文本内容（支持代码高亮显示）
- 文件路径（不复制文件本身，只记录路径）
- 多种文件类型预览：图片、视频、音频、Office文档、PDF、压缩包等

</details>

## 🙏 致谢

感谢以下优秀的开源项目和社区，让 EasyPaste 的开发成为可能：

### 🏗️ 核心框架与技术栈

| 项目                                          | 描述                           | 许可证         | 贡献                                 |
| --------------------------------------------- | ------------------------------ | -------------- | ------------------------------------ |
| [Tauri](https://tauri.app/)                   | 基于 Rust 的跨平台桌面应用框架 | MIT            | 提供了安全、高性能的桌面应用开发基础 |
| [Rust](https://www.rust-lang.org/)            | 系统级编程语言                 | MIT/Apache-2.0 | 保证了应用的内存安全和高性能         |
| [Vue.js](https://vuejs.org/)                  | 渐进式 JavaScript 框架         | MIT            | 提供了响应式的用户界面开发能力       |
| [TypeScript](https://www.typescriptlang.org/) | JavaScript 的类型安全超集      | Apache-2.0     | 提供了类型安全和更好的开发体验       |

### 🎨 UI 组件与样式

| 项目                                         | 描述               | 许可证 | 贡献                           |
| -------------------------------------------- | ------------------ | ------ | ------------------------------ |
| [Naive UI](https://www.naiveui.com/)         | Vue 3 现代化组件库 | MIT    | 提供了美观且功能完整的 UI 组件 |
| [Vfonts](https://github.com/07akioni/vfonts) | Web 字体加载工具   | MIT    | 提供了优雅的字体加载解决方案   |

### 🔧 开发工具与构建

| 项目                                                                        | 描述                  | 许可证 | 贡献                             |
| --------------------------------------------------------------------------- | --------------------- | ------ | -------------------------------- |
| [Vite](https://vitejs.dev/)                                                 | 下一代前端构建工具    | MIT    | 提供了快速的开发服务器和构建优化 |
| [Pinia](https://pinia.vuejs.org/)                                           | Vue 3 状态管理库      | MIT    | 提供了简洁的状态管理解决方案     |
| [Vue Router](https://router.vuejs.org/)                                     | Vue.js 官方路由管理器 | MIT    | 提供了强大的路由管理功能         |
| [unplugin-auto-import](https://github.com/antfu/unplugin-auto-import)       | 自动导入插件          | MIT    | 简化了开发过程中的导入操作       |
| [unplugin-vue-components](https://github.com/antfu/unplugin-vue-components) | Vue 组件自动注册      | MIT    | 实现了组件的按需自动注册         |

### 📄 文件处理与预览

| 项目                                                       | 描述             | 许可证         | 贡献                             |
| ---------------------------------------------------------- | ---------------- | -------------- | -------------------------------- |
| [highlight.js](https://highlightjs.org/)                   | 语法高亮库       | BSD-3-Clause   | 提供了多语言代码语法高亮功能     |
| [Marked](https://marked.js.org/)                           | Markdown 解析器  | MIT            | 实现了 Markdown 文档的解析和渲染 |
| [Plyr](https://plyr.io/)                                   | 现代化媒体播放器 | MIT            | 提供了优雅的视频播放体验         |
| [v-viewer](https://github.com/mirari/v-viewer)             | 图片查看组件     | MIT            | 实现了图片的缩放和查看功能       |
| [WaveSurfer.js](https://wavesurfer-js.org/)                | 音频波形可视化   | BSD-3-Clause   | 提供了音频文件的波形显示         |
| [@zip.js/zip.js](https://gildas-lormeau.github.io/zip.js/) | ZIP 文件处理库   | BSD-3-Clause   | 支持压缩文件的解析和预览         |
| [unrar](https://github.com/muja/unrar.rs)                  | RAR 文件解压库   | MIT            | 支持 RAR 压缩文件的处理          |
| [tar](https://github.com/alexcrichton/tar-rs)              | TAR 归档文件处理 | MIT/Apache-2.0 | 处理 TAR 格式的归档文件          |
| [flate2](https://github.com/rust-lang/flate2-rs)           | 压缩算法库       | MIT/Apache-2.0 | 提供 GZIP/DEFLATE 压缩支持       |

### 🗄️ 数据存储与系统集成

| 项目                                                      | 描述               | 许可证         | 贡献                         |
| --------------------------------------------------------- | ------------------ | -------------- | ---------------------------- |
| [SQLite](https://www.sqlite.org/)                         | 轻量级嵌入式数据库 | Public Domain  | 提供了可靠的本地数据存储方案 |
| [clipboard-rs](https://github.com/ChurchTao/clipboard-rs) | Rust 剪贴板操作库  | MIT            | 实现了跨平台的剪贴板内容读写 |
| [serde](https://serde.rs/)                                | Rust 序列化框架    | MIT/Apache-2.0 | 提供了高效的数据序列化能力   |
| [chrono](https://github.com/chronotope/chrono)            | Rust 日期时间库    | MIT/Apache-2.0 | 处理日期时间的解析和格式化   |
| [dirs](https://github.com/dirs-dev/dirs-rs)               | 系统目录获取库     | MIT/Apache-2.0 | 跨平台获取系统目录路径       |

### 🪟 平台特定功能

| 项目                                               | 描述               | 许可证 | 贡献                            |
| -------------------------------------------------- | ------------------ | ------ | ------------------------------- |
| [winreg-rs](https://github.com/gentoo90/winreg-rs) | Windows 注册表操作 | MIT    | 实现了 Windows 注册表的读写功能 |

### 🌟 特别感谢

- **Rust 社区**: 为提供安全、高性能的系统编程语言和丰富的生态系统
- **Vue.js 社区**: 为创建优雅的响应式前端框架和完善的工具链
- **Tauri 团队**: 为开发者提供了现代化的桌面应用开发解决方案
- **所有开源贡献者**: 感谢每一位为开源项目贡献代码、文档和想法的开发者

## 📞 联系方式

| 联系方式    | 链接                                                      |
| ----------- | --------------------------------------------------------- |
| 🏠 项目主页 | [GitHub Repository](https://github.com/lin0306/EasyPaste) |
| 🐛 问题反馈 | [Issues](https://github.com/lin0306/EasyPaste/issues)     |
| 💬 讨论交流 | [暂未开通](https://github.com/lin0306/EasyPaste)          |
| 📧 邮件联系 | [通过 GitHub](https://github.com/lin0306)                 |

---

<div align="center">
  <p>
    <strong>如果这个项目对您有帮助，请考虑给它一个 ⭐️！</strong>
  </p>
  <p>
    <em>您的支持是我们持续改进的动力</em>
  </p>
  <p>
    <strong>仓库地址：</strong> <a href="https://github.com/lin0306/EasyPaste">GitHub</a> | <a href="https://gitee.com/lin0306/EasyPaste">Gitee</a>
  </p>
</div>
