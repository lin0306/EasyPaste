import { info } from '@tauri-apps/plugin-log';
import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/plugin-notification';
import { relaunch } from '@tauri-apps/plugin-process';
import { check, DownloadEvent, DownloadOptions, Update } from '@tauri-apps/plugin-updater';
import { openUpdaterWindow } from '../utils/window';

/**
 * 程序更新服务
 */
export default class UpdaterService {
  private updateInterval: NodeJS.Timeout | null = null;
  private intervalTime: number = 1000 * 60 * 60; // 默认1小时检查一次更新
  private static instance: UpdaterService; // 声明单例，避免重复创建定时任务

  private constructor() {
  }

  /**
   * 获取更新服务实例
   */
  static getInstance() {
    if (!this.instance) {
      this.instance = new UpdaterService();
    }
    return this.instance;
  }

  /**
   * 设置检查更新的时间间隔
   * @param minutes 分钟
   */
  setIntervalTime(minutes: number) {
    this.intervalTime = minutes * 60000;
    if (this.updateInterval !== null) {
      clearInterval(this.updateInterval);
      this.startAutoCheck();
    }
  }

  /**
   * 开始自动检查更新
   */
  startAutoCheck() {
    if (this.updateInterval === null) {
      this.updateInterval = setInterval(() => this.checkForUpdates(), this.intervalTime);
      info('初始化自动检查更新任务')
    }
  }

  /**
   * 停止自动检查更新
   */
  stopAutoCheck() {
    if (this.updateInterval !== null) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      info('停止自动检查更新任务')
    }
  }

  /**
   * 检查更新
   */
  async checkForUpdates() {
    info('触发检查更新操作')
    try {
      const update = await check();
      if (update && update.version) {
        info('检查到新版本')
        this.showUpdateWindow();
      } else {
        let permissionGranted = await isPermissionGranted();
        if (!permissionGranted) {
          const permission = await requestPermission();
          permissionGranted = permission === 'granted';
        }

        if (permissionGranted) {
          sendNotification({ title: 'EasyPaste', body: '已经是最新版本' });
        }
      }
    } catch (error) {
      console.error('Error occurred while checking for updates:', error);
    }
  }

  /**
   * 显示更新窗口
   * @param update 更新内容
   */
  showUpdateWindow() {
    // 打开更新窗口
    openUpdaterWindow();
  }

  /**
   * 下载并安装更新
   * @param options 下载选项
   */
  static downloadAndInstall(options?: DownloadOptions) {
    return check().then(async (update) => {
      if (update) {
        await update.downloadAndInstall(() => { }, options);
        await relaunch();
      }
    });
  }

  static async download(update?: Update, onEvent?: (progress: DownloadEvent) => void, options?: DownloadOptions) {
    if (update) {
      await update.download(onEvent, options);
    }
  }

  static async install(update?: Update) {
    if (update) {
      await update.install();
      await relaunch();
    }
  }
}