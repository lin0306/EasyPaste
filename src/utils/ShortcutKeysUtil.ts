import {isMac} from "../data/SystemParams";

/**
 * 将快捷键转换为注册格式
 */
export function convertRegisterKeys(keys: Array<string>): string {
    return keys.map(convertRegisterKey).join("+");
}

/**
 * 转换快捷键注册格式
 */
export function convertRegisterKey(key: string): string {
    // 由于Tauri进行快捷键注册时 Win/Command键位使用Super，这里需要进行转换
    return key.toLocaleLowerCase() === 'meta' ? 'Super' : formatKeyDisplay(key);
}

/**
 * 格式化快捷键显示，修饰键首字母大写，普通键全部大写
 */
export function formatKeysDisplay(keys: Array<string>): string {
    return keys.map(formatKeyDisplay).join("+");
}

/**
 * 格式化快捷键显示
 * <ul>
 *  <li>修饰键首字母大写，普通键全部大写</li>
 *  <li>将 meta 根据系统替换为对应的键位，Windows系统为 ’Win‘，Mac系统为 ‘⌘’</li>
 * </ul>
 */
export function formatKeyDisplay(key: string): string {
    // 修饰键列表
    const modifierKeys = ['ctrl', 'shift', 'alt', 'meta'];

    if (modifierKeys.includes(key.toLowerCase())) {
        if (key.toLowerCase() === 'meta') {
            if (isMac) {
                // mac Command
                return '⌘';
            } else {
                // windows徽标
                return 'Win';
            }
        } else {
            // 修饰键首字母大写
            return key.charAt(0).toUpperCase() + key.slice(1);
        }
    } else {
        // 普通键全部大写
        return key.toUpperCase();
    }
}


