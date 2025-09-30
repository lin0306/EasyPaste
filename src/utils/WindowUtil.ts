import {WebviewWindow} from '@tauri-apps/api/webviewWindow'
import {WebViewWindowOptions} from "../types/Window";

// 创建窗口参数配置
export const windowConfig: WebViewWindowOptions = {
    label: '',
    title: '',
    url: '',
    width: 500,
    height: 500,
    minWidth: undefined,
    minHeight: undefined,
    maxWidth: undefined,
    maxHeight: undefined,
    x: undefined,
    y: undefined,
    center: true,
    maximized: false,
    decorations: false,
    alwaysOnTop: false,
    dragDropEnabled: false,
    visible: true,
    focus: true,
    resizable: true,
    skipTaskbar: false,
    fullscreen: false,
    contentProtected: false,
    preventOverflow: true,
    incognito: true,
};

/**
 * 创建新窗口
 * @param options 窗口参数
 */
export async function createWin(options: WebViewWindowOptions) {
    console.log('-=-=-=-=-=开始创建窗口')

    const args: WebViewWindowOptions = Object.assign({}, windowConfig, options)

    // 判断窗口是否存在
    const existWin = await WebviewWindow.getByLabel(args.label)
    if (existWin) {
        // 窗口存在，直接聚焦
        await existWin.setFocus();
        return;
    }
    // 创建窗口对象
    const win = new WebviewWindow(args.label, args)

    // 窗口创建完毕/失败
    await win.once('tauri://created', async () => {
        console.log('执行窗口创建')
        // 是否主窗口
        if (args.label.indexOf('main') > -1) {
            // ...
        }

        // 是否最大化
        if (args.maximized) {
            console.log('窗口默认最大化')
            await win.maximize()
        }
    })

    await win.once('tauri://error', async (error) => {
        console.log('窗口创建异常', error)
    })
}


/**
 * 打开设置窗口
 */
export function openSettingsWindow() {
    return createWin({
        label: 'settings',
        url: '/settings',
        width: 650,
        height: 500,
        minWidth: 650,
        minHeight: 500
    })
}

/**
 * 打开标签窗口
 */
export function openTagsWindow() {
    return createWin({
        label: 'tags',
        url: '/tags',
        width: 650,
        height: 500,
        minWidth: 650,
        minHeight: 500
    })
}

/**
 * 打开关于窗口
 */
export function openAboutWindow() {
    return createWin({
        label: 'about',
        url: '/about',
        width: 350,
        height: 270,
        resizable: false
    })
}

/**
 * 打开更新窗口
 */
export function openUpdaterWindow() {
    return createWin({
        label: 'updater',
        url: '/updater',
        width: 600,
        height: 500,
        resizable: false
    })
}