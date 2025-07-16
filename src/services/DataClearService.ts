import { error, info } from '@tauri-apps/plugin-log';
import ClipboardDBService from './ClipboardDBService';

/**
 * 数据清理服务
 */
export default class DataClearService {
    private dataClearInterval: NodeJS.Timeout | null = null;
    private intervalTime: number = 1000 * 60 * 60; // 默认1小时检查一次更新
    private static instance: DataClearService; // 声明单例，避免重复创建定时任务
    private dataRetentionDays: number = 0; // 数据保留时长

    private constructor(dataRetentionDays: number) {
        this.dataRetentionDays = dataRetentionDays;
    }

    /**
     * 获取定时器实例
     */
    static getInstance(dataRetentionDays: number | undefined) {
        if (dataRetentionDays) {
            if (!this.instance) {
                this.instance = new DataClearService(dataRetentionDays);
            }
        }

        return this.instance;
    }

    /**
     * 设置数据清理的时间间隔
     * @param minutes 分钟
     */
    setIntervalTime(minutes: number) {
        this.intervalTime = minutes * 60000;
        if (this.dataClearInterval !== null) {
            clearInterval(this.dataClearInterval);
            this.startDataClear();
        }
    }

    /**
     * 设置数据保留时长
     * @param days 天数
     */

    setDataRetentionDays(days: number) {
        this.dataRetentionDays = days;
    }

    /**
     * 开始自动清理数据
     */
    startDataClear() {
        if (this.dataClearInterval === null && this.dataRetentionDays > 0) {
            this.dataClearInterval = setInterval(() => this.dataClear(), this.intervalTime);
            info('初始化自动清理数据任务')
        }
    }

    /**
     * 停止自动清理数据
     */
    stopDataClear() {
        if (this.dataClearInterval !== null) {
            clearInterval(this.dataClearInterval);
            this.dataClearInterval = null;
            info('停止自动清理数据任务')
        }
    }


    /**
     * 数据清理
     */
    async dataClear() {
        info('触发数据清理操作')
        try {
            const db = await ClipboardDBService.getInstance();
            const count = await db.clearClipboardItems(this.dataRetentionDays);
            info(`清理历史数据完成，成功删除${count}条剪贴板数据`)
            info('数据清理完成')
        } catch (er: any) {
            error('数据清理异常:' + er.message);
        }
    }
}