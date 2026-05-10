import { computed } from 'vue'
import type { TreeNode, TreeProps } from './types'
import { getPropValue, getNodeKey, findNode } from './utils'

export function useDrag(props: TreeProps, emit: (e: string, ...args: unknown[]) => void) {
  function nodeKey(node: TreeNode): string | number {
    return getNodeKey(node, props.nodeKey, props.fieldNames)
  }

  function childKey(node: TreeNode): string {
    return `${nodeKey(node)}-${getPropValue(node, 'parentId') ?? 'root'}`
  }

  function isDescendant(ancestor: TreeNode, descendant: TreeNode): boolean {
    const children = getPropValue(ancestor, 'children', props.fieldNames) as TreeNode[] || []
    const dKey = nodeKey(descendant)
    for (const child of children) {
      if (nodeKey(child) === dKey) return true
      if (isDescendant(child, descendant)) return true
    }
    return false
  }

  function canNodeDrag(node: TreeNode): boolean {
    node.disabled = node.disabled ?? false
    if (node.disabled) return false
    if (props?.allowDrag) {
      if (node?.allowDrag !== undefined) return node.allowDrag
      if (typeof props?.allowDrag === 'function') return props.allowDrag(node)
      if (typeof props?.allowDrag === 'boolean') return props.allowDrag
    }
    return true
  }

  function canNodeDrop(targetNode: TreeNode, dragNode: TreeNode): boolean {
    if (dragNode === targetNode) return false
    if (isDescendant(dragNode, targetNode)) return false
    if (targetNode.allowDrop === false) return false
    return true
  }

  function removeFromParent(node: TreeNode) {
    const pid = getPropValue(node, 'parentId') as string | number | undefined
    if (pid === undefined) {
      const idx = props.data.indexOf(node)
      if (idx > -1) props.data.splice(idx, 1)
      return
    }
    const parent = findNode(props.data, pid, props.nodeKey, props.fieldNames)
    if (!parent) return
    const children = getPropValue(parent, 'children', props.fieldNames) as TreeNode[] | undefined
    if (!children) return
    const idx = children.indexOf(node)
    if (idx > -1) children.splice(idx, 1)
  }

  function moveInArray(arr: TreeNode[], fromIdx: number, toIdx: number) {
    const [moved] = arr.splice(fromIdx, 1)
    arr.splice(toIdx, 0, moved)
  }

  function processDragEnd(
    dragKey: string | number,
    fromParentKey: string | number | undefined,
    toParentKey: string | number | undefined,
    _oldIndex: number,
    newIndex: number,
  ) {
    const sourceNode = findNode(props.data, dragKey, props.nodeKey, props.fieldNames)
    if (!sourceNode) return false

    if (fromParentKey === toParentKey) {
      const targetArr = fromParentKey !== undefined
        ? (getPropValue(
          findNode(props.data, fromParentKey, props.nodeKey, props.fieldNames)!,
          'children',
          props.fieldNames,
        ) as TreeNode[]) || []
        : props.data
      const dataOldIdx = targetArr.indexOf(sourceNode)
      if (dataOldIdx === -1 || dataOldIdx === newIndex) return false
      moveInArray(targetArr, dataOldIdx, newIndex)
      emit('drag-end', sourceNode, null as any)
      return true
    }

    removeFromParent(sourceNode)
    const targetArr = toParentKey !== undefined
      ? (getPropValue(
        findNode(props.data, toParentKey, props.nodeKey, props.fieldNames)!,
        'children',
        props.fieldNames,
      ) as TreeNode[]) || []
      : props.data
    targetArr.splice(newIndex, 0, sourceNode)
    sourceNode.parentId = toParentKey
    emit('drop', sourceNode, null as any)
    emit('drag-end', sourceNode, null as any)
    return true
  }

  function resolveContainerParent(container: HTMLElement): { key: string | number; isRoot: boolean } | null {
    const parentLi = container.parentElement?.closest('li.tree-item') as HTMLElement | null
    if (parentLi) {
      const key = parentLi.getAttribute('data-node-key')
      if (key) return { key, isRoot: false }
    }
    return { key: 'root', isRoot: true }
  }

  function getNodeFromEl(el: HTMLElement): TreeNode | undefined {
    const key = el.getAttribute('data-node-key')
    if (!key) return undefined
    return findNode(props.data, key, props.nodeKey, props.fieldNames)
  }

  function emitDragStart(node: TreeNode) {
    emit('drag-start', node, null as any)
  }

  function updateParentId(dragKey: string | number, newParentKey: string | number | undefined) {
    const sourceNode = findNode(props.data, dragKey, props.nodeKey, props.fieldNames)
    if (sourceNode) {
      sourceNode.parentId = newParentKey
    }
  }

  function handleDragEnd(
    dragKey: string | number,
    fromParentKey: string | number | undefined,
    toParentKey: string | number | undefined
  ) {
    const sourceNode = findNode(props.data, dragKey, props.nodeKey, props.fieldNames)
    if (!sourceNode) return

    if (fromParentKey !== toParentKey) {
      sourceNode.parentId = toParentKey
      emit('drop', sourceNode, null as any)
    }
    emit('drag-end', sourceNode, null as any)
  }

  const treeDrag = {
    draggable: computed(() => props.draggable),
    canNodeDrag,
    canNodeDrop,
    processDragEnd,
    resolveContainerParent,
    getNodeFromEl,
    nodeKey,
    childKey,
    emitDragStart,
    updateParentId,
    handleDragEnd,
  }

  return {
    treeDrag,
    childKey,
    removeFromParent,
  }
}
