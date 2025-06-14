# EasyPaste - 高效剪贴板管理工具

![EasyPaste Logo](./public/logo.png)

## 项目简介

EasyPaste 是一个基于 Tauri + Vue3 + TypeScript 开发的跨平台剪贴板管理工具，旨在提供简洁高效的剪贴板历史记录管理体验。应用支持文本和图片内容的自动保存、快速检索和便捷复制，帮助用户提高工作效率。

## 主要功能

- **自动监控剪贴板**：实时捕获并保存剪贴板中的文本和图片内容
- **历史记录管理**：按时间顺序保存剪贴板历史，支持置顶重要内容
- **标签分类**：为剪贴板内容添加自定义标签，便于分类管理
- **快速搜索**：支持内容搜索，快速定位历史记录
- **系统托盘**：支持系统托盘操作，随时快速访问
- **全局快捷键**：支持自定义全局快捷键，快速调用应用
- **多语言支持**：内置多语言支持，可自由切换
- **主题切换**：支持明暗主题切换，保护视力
- **自启动支持**：可设置开机自启动，无需手动启动

## 技术栈

### 前端

- **Vue 3**：使用组合式 API 构建用户界面
- **TypeScript**：提供类型安全的代码编写体验
- **Naive UI**：美观现代的 UI 组件库
- **Vue Router**：页面路由管理
- **Pinia**：状态管理库
- **Vite**：现代前端构建工具

### 后端

- **Tauri**：使用 Rust 构建的跨平台应用框架
- **SQLite**：本地数据存储
- **Rust**：高性能、安全的系统编程语言

## 主要依赖

### 前端依赖

- `@tauri-apps/api`：Tauri API 客户端
- `vue`：Vue 3 核心库
- `vue-router`：Vue 路由管理
- `pinia`：Vue 状态管理
- `naive-ui`：UI 组件库
- `vfonts`：字体支持

### Tauri 插件

- `tauri-plugin-autostart`：自启动支持
- `tauri-plugin-clipboard-manager`：剪贴板管理
- `tauri-plugin-fs`：文件系统操作
- `tauri-plugin-global-shortcut`：全局快捷键
- `tauri-plugin-log`：日志管理
- `tauri-plugin-opener`：文件打开
- `tauri-plugin-process`：进程管理
- `tauri-plugin-shell`：Shell 命令执行
- `tauri-plugin-sql`：SQL 数据库支持
- `tauri-plugin-store`：数据存储
- `tauri-plugin-updater`：应用更新
- `tauri-plugin-window-state`：窗口状态管理

## 开发环境设置

### 前提条件

- Node.js (推荐 v18+)
- Rust (最新稳定版)
- pnpm 包管理器

### 安装依赖

```bash
pnpm install
```

### 开发模式运行

```bash
pnpm tauri dev
```

### 构建生产版本

```bash
pnpm tauri build
```

## 许可证

[Apache License 2.0](LICENSE)

## 贡献指南

欢迎提交 Issue 和 Pull Request 来帮助改进这个项目！
