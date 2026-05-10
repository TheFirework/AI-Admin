import { ref, watch } from 'vue'
import type { TreeNode, TreeProps } from './types'
import { getPropValue, getNodeKey, findSiblings } from './utils'

export function useExpand(props: TreeProps, emit: (e: string, ...args: unknown[]) => void) {
  const expandedKeys = ref<(string | number)[]>([...props.defaultExpandedKeys])

  function expandAll(nodes: TreeNode[]) {
    nodes.forEach(node => {
      const key = getNodeKey(node, props.nodeKey, props.fieldNames)
      if (!expandedKeys.value.includes(key)) {
        expandedKeys.value.push(key)
      }
      const children = getPropValue(node, 'children', props.fieldNames) as TreeNode[]
      if (children && children.length > 0) {
        expandAll(children)
      }
    })
  }

  function toggleExpand(node: TreeNode) {
    const key = getNodeKey(node, props.nodeKey, props.fieldNames)
    const index = expandedKeys.value.indexOf(key)

    if (props.accordion && index === -1) {
      const parentKey = node.parentId
      const siblings = findSiblings(props.data, node, props.nodeKey, props.fieldNames)
      siblings.forEach(sibling => {
        const siblingKey = getNodeKey(sibling, props.nodeKey, props.fieldNames)
        const idx = expandedKeys.value.indexOf(siblingKey)
        if (idx > -1) {
          expandedKeys.value.splice(idx, 1)
          emit('collapse', sibling, null)
        }
      })
    }

    if (index > -1) {
      expandedKeys.value.splice(index, 1)
      emit('expand-change', node, false, expandedKeys.value)
      emit('collapse', node, null)
    } else {
      expandedKeys.value.push(key)
      emit('expand-change', node, true, expandedKeys.value)
      emit('expand', node, true, null)
    }
  }

  function isExpanded(node: TreeNode): boolean {
    return expandedKeys.value.includes(getNodeKey(node, props.nodeKey, props.fieldNames))
  }

  watch(() => props.defaultExpandAll, (val) => {
    if (val) {
      expandAll(props.data)
    }
  }, { immediate: true })

  return {
    expandedKeys,
    expandAll,
    toggleExpand,
    isExpanded
  }
}
