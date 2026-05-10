<script setup lang="ts">
import { ref, computed, provide, onMounted, nextTick } from 'vue'
import { cn } from '@/lib/utils'
import TreeItem from './TreeItem.vue'
import { VueDraggable } from 'vue-draggable-plus'
import type { TreeProps, TreeEmits, TreeNode } from './types'
import { getPropValue, getNodeKey, findNode, filterTree, setParentIds } from './utils'
import { useCheckbox } from './useCheckbox'
import { useExpand } from './useExpand'
import { useDrag } from './useDrag'

const props = withDefaults(defineProps<TreeProps>(), {
  showCheckbox: false,
  checkStrictly: false,
  highlightCurrent: false,
  defaultExpandAll: false,
  accordion: false,
  showIcon: true,
  blockNode: false,
  draggable: false,
  nodeKey: 'id',
  defaultExpandedKeys: () => [],
  defaultCheckedKeys: () => [],
  fieldNames: () => ({
    label: 'label',
    key: 'id',
    children: 'children'
  }),
  disabled: false, // 组件级禁用默认值
  lockChildren: false, // 组件级锁定默认值
})

const emit = defineEmits<TreeEmits>()
const hookEmit = emit as (e: string, ...args: unknown[]) => void
const { checkedKeys, halfCheckedKeys, toggleCheck, recalculateHalfChecked } = useCheckbox(props, hookEmit)
const { expandedKeys, toggleExpand, isExpanded } = useExpand(props, hookEmit)
const { treeDrag, childKey, removeFromParent } = useDrag(props, hookEmit)

provide('treeDrag', treeDrag)

// 注入组件级别状态（供所有 TreeItem 子组件使用）
provide('treeDisabled', computed(() => props.disabled))
provide('treeLockChildren', computed(() => props.lockChildren))

const treeContainerRef = ref<HTMLElement | null>(null)
const currentNodeKey = ref<string | number | null>(null)
const filterText = ref('')
const filterNodeMethod = ref<((value: string, data: TreeNode) => boolean) | null>(null)

const filteredData = computed({
  get() {
    if (!filterText.value && !filterNodeMethod.value) {
      return props.data
    }
    return filterTree(props.data, filterText.value, filterNodeMethod.value!)
  },
  set(val: TreeNode[]) {
    if (!filterText.value && !filterNodeMethod.value) {
      props.data.length = 0
      props.data.push(...val)
    }
  }
})

function isChecked(node: TreeNode): boolean {
  return checkedKeys.value.includes(getNodeKey(node, props.nodeKey, props.fieldNames))
}
function isHalfChecked(node: TreeNode): boolean {
  return halfCheckedKeys.value.includes(getNodeKey(node, props.nodeKey, props.fieldNames))
}
function isLeaf(node: TreeNode): boolean {
  const isLeafProp = getPropValue(node, 'isLeaf', props.fieldNames) as boolean | undefined
  const children = getPropValue(node, 'children', props.fieldNames) as TreeNode[]
  return !!isLeafProp || !children || children.length === 0
}
function isCurrent(node: TreeNode): boolean {
  if (!props.highlightCurrent) return false
  return currentNodeKey.value === getNodeKey(node, props.nodeKey, props.fieldNames)
}

function handleNodeClick(node: TreeNode) {
  const disabled = getPropValue(node, 'disabled', props.fieldNames) as boolean
  if (disabled) return
  const oldCurrentNode = currentNodeKey.value
    ? (findNode(props.data, currentNodeKey.value, props.nodeKey, props.fieldNames) || null)
    : null
  if (props.highlightCurrent) {
    currentNodeKey.value = getNodeKey(node, props.nodeKey, props.fieldNames)
  }
  emit('node-click', node, null)
  emit('current-change', node, oldCurrentNode)
}

function filter(value: string, filterMethod?: (value: string, data: TreeNode) => boolean) {
  filterText.value = value
  if (filterMethod) filterNodeMethod.value = filterMethod
}

