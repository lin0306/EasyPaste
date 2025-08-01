# EasyPaste - 高效剪贴板管理工具

<img src="./public/logo.png" width="100px" alt="EasyPaste Logo">

## 项目简介

EasyPaste 是一个基于 Tauri + Vue3 + TypeScript 开发的跨平台剪贴板管理工具，旨在提供简洁高效的剪贴板历史记录管理体验。应用支持文本和文件内容的自动保存、快速检索和便捷复制，帮助用户提高工作效率。

### ✨ 核心特性

- 🚀 **高性能**: 基于 Rust + Tauri 构建，内存占用低，响应速度快
- 🔒 **隐私安全**: 所有数据本地存储，不上传云端，保护用户隐私
- 📄 **文件安全**：不实际操作任何文件，只保存文件路径，保证文件的原始性
- 🎨 **现代化界面**: 基于 Vue3 + Naive UI，提供美观的用户体验
- 🌍 **跨平台支持**: 支持 Windows、macOS 多平台运行
- 📦 **轻量级**: 安装包小巧，启动迅速，资源消耗极低

## 主要功能

### 📋 剪贴板管理
- **自动监控剪贴板**：实时捕获并保存剪贴板中的文本和文件内容
- **智能去重**：自动识别重复内容，更新时间戳而非创建新记录
- **历史记录管理**：按时间顺序保存剪贴板历史，支持置顶重要内容
- **分页加载**：支持大量历史记录的高效分页显示
- **文件支持**：完整支持文件和文件夹的复制粘贴操作

### 🏷️ 标签与分类
- **标签分类**：为剪贴板内容添加自定义标签，便于分类管理
- **颜色标识**：支持为标签设置不同颜色，视觉化分类
- **标签筛选**：按标签快速筛选和查找相关内容
- **批量管理**：支持批量添加、删除标签

### 🔍 搜索与导航
- **快速搜索**：支持内容关键词搜索，快速定位历史记录
- **实时筛选**：输入即搜索，实时显示匹配结果
- **组合筛选**：支持内容搜索与标签筛选的组合使用

### ⚙️ 系统集成
- **系统托盘**：支持系统托盘操作，随时快速访问
- **全局快捷键**：支持自定义全局快捷键，快速调用应用
- **窗口管理**：智能窗口显示/隐藏，失焦自动隐藏
- **自启动支持**：可设置开机自启动，无需手动启动

### 🎨 个性化定制
- **多主题支持**：内置浅色、深色、蓝色、粉色等多种主题
- **多语言支持**：内置多语言支持，可自由切换
- **界面定制**：支持字体、颜色等界面元素的个性化设置

### 🔄 数据管理
- **自动更新**：内置应用自动更新功能，保持最新版本
- **数据清理**：支持按时间和数量自动清理历史数据
- **数据导入导出**：支持数据的备份和恢复（规划中）
- **SQLite 存储**：使用 SQLite 数据库，数据安全可靠

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
- `@highlightjs/vue-plugin`：代码高亮支持
- `highlight.js`：语法高亮库

### Tauri 插件

- `tauri-plugin-autostart`：自启动支持
- `tauri-plugin-fs`：文件系统操作
- `tauri-plugin-global-shortcut`：全局快捷键
- `tauri-plugin-log`：日志管理
- `tauri-plugin-notification`：系统通知
- `tauri-plugin-opener`：文件打开
- `tauri-plugin-process`：进程管理
- `tauri-plugin-shell`：Shell 命令执行
- `tauri-plugin-sql`：SQL 数据库支持
- `tauri-plugin-store`：数据存储
- `tauri-plugin-updater`：应用更新

### Rust 依赖

- `clipboard-rs`：跨平台剪贴板操作
- `serde` & `serde_json`：JSON 序列化/反序列化
- `chrono`：日期时间处理
- `dirs`：系统目录获取
- `log`：日志记录
- `lazy_static`：静态变量管理

## 快速开始

### 📥 安装使用

1. 从 [Releases](https://github.com/lin0306/EasyPaste/releases) 页面下载最新版本
2. 运行安装程序完成安装
3. 启动应用，首次运行会自动初始化数据库
4. 开始使用剪贴板管理功能

### ⌨️ 快捷键

- `Alt + C`：显示/隐藏主窗口（可自定义）
- `Ctrl + F`：激活搜索框（应用内）
- `Esc`：隐藏搜索框
- `单击托盘图标`：显示/隐藏主窗口

## 开发环境设置

### 前提条件

- **Node.js** (推荐 v18+)
- **Rust** (最新稳定版)
- **pnpm** 包管理器

### 克隆项目

```bash
git clone https://github.com/lin0306/EasyPaste.git
cd EasyPaste
```

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

### 项目结构

```
EasyPaste/
├── src/                    # 前端源码
│   ├── components/         # Vue 组件
│   ├── views/             # 页面视图
│   ├── services/          # 业务服务层
│   ├── configs/           # 配置管理
│   ├── types/             # TypeScript 类型定义
│   ├── utils/             # 工具函数
│   └── data/              # 静态数据
├── src-tauri/             # Tauri 后端
│   ├── src/               # Rust 源码
│   ├── icons/             # 应用图标
│   └── Cargo.toml         # Rust 依赖配置
├── public/                # 静态资源
└── dist/                  # 构建输出
```

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 如何贡献

1. **Fork** 本仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 **Pull Request**

### 报告问题

如果您发现了 bug 或有功能建议，请：

1. 查看 [Issues](https://github.com/lin0306/EasyPaste/issues) 确认问题未被报告
2. 创建新的 Issue，详细描述问题或建议
3. 提供复现步骤（如果是 bug）

### 开发规范

- 遵循现有的代码风格
- 为新功能添加适当的注释
- 确保代码通过所有测试
- 更新相关文档

## 📄 许可证

本项目基于 [Apache License 2.0](LICENSE) 许可证开源。

## 🙏 致谢

感谢以下开源项目：

- [Tauri](https://tauri.app/) - 跨平台应用框架
- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Naive UI](https://www.naiveui.com/) - Vue 3 组件库
- [clipboard-rs](https://github.com/ChurchTao/clipboard-rs) - Rust 剪贴板库

## 📞 联系方式

- 项目主页：[GitHub Repository](https://github.com/lin0306/EasyPaste)
- 问题反馈：[Issues](https://github.com/lin0306/EasyPaste/issues)

---

如果这个项目对您有帮助，请考虑给它一个 ⭐️！
