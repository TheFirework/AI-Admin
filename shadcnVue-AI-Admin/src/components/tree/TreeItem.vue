<script setup lang="ts">
import { computed, inject, ref, type Ref } from 'vue'
import { ChevronRight, ChevronDown, Folder, FolderOpen, File, GripVertical, Loader2 } from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import TreeCheckbox from './TreeCheckbox.vue'
import { VueDraggable } from 'vue-draggable-plus'
import type { TreeNode } from './types'
import { getPropValue } from './utils'

interface TreePropsConfig {
  label?: string
  key?: string
  children?: string
  disabled?: string
  title?: string
}

interface TreeItemProps {
  node: TreeNode
  level: number
  isExpanded: boolean
  isChecked: boolean
  isHalfChecked: boolean
  isLeaf: boolean
  isCurrent: boolean
  showCheckbox: boolean
  disabled: boolean
  showIcon: boolean
  blockNode: boolean
  draggable: boolean
  expandedKeys: (string | number)[]
  checkedKeys: (string | number)[]
  halfCheckedKeys: (string | number)[]
  currentNodeKey: string | number | null
  highlightCurrent: boolean
  fieldNames?: TreePropsConfig
  nodeKey?: string
  parentLocked?: boolean // 父节点是否设置了 lockChildren（继承锁定状态）
}

const props = withDefaults(defineProps<TreeItemProps>(), {
  showIcon: true,
  blockNode: false,
  draggable: false,
  fieldNames: () => ({
    label: 'label',
    key: 'id',
    children: 'children'
  })
})

const emit = defineEmits<{
  (e: 'toggle-expand', node: TreeNode): void
  (e: 'toggle-check', node: TreeNode): void
  (e: 'node-click', node: TreeNode): void
}>()

const treeDrag = inject<any>('treeDrag', null)

// ==================== 组件级别状态（从 Tree 注入）====================
const treeDisabled = inject<Ref<boolean>>('treeDisabled', ref(false))
const treeLockChildren = inject<Ref<boolean>>('treeLockChildren', ref(false))
const treeLoadingKeys = inject<Ref<Set<string | number>>>('treeLoadingKeys', ref(new Set()))

// ==================== 禁用状态计算（双模式）====================

// 组件级禁用：整个树完全禁用
const isComponentDisabled = computed(() => treeDisabled?.value === true)

// 节点级禁用：仅当前节点自身被禁用（不影响子节点）
const isNodeDisabled = computed(() => {
  if (props.disabled) return true // prop 传入的 disabled
  const nodeDisabled = props.node.disabled || false
  return !!nodeDisabled
})

// 最终禁用状态：组件级优先 > 节点级
// - 组件级 disabled → 所有节点都禁用
// - 节点级 disabled → 仅当前节点禁用
const isActuallyDisabled = computed(() => {
  if (isComponentDisabled.value) return true // 组件级禁用优先
  return isNodeDisabled.value // 否则使用节点级状态
})

// ==================== 锁定状态计算（双模式）====================

// 组件级锁定：所有节点都被锁定
const isComponentLocked = computed(() => treeLockChildren?.value === true)

// 节点级锁定区域：祖先节点设置了 lockChildren（继承）
const isInNodeLockedZone = computed(() => props.parentLocked === true)

// 最终锁定状态：
// - 组件级 lockChildren → 所有节点锁定
// - 节点级 lockChildren → 仅当前节点的子节点及后代锁定
const isLocked = computed(() => {
  if (isComponentLocked.value) return true // 组件级锁定优先
  if (isInNodeLockedZone.value) return true // 节点级继承锁定
  return false
})

const isNodeLoading = computed(() => {
  const key = getNodeKey(props.node)
  return treeLoadingKeys.value.has(key)
})

// 场景1：当前节点是否可被拖出（pull 权限）
const canDrag = computed(() => {
  if (!props.draggable) return false
  if (isActuallyDisabled.value) return false // 禁用节点不可拖拽
  if (isLocked.value) return false // 被锁定（组件级或节点级）
  if (treeDrag) return treeDrag.canNodeDrag(props.node)
  return true
})

