<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { ChevronDown, X, Search } from 'lucide-vue-next'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tree } from '@/components/tree'
import { cn } from '@/lib/utils'
import { findNode, getNodeKey, getPropValue } from '@/components/tree/utils'
import type { TreeNode } from '@/components/tree'
import type { TreeSelectProps, TreeSelectEmits } from './types'

const props = withDefaults(defineProps<TreeSelectProps>(), {
  modelValue: undefined,
  multiple: false,
  disabled: false,
  placeholder: '请选择',
  nodeKey: 'id',
  checkStrictly: false,
  showCheckbox: undefined,
  defaultExpandAll: false,
  defaultExpandedKeys: () => [],
  fieldNames: () => ({
    label: 'label',
    key: 'id',
    children: 'children',
  }),
  clearable: false,
  accordion: false,
  highlightCurrent: true,
  autoExpandParent: true,
  size: 'default',
  renderAfterExpand: true,
  lazy: false,
})

const emit = defineEmits<TreeSelectEmits>()

const popoverOpen = ref(false)
const treeRef = ref<InstanceType<typeof Tree> | null>(null)
const filterText = ref('')

const showCheckbox = computed(() => {
  if (props.showCheckbox !== undefined) return props.showCheckbox
  return props.multiple
})

const selectedKeys = computed<(string | number)[]>(() => {
  if (props.multiple) {
    return (props.modelValue as (string | number)[]) || []
  }
  const val = props.modelValue as string | number | undefined
  return val !== undefined && val !== '' ? [val] : []
})

function resolveKey(node: TreeNode): string | number {
  return getNodeKey(node, props.nodeKey, props.fieldNames)
}

function isLeafNode(node: TreeNode): boolean {
  if ('isLeaf' in node) return !!node.isLeaf
  const children = getPropValue(node, 'children', props.fieldNames) as TreeNode[] | undefined
  return !children || children.length === 0
}

function resolveNodeLabel(node: TreeNode): string {
  return (getPropValue(node, 'label', props.fieldNames) as string) || node.label || ''
}

const selectedNodes = computed<TreeNode[]>(() => {
  return selectedKeys.value
    .map(key => findNode(props.data, key, props.nodeKey, props.fieldNames))
    .filter((n): n is TreeNode => n !== undefined)
})

const displayText = computed(() => {
  if (selectedNodes.value.length === 0) return ''
  return selectedNodes.value.map(n => resolveNodeLabel(n)).join('，')
})

const showClearButton = computed(() => {
  if (!props.clearable || props.disabled) return false
  return selectedKeys.value.length > 0
})

function collectParentKeys(nodes: TreeNode[], targetKey: string | number): (string | number)[] {
  const keys: (string | number)[] = []
  function walk(searchNodes: TreeNode[]): boolean {
    for (const node of searchNodes) {
      const children = getPropValue(node, 'children', props.fieldNames) as TreeNode[] | undefined
      if (!children) continue
      for (const child of children) {
        if (String(resolveKey(child)) === String(targetKey)) {
          keys.push(resolveKey(node))
          return true
        }
      }
      if (walk(children)) {
        keys.push(resolveKey(node))
        return true
      }
    }
    return false
  }
  walk(nodes)
  return keys
}

const effectiveExpandedKeys = computed<(string | number)[]>(() => {
  const base = [...props.defaultExpandedKeys]
  if (!props.autoExpandParent || props.multiple || props.defaultExpandAll) return base

  const val = props.modelValue as string | number | undefined
  if (val === undefined || val === '') return base

  const parentKeys = collectParentKeys(props.data, val)
  const merged = new Set([...base, ...parentKeys])
  return [...merged]
})

function filterDisabledKeys(keys: (string | number)[]): (string | number)[] {
  return keys.filter(key => {
    const node = findNode(props.data, key, props.nodeKey, props.fieldNames)
    if (!node) return false
    return !(node.disabled || false)
  })
}

const effectiveCheckedKeys = computed<(string | number)[]>(() => {
  return filterDisabledKeys(selectedKeys.value)
})

function emitValue(val: string | number | (string | number)[]) {
  if (JSON.stringify(val) === JSON.stringify(props.modelValue)) return
  emit('update:modelValue', val)
  emit('change', val)
}

function handleNodeClick(node: TreeNode) {
  if (props.disabled) return
  const disabled = node.disabled || false
  if (disabled) return

  if (props.multiple || showCheckbox.value) return

  emitValue(resolveKey(node))
  nextTick(() => { popoverOpen.value = false })

  emit('node-click', node, null)
}

function handleCheckChange(_node: TreeNode, _checked: boolean, checkedKeys: (string | number)[]) {
  if (props.disabled) return
  if (props.multiple) {
    emitValue(filterDisabledKeys(checkedKeys))
  }
}

