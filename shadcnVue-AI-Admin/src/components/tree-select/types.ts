import type { TreeNode, TreePropsConfig } from '@/components/tree'
import type { HTMLAttributes } from 'vue'

export interface TreeSelectProps {
  modelValue?: string | number | (string | number)[]
  data: TreeNode[]
  multiple?: boolean
  disabled?: boolean
  placeholder?: string
  nodeKey?: string
  checkStrictly?: boolean
  showCheckbox?: boolean
  defaultExpandAll?: boolean
  defaultExpandedKeys?: (string | number)[]
  fieldNames?: TreePropsConfig
  filterMethod?: (value: string, data: TreeNode) => boolean
  filterNodeMethod?: (value: string, data: TreeNode) => boolean
  loadData?: (node: TreeNode) => Promise<void>
  lazy?: boolean
  clearable?: boolean
  accordion?: boolean
  highlightCurrent?: boolean
  autoExpandParent?: boolean
  size?: 'sm' | 'default'
  renderAfterExpand?: boolean
  class?: HTMLAttributes['class']
  style?: HTMLAttributes['style']
}

export interface TreeSelectEmits {
  (e: 'update:modelValue', value: string | number | (string | number)[]): void
  (e: 'change', value: string | number | (string | number)[]): void
  (e: 'node-click', data: TreeNode, node: unknown): void
  (e: 'node-expand', data: TreeNode, expanded: boolean, node: unknown): void
  (e: 'node-collapse', data: TreeNode, node: unknown): void
  (e: 'visible-change', visible: boolean): void
  (e: 'remove-tag', key: string | number): void
}
