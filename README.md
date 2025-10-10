# EasyPaste - 高效剪贴板管理工具

<div align="center">
  <img src="./public/logo.png" width="120px" alt="EasyPaste Logo">
  
  <p>
    <strong>专注于提升工作效率的跨平台剪贴板管理工具</strong>
  </p>
  
  <p>

[![](https://img.shields.io/badge/GitHub%20version-v0.1.7--beta-blue.svg?cacheSeconds=2592000)](https://github.com/lin0306/EasyPaste/releases/latest)
[![](https://img.shields.io/badge/Gitee%20version-v0.1.7--beta-green.svg?cacheSeconds=2592000)](https://gitee.com/lin0306/easy-paste/releases/latest)
[![](https://img.shields.io/badge/License-Apache--2.0-yellow.svg)](https://www.apache.org/licenses/LICENSE-2.0.html)
![](https://img.shields.io/badge/platform-Windows%20%7C%20macOS-lightgrey)

  </p>
</div>

---

> ⚠️ **项目状态**
> 
> **当前版本**: v0.1.7-beta (开发测试阶段)
> 
> - ✅ **测试环境**: 已在 Windows 10/11 纯净版系统测试，核心功能稳定
> - 🔧 **质量保证**: 采用严格的代码规范和安全策略，持续改进中
> - 📖 **系统集成**: 如需完全替换 Windows 剪贴板，请打开程序设置，开启`替换全局热键`功能，功能实现逻辑请参考 [FAQ 文档](./FAQ/replace_global_hotkey_theory/replace_global_hotkey_theory.md)
> - 💡 **反馈欢迎**: 由于是个人项目，可能部分边缘性测试场景没有覆盖到，欢迎提 Issue 和 PR


## 📖 项目简介

EasyPaste 是一个专注于提升工作效率的跨平台剪贴板管理工具，基于现代化的 **Tauri + Vue3 + TypeScript** 技术栈开发。通过智能化的剪贴板历史记录管理，为开发者、设计师、办公人员等用户提供简洁高效的复制粘贴体验，显著提升日常工作效率。

### 🎯 设计理念

- **高效优先**: 专注于核心功能，避免功能冗余，确保每个功能都能真正提升效率
- **隐私安全**: 所有数据本地存储，不依赖网络，保护用户隐私和数据安全，禁止其他程序捕捉，避免数据泄露
- **轻量稳定**: 基于 Rust 构建，内存占用小，运行稳定，不影响系统性能
- **用户友好**: 简洁直观的界面设计，支持多主题和个性化定制

## 📸 应用截图

<div align="center">
   <p><em>主界面 - 剪贴板历史记录</em></p>
      <img src="./public/main-screenshot.png" width="300px" alt="主界面截图"/>
</div>

### ✨ 核心特性

| 特性 | 描述 | 性能指标 |
|------|------|----------|
| 🚀 **高性能** | 基于 Rust + Tauri 构建 | 启动时间 < 2秒，内存占用 < 50MB |
| 🔒 **隐私安全** | 所有数据本地存储，不上传云端 | 零网络依赖，完全离线运行 |
| 📄 **文件安全** | 不实际操作任何文件，只保存文件路径 | 保证文件原始性和完整性 |
| 🎨 **现代化界面** | 基于 Vue3 + Naive UI | 支持多主题，响应式设计 |
| 🌍 **跨平台支持** | 支持主流操作系统 | Windows 10/11，macOS 10.13+ |
| 📦 **轻量级** | 安装包小巧，资源占用低 | 后台 CPU 占用 < 1% |
| 🔧 **开发友好** | 热重载、自动导入、代码分割 | 开发体验优化，构建产物优化 |
| 🎯 **智能优化** | 自动代码分割、资源压缩 | 生产环境移除 console，gzip 压缩 |
| 👁️ **文件预览** | 支持多种文件类型预览 | 图片、视频、音频、Office文档、PDF等 |

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
- **文件预览功能**: 支持图片、视频、音频、Office文档、PDF、压缩包等多种文件类型的预览

### 🏷️ 标签与分类
- **自定义标签**: 为剪贴板内容添加自定义标签，便于分类管理
- **颜色标识**: 支持为标签设置不同颜色，视觉化分类
- **标签筛选**: 按标签快速筛选和查找相关内容
- **批量管理**: 支持批量添加、删除、修改标签（规划中）
- **智能建议**: 基于内容自动建议相关标签（规划中）

### 🔍 搜索与导航
- **实时搜索**: 支持内容关键词搜索，响应时间 < 100ms
- **模糊匹配**: 支持关键词匹配，可根据文本内容/文件路径进行匹配展示
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
| 技术 | 版本 | 用途 |
|------|------|------|
| **Vue 3** | 3.5.13 | 使用组合式 API 构建响应式用户界面 |
| **TypeScript** | 5.6.2 | 类型安全的 JavaScript 超集，启用严格模式 |
| **Naive UI** | 2.41.0 | 基于 Vue 3 的现代化 UI 组件库 |
| **Vue Router** | 4.x | 官方路由管理器，支持嵌套路由和导航守卫 |
| **Pinia** | 3.0.2 | Vue 3 官方状态管理库，替代 Vuex |
| **Vite** | 6.0.3 | 下一代前端构建工具，支持 HMR 和 ESM |
| **Highlight.js** | 11.11.1 | 多语言代码语法高亮库 |
| **Marked** | 16.2.1 | 高性能 Markdown 解析器和编译器 |
| **Vue Demi** | 0.14.10 | Vue 2/3 兼容性工具库 |

### 后端技术栈
| 技术 | 版本 | 用途 |
|------|------|------|
| **Tauri** | 2.x | 基于 Rust 的跨平台桌面应用框架 |
| **Rust** | 1.86.0+ | 系统级编程语言，内存安全且高性能 |
| **SQLite** | 最新版 | 轻量级嵌入式关系数据库 |
| **clipboard-rs** | 0.3.0 | 跨平台剪贴板操作库 |
| **serde** | 1.x | Rust 序列化/反序列化框架 |
| **chrono** | 0.4.19 | Rust 日期时间处理库 |
| **dirs** | 6.0.0 | 跨平台系统目录获取库 |
| **lazy_static** | 1.5.0 | Rust 静态变量延迟初始化 |
| **winreg** | 0.55.0 | Windows 注册表操作库（仅 Windows） |

## 📦 主要依赖

<details>
<summary><strong>核心前端依赖</strong></summary>

| 依赖包 | 版本 | 用途 |
|--------|------|------|
| `@tauri-apps/api` | ^2 | Tauri 前端 API 客户端 |
| `vue` | ^3.5.13 | Vue 3 响应式框架核心 |
| `vue-router` | 4 | Vue 官方路由管理器 |
| `pinia` | ^3.0.2 | Vue 3 状态管理库 |
| `naive-ui` | ^2.41.0 | Vue 3 UI 组件库 |
| `typescript` | ~5.6.2 | TypeScript 编译器 |
| `vite` | ^6.0.3 | 现代前端构建工具 |

</details>

<details>
<summary><strong>文件预览相关依赖</strong></summary>

| 依赖包 | 版本 | 用途 |
|--------|------|------|
| `@vue-office/docx` | ^1.6.3 | Word 文档在线预览 |
| `@vue-office/excel` | ^1.7.14 | Excel 表格在线预览 |
| `@zip.js/zip.js` | ^2.8.2 | ZIP 压缩文件处理 |
| `plyr` | ^3.8.3 | 现代化视频播放器 |
| `v-viewer` | ^3.0.22 | 图片查看和缩放组件 |
| `wavesurfer.js` | ^7.10.1 | 音频波形可视化 |
| `@highlightjs/vue-plugin` | ^2.1.0 | Vue 代码高亮插件 |
| `highlight.js` | ^11.11.1 | 多语言语法高亮 |
| `marked` | ^16.2.1 | Markdown 解析渲染 |

</details>

<details>
<summary><strong>开发工具依赖</strong></summary>

| 依赖包 | 版本 | 用途 |
|--------|------|------|
| `@vitejs/plugin-vue` | ^5.2.1 | Vite Vue 单文件组件支持 |
| `unplugin-auto-import` | ^20.0.0 | 自动导入 API 和组件 |
| `unplugin-vue-components` | ^29.0.0 | 按需自动注册组件 |
| `rollup-plugin-visualizer` | ^6.0.3 | 构建产物分析工具 |
| `vue-tsc` | ^2.1.10 | Vue TypeScript 类型检查 |
| `vfonts` | ^0.0.3 | Web 字体加载工具 |

</details>

<details>
<summmary><strong>Tauri 核心插件</strong></sumary>

| 插件 | 版本 | 功能描述 |
|------|------|----------|
| `tauri-plugin-sql` | ^2.2.0 | SQLite 数据库操作支持 |
| `tauri-plugin-global-shortcut` | ~2 | 全局快捷键注册和监听 |
| `tauri-plugin-autostart` | ~2 | 系统开机自启动管理 |
| `tauri-plugin-notification` | ~2.3.0 | 系统原生通知服务 |
| `tauri-plugin-updater` | ~2 | 应用自动更新机制 |
| `tauri-plugin-store` | ~2 | 持久化配置数据存储 |
| `tauri-plugin-opener` | ^2 | 系统默认程序打开文件 |
| `tauri-plugin-process` | ~2 | 应用进程生命周期管理 |
| `tauri-plugin-shell` | ~2 | Shell 命令执行接口 |
| `tauri-plugin-log` | ~2 | 结构化日志记录系统 |
| `tauri-plugin-clipboard-manager` | ~2 | 剪贴板内容管理 |
| `tauri-plugin-fs` | ~2 | 文件系统安全操作 |
| `tauri-plugin-window-state` | ~2 | 窗口状态持久化 |

</details>

<details>
<summary><strong>Rust 核心依赖</strong></summary>

| 依赖包 | 版本 | 用途描述 |
|--------|------|----------|
| `tauri` | 2.x | Tauri 核心框架，支持托盘和 PNG 图像 |
| `clipboard-rs` | 0.3.0 | 跨平台剪贴板内容读写操作 |
| `serde` | 1.x | Rust 序列化/反序列化框架 |
| `serde_json` | 1.x | JSON 格式数据处理 |
| `chrono` | 0.4.19 | 日期时间解析和格式化 |
| `dirs` | 6.0.0 | 跨平台系统目录路径获取 |
| `log` | 0.4 | 结构化日志记录接口 |
| `lazy_static` | 1.5.0 | 编译时静态变量初始化 |

</details>

<details>
<summary><strong>平台特定依赖</strong></summary>

| 依赖包 | 版本 | 平台 | 用途描述 |
|--------|------|------|----------|
| `winreg` | 0.55.0 | Windows | Windows 注册表读写操作 |

</details>

<details>
<summary><strong>文件处理依赖</strong></summary>

| 依赖包 | 版本 | 用途描述 |
|--------|------|----------|
| `unrar` | 0.5.8 | RAR 压缩文件解压缩 |
| `tar` | 0.4.44 | TAR 归档文件处理 |
| `flate2` | 1.1.2 | GZIP/DEFLATE 压缩算法 |

</details>

<details>
<summary><strong>构建工具依赖</strong></summary>

| 依赖包 | 版本 | 用途描述 |
|--------|------|----------|
| `tauri-build` | 2.x | Tauri 应用构建脚本支持 |

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

| 工具                 | 说明 |
|--------------------|------|
| **Node.js v18.0+** | 推荐使用 LTS 版本 |
| **Rust 1.86.0+**   | 通过 rustup 安装 |
| **pnpm 10.12.1+**  | 包管理器，项目指定版本 |
| **Tauri CLI ^2**   | Tauri 命令行工具 |

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

| 命令 | 功能 | 说明 |
|------|------|------|
| `pnpm dev` | 前端开发 | 启动 Vite 开发服务器 |
| `pnpm tauri dev` | 开发模式 | 启动 Tauri 开发模式，支持热重载 |
| `pnpm build` | 前端构建 | 构建前端资源 |
| `pnpm tauri build` | 生产构建 | 构建可分发的应用程序 |
| `pnpm preview` | 预览构建 | 预览构建后的前端应用 |

### 📁 项目结构

<details>
<summary><strong>点击展开项目结构</strong></summary>

```
EasyPaste/
├── 📁 src/                    # 前端源码
│   ├── 📁 components/         # Vue 组件
│   │   ├── 📁 filePreview/    # 文件预览组件
│   │   ├── NavBar.vue         # 导航栏组件
│   │   └── TitleBar.vue       # 标题栏组件
│   ├── 📁 pages/               # 页面视图
│   │   ├── 📁 about/          # 关于页面
│   │   ├── 📁 icon/           # 图标页面
│   │   ├── 📁 list/           # 列表页面（主页面）
│   │   ├── 📁 preview/        # 预览页面
│   │   ├── 📁 settings/       # 设置页面
│   │   ├── 📁 tags/           # 标签管理页面
│   │   └── 📁 updater/        # 更新页面
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
│   │   ├── CopyStatus.ts      # 复制状态管理
│   │   ├── fixed.ts           # 固定状态管理
│   │   ├── FirstRun.ts        # 首次运行状态
│   │   ├── Settings.ts        # 设置状态管理
│   │   ├── ShortcutKeys.ts    # 快捷键状态管理
│   │   └── ShortcutKeyAvailableStatus.ts  # 快捷键可用状态
│   ├── 📁 types/              # TypeScript 类型定义
│   │   ├── ClipboardItem.d.ts   # 剪贴板项目类型
│   │   ├── Configs.d.ts         # 配置类型
│   │   ├── Language.d.ts        # 语言类型
│   │   ├── NavBarItem.d.ts      # 导航栏项目类型
│   │   ├── PackageInfo.d.ts     # 包信息类型
│   │   ├── PackageTreeOption.d.ts # 包树选项类型
│   │   ├── Themes.d.ts          # 主题类型
│   │   ├── UpdaterInfo.d.ts     # 更新信息类型
│   │   └── Window.d.ts          # 窗口类型
│   ├── 📁 utils/              # 工具函数
│   │   ├── AudioUtil.ts           # 音频工具
│   │   ├── CodeUtil.ts            # 代码工具
│   │   ├── ContrastColorUtil.ts   # 颜色对比工具
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
│   │   ├── VideoUtil.ts           # 视频工具
│   │   └── WindowUtil.ts          # 窗口工具
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
│   ├── 📁 constants/          # 常量定义
│   │   ├── CopyStateConstant.ts    # 复制状态常量
│   │   ├── FileTypeConstants.ts    # 文件类型常量
│   │   ├── PublicConstants.ts      # 公共常量
│   │   ├── StoreKeyConstants.ts    # 存储键常量
│   │   └── UserSettingsConstant.ts # 用户设置常量
│   ├── 📁 assets/             # 静态资源
│   │   ├── 📁 css/            # 样式文件
│   │   └── 📁 icons/          # 图标组件
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
│   │   ├── log.rs             # 日志配置
│   │   ├── file.rs            # 文件操作
│   │   └── windows.rs         # 窗口管理
│   ├── 📁 capabilities/       # Tauri 权限配置
│   │   └── default.json       # 默认权限配置
│   ├── 📁 configs/            # 配置文件
│   │   └── 📁 nsis/           # NSIS 安装程序配置
│   ├── 📁 icons/              # 应用图标
│   │   ├── 128x128.png        # 128x128 图标
│   │   ├── icon.icns          # macOS 图标
│   │   └── icon.ico           # Windows 图标
│   ├── build.rs               # 构建脚本
│   ├── Cargo.toml             # Rust 依赖配置
│   ├── Cargo.lock             # 依赖锁定文件
│   └── tauri.conf.json        # Tauri 应用配置
├── 📁 public/                 # 静态资源
│   ├── main-screenshot.png    # 主页面截图
│   └── logo.png               # 应用 Logo
├── 📁 FAQ/                    # 常见问题文档
│   ├── 📁 replace_global_hotkey_theory/  # 快捷键替换说明
│   └── 📁 rights_of_administrators/      # 管理员权限说明
├── 📁 .github/                # GitHub 配置
│   └── 📁 workflows/          # GitHub Actions 工作流
├── 📄 latest.json             # 更新配置文件
├── 📄 package.json            # 项目配置
├── 📄 pnpm-workspace.yaml     # pnpm 工作区配置
├── 📄 vite.config.ts          # Vite 配置
├── 📄 tsconfig.json           # TypeScript 配置
├── 📄 tsconfig.node.json      # Node.js TypeScript 配置
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

#### 构建优化
- **代码分割**: 智能 chunk 分割，第三方库单独打包
- **资源优化**: 自动压缩 CSS/JS，支持 gzip 和 brotli 压缩
- **Tree Shaking**: 移除未使用代码，减小最终包体积
- **生产优化**: 自动移除 console 和 debugger 语句

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
- 纯文本内容（支持代码高亮显示）
- 文件路径（不复制文件本身，只记录路径）
- 多种文件类型预览：图片、视频、音频、Office文档、PDF、压缩包等

</details>

## 🙏 致谢

感谢以下优秀的开源项目，让 EasyPaste 的开发成为可能：

| 项目                                                        | 描述                | 许可证           |
|-----------------------------------------------------------|-------------------|---------------|
| [Tauri](https://tauri.app/)                               | 跨平台应用框架           | MIT           |
| [Vue.js](https://vuejs.org/)                              | 渐进式 JavaScript 框架 | MIT           |
| [Naive UI](https://www.naiveui.com/)                      | Vue 3 组件库         | MIT           |
| [clipboard-rs](https://github.com/ChurchTao/clipboard-rs) | Rust 剪贴板库         | MIT           |
| [SQLite](https://www.sqlite.org/)                         | 嵌入式数据库            | Public Domain |
| [winreg-rs](https://github.com/gentoo90/winreg-rs)        | Windows 注册表操作     | MIT           |
| [Vite](https://vitejs.dev/)                               | 现代前端构建工具          | MIT           |
| [Pinia](https://pinia.vuejs.org/)                         | Vue 状态管理库         | MIT           |
| [highlight.js](https://highlightjs.org/)                  | 语法高亮库             | BSD-3-Clause  |
| [markdown-it](https://github.com/markdown-it/markdown-it) | Markdown 解析器      | MIT           |

## 📞 联系方式

| 联系方式 | 链接 |
|----------|------|
| 🏠 项目主页 | [GitHub Repository](https://github.com/lin0306/EasyPaste) |
| 🐛 问题反馈 | [Issues](https://github.com/lin0306/EasyPaste/issues) |
| 💬 讨论交流 | [暂未开通](https://github.com/lin0306/EasyPaste) |
| 📧 邮件联系 | [通过 GitHub](https://github.com/lin0306) |

---

<div align="center">
  <p>
    <strong>如果这个项目对您有帮助，请考虑给它一个 ⭐️！</strong>
  </p>
  <p>
    <em>您的支持是我们持续改进的动力</em>
  </p>
  <p>
    <strong>仓库地址：</strong> <a href="https://github.com/lin0306/EasyPaste">GitHub</a> | <a href="https://gitee.com/lin0306/easy-paste">Gitee</a>
  </p>
</div>