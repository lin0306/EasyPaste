import { error, info } from '@tauri-apps/plugin-log';
import { getSettings } from './FileService.ts';
import ClipboardDBService from './ClipboardDBService';

/**
 * 数据清理服务
 */
export default class DataClearService {
    private dataClearInterval: NodeJS.Timeout | null = null;
    private intervalTime: number = 1000 * 60 * 60; // 默认1小时检查一次更新
    private static instance: DataClearService; // 声明单例，避免重复创建定时任务
    private initialized: Promise<void>;
    private dataRetentionDays: number = 0; // 数据保留时长
    private maxHistoryItems: number = 0; // 数据保留条数

    private constructor() {
        this.initialized = this.initialize();
    }

    private async initialize(): Promise<void> {
        try {
            const settings = await getSettings();
            this.dataRetentionDays = settings.dataRetentionDays;
            this.maxHistoryItems = settings.maxHistoryItems;
            info('[数据库进程] 数据库初始化完成');
        } catch (er) {
            error('[数据库进程] 数据库加载失败:' + er);
            throw er;
        }
    }

    /**
     * 获取定时器实例
     */
    public static async getInstance(): Promise<DataClearService> {
        if (!DataClearService.instance) {
            DataClearService.instance = new DataClearService();
            await DataClearService.instance.initialized;
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
     * 设置数据保留条数
     * @param count 保留条数
     */
    setMaxHistoryItems(count: number) {
        this.maxHistoryItems = count;
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
        try {
            const db = await ClipboardDBService.getInstance();
            const c1 = await db.clearClipboardItems(this.dataRetentionDays);
            const c2 = await db.clearHistoryItems(this.maxHistoryItems);
            if (c1 + c2 > 0) {
                info(`清理历史数据完成，成功删除${c1}条超过保留时长的数据，删除${c2}条超过保留条数限制的数据，保留时长：${this.dataRetentionDays}天，保留条数：${this.maxHistoryItems}条`);
            }
        } catch (er) {
            error('数据清理异常:' + er);
        }
    }
}