function getCheckedNodes(): TreeNode[] {
  const nodes: TreeNode[] = []
  function collectChecked(node: TreeNode) {
    if (checkedKeys.value.includes(getNodeKey(node, props.nodeKey, props.fieldNames))) {
      nodes.push(node)
    }
    const children = getPropValue(node, 'children', props.fieldNames) as TreeNode[]
    if (children) children.forEach(child => collectChecked(child))
  }
  props.data.forEach(node => collectChecked(node))
  return nodes
}
function getCheckedKeys(): (string | number)[] { return [...checkedKeys.value] }
function setChecked(key: string | number) {
  const node = findNode(props.data, key, props.nodeKey, props.fieldNames)
  if (node) toggleCheck(node)
}
function append(node: TreeNode, parentId: string | number) {
  const parent = findNode(props.data, parentId, props.nodeKey, props.fieldNames)
  if (parent) {
    parent.children = [...(parent.children || []), node]
  }
}
function remove(key: string | number) {
  const node = findNode(props.data, key, props.nodeKey, props.fieldNames)
  if (node) removeFromParent(node)
}
function insertBefore(node: TreeNode, refKey: string | number) {
  const refNode = findNode(props.data, refKey, props.nodeKey, props.fieldNames)
  if (refNode && refNode.parentId !== undefined) {
    const parent = findNode(props.data, refNode.parentId, props.nodeKey, props.fieldNames)
    if (parent && parent.children) {
      const idx = parent.children.indexOf(refNode)
      if (idx > -1) parent.children.splice(idx, 0, node)
    }
  }
}
function insertAfter(node: TreeNode, refKey: string | number) {
  const refNode = findNode(props.data, refKey, props.nodeKey, props.fieldNames)
  if (refNode && refNode.parentId !== undefined) {
    const parent = findNode(props.data, refNode.parentId, props.nodeKey, props.fieldNames)
    if (parent && parent.children) {
      const idx = parent.children.indexOf(refNode)
      if (idx > -1) parent.children.splice(idx + 1, 0, node)
    }
  }
}

onMounted(() => {
  nextTick(() => {
    setParentIds(props.data, undefined, props.nodeKey, props.fieldNames)
    if (!props.checkStrictly && checkedKeys.value.length > 0) {
      recalculateHalfChecked(props.data)
    }
  })
})

defineExpose({ filter, getCheckedNodes, getCheckedKeys, setChecked, append, remove, insertBefore, insertAfter })
provide('treeProps', props)

function onRootDragStart() {
  // 根级拖拽开始事件由子级 @start 触发
}

function onRootDragEnd(evt: any) {
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

function onRootDragMove(evt: any) {
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
  <div ref="treeContainerRef" :class="cn(
    'tree-container list-none m-0 p-0 w-full',
    height && `max-h-${height} overflow-y-auto`
  )" role="tree">
    <VueDraggable v-if="draggable" v-model="filteredData" :group="{ name: 'tree', pull: true, put: true }"
      :animation="200" handle=".drag-handle" tag="ul" class="list-none m-0 p-0" ghost-class="opacity-50"
      @start="onRootDragStart" @end="onRootDragEnd" @move="onRootDragMove">
      <TreeItem v-for="node in filteredData" :key="childKey(node)" :node="node" :level="0"
        :is-expanded="isExpanded(node)" :is-checked="isChecked(node)" :is-half-checked="isHalfChecked(node)"
        :is-leaf="isLeaf(node)" :is-current="isCurrent(node)" :show-checkbox="showCheckbox"
        :disabled="!!getPropValue(node, 'disabled', props.fieldNames)" :show-icon="showIcon" :block-node="blockNode"
        :draggable="draggable" :expanded-keys="expandedKeys" :checked-keys="checkedKeys"
        :half-checked-keys="halfCheckedKeys" :current-node-key="currentNodeKey" :highlight-current="highlightCurrent"
        :field-names="props.fieldNames" :node-key="nodeKey" @toggle-expand="toggleExpand" @toggle-check="toggleCheck"
        @node-click="handleNodeClick">
        <template #default="{ node }">
          <slot :node="node" />
        </template>
      </TreeItem>
    </VueDraggable>
    <ul v-else class="list-none m-0 p-0">
      <TreeItem v-for="node in filteredData" :key="childKey(node)" :node="node" :level="0"
        :is-expanded="isExpanded(node)" :is-checked="isChecked(node)" :is-half-checked="isHalfChecked(node)"
        :is-leaf="isLeaf(node)" :is-current="isCurrent(node)" :show-checkbox="showCheckbox"
        :disabled="!!getPropValue(node, 'disabled', props.fieldNames)" :show-icon="showIcon" :block-node="blockNode"
        :draggable="draggable" :expanded-keys="expandedKeys" :checked-keys="checkedKeys"
        :half-checked-keys="halfCheckedKeys" :current-node-key="currentNodeKey" :highlight-current="highlightCurrent"
        :field-names="props.fieldNames" :node-key="nodeKey" @toggle-expand="toggleExpand" @toggle-check="toggleCheck"
        @node-click="handleNodeClick">
        <template #default="{ node }">
          <slot :node="node" />
        </template>
      </TreeItem>
    </ul>
  </div>
</template>
