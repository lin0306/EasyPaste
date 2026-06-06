/**
 * 商店插件
 */
declare interface StorePlugin {
  id: string // 插件唯一id
  name: string // 插件名称
  branch: 'GA' | 'RC' | 'Beta' | 'Dev' // 分支
  version: string // 插件版本
  description: string // 插件描述
  platform: 'Windows' | 'MacOS' | 'General' // 可用平台
  fileName: string // 插件安装包名称
  releaseUrl: string // 插件发布地址
  downloadUrl: string // 插件下载地址
  size: number // 插件安装包大小，单位：字节
}

/**
 * 本地插件
 */
declare interface LocalPlugin {
  id: number // id
  plugin_id: string // 插件唯一id
  plugin_name: string // 插件名称
  version: string // 插件版本
  use_location: string // 可用位置，list，settings，tags，preview
  platform: 'Windows' | 'MacOS' | 'General' // 可用平台
  fileName: string // 插件安装包名称
  release_url: string // 插件发布地址
  url: string // 插件下载地址
  enable: number // 插件是否启用
  description: string // 插件描述
  install_time: number // 安装时间
  size: number // 插件安装包大小，单位：字节
}

/**
 * 选择的插件
 */
declare interface SelectPlugin {
  id: number | null // id
  pluginId: string // 插件唯一id
  pluginName: string // 插件名称
  version: string // 插件版本
  platform: 'Windows' | 'MacOS' | 'General' // 可用平台
  fileName: string // 插件安装包名称
  releaseUrl: string // 插件发布地址
  url: string // 插件下载地址
  enable: number // 插件是否启用
  description: string // 插件描述
  size: number // 插件安装包大小，单位：字节
}
