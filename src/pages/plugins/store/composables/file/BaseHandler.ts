import { deleteFile, deleteFolder } from '@/utils/FileUtil.ts'
import { PluginHandlerContext } from '@/pages/plugins/store/composables/file/types'

/**
 * 处理器接口
 */
interface Handler {
  setNext(handler: Handler): Handler
  handle(context: PluginHandlerContext): Promise<void>
}

/**
 * 抽象基类，提供默认的链式行为
 */
export abstract class BaseHandler implements Handler {
  private nextHandler: Handler | undefined

  /**
   * 设置下一个处理器并返回，支持链式调用
   * @param handler 下一个处理器
   */
  public setNext(handler: Handler): Handler {
    this.nextHandler = handler
    return handler
  }

  // 核心：统一拦截异常
  public async handle(context: PluginHandlerContext): Promise<void> {
    // 如果上下文已经标记为错误状态，直接跳过当前节点（防止在异常后继续执行后续节点）
    if (!context.success) {
      return
    }

    try {
      await this.doHandle(context)
      if (context.success) {
        await this.handleNext(context)
      } else {
        context.success = false
        this.handleFailed(context)
      }
    } catch (error: unknown) {
      this.handleFailed(context, error)
    }
  }

  /**
   * 错误处理
   * @param error 错误信息
   * @param context 上下文
   */
  private handleFailed(context: PluginHandlerContext, error?: unknown) {
    if (context.mode !== 'installLocal') {
      this.deleteZipFile(context)
      this.deleteFolder(context)
    }
    context.errorMessage = error instanceof Error ? error.message : String(error)

    // 【核心】动态调用外部传入的自定义错误处理方法
    if (typeof context.onGlobalError === 'function') {
      context.onGlobalError(error, context)
    } else {
      // 如果外部没传，则执行默认的兜底日志打印
      console.error(`[全局错误拦截] 流程在 [${this.constructor.name}] 节点中断！`)
      console.error(`[全局错误拦截] 错误原因: ${context.errorMessage}`, error)
    }
  }

  // 子类实现真正的业务逻辑（替代原来的 handle）
  protected abstract doHandle(context: PluginHandlerContext): Promise<void>

  /**
   * 执行下一个处理器
   * @param context 请求上下文
   */
  protected async handleNext(context: PluginHandlerContext): Promise<void> {
    if (this.nextHandler) {
      await this.nextHandler.handle(context)
    } else {
      console.log('处理结束')
    }
  }

  /**
   * 删除压缩文件
   * @param context 请求上下文
   */
  protected deleteZipFile(context: PluginHandlerContext) {
    if (context.localZipPath) {
      deleteFile(context.localZipPath)
    }
  }

  /**
   * 删除文件夹
   * @param context 请求上下文
   */
  protected deleteFolder(context: PluginHandlerContext) {
    if (context.localFolderPath) {
      deleteFolder(context.localFolderPath)
    }
  }
}
