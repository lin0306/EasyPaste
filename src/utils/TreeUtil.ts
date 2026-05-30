import { TreeOption } from 'naive-ui'
import { h } from 'vue'

/**
 * 修改展开收起时的前缀图标
 */
export function updatePrefixWithExpanded(
  _keys: Array<string | number>,
  _option: Array<TreeOption | null>,
  meta: {
    node: TreeOption | null
    action: 'expand' | 'collapse' | 'filter'
  }
): void {
  if (!meta.node) return
  switch (meta.action) {
    case 'expand':
      meta.node.prefix = () => h('span', '📂')
      break
    case 'collapse':
      meta.node.prefix = () => h('span', '📁')
      break
  }
}
