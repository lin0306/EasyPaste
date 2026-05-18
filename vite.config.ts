import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { visualizer } from 'rollup-plugin-visualizer'
import AutoImport from 'unplugin-auto-import/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import path from 'path'

const host = process.env.TAURI_DEV_HOST

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // 打包分析
    visualizer({
      open: true, // 构建完成后自动打开分析报告
      filename: 'stats.html', // 生成的分析报告文件名
      gzipSize: true, // 收集 gzip 大小并显示
      brotliSize: true, // 收集 brotli 大小并显示
    }),
    AutoImport({
      imports: [
        'vue',
        {
          'naive-ui': [
            'useButton',
            'useCode',
            'useColorPicker',
            'useEmpty',
            'useIcon',
            'useInfiniteScroll',
            'useInput',
            'useInputNumber',
            'useMenu',
            'useModal',
            'useSelect',
            'useSpin',
            'useSwitch',
            'useTag',
          ],
        },
      ],
      dts: 'src/types/auto-imports.d.ts',
      eslintrc: {
        enabled: true,
      },
      // 排除未使用的模块
      exclude: ['birpc', 'hookable', 'perfect-debounce'],
    }),
    Components({
      dts: 'src/types/components.d.ts',
      resolvers: [NaiveUiResolver()],
      // 排除未使用的组件
      exclude: ['birpc', 'hookable', 'perfect-debounce'],
    }),
  ],

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 防止 Vite 清除 Rust 显示的错误
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 23000,
    // Tauri 工作于固定端口，如果端口不可用则报错
    strictPort: true,
    // 如果设置了 host，Tauri 则会使用
    host: host || false,
    hmr: host
      ? {
          protocol: 'ws',
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ['**/src-tauri/**'],
    },
  },
  // 添加有关当前构建目标的额外前缀，使这些 CLI 设置的 Tauri 环境变量可以在客户端代码中访问
  envPrefix: ['VITE_', 'TAURI_ENV_*'],
  // 构建选项
  build: {
    // Tauri 在 Windows 上使用 Chromium，在 macOS 和 Linux 上使用 WebKit
    // target: process.env.TAURI_ENV_PLATFORM == 'windows' ? 'chrome114' : 'safari16',
    target: 'esnext',
    // 在 debug 构建中生成 sourcemap
    sourcemap: !!process.env.TAURI_ENV_DEBUG,
    // 使用 Oxc 压缩选项（替代 terserOptions）
    minify: 'oxc', // 默认值，可选 'oxc' | 'esbuild' | 'terser' | boolean
    // 优化 Rollup 配置
    rolldownOptions: {
      output: {
        minify: {
          compress: {
            dropConsole: true,
            dropDebugger: true,
          },
        },
        chunkFileNames: 'js/[name]-[hash].js', // 引入文件名的名称
        entryFileNames: 'js/[name]-[hash].js', // 包的入口文件名称
        assetFileNames: '[ext]/[name]-[hash].[ext]', // 资源文件像 字体，图片等

        // 优化分组
        advancedChunks: {
          groups: [
            // Vue 生态
            {
              name: 'vendor',
              test: /[\\/]node_modules[\\/](vue|pinia)[\\/]/,
            },
            // UI 库
            {
              name: 'vendor-ui',
              test: /[\\/]node_modules[\\/](naive-ui)[\\/]/,
            },
            // 图标
            {
              name: 'vendor-fontawesome',
              test: /[\\/]node_modules[\\/](@fortawesome)[\\/]/,
            },
            // Markdown 和处理
            {
              name: 'vendor-markdown',
              test: /[\\/]node_modules[\\/](marked|highlight.js)[\\/]/,
            },
            // 媒体播放
            {
              name: 'vendor-media',
              test: /[\\/]node_modules[\\/](plyr|wavesurfer.js|v-viewer)[\\/]/,
            },
            // 压缩
            {
              name: 'vendor-zip',
              test: /[\\/]node_modules[\\/](@zip.js)[\\/]/,
            },
            // Tauri
            {
              name: 'vendor-tauri',
              test: /[\\/]node_modules[\\/](@tauri-apps)[\\/]/,
            },
          ],
        },
      },
    },
  },
  // 优化依赖项
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', 'naive-ui'],
    // 明确排除这些空模块
    exclude: ['birpc', 'hookable', 'perfect-debounce'],
  },
  // 别名
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