// 当前节点是否可接收拖入（put 权限）
const canPut = computed(() => {
  if (!props.draggable) return false
  if (props.isLeaf) return false // 叶子节点不能接收
  if (props.node.allowDrop === false) return false // 显式禁止接收
  if (isActuallyDisabled.value) return false // 禁用节点不能接收
  if (isLocked.value) return false // 被锁定（组件级或节点级）
  return true
})

// 子区域容器的拖拽权限（独立于当前节点状态）
// 即使当前节点被禁用，子节点仍应可正常拖拽（场景1）
const containerCanDrag = computed(() => {
  if (!props.draggable) return false
  if (isLocked.value || props.node.lockChildren) return false // 被锁定时，整个子区域不可拖出
  return true
})

// 子区域容器是否可接收外部节点拖入
const containerCanPut = computed(() => {
  if (!props.draggable) return false
  if (isLocked.value || props.node.lockChildren) return false // 被锁定时，不可接收
  if (isActuallyDisabled.value && props.isLeaf === false && !isComponentDisabled.value) {
    // 节点级禁用的非叶子节点：自身不可操作，但子区域可以接收（场景1特殊处理）
    // 注意：组件级禁用时不适用此规则
    return true
  }
  return canPut.value
})

const shouldShowCheckbox = computed(() => {
  if (!props.showCheckbox) return false
  const checkable = props.node.checkable as boolean | undefined
  if (checkable !== undefined) return checkable
  return true
})

const isCheckboxDisabled = computed(() => {
  if (isNodeDisabled.value) return true
  const disableCheckbox = props.node.disableCheckbox as boolean | undefined
  if (disableCheckbox !== undefined) return disableCheckbox
  return false
})

const nodeClass = computed(() => {
  return props.node.class as string | Record<string, boolean> | (string | Record<string, boolean>)[] | undefined
})

const nodeStyle = computed(() => {
  return props.node.style as Record<string, string> | string | undefined
})

const nodeTitle = computed(() => {
  const titleKey = props.fieldNames?.title || 'title'
  const labelKey = props.fieldNames?.label || 'label'
  return (props.node[titleKey] as string | undefined)
    || (props.node[labelKey] as string | undefined)
})

const label = computed(() => {
  const labelKey = props.fieldNames?.label || 'label'
  return (props.node[labelKey] as string) || props.node.label || ''
})

const nodeChildren = computed({
  get() {
    const childrenKey = props.fieldNames?.children || 'children'
    return (props.node[childrenKey] as TreeNode[]) || props.node.children || []
  },
  set(val: TreeNode[]) {
    const childrenKey = props.fieldNames?.children || 'children'
    if (childrenKey in props.node) {
      props.node[childrenKey] = val as any
    } else {
      props.node.children = val
    }
  }
})

function getIcon() {
  if (props.node.icon) return props.node.icon
  if (!props.showIcon) return null
  if (props.isLeaf) return File
  return isChildExpanded(props.node) ? FolderOpen : Folder
}

function getNodeKey(node: TreeNode): string | number {
  const keyField = props.fieldNames?.key || props.nodeKey || 'id'
  return (node[keyField] as string | number) ?? node.id
}

function childKey(node: TreeNode): string {
  return `${getNodeKey(node)}-${(node as any).parentId ?? 'root'}`
}

function isChildExpanded(node: TreeNode): boolean {
  return props.expandedKeys.includes(getNodeKey(node))
}
function isChildChecked(node: TreeNode): boolean {
  return props.checkedKeys.includes(getNodeKey(node))
}
function isChildHalfChecked(node: TreeNode): boolean {
  return props.halfCheckedKeys.includes(getNodeKey(node))
}
function isChildLeaf(node: TreeNode): boolean {
  if ('isLeaf' in node) return !!node.isLeaf
  const childrenKey = props.fieldNames?.children || 'children'
  const childNodes = node[childrenKey] as TreeNode[] | undefined
  return !childNodes || childNodes.length === 0
}
function isChildCurrent(node: TreeNode): boolean {
  return props.highlightCurrent && props.currentNodeKey === getNodeKey(node)
}

function handleExpandClick(e: MouseEvent) {
  e.stopPropagation()
  // 禁用节点如果有子节点，仍允许展开/折叠操作
  emit('toggle-expand', props.node)
}

function handleCheckboxChange() {
  if (isNodeDisabled.value) return
  emit('toggle-check', props.node)
}

