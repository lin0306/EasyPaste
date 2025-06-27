import { WebviewWindow } from '@tauri-apps/api/webviewWindow'
import { getAllWindows } from '@tauri-apps/api/window'
import { info } from '@tauri-apps/plugin-log'

// 创建窗口参数配置
export const windowConfig = {
    label: null,            // 窗口唯一label
    title: '',              // 窗口标题
    url: '',                // 路由地址url
    width: 500,            // 窗口宽度
    height: 500,            // 窗口高度
    minWidth: null,         // 窗口最小宽度
    minHeight: null,        // 窗口最小高度
    maxWidth: null,         // 窗口最大宽度
    maxHeight: null,        // 窗口最大高度
    x: null,                // 窗口相对于屏幕左侧坐标
    y: null,                // 窗口相对于屏幕顶端坐标
    center: true,           // 窗口居中显示
    maximized: false,       // 是否最大化窗口
    decorations: false,     // 是否窗口是否装饰边框及导航条
    alwaysOnTop: false,     // 是否置顶窗口
    dragDropEnabled: false, // 是否启用系统拖放
    visible: false,         // 是否显示窗口
    focus: true,            // 是否聚焦窗口
    resizable: true,        // 是否允许窗口调整大小
}

class Windows {
    private constructor() {
    }

    // 创建新窗口
    static async createWin(options: any) {
        info('-=-=-=-=-=开始创建窗口')

        const args = Object.assign({}, windowConfig, options)

        // 判断窗口是否存在
        const existWin = await Windows.getWin(args.label)
        if (existWin) {
            info('窗口已存在>>' + existWin)
            // ...
        }
        // 创建窗口对象
        const win = new WebviewWindow(args.label, args)

        // 窗口创建完毕/失败
        win.once('tauri://created', async () => {
            info('tauri://created')
            // 是否主窗口
            if (args.label.indexOf('main') > -1) {
                // ...
            }

            // 是否最大化
            if (args.maximized) {
                info('is-maximized')
                await win.maximize()
            }
        })

        win.once('tauri://error', async (error) => {
            info('window create error!' + error)
        })
    }

    // 获取窗口
    static async getWin(label: string) {
        return await WebviewWindow.getByLabel(label)
    }

    // 获取全部窗口
    static async getAllWin() {
        return await getAllWindows()
    }
}

/**
 * 打开设置窗口
 */
export function openSettingsWindow() {
    Windows.createWin({
        label: 'settings',
        url: '/settings',
        width: 650,
        height: 500
    })
}

/**
 * 打开标签窗口
 */
export function openTagsWindow() {
    Windows.createWin({
        label: 'tags',
        url: '/tags',
        width: 650,
        height: 500
    })
}

/**
 * 打开关于窗口
 */
export function openAboutWindow() {
    Windows.createWin({
        label: 'about',
        url: '/about',
        width: 350,
        height: 270
    })
}

/**
 * 打开更新窗口
 */
export function openUpdaterWindow() {
    Windows.createWin({
        label: 'updater',
        url: '/updater',
        width: 600,
        height: 500
    })
}

export default Windows