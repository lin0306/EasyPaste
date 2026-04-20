/**
 * 搜索过滤器接口
 */
declare interface SearchFilters {
  content?: string // 内容
  tagId?: number | undefined // 标签ID
  pageSize?: number // 每页数量
  lastItemId?: number // 最后一条数据的ID
  selectTypes?: string[] // 选择类型
  showAdvancedOptions?: boolean // 是否显示高级选项
  excludeText?: string // 排除关键词
  minLength?: number | undefined // 最小长度
  maxLength?: number | undefined // 最大长度
  startDate?: number | undefined // 开始日期
  endDate?: number | undefined // 结束日期
  exactMatch?: boolean // 精确匹配
  sortField?: 'time' | 'length' // 排序字段
  sortOrder?: 'desc' | 'asc' // 排序顺序
  sortValue?: 'time-desc' | 'time-asc' | 'length-desc' | 'length-asc' // 排序值
}
