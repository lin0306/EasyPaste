import { MessageApiInjection } from 'naive-ui/es/message/src/MessageProvider'
import { DialogApiInjection } from 'naive-ui/es/dialog/src/DialogProvider'


/**
 * 插件处理上下文
 */
declare interface PluginHandlerContext {
  pluginId: number // 数据库插件id
  mode: 'install' | 'installLocal' | 'update' | 'uninstall' // 执行模式
  times: number | 0 // 执行器执行次数， 从0开始
  localZipPath: string // 本地压缩文件路径
  localFolderPath: string // 本地解压文件路径
  plugin: StorePlugin // 插件信息
  success: boolean // 是否成功
  errorMessage?: string // 错误信息
  onGlobalError?: (error: unknown, context: InstallContext) => void // 异常回滚方法
  message: MessageApiInjection // 消息
  dialog: DialogApiInjection // 对话框
}
