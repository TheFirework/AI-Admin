import type { TreeNode, TreePropsConfig } from './types'

export function getPropValue(node: TreeNode, prop: string, props?: TreePropsConfig): unknown {
  const propKey = props?.[prop as keyof TreePropsConfig] || prop
  return node[propKey as keyof TreeNode] ?? node[prop as keyof TreeNode]
}

export function getNodeKey(node: TreeNode, nodeKey?: string, props?: TreePropsConfig): string | number {
  // 优先使用 fieldNames.key，其次是 nodeKey，最后是 'id'
  const keyField = props?.key || nodeKey || 'id'
  return getPropValue(node, keyField, props) as string | number
}

export function setParentIds(nodes: TreeNode[], parentId: string | number | undefined, nodeKey?: string, props?: TreePropsConfig): void {
  nodes.forEach(node => {
    Object.defineProperty(node, 'parentId', {
      value: parentId,
      writable: true,
      enumerable: true,
      configurable: true
    })
    const children = getPropValue(node, 'children', props) as TreeNode[]
    if (children && children.length > 0) {
      setParentIds(children, getNodeKey(node, nodeKey, props), nodeKey, props)
    }
  })
}

export function findNode(nodes: TreeNode[], id: string | number, nodeKey?: string, props?: TreePropsConfig): TreeNode | undefined {
  for (const node of nodes) {
    const nodeKeyVal = getNodeKey(node, nodeKey, props)
    // 处理类型转换问题：字符串和数字比较
    if (String(nodeKeyVal) === String(id)) return node
    const children = getPropValue(node, 'children', props) as TreeNode[]
    if (children) {
      const found = findNode(children, id, nodeKey, props)
      if (found) return found
    }
  }
  return undefined
}

export function findSiblings(nodes: TreeNode[], node: TreeNode, nodeKey?: string, props?: TreePropsConfig): TreeNode[] {
  if (node.parentId === undefined) {
    return nodes.filter(n => getNodeKey(n, nodeKey, props) !== getNodeKey(node, nodeKey, props))
  }

  const parent = findNode(nodes, node.parentId, nodeKey, props)
  if (!parent) return []

  const children = getPropValue(parent, 'children', props) as TreeNode[]
  return children?.filter(n => getNodeKey(n, nodeKey, props) !== getNodeKey(node, nodeKey, props)) || []
}

export function isLeaf(node: TreeNode, props?: TreePropsConfig): boolean {
  const isLeafProp = getPropValue(node, 'isLeaf', props) as boolean | undefined
  const children = getPropValue(node, 'children', props) as TreeNode[]
  return !!isLeafProp || !children || children.length === 0
}

export function isDescendant(ancestor: TreeNode, descendant: TreeNode): boolean {
  const children = ancestor.children || []
  for (const child of children) {
    if (child === descendant) return true
    if (isDescendant(child, descendant)) return true
  }
  return false
}

export function updateParentIdsRecursively(node: TreeNode, parentId: string | number | undefined, nodeKey?: string, props?: TreePropsConfig): void {
  Object.defineProperty(node, 'parentId', {
    value: parentId,
    writable: true,
    enumerable: true,
    configurable: true
  })

  const children = node.children || []
  children.forEach(child => {
    updateParentIdsRecursively(child, getNodeKey(node, nodeKey, props), nodeKey, props)
  })
}

export function filterTree(
  nodes: TreeNode[], 
  text: string, 
  filterMethod: ((value: string, data: TreeNode) => boolean),
  props?: TreePropsConfig
): TreeNode[] {
  const result: TreeNode[] = []
  nodes.forEach(node => {
    const label = getPropValue(node, 'label', props) as string
    const matches = filterMethod ? filterMethod(text, node) : label.toLowerCase().includes(text.toLowerCase())

    if (node.children && node.children.length > 0) {
      const filteredChildren = filterTree(node.children, text, filterMethod, props)
      if (matches || filteredChildren.length > 0) {
        result.push({
          ...node,
          children: filteredChildren
        })
      }
    } else if (matches) {
      result.push(node)
    }
  })
  return result
}
