import { ref, watch } from 'vue'
import type { TreeNode, TreeProps } from './types'
import { getPropValue, getNodeKey, findNode } from './utils'

export function useCheckbox(props: TreeProps, emit: (e: string, ...args: unknown[]) => void) {
  const checkedKeys = ref<(string | number)[]>([...props.defaultCheckedKeys])
  const halfCheckedKeys = ref<(string | number)[]>([])

  function checkNode(node: TreeNode) {
    const key = getNodeKey(node, props.nodeKey, props.fieldNames)
    if (!checkedKeys.value.includes(key)) {
      checkedKeys.value.push(key)
    }

    const halfIndex = halfCheckedKeys.value.indexOf(key)
    if (halfIndex > -1) {
      halfCheckedKeys.value.splice(halfIndex, 1)
    }

    const children = getPropValue(node, 'children', props.fieldNames) as TreeNode[]
    if (children) {
      children.forEach(child => checkNode(child))
    }
  }

  function uncheckNode(node: TreeNode) {
    const key = getNodeKey(node, props.nodeKey, props.fieldNames)
    checkedKeys.value = checkedKeys.value.filter(id => id !== key)

    const halfIndex = halfCheckedKeys.value.indexOf(key)
    if (halfIndex > -1) {
      halfCheckedKeys.value.splice(halfIndex, 1)
    }

    const children = getPropValue(node, 'children', props.fieldNames) as TreeNode[]
    if (children) {
      children.forEach(child => uncheckNode(child))
    }
  }

  function updateParentChecked(nodes: TreeNode[], parentId: string | number | undefined) {
    if (!parentId) return

    const parent = findNode(nodes, parentId, props.nodeKey, props.fieldNames)
    if (!parent) return

    const children = getPropValue(parent, 'children', props.fieldNames) as TreeNode[] || []
    const checkedChildCount = children.filter(child =>
      checkedKeys.value.includes(getNodeKey(child, props.nodeKey, props.fieldNames)) &&
      !halfCheckedKeys.value.includes(getNodeKey(child, props.nodeKey, props.fieldNames))
    ).length

    const halfCheckedChildCount = children.filter(child =>
      halfCheckedKeys.value.includes(getNodeKey(child, props.nodeKey, props.fieldNames))
    ).length

    const totalChildCount = children.length
    const parentKey = getNodeKey(parent, props.nodeKey, props.fieldNames)

    const parentCheckedIndex = checkedKeys.value.indexOf(parentKey)
    const parentHalfIndex = halfCheckedKeys.value.indexOf(parentKey)

    if (checkedChildCount === totalChildCount && halfCheckedChildCount === 0) {
      if (parentCheckedIndex === -1) checkedKeys.value.push(parentKey)
      if (parentHalfIndex > -1) halfCheckedKeys.value.splice(parentHalfIndex, 1)
    } else if (checkedChildCount === 0 && halfCheckedChildCount === 0) {
      if (parentCheckedIndex > -1) checkedKeys.value.splice(parentCheckedIndex, 1)
      if (parentHalfIndex > -1) halfCheckedKeys.value.splice(parentHalfIndex, 1)
    } else {
      if (parentCheckedIndex > -1) checkedKeys.value.splice(parentCheckedIndex, 1)
      if (parentHalfIndex === -1) halfCheckedKeys.value.push(parentKey)
    }

    updateParentChecked(nodes, parent.parentId)
  }

  function recalculateHalfChecked(nodes: TreeNode[]) {
    const newCheckedKeys = [...checkedKeys.value]
    const newHalfCheckedKeys: (string | number)[] = []

    function calculate(node: TreeNode): { checked: boolean; halfChecked: boolean } {
      const nodeKey = getNodeKey(node, props.nodeKey, props.fieldNames)
      const children = getPropValue(node, 'children', props.fieldNames) as TreeNode[]

      if (!children || children.length === 0) {
        const isChecked = newCheckedKeys.includes(nodeKey)
        return { checked: isChecked, halfChecked: false }
      }

      const childResults = children.map(child => calculate(child))
      const checkedCount = childResults.filter(r => r.checked && !r.halfChecked).length
      const halfCheckedCount = childResults.filter(r => r.halfChecked).length
      const totalCount = children.length

      let isChecked: boolean
      let isHalfChecked: boolean

      if (checkedCount === totalCount && halfCheckedCount === 0) {
        isChecked = true
        isHalfChecked = false
      } else if (checkedCount === 0 && halfCheckedCount === 0) {
        isChecked = false
        isHalfChecked = false
      } else {
        isChecked = false
        isHalfChecked = true
      }

      if (isChecked) {
        const index = newCheckedKeys.indexOf(nodeKey)
        if (index === -1) {
          newCheckedKeys.push(nodeKey)
        }
        const halfIndex = newHalfCheckedKeys.indexOf(nodeKey)
        if (halfIndex > -1) {
          newHalfCheckedKeys.splice(halfIndex, 1)
        }
      } else if (isHalfChecked) {
        const halfIndex = newHalfCheckedKeys.indexOf(nodeKey)
        if (halfIndex === -1) {
          newHalfCheckedKeys.push(nodeKey)
        }
        const index = newCheckedKeys.indexOf(nodeKey)
        if (index > -1) {
          newCheckedKeys.splice(index, 1)
        }
      } else {
        const index = newCheckedKeys.indexOf(nodeKey)
        if (index > -1) {
          newCheckedKeys.splice(index, 1)
        }
        const halfIndex = newHalfCheckedKeys.indexOf(nodeKey)
        if (halfIndex > -1) {
          newHalfCheckedKeys.splice(halfIndex, 1)
        }
      }

      return { checked: isChecked, halfChecked: isHalfChecked }
    }

    nodes.forEach(node => {
      calculate(node)
    })

    checkedKeys.value = [...newCheckedKeys]
    halfCheckedKeys.value = [...newHalfCheckedKeys]
  }

  function toggleCheck(node: TreeNode) {
    const disabled = node.disabled || false
    if (disabled) return

    const checked = !checkedKeys.value.includes(getNodeKey(node, props.nodeKey, props.fieldNames))

    if (props.checkStrictly) {
      if (checked) {
        checkedKeys.value.push(getNodeKey(node, props.nodeKey, props.fieldNames))
      } else {
        checkedKeys.value = checkedKeys.value.filter(id => id !== getNodeKey(node, props.nodeKey, props.fieldNames))
      }
    } else {
      if (checked) {
        checkNode(node)
      } else {
        uncheckNode(node)
      }
      updateParentChecked(props.data, node.parentId)
    }

    emit('check', node, checked, null)
    emit('check-change', node, checked, checkedKeys.value)
  }

  watch(() => props.defaultCheckedKeys, () => {
    checkedKeys.value = [...props.defaultCheckedKeys]
    if (!props.checkStrictly && checkedKeys.value.length > 0) {
      recalculateHalfChecked(props.data)
    }
  })

  return {
    checkedKeys,
    halfCheckedKeys,
    toggleCheck,
    recalculateHalfChecked,
    checkNode,
    uncheckNode
  }
}
