import type { Slot } from 'vue'

export interface TreeNode {
  id: string | number
  label: string
  children?: TreeNode[]
  icon?: unknown
  isLeaf?: boolean
  disabled?: boolean
  parentId?: string | number
  allowDrag?: boolean
  allowDrop?: boolean

  // 新增节点级配置
  checkable?: boolean
  disableCheckbox?: boolean
  selectable?: boolean
  class?: string | Record<string, boolean> | (string | Record<string, boolean>)[]
  style?: Record<string, string> | string
  [key: string]: unknown
}

export interface TreePropsConfig {
  label?: string
  key?: string
  children?: string
  disabled?: string
  title?: string
}

export interface TreeProps {
  data: TreeNode[]
  nodeKey?: string
  defaultExpandedKeys?: (string | number)[]
  defaultCheckedKeys?: (string | number)[]
  showCheckbox?: boolean
  checkStrictly?: boolean
  highlightCurrent?: boolean
  defaultExpandAll?: boolean
  accordion?: boolean
  showIcon?: boolean
  blockNode?: boolean
  draggable?: boolean
  allowDrag?: ((node: TreeNode) => boolean) | boolean
  height?: number
  fieldNames?: TreePropsConfig
  switcherIcon?: Slot
}

export interface TreeEmits {
  (e: 'node-click', data: TreeNode, node: unknown): void
  (e: 'check', data: TreeNode, checked: boolean, node: unknown): void
  (e: 'check-change', data: TreeNode, checked: boolean, checkedKeys: (string | number)[]): void
  (e: 'current-change', currentNode: TreeNode, oldCurrentNode: TreeNode | null): void
  (e: 'expand', data: TreeNode, expanded: boolean, node: unknown): void
  (e: 'expand-change', data: TreeNode, expanded: boolean, expandedKeys: (string | number)[]): void
  (e: 'collapse', data: TreeNode, node: unknown): void
  (e: 'drag-start', node: TreeNode, event: DragEvent): void
  (e: 'drag-enter', node: TreeNode, event: DragEvent): void
  (e: 'drag-leave', node: TreeNode, event: DragEvent): void
  (e: 'drag-over', node: TreeNode, event: DragEvent): void
  (e: 'drag-end', node: TreeNode, event: DragEvent): void
  (e: 'drop', node: TreeNode, event: DragEvent): void
}
