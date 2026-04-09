declare interface ContextMenu {
  pluginId: string
  labelCode: string
  label: string
  params?: string[]
  onClick: (...any) => any
}
