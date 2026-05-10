<script setup lang="ts">
import { computed, inject } from 'vue'
import { ChevronRight, ChevronDown, Folder, FolderOpen, File, GripVertical } from 'lucide-vue-next'
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

const canDrag = computed(() => {
  if (!props.draggable) return false
  if (props.disabled) return false
  if (treeDrag) return treeDrag.canNodeDrag(props.node)
  return true
})

const shouldShowCheckbox = computed(() => {
  if (!props.showCheckbox) return false
  const checkable = props.node.checkable as boolean | undefined
  if (checkable !== undefined) return checkable
  return true
})

const isCheckboxDisabled = computed(() => {
  if (props.disabled) return true
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
  const isLeafProp = node.isLeaf as boolean | undefined
  const childrenKey = props.fieldNames?.children || 'children'
  const childNodes = node[childrenKey] as TreeNode[] | undefined
  return !!isLeafProp || !childNodes || childNodes.length === 0
}
function isChildCurrent(node: TreeNode): boolean {
  return props.highlightCurrent && props.currentNodeKey === getNodeKey(node)
}

function handleExpandClick(e: MouseEvent) {
  e.stopPropagation()
  emit('toggle-expand', props.node)
}

function handleCheckboxChange() {
  if (props.disabled) return
  emit('toggle-check', props.node)
}

function handleClick() {
  if (props.disabled) return
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
  if (!treeDrag) return false
  const dragged = evt.dragged as HTMLElement | undefined
  const related = evt.related as HTMLElement | undefined
  if (!dragged || !related) return true
  const dragNode = treeDrag.getNodeFromEl(dragged)
  const targetNode = treeDrag.getNodeFromEl(related)
  if (!dragNode || !targetNode) return true
  return treeDrag.canNodeDrop(targetNode, dragNode)
}
</script>

<template>
  <li class="tree-item relative" :class="[nodeClass, { 'w-full': blockNode }]" role="treeitem"
    :aria-expanded="!isLeaf && isExpanded" :data-node-key="getNodeKey(node)" :title="nodeTitle">
    <div :style="[nodeStyle, { paddingLeft: `${level * 16}px` }]" :class="cn(
      'tree-item-content flex items-center gap-1 h-8 px-2 rounded cursor-pointer transition-colors select-none',
      'hover:bg-gray-50 dark:hover:bg-gray-800',
      isCurrent && 'bg-primary/10 dark:bg-primary/20',
      disabled && 'opacity-50 cursor-not-allowed',
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
        disabled && 'cursor-not-allowed'
      )" @click="handleExpandClick" aria-label="Toggle expand">
        <slot name="switcher-icon">
          <ChevronDown v-if="isExpanded" class="w-4 h-4 text-gray-500" />
          <ChevronRight v-else class="w-4 h-4 text-gray-500" />
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
      <span v-else-if="showIcon" class="w-4" />

      <span :class="cn(
        'text-sm flex-1 min-w-0 truncate',
        isCurrent && 'text-primary font-medium',
        disabled && 'text-gray-400'
      )">
        <slot name="label" :node="node">{{ label }}</slot>
      </span>

      <slot :node="node" />
    </div>

    <VueDraggable v-if="draggable && !isLeaf && isExpanded && nodeChildren.length > 0" v-model="nodeChildren"
      :group="{ name: 'tree', pull: true, put: true }" :animation="200" handle=".drag-handle" tag="ul"
      :class="cn('list-none m-0 pl-4', blockNode && 'w-full')" role="group" @start="onDragStart" @end="onDragEnd"
      @move="onDragMove">
      <TreeItem v-for="child in nodeChildren" :key="childKey(child)" :node="child" :level="level + 1"
        :is-expanded="isChildExpanded(child)" :is-checked="isChildChecked(child)"
        :is-half-checked="isChildHalfChecked(child)" :is-leaf="isChildLeaf(child)" :is-current="isChildCurrent(child)"
        :show-checkbox="showCheckbox" :disabled="!!getPropValue(child, 'disabled', props.fieldNames)"
        :show-icon="showIcon" :block-node="blockNode" :draggable="draggable" :expanded-keys="expandedKeys"
        :checked-keys="checkedKeys" :half-checked-keys="halfCheckedKeys" :current-node-key="currentNodeKey"
        :highlight-current="highlightCurrent" :field-names="props.fieldNames" :node-key="nodeKey"
        @toggle-expand="$emit('toggle-expand', $event)" @toggle-check="$emit('toggle-check', $event)"
        @node-click="$emit('node-click', $event)" />
    </VueDraggable>

    <ul v-else-if="!isLeaf && isExpanded && nodeChildren.length > 0"
      :class="cn('list-none m-0 pl-4', blockNode && 'w-full')" role="group">
      <TreeItem v-for="child in nodeChildren" :key="childKey(child)" :node="child" :level="level + 1"
        :is-expanded="isChildExpanded(child)" :is-checked="isChildChecked(child)"
        :is-half-checked="isChildHalfChecked(child)" :is-leaf="isChildLeaf(child)" :is-current="isChildCurrent(child)"
        :show-checkbox="showCheckbox" :disabled="!!getPropValue(child, 'disabled', props.fieldNames)"
        :show-icon="showIcon" :block-node="blockNode" :draggable="draggable" :expanded-keys="expandedKeys"
        :checked-keys="checkedKeys" :half-checked-keys="halfCheckedKeys" :current-node-key="currentNodeKey"
        :highlight-current="highlightCurrent" :field-names="props.fieldNames" :node-key="nodeKey"
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