function handleClick() {
  if (isNodeDisabled.value) return
  emit('node-click', props.node)
}

function onDragStart() {
  if (treeDrag) treeDrag.emitDragStart(props.node)
}

function onDragEnd(evt: any) {
  if (!treeDrag) return
  const dragKey = evt.item?.getAttribute('data-node-key')
  if (!dragKey) return
  const fromContainer = evt.from as HTMLElement
  const toContainer = evt.to as HTMLElement
  const fromInfo = treeDrag.resolveContainerParent(fromContainer)
  const toInfo = treeDrag.resolveContainerParent(toContainer)
  const fromParentKey = fromInfo?.isRoot ? undefined : (fromInfo?.key as string | number | undefined)
  const toParentKey = toInfo?.isRoot ? undefined : (toInfo?.key as string | number | undefined)
  treeDrag.handleDragEnd(dragKey, fromParentKey, toParentKey)
}

function onDragMove(evt: any) {
  if (!treeDrag) return true // 默认允许移动
  const dragged = evt.dragged as HTMLElement | undefined
  const related = evt.related as HTMLElement | undefined
  const to = evt.to as HTMLElement | undefined
  const from = evt.from as HTMLElement | undefined

  if (!dragged) return true

  const dragNode = treeDrag.getNodeFromEl(dragged)

  // 如果目标容器存在且与源容器不同（跨容器拖拽）
  if (to && from && to !== from) {
    const toInfo = treeDrag.resolveContainerParent(to)
    const targetNode = toInfo && !toInfo.isRoot
      ? treeDrag.getNodeFromEl(to.parentElement?.closest('li.tree-item') as HTMLElement)
      : null

    // 如果目标是目录节点（非叶子），允许拖入
    if (dragNode && targetNode) {
      const targetChildren = targetNode.children
      const targetIsLeaf = !(!targetNode.isLeaf && targetChildren && targetChildren.length >= 0)
      if (!targetIsLeaf && targetNode.allowDrop !== false) {
        return true // 允许拖入子目录
      }
    }

    // 目标是根级别或其他有效位置
    if (related) {
      const relNode = treeDrag.getNodeFromEl(related)
      if (dragNode && relNode) {
        return treeDrag.canNodeDrop(relNode, dragNode)
      }
    }
    return true
  }

  // 同容器内排序：使用原有逻辑
  if (!related) return true
  if (!dragNode) return true
  const relatedTargetNode = treeDrag.getNodeFromEl(related)
  if (!relatedTargetNode) return true
  return treeDrag.canNodeDrop(relatedTargetNode, dragNode)
}
</script>