function handleCheck(_node: TreeNode, checked: boolean, _nodeEl: unknown) {
  if (props.disabled) return
  if (!props.multiple && showCheckbox.value) {
    if (checked) {
      emitValue(resolveKey(_node))
    } else {
      emitValue('')
    }
  }
}

function removeTag(key: string | number, e: Event) {
  e.stopPropagation()
  const newKeys = selectedKeys.value.filter(k => k !== key)
  emitValue(newKeys)
  emit('remove-tag', key)
}

function clearAll(e: Event) {
  e.stopPropagation()
  emitValue(props.multiple ? [] : '')
}

async function handleNodeExpand(node: TreeNode, expanded: boolean, _el: unknown) {
  if (expanded) {
    emit('node-expand', node, expanded, null)
    if (props.lazy && props.loadData && !isLeafNode(node)) {
      const children = getPropValue(node, 'children', props.fieldNames) as TreeNode[] | undefined
      if (!children || children.length === 0) {
        const key = resolveKey(node)
        treeRef.value?.setLoading(key, true)
        try {
          await props.loadData(node)
        } finally {
          treeRef.value?.setLoading(key, false)
        }
      }
    }
  } else {
    emit('node-collapse', node, null)
  }
}

function handlePopoverChange(open: boolean) {
  popoverOpen.value = open
  emit('visible-change', open)
  if (!open) {
    filterText.value = ''
    treeRef.value?.filter('')
  }
}

function handleFilterInput() {
  const method = props.filterMethod || props.filterNodeMethod
  treeRef.value?.filter(filterText.value, method)
}

defineExpose({
  treeRef: computed(() => treeRef.value),
  selectRef: computed(() => treeRef.value),
  get isOpen() { return popoverOpen.value },
  get selectedKeys() { return [...selectedKeys.value] },
})
</script>

<template>
  <Popover v-model:open="popoverOpen" @update:open="handlePopoverChange">
    <PopoverTrigger as-child>
      <button type="button" role="combobox" :aria-expanded="popoverOpen" :data-size="size" :disabled="disabled"
        :style="style" :class="cn(
          'border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*=\'text-\'])]:text-muted-foreground',
          'focus-visible:border-ring focus-visible:ring-ring/50',
          'flex w-[240px] items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs',
          'transition-[color,box-shadow] outline-none focus-visible:ring-[3px]',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'data-[size=default]:h-9 data-[size=sm]:h-8',
          '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=\'size-\'])]:size-4',
          props.class,
        )">
        <span v-if="selectedKeys.length === 0" class="text-muted-foreground">
          {{ placeholder }}
        </span>

        <div v-else-if="multiple" class="flex flex-wrap items-center gap-1 max-w-[280px] overflow-hidden">
          <span v-for="(node, index) in selectedNodes.slice(0, 3)" :key="selectedKeys[index]"
            class="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-xs">
            <span class="max-w-[80px] truncate">{{ resolveNodeLabel(node) }}</span>
            <button type="button" class="pointer-events-auto rounded-sm hover:bg-accent hover:text-accent-foreground"
              @click="removeTag(selectedKeys[index], $event)">
              <X class="size-3" />
            </button>
          </span>
          <span v-if="selectedNodes.length > 3" class="text-xs text-muted-foreground">
            +{{ selectedNodes.length - 3 }}
          </span>
        </div>

        <span v-else class="line-clamp-1">
          {{ displayText }}
        </span>

        <div class="flex items-center gap-1">
          <button v-if="showClearButton" type="button"
            class="pointer-events-auto rounded-sm hover:bg-accent hover:text-accent-foreground" @click="clearAll">
            <X class="size-4" />
          </button>
          <ChevronDown class="size-4 opacity-50 shrink-0" />
        </div>
      </button>
    </PopoverTrigger>

    <PopoverContent align="start" :side-offset="4" class="w-[var(--reka-popover-trigger-width)] min-w-[8rem] p-0">
      <div v-if="filterMethod || filterNodeMethod" class="flex items-center border-b px-3 py-2">
        <Search class="size-4 text-muted-foreground mr-2 shrink-0" />
        <input v-model="filterText" type="text"
          class="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" placeholder="搜索..."
          @input="handleFilterInput">
      </div>

      <div class="max-h-[320px] overflow-y-auto p-1">
        <Tree ref="treeRef" :data="data" :node-key="nodeKey" :show-checkbox="showCheckbox"
          :check-strictly="checkStrictly" :highlight-current="highlightCurrent && !multiple && !showCheckbox"
          :show-icon="false" :default-expand-all="defaultExpandAll" :default-expanded-keys="effectiveExpandedKeys"
          :default-checked-keys="effectiveCheckedKeys" :accordion="accordion" :block-node="false"
          :field-names="fieldNames" @node-click="handleNodeClick" @check="handleCheck" @check-change="handleCheckChange"
          @expand="handleNodeExpand">
          <template v-if="$slots.default" #default="{ node }">
            <slot :node="node" />
          </template>
        </Tree>
      </div>
    </PopoverContent>
  </Popover>
</template>