<template>
  <li class="tree-item relative" :class="[nodeClass, { 'w-full': blockNode }]" role="treeitem"
    :aria-expanded="!isLeaf && isExpanded" :data-node-key="getNodeKey(node)" :title="nodeTitle">
    <div :style="[nodeStyle, { paddingLeft: `${level * 16}px` }]" :class="cn(
      'tree-item-content flex items-center gap-1 h-8 px-2 rounded cursor-pointer transition-colors select-none',
      'hover:bg-gray-50 dark:hover:bg-gray-800',
      isCurrent && 'bg-primary/10 dark:bg-primary/20',
      isActuallyDisabled && !nodeChildren.length && 'opacity-50 cursor-not-allowed pointer-events-none',
      isActuallyDisabled && nodeChildren.length > 0 && 'opacity-50 cursor-not-allowed',
      blockNode && 'w-full'
    )" @click="handleClick">
      <button v-if="canDrag" type="button"
        class="drag-handle flex items-center justify-center w-5 h-5 rounded opacity-50 hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all cursor-grab active:cursor-grabbing"
        @click.stop>
        <GripVertical class="w-3 h-3 text-gray-400 pointer-events-none" />
      </button>
      <span v-else-if="!isLeaf" class="w-5" />

      <button v-if="!isLeaf" type="button" :class="cn(
        'flex items-center justify-center w-5 h-5 rounded transition-colors',
        'hover:bg-gray-200 dark:hover:bg-gray-700',
        isActuallyDisabled && 'opacity-70',
        isNodeLoading && 'cursor-wait'
      )" @click="handleExpandClick" aria-label="Toggle expand">
        <slot name="switcher-icon">
          <Loader2 v-if="isNodeLoading" class="w-4 h-4 text-gray-400 animate-spin" />
          <template v-else>
            <ChevronDown v-if="isExpanded" class="w-4 h-4 text-gray-500" />
            <ChevronRight v-else class="w-4 h-4 text-gray-500" />
          </template>
        </slot>
      </button>
      <span v-else class="w-5" />

      <div v-if="shouldShowCheckbox" class="w-4">
        <TreeCheckbox :checked="isChecked" :indeterminate="isHalfChecked" :disabled="isCheckboxDisabled"
          @change="handleCheckboxChange" />
      </div>
      <span v-else class="w-4" />

      <component v-if="getIcon()" :is="getIcon()" :class="cn(
        'w-4 h-4',
        isLeaf ? 'text-gray-400' : 'text-yellow-500'
      )" />
      <span v-else-if="showIcon" class="w-5" />

      <span :class="cn(
        'text-sm flex-1 min-w-0 truncate',
        isCurrent && 'text-primary font-medium',
        isActuallyDisabled && 'text-gray-400'
      )">
        <slot name="label" :node="node">{{ label }}</slot>
      </span>

      <!-- 自定义 slot 内容：禁用状态下阻止所有交互 -->
      <div v-if="!isActuallyDisabled" @click.stop>
        <slot :node="node" />
      </div>
    </div>

    <!-- 场景1&3：如果子区域未被锁定，则使用 VueDraggable 支持拖拽 -->
    <VueDraggable
      v-if="draggable && !isLeaf && isExpanded && nodeChildren.length > 0 && !isLocked && !props.node.lockChildren"
      v-model="nodeChildren" :group="{ name: 'tree', pull: containerCanDrag, put: containerCanPut }" :animation="200"
      handle=".drag-handle" tag="ul" :class="cn('list-none m-0 pl-4', blockNode && 'w-full')" role="group"
      @start="onDragStart" @end="onDragEnd" @move="onDragMove">
      <TreeItem v-for="child in nodeChildren" :key="childKey(child)" :node="child" :level="level + 1"
        :is-expanded="isChildExpanded(child)" :is-checked="isChildChecked(child)"
        :is-half-checked="isChildHalfChecked(child)" :is-leaf="isChildLeaf(child)" :is-current="isChildCurrent(child)"
        :show-checkbox="showCheckbox" :disabled="child.disabled || false" :show-icon="showIcon" :block-node="blockNode"
        :draggable="draggable" :expanded-keys="expandedKeys" :checked-keys="checkedKeys"
        :half-checked-keys="halfCheckedKeys" :current-node-key="currentNodeKey" :highlight-current="highlightCurrent"
        :field-names="props.fieldNames" :node-key="nodeKey" :parent-locked="isLocked || !!props.node.lockChildren"
        @toggle-expand="$emit('toggle-expand', $event)" @toggle-check="$emit('toggle-check', $event)"
        @node-click="$emit('node-click', $event)" />
    </VueDraggable>

    <!-- 场景3：锁定状态或非拖拽模式 -->
    <ul v-else-if="!isLeaf && isExpanded && nodeChildren.length > 0"
      :class="cn('list-none m-0 pl-4', blockNode && 'w-full')" role="group">
      <TreeItem v-for="child in nodeChildren" :key="childKey(child)" :node="child" :level="level + 1"
        :is-expanded="isChildExpanded(child)" :is-checked="isChildChecked(child)"
        :is-half-checked="isChildHalfChecked(child)" :is-leaf="isChildLeaf(child)" :is-current="isChildCurrent(child)"
        :show-checkbox="showCheckbox" :disabled="child.disabled || false" :show-icon="showIcon" :block-node="blockNode"
        :draggable="draggable" :expanded-keys="expandedKeys" :checked-keys="checkedKeys"
        :half-checked-keys="halfCheckedKeys" :current-node-key="currentNodeKey" :highlight-current="highlightCurrent"
        :field-names="props.fieldNames" :node-key="nodeKey" :parent-locked="isLocked || !!props.node.lockChildren"
        @toggle-expand="$emit('toggle-expand', $event)" @toggle-check="$emit('toggle-check', $event)"
        @node-click="$emit('node-click', $event)" />
    </ul>
  </li>
</template>

<style scoped>
.tree-item {
  user-select: none;
}
</style>
