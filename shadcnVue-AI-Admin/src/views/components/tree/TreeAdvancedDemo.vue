<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Tree } from '@/components/ui/tree'
import type { TreeNode } from '@/components/ui/tree'

// ==================== 虚拟滚动核心逻辑 ====================
const containerRef = ref<HTMLElement | null>(null)
const scrollTop = ref(0)
const containerHeight = ref(600) // 容器高度
const itemHeight = 32 // 每个节点的高度
const bufferSize = 5 // 上下缓冲区数量

// ==================== 生成大量测试数据 ====================
function generateLargeTreeData(count: number): TreeNode[] {
  const data: TreeNode[] = []
  for (let i = 1; i <= count; i++) {
    const node: TreeNode = {
      id: `node-${i}`,
      label: `📁 节点 ${i} - 大数据量测试`,
    }

    // 每隔几个节点添加子节点，模拟真实场景
    if (i % 3 === 0 && i < count - 10) {
      node.children = []
      const childCount = Math.min(5, Math.floor(Math.random() * 8) + 1)
      for (let j = 1; j <= childCount; j++) {
        const childNode: TreeNode = {
          id: `node-${i}-${j}`,
          label: `📄 子节点 ${i}-${j}`,
          isLeaf: true,
        }
        // 部分子节点再添加孙节点
        if (j % 2 === 0) {
          childNode.children = []
          for (let k = 1; k <= 3; k++) {
            childNode.children.push({
              id: `node-${i}-${j}-${k}`,
              label: `📋 孙节点 ${i}-${j}-${k}`,
              isLeaf: true,
            })
          }
        }
        node.children.push(childNode)
      }
    }

    // 随机禁用部分节点
    if (i % 17 === 0) {
      node.disabled = true
    }

    data.push(node)
  }
  return data
}

// 不同规模的数据集
const smallData = ref<TreeNode[]>(generateLargeTreeData(100))
const mediumData = ref<TreeNode[]>(generateLargeTreeData(500))
const largeData = ref<TreeNode[]>(generateLargeTreeData(1000))
const hugeData = ref<TreeNode[]>(generateLargeTreeData(5000))

// 当前选中的数据集（用于虚拟滚动）
const currentData = ref<TreeNode[]>([...mediumData.value])

// 用于高级功能演示的独立 Tree 数据
const advancedTreeData = ref<TreeNode[]>([
  {
    id: '1',
    label: '📂 一级目录 A',
    children: [
      { id: '1-1', label: '📄 文档 A-1', isLeaf: true },
      { id: '1-2', label: '📄 文档 A-2', isLeaf: true },
      { id: '1-3', label: '📄 文档 A-3', isLeaf: true },
    ]
  },
  {
    id: '2',
    label: '📂 一级目录 B',
    children: [
      { id: '2-1', label: '📄 文档 B-1', isLeaf: true },
      { id: '2-2', label: '📄 文档 B-2', isLeaf: true },
    ]
  },
  {
    id: '3',
    label: '📂 一级目录 C',
    children: [
      { id: '3-1', label: '📄 文档 C-1', isLeaf: true },
      { id: '3-2', label: '📄 文档 C-2', isLeaf: true },
      { id: '3-3', label: '📄 文档 C-3', isLeaf: true },
      { id: '3-4', label: '📄 文档 C-4', isLeaf: true },
    ]
  },
  {
    id: '4',
    label: '📂 一级目录 D（懒加载示例）',
    children: [] // 初始为空，通过懒加载填充
  },
  {
    id: '5',
    label: '📂 一级目录 E',
    disabled: true,
    children: [
      { id: '5-1', label: '📄 文档 E-1', isLeaf: true },
      { id: '5-2', label: '📄 文档 E-2', isLeaf: true },
    ]
  },
])

const dataSizeOptions = [
  { value: 100, label: '小数据 (100)' },
  { value: 500, label: '中数据 (500)' },
  { value: 1000, label: '大数据 (1000)' },
  { value: 5000, label: '超大数据 (5000)' },
]
const selectedDataSize = ref(500)

// ==================== 扁平化树形数据用于虚拟滚动 ====================
interface FlatTreeNode {
  node: TreeNode
  level: number
  index: number // 在扁平化数组中的索引
}

// 将树形结构扁平化为一维数组
function flattenTree(nodes: TreeNode[], level: number = 0, expandedKeys?: Set<string | number>): FlatTreeNode[] {
  const result: FlatTreeNode[] = []
  let idx = 0

  function traverse(nodeList: TreeNode[], currentLevel: number) {
    nodeList.forEach((node) => {
      result.push({
        node,
        level: currentLevel,
        index: idx++,
      })

      // 如果有子节点且该节点已展开（或默认展开），则递归处理子节点
      const children = node.children
      if (children && children.length > 0) {
        // 默认展开所有非禁用节点的第一层子节点
        const shouldExpand = !expandedKeys || expandedKeys.has(node.id) || currentLevel < 1
        if (shouldExpand) {
          traverse(children, currentLevel + 1)
        }
      }
    })
  }

  traverse(nodes, level)
  return result
}

// 扁平化后的数据
const flatData = computed(() => flattenTree(currentData.value))

// 总内容高度（所有节点的高度之和）
const totalHeight = computed(() => flatData.value.length * itemHeight)

// 可视区域内的节点范围
const visibleRange = computed(() => {
  const start = Math.max(0, Math.floor(scrollTop.value / itemHeight) - bufferSize)
  const end = Math.min(
    flatData.value.length,
    Math.ceil((scrollTop.value + containerHeight.value) / itemHeight) + bufferSize
  )
  return { start, end }
})

// 当前可视区域内的节点
const visibleNodes = computed(() => {
  return flatData.value.slice(visibleRange.value.start, visibleRange.value.end)
})

// 偏移量（用于定位可视区域的起始位置）
const offsetY = computed(() => visibleRange.value.start * itemHeight)

// ==================== 控制选项 ====================
const enableVirtualScroll = ref(true)
const showCheckbox = ref(false)
const highlightCurrent = ref(true)
const defaultExpandAll = ref(false)
const showIcon = ref(true)

// 性能统计
const renderTime = ref(0)
const visibleCount = computed(() => visibleNodes.value.length)
const totalCount = computed(() => flatData.value.length)

// 切换数据集大小
function onDataChange(size: number) {
  selectedDataSize.value = size
  const startTime = performance.now()

  switch (size) {
    case 100:
      currentData.value = [...smallData.value]
      break
    case 500:
      currentData.value = [...mediumData.value]
      break
    case 1000:
      currentData.value = [...largeData.value]
      break
    case 5000:
      currentData.value = [...hugeData.value]
      break
    default:
      currentData.value = [...mediumData.value]
  }

  // 重置滚动位置
  scrollTop.value = 0
  if (containerRef.value) {
    containerRef.value.scrollTop = 0
  }

  const endTime = performance.now()
  renderTime.value = Math.round(endTime - startTime)
}

// 滚动事件处理
function handleScroll(e: Event) {
  const target = e.target as HTMLElement
  scrollTop.value = target.scrollTop
}

// ==================== 高级功能：树节点过滤 ====================
const filterTreeRef = ref<InstanceType<typeof Tree> | null>(null)
const filterText = ref('')
const isFiltering = ref(false)

// 自定义过滤方法：支持模糊匹配标签文本
function customFilterMethod(value: string, data: TreeNode): boolean {
  if (!value) return true
  const label = data.label?.toString().toLowerCase() || ''
  return label.includes(value.toLowerCase())
}

// 执行过滤操作
function executeFilter() {
  if (!filterTreeRef.value) return

  isFiltering.value = !!filterText.value

  // 调用 Tree 组件的 filter 方法
  filterTreeRef.value.filter(filterText.value, customFilterMethod)

  addEventLog('filter', `执行过滤：关键词 "${filterText.value}"`, null)
}

// 清除过滤
function clearFilter() {
  if (!filterTreeRef.value) return

  filterText.value = ''
  isFiltering.value = false
  filterTreeRef.value.filter('', customFilterMethod)

  addEventLog('filter', '清除过滤', null)
}

// ==================== 高级功能：懒加载 ====================
const lazyLoadTreeRef = ref<InstanceType<typeof Tree> | null>(null)
const isLoading = ref(false)
const lazyLoadedNodes = ref<Set<string | number>>(new Set())

// 模拟懒加载：延迟加载节点 D 的子节点
async function loadLazyChildren(parentId: string | number): Promise<TreeNode[]> {
  // 模拟网络请求延迟
  await new Promise(resolve => setTimeout(resolve, 800))

  // 根据父节点 ID 返回不同的子节点数据
  if (parentId === '4') {
    return [
      { id: '4-1', label: '⏳ 懒加载项 D-1', isLeaf: true },
      { id: '4-2', label: '⏳ 懒加载项 D-2', isLeaf: true },
      { id: '4-3', label: '⏳ 懒加载项 D-3', isLeaf: true },
      { id: '4-4', label: '⏳ 懒加载项 D-4', isLeaf: true },
      { id: '4-5', label: '⏳ 懒加载项 D-5', isLeaf: true },
    ]
  }

  return []
}

// 手动触发懒加载
async function triggerLazyLoad() {
  if (isLoading.value) return

  isLoading.value = true
  addEventLog('lazy-load', '开始懒加载节点 D 的子数据...', null)

  try {
    const children = await loadLazyChildren('4')

    // 找到目标节点并添加子节点
    const parentNode = advancedTreeData.value.find(n => n.id === '4')
    if (parentNode) {
      parentNode.children = children
      lazyLoadedNodes.value.add('4')
      addEventLog('lazy-load', `✅ 懒加载完成：成功加载 ${children.length} 个子节点`, null)
    }
  } catch (error) {
    addEventLog('lazy-load', `❌ 懒加载失败：${error}`, null)
  } finally {
    isLoading.value = false
  }
}

// 重置懒加载数据
function resetLazyLoad() {
  const parentNode = advancedTreeData.value.find(n => n.id === '4')
  if (parentNode) {
    parentNode.children = []
    lazyLoadedNodes.value.delete('4')
    addEventLog('lazy-load', '已重置懒加载数据', null)
  }
}

// ==================== 高级功能：事件调用演示 ====================
interface EventLogItem {
  time: string
  type: string
  message: string
  data?: unknown
}

const eventLog = ref<EventLogItem[]>([])
const maxLogLength = 50 // 最大保留的日志条数

// 添加事件日志
function addEventLog(type: string, message: string, data?: unknown) {
  const now = new Date()
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`

  eventLog.value.unshift({
    time: timeStr,
    type,
    message,
    data,
  })

  // 限制日志长度，防止内存溢出
  if (eventLog.value.length > maxLogLength) {
    eventLog.value = eventLog.value.slice(0, maxLogLength)
  }
}

// 清空事件日志
function clearEventLog() {
  eventLog.value = []
}

// 事件类型颜色映射
const eventTypeColors: Record<string, string> = {
  'node-click': 'bg-blue-100 text-blue-700 border-blue-300',
  'check': 'bg-green-100 text-green-700 border-green-300',
  'check-change': 'bg-emerald-100 text-emerald-700 border-emerald-300',
  'current-change': 'bg-purple-100 text-purple-700 border-purple-300',
  'expand': 'bg-orange-100 text-orange-700 border-orange-300',
  'expand-change': 'bg-yellow-100 text-yellow-700 border-yellow-300',
  'collapse': 'bg-gray-100 text-gray-700 border-gray-300',
  'filter': 'bg-cyan-100 text-cyan-700 border-cyan-300',
  'lazy-load': 'bg-indigo-100 text-indigo-700 border-indigo-300',
  'method': 'bg-pink-100 text-pink-700 border-pink-300',
}

// Tree 组件事件处理器
function onTreeNodeClick(data: TreeNode, node: unknown) {
  addEventLog('node-click', `点击节点：${data.label}`, { id: data.id, label: data.label })
}

function onTreeCheck(data: TreeNode, checked: boolean, node: unknown) {
  addEventLog('check', `${checked ? '✅ 选中' : '❌ 取消选中'}节点：${data.label}`, {
    id: data.id,
    checked,
  })
}

function onTreeCheckChange(data: TreeNode, checked: boolean, checkedKeys: (string | number)[]) {
  addEventLog('check-change', `选中状态变化：${data.label} (${checkedKeys.length} 个已选)`, {
    id: data.id,
    checked,
    totalChecked: checkedKeys.length,
  })
}

function onTreeCurrentChange(currentNode: TreeNode, oldCurrentNode: TreeNode | null) {
  addEventLog('current-change', `当前选中变化：${oldCurrentNode?.label || '无'} → ${currentNode.label}`, {
    oldId: oldCurrentNode?.id,
    newId: currentNode.id,
  })
}

function onTreeExpand(data: TreeNode, expanded: boolean, node: unknown) {
  addEventLog('expand', `${expanded ? '📂 展开' : '📁 折叠'}节点：${data.label}`, {
    id: data.id,
    expanded,
  })
}

function onTreeExpandChange(data: TreeNode, expanded: boolean, expandedKeys: (string | number)[]) {
  addEventLog('expand-change', `展开状态变化：${data.label} (${expandedKeys.length} 个已展开)`, {
    id: data.id,
    expanded,
    totalExpanded: expandedKeys.length,
  })
}

function onTreeCollapse(data: TreeNode, node: unknown) {
  addEventLog('collapse', `折叠节点：${data.label}`, { id: data.id })
}

// ==================== 高级功能：对外暴露的方法调用 ====================
const methodTreeRef = ref<InstanceType<typeof Tree> | null>(null)
const methodResult = ref<string>('')
const methodResultType = ref<'success' | 'error' | 'info'>('info')

// 显示方法执行结果
function showMethodResult(result: string, type: 'success' | 'error' | 'info' = 'info') {
  methodResult.value = result
  methodResultType.value = type
  addEventLog('method', result, null)

  // 3秒后自动清除结果
  setTimeout(() => {
    if (methodResult.value === result) {
      methodResult.value = ''
    }
  }, 3000)
}

// 方法1：获取选中的节点
function callGetCheckedNodes() {
  if (!methodTreeRef.value) {
    showMethodResult('❌ 错误：Tree 组件引用不存在', 'error')
    return
  }

  try {
    const nodes = methodTreeRef.value.getCheckedNodes()
    if (nodes.length === 0) {
      showMethodResult('ℹ️ 当前没有选中的节点', 'info')
    } else {
      const labels = nodes.map(n => n.label).join(', ')
      showMethodResult(`✅ 获取到 ${nodes.length} 个选中节点：${labels}`, 'success')
    }
  } catch (error) {
    showMethodResult(`❌ 执行错误：${error}`, 'error')
  }
}

// 方法2：获取选中的节点 Key
function callGetCheckedKeys() {
  if (!methodTreeRef.value) {
    showMethodResult('❌ 错误：Tree 组件引用不存在', 'error')
    return
  }

  try {
    const keys = methodTreeRef.value.getCheckedKeys()
    if (keys.length === 0) {
      showMethodResult('ℹ️ 当前没有选中的 Key', 'info')
    } else {
      showMethodResult(`✅ 获取到 ${keys.length} 个选中 Key：[${keys.join(', ')}]`, 'success')
    }
  } catch (error) {
    showMethodResult(`❌ 执行错误：${error}`, 'error')
  }
}

// 方法3：设置指定节点为选中状态
function callSetChecked() {
  if (!methodTreeRef.value) {
    showMethodResult('❌ 错误：Tree 组件引用不存在', 'error')
    return
  }

  try {
    // 示例：切换节点 "2-1" 的选中状态
    methodTreeRef.value.setChecked('2-1')
    showMethodResult('✅ 已切换节点 "文档 B-1" 的选中状态', 'success')
  } catch (error) {
    showMethodResult(`❌ 执行错误：${error}`, 'error')
  }
}

// 方法4：追加子节点
function callAppend() {
  if (!methodTreeRef.value) {
    showMethodResult('❌ 错误：Tree 组件引用不存在', 'error')
    return
  }

  try {
    // 在节点 "3" 下追加一个新子节点
    const newNode: TreeNode = {
      id: `new-${Date.now()}`,
      label: '🆕 动态新增的节点',
      isLeaf: true,
    }
    methodTreeRef.value.append(newNode, '3')
    showMethodResult(`✅ 已在 "一级目录 C" 下新增节点：${newNode.label}`, 'success')
  } catch (error) {
    showMethodResult(`❌ 执行错误：${error}`, 'error')
  }
}

// 方法5：删除节点
function callRemove() {
  if (!methodTreeRef.value) {
    showMethodResult('❌ 错误：Tree 组件引用不存在', 'error')
    return
  }

  try {
    // 删除节点 "1-1"
    methodTreeRef.value.remove('1-1')
    showMethodResult('✅ 已删除节点 "文档 A-1"', 'success')
  } catch (error) {
    showMethodResult(`❌ 执行错误：${error}`, 'error')
  }
}

// 方法6：在指定节点前插入
function callInsertBefore() {
  if (!methodTreeRef.value) {
    showMethodResult('❌ 错误：Tree 组件引用不存在', 'error')
    return
  }

  try {
    const newNode: TreeNode = {
      id: `before-${Date.now()}`,
      label: '📍 前插节点',
      isLeaf: true,
    }
    // 在 "2-2" 前插入新节点
    methodTreeRef.value.insertBefore(newNode, '2-2')
    showMethodResult(`✅ 已在 "文档 B-2" 前插入节点：${newNode.label}`, 'success')
  } catch (error) {
    showMethodResult(`❌ 执行错误：${error}`, 'error')
  }
}

// 方法7：在指定节点后插入
function callInsertAfter() {
  if (!methodTreeRef.value) {
    showMethodResult('❌ 错误：Tree 组件引用不存在', 'error')
    return
  }

  try {
    const newNode: TreeNode = {
      id: `after-${Date.now()}`,
      label: '📍 后插节点',
      isLeaf: true,
    }
    // 在 "3-2" 后插入新节点
    methodTreeRef.value.insertAfter(newNode, '3-2')
    showMethodResult(`✅ 已在 "文档 C-2" 后插入节点：${newNode.label}`, 'success')
  } catch (error) {
    showMethodResult(`❌ 执行错误：${error}`, 'error')
  }
}

// ==================== 虚拟滚动模式的事件处理 ====================
function onCheck(data: TreeNode, checked: boolean) {
  console.log('选中节点:', data.label, checked)
}

function onExpand(data: TreeNode, expanded: boolean) {
  console.log('展开/折叠:', data.label, expanded)
}

function onSelect(data: TreeNode) {
  console.log('选中项:', data.label)
}

// 组件挂载和卸载时的处理
onMounted(() => {
  if (containerRef.value) {
    containerHeight.value = containerRef.value.clientHeight || 600
  }
})

onUnmounted(() => {
  // 清理工作
})
</script>

<template>
  <div class="p-6 space-y-8">
    <!-- 页面标题 -->
    <div>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Tree 高级功能演示</h1>
      <p class="mt-2 text-gray-600 dark:text-gray-400">
        全面展示 Tree 组件的五大高级特性：虚拟滚动、节点过滤、懒加载、事件系统、对外方法调用
      </p>
    </div>

    <!-- 功能说明卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div class="p-4 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/20">
        <h3 class="font-semibold text-blue-700 dark:text-blue-400">⚡ 高性能渲染</h3>
        <p class="text-sm text-blue-600 dark:text-blue-300 mt-1">只渲染可视区域内的节点，大幅降低 DOM 节点数量</p>
      </div>
      <div class="p-4 rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/20">
        <h3 class="font-semibold text-green-700 dark:text-green-400">🔍 节点过滤</h3>
        <p class="text-sm text-green-600 dark:text-green-300 mt-1">支持关键词搜索和自定义过滤方法，快速定位目标节点</p>
      </div>
      <div class="p-4 rounded-lg border border-purple-200 bg-purple-50 dark:bg-purple-950/20">
        <h3 class="font-semibold text-purple-700 dark:text-purple-400">⏳ 懒加载</h3>
        <p class="text-sm text-purple-600 dark:text-purple-300 mt-1">按需动态加载子节点数据，优化初始加载性能</p>
      </div>
      <div class="p-4 rounded-lg border border-orange-200 bg-orange-50 dark:bg-orange-950/20">
        <h3 class="font-semibold text-orange-700 dark:text-orange-400">📡 事件系统</h3>
        <p class="text-sm text-orange-600 dark:text-orange-300 mt-1">完整的事件回调机制，实时监听用户交互行为</p>
      </div>
      <div class="p-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20">
        <h3 class="font-semibold text-red-700 dark:text-red-400">🛠️ 方法调用</h3>
        <p class="text-sm text-red-600 dark:text-red-300 mt-1">丰富的对外 API，支持编程式操作树的增删改查</p>
      </div>
      <div class="p-4 rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
        <h3 class="font-semibold text-yellow-700 dark:text-yellow-400">🎯 精准定位</h3>
        <p class="text-sm text-yellow-600 dark:text-yellow-300 mt-1">通过动态计算偏移量，保持正确的滚动位置和视觉体验</p>
      </div>
      <div class="p-4 rounded-lg border border-indigo-200 bg-indigo-50 dark:bg-indigo-950/20">
        <h3 class="font-semibold text-indigo-700 dark:text-indigo-400">💾 内存优化</h3>
        <p class="text-sm text-indigo-600 dark:text-indigo-300 mt-1">减少内存占用，适合超大数据量的树形结构展示</p>
      </div>
      <div class="p-4 rounded-lg border border-cyan-200 bg-cyan-50 dark:bg-cyan-950/20">
        <h3 class="font-semibold text-cyan-700 dark:text-cyan-400">🔄 平滑滚动</h3>
        <p class="text-sm text-cyan-600 dark:text-cyan-300 mt-1">使用缓冲区机制，确保快速滚动时不会出现空白闪烁</p>
      </div>
    </div>

    <!-- ========== 第一部分：虚拟滚动基础演示 ========== -->
    <div class="border rounded-lg overflow-hidden shadow-sm">
      <div
        class="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-b">
        <h2 class="text-xl font-bold text-blue-800 dark:text-blue-300">🚀 一、虚拟滚动基础演示</h2>
        <p class="text-sm text-blue-600 dark:text-blue-400 mt-1">高性能渲染大量树节点数据的核心技术展示</p>
      </div>

      <!-- 控制面板 -->
      <div class="flex flex-wrap items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 border-b">
        <div class="flex items-center gap-2">
          <label class="font-medium text-sm">数据规模：</label>
          <select v-model.number="selectedDataSize"
            @change="onDataChange(Number(($event.target as HTMLSelectElement).value))"
            class="px-3 py-1.5 border rounded-md bg-white dark:bg-gray-900 text-sm">
            <option v-for="opt in dataSizeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </div>
        <label class="flex items-center gap-2 cursor-pointer">
          <input v-model="enableVirtualScroll" type="checkbox" />
          <span>启用虚拟滚动</span>
        </label>
        <label class="flex items-center gap-2 cursor-pointer">
          <input v-model="showCheckbox" type="checkbox" />
          <span>显示复选框</span>
        </label>
        <label class="flex items-center gap-2 cursor-pointer">
          <input v-model="highlightCurrent" type="checkbox" />
          <span>高亮当前</span>
        </label>
        <label class="flex items-center gap-2 cursor-pointer">
          <input v-model="defaultExpandAll" type="checkbox" />
          <span>默认展开</span>
        </label>
        <label class="flex items-center gap-2 cursor-pointer">
          <input v-model="showIcon" type="checkbox" />
          <span>显示图标</span>
        </label>
      </div>

      <!-- 性能统计面板 -->
      <div
        class="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-linear-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-b">
        <div class="text-center">
          <div class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{{ totalCount }}</div>
          <div class="text-xs text-gray-600 dark:text-gray-400 mt-1">总节点数</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{ enableVirtualScroll ? visibleCount :
            totalCount }}</div>
          <div class="text-xs text-gray-600 dark:text-gray-400 mt-1">{{ enableVirtualScroll ? '渲染节点数' : '实际渲染' }}</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">{{ renderTime }}ms</div>
          <div class="text-xs text-gray-600 dark:text-gray-400 mt-1">渲染耗时</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold font-mono text-orange-600 dark:text-orange-400">
            {{ enableVirtualScroll ? `${Math.round((visibleCount / totalCount) * 100)}%` : '100%' }}
          </div>
          <div class="text-xs text-gray-600 dark:text-gray-400 mt-1">渲染比例</div>
        </div>
      </div>

      <!-- 虚拟滚动容器 -->
      <div ref="containerRef" :style="{ height: containerHeight + 'px', overflowY: 'auto' }" @scroll="handleScroll"
        class="relative bg-white dark:bg-gray-900">
        <template v-if="enableVirtualScroll">
          <div :style="{ height: totalHeight + 'px', position: 'relative' }">
            <div :style="{ transform: `translateY(${offsetY}px)` }" role="tree">
              <div v-for="(item) in visibleNodes" :key="item.node.id" :style="{
                height: itemHeight + 'px',
                paddingLeft: (item.level * 24 + 16) + 'px',
                display: 'flex',
                alignItems: 'center',
                borderBottom: '1px solid #f0f0f0',
                transition: 'background-color 0.15s',
              }" class="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer group" @click="onSelect(item.node)">
                <span :style="{ width: '16px', marginRight: '8px' }" class="inline-block text-center">
                  <template v-if="item.node.children?.length"><span class="text-gray-400">▶</span></template>
                  <template v-else><span class="text-transparent">◇</span></template>
                </span>
                <span v-if="showIcon" :style="{ marginRight: '8px' }">
                  {{ item.node.children?.length ? '📁' : '📄' }}
                </span>
                <span v-if="showCheckbox" :style="{ marginRight: '8px' }">
                  <input type="checkbox" @click.stop="onCheck(item.node, true)" />
                </span>
                <span :class="[
                  'flex-1 text-sm truncate',
                  item.node.disabled ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-gray-300'
                ]">{{ item.node.label }}</span>
                <span v-if="item.node.disabled"
                  class="ml-2 px-1.5 py-0.5 text-xs bg-red-100 text-red-600 rounded opacity-70">禁用</span>
                <span
                  class="ml-2 px-1 py-0.5 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity font-mono">#{{
                    item.index }}</span>
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <Tree :data="currentData" :show-checkbox="showCheckbox" :highlight-current="highlightCurrent"
            :default-expand-all="defaultExpandAll" :show-icon="showIcon" :height="containerHeight" @check="onCheck"
            @expand="onExpand" @node-click="onSelect">
            <template #default="{ node }">
              <template v-if="node.disabled">
                <span class="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded">DISABLED</span>
              </template>
            </template>
          </Tree>
        </template>
      </div>
    </div>

    <!-- ========== 第二部分：树节点过滤功能 ========== -->
    <div class="border rounded-lg overflow-hidden shadow-sm">
      <div
        class="px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-b">
        <h2 class="text-xl font-bold text-green-800 dark:text-green-300">🔍 二、树节点过滤功能</h2>
        <p class="text-sm text-green-600 dark:text-green-400 mt-1">通过关键词搜索快速定位目标节点，支持自定义过滤逻辑</p>
      </div>

      <!-- 过滤控制区 -->
      <div class="flex flex-wrap items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 border-b">
        <div class="flex items-center gap-2 flex-1 min-w-[300px]">
          <label class="font-medium text-sm whitespace-nowrap">🔎 过滤关键词：</label>
          <input v-model="filterText" type="text" placeholder="输入关键词进行过滤..."
            class="flex-1 px-3 py-1.5 border rounded-md bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            @keyup.enter="executeFilter" />
        </div>
        <button @click="executeFilter"
          class="px-4 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium">
          🔍 执行过滤
        </button>
        <button @click="clearFilter"
          class="px-4 py-1.5 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm font-medium">
          🗑️ 清除过滤
        </button>
        <span v-if="isFiltering"
          class="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium animate-pulse">
          🔍 过滤中...
        </span>
      </div>

      <!-- 过滤说明 -->
      <div class="p-3 bg-green-50 dark:bg-green-950/20 border-b text-sm text-green-700 dark:text-green-400">
        <strong>💡 使用提示：</strong>输入关键词后按回车或点击"执行过滤"按钮进行搜索。支持模糊匹配节点标签文本。
        过滤会隐藏不匹配的节点及其父节点（如果父节点下无匹配子节点）。
      </div>

      <!-- 过滤演示 Tree -->
      <div class="p-4 bg-white dark:bg-gray-900" style="max-height: 350px; overflow-y: auto;">
        <Tree ref="filterTreeRef" :data="advancedTreeData" :show-checkbox="true" :highlight-current="true"
          :default-expand-all="true" :show-icon="true" @check="onTreeCheck" @expand="onTreeExpand"
          @node-click="onTreeNodeClick">
          <template #default="{ node }">
            <template v-if="node.disabled">
              <span class="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded">DISABLED</span>
            </template>
          </template>
        </Tree>
      </div>
    </div>

    <!-- ========== 第三部分：懒加载功能 ========== -->
    <div class="border rounded-lg overflow-hidden shadow-sm">
      <div
        class="px-4 py-3 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 border-b">
        <h2 class="text-xl font-bold text-purple-800 dark:text-purple-300">⏳ 三、懒加载功能</h2>
        <p class="text-sm text-purple-600 dark:text-purple-400 mt-1">按需动态加载子节点数据，优化初始加载性能和网络资源消耗</p>
      </div>

      <!-- 懒加载控制区 -->
      <div class="flex flex-wrap items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 border-b">
        <button @click="triggerLazyLoad" :disabled="isLoading"
          class="px-4 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
          {{ isLoading ? '⏳ 加载中...' : '🚀 触发懒加载（节点 D）' }}
        </button>
        <button @click="resetLazyLoad"
          class="px-4 py-1.5 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm font-medium">
          🔄 重置懒加载数据
        </button>
        <span v-if="lazyLoadedNodes.has('4')"
          class="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
          ✅ 节点 D 已加载
        </span>
        <span v-else class="px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs font-medium">
          ⏳ 节点 D 待加载
        </span>
      </div>

      <!-- 懒加载说明 -->
      <div class="p-3 bg-purple-50 dark:bg-purple-950/20 border-b text-sm text-purple-700 dark:text-purple-400">
        <strong>💡 工作原理：</strong>"一级目录 D" 初始状态为空（children: []）。
        点击"触发懒加载"按钮将模拟异步请求（800ms 延迟），动态加载 5 个子节点并插入到该节点下。
        这适用于远程数据源或需要按需加载的大规模树形数据场景。
      </div>

      <!-- 懒加载演示 Tree -->
      <div class="p-4 bg-white dark:bg-gray-900" style="max-height: 350px; overflow-y: auto;">
        <Tree ref="lazyLoadTreeRef" :data="advancedTreeData" :show-checkbox="false" :highlight-current="true"
          :default-expand-all="true" :show-icon="true" @expand="onTreeExpand" @node-click="onTreeNodeClick">
          <template #default="{ node }">
            <template v-if="node.id === '4' && !node.children?.length">
              <span class="ml-2 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded animate-pulse">
                ⏳ 点击上方按钮加载
              </span>
            </template>
            <template v-if="node.disabled">
              <span class="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded">DISABLED</span>
            </template>
          </template>
        </Tree>
      </div>
    </div>

    <!-- ========== 第四部分：事件调用演示 ========== -->
    <div class="border rounded-lg overflow-hidden shadow-sm">
      <div
        class="px-4 py-3 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border-b flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-orange-800 dark:text-orange-300">📡 四、事件调用演示</h2>
          <p class="text-sm text-orange-600 dark:text-orange-400 mt-1">完整的事件回调机制，实时监控用户交互行为</p>
        </div>
        <button @click="clearEventLog"
          class="px-3 py-1 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors text-sm">
          🗑️ 清空日志
        </button>
      </div>

      <!-- 事件说明 -->
      <div class="p-3 bg-orange-50 dark:bg-orange-950/20 border-b text-sm text-orange-700 dark:text-orange-400">
        <strong>📝 支持的事件类型：</strong>
        <code class="mx-1 px-1.5 py-0.5 bg-white rounded text-xs">node-click</code>
        <code class="mx-1 px-1.5 py-0.5 bg-white rounded text-xs">check / check-change</code>
        <code class="mx-1 px-1.5 py-0.5 bg-white rounded text-xs">current-change</code>
        <code class="mx-1 px-1.5 py-0.5 bg-white rounded text-xs">expand / expand-change</code>
        <code class="mx-1 px-1.5 py-0.5 bg-white rounded text-xs">collapse</code>
        — 与下方 Tree 组件交互以触发事件
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-0">
        <!-- 左侧：Tree 组件 -->
        <div class="p-4 bg-white dark:bg-gray-900 border-r" style="max-height: 450px; overflow-y: auto;">
          <Tree :data="advancedTreeData" :show-checkbox="true" :highlight-current="true" :default-expand-all="false"
            :show-icon="true" @check="onTreeCheck" @check-change="onTreeCheckChange" @node-click="onTreeNodeClick"
            @current-change="onTreeCurrentChange" @expand="onTreeExpand" @expand-change="onTreeExpandChange"
            @collapse="onTreeCollapse">
            <template #default="{ node }">
              <template v-if="node.disabled">
                <span class="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded">DISABLED</span>
              </template>
            </template>
          </Tree>
        </div>

        <!-- 右侧：事件日志 -->
        <div class="bg-gray-50 dark:bg-gray-900" style="max-height: 450px; overflow-y: auto;">
          <div class="p-3 bg-gray-100 dark:bg-gray-800 border-b sticky top-0 z-10">
            <h4 class="font-semibold text-sm text-gray-700 dark:text-gray-300">📋 实时事件日志 ({{ eventLog.length }} 条)</h4>
          </div>
          <div class="p-2 space-y-1">
            <div v-if="eventLog.length === 0" class="text-center text-gray-400 py-8 text-sm">
              💡 与左侧 Tree 交互以查看事件日志...
            </div>
            <div v-for="(log, idx) in eventLog" :key="idx" class="p-2 rounded text-xs border-l-2 font-mono"
              :class="eventTypeColors[log.type] || 'bg-gray-100 text-gray-700 border-gray-300'">
              <div class="flex items-start gap-2">
                <span class="text-gray-500 whitespace-nowrap">{{ log.time }}</span>
                <span class="flex-1">{{ log.message }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========== 第五部分：对外暴露的方法调用 ========== -->
    <div class="border rounded-lg overflow-hidden shadow-sm">
      <div class="px-4 py-3 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 border-b">
        <h2 class="text-xl font-bold text-red-800 dark:text-red-300">🛠️ 五、对外暴露的方法调用</h2>
        <p class="text-sm text-red-600 dark:text-red-400 mt-1">通过组件 ref 编程式操作 Tree，实现增删改查等复杂业务逻辑</p>
      </div>

      <!-- 方法按钮组 -->
      <div class="flex flex-wrap gap-3 p-4 bg-gray-50 dark:bg-gray-800 border-b">
        <button @click="callGetCheckedNodes"
          class="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
          📋 getCheckedNodes()
        </button>
        <button @click="callGetCheckedKeys"
          class="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
          🔑 getCheckedKeys()
        </button>
        <button @click="callSetChecked"
          class="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium">
          ✅ setChecked('2-1')
        </button>
        <button @click="callAppend"
          class="px-3 py-1.5 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors text-sm font-medium">
          ➕ append(→ 节点C)
        </button>
        <button @click="callRemove"
          class="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium">
          ➖ remove('1-1')
        </button>
        <button @click="callInsertBefore"
          class="px-3 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm font-medium">
          ⬆️ insertBefore(→ B-2)
        </button>
        <button @click="callInsertAfter"
          class="px-3 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm font-medium">
          ⬇️ insertAfter(→ C-2)
        </button>
      </div>

      <!-- 方法执行结果显示 -->
      <transition name="fade">
        <div v-if="methodResult" class="px-4 py-3 border-b text-sm font-medium" :class="{
          'bg-green-50 text-green-700 border-green-200': methodResultType === 'success',
          'bg-red-50 text-red-700 border-red-200': methodResultType === 'error',
          'bg-blue-50 text-blue-700 border-blue-200': methodResultType === 'info',
        }">
          {{ methodResult }}
        </div>
      </transition>

      <!-- 方法说明表格 -->
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th class="py-2 px-3 text-left font-semibold text-gray-700 dark:text-gray-300">方法名</th>
              <th class="py-2 px-3 text-left font-semibold text-gray-700 dark:text-gray-300">参数</th>
              <th class="py-2 px-3 text-left font-semibold text-gray-700 dark:text-gray-300">返回值</th>
              <th class="py-2 px-3 text-left font-semibold text-gray-700 dark:text-gray-300">说明</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td class="py-2 px-3 font-mono text-blue-600 dark:text-blue-400">getCheckedNodes()</td>
              <td class="py-2 px-3 text-gray-600 dark:text-gray-400">无</td>
              <td class="py-2 px-3 font-mono text-green-600 dark:text-green-400">TreeNode[]</td>
              <td class="py-2 px-3 text-gray-700 dark:text-gray-300">获取所有被选中的节点对象数组</td>
            </tr>
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td class="py-2 px-3 font-mono text-blue-600 dark:text-blue-400">getCheckedKeys()</td>
              <td class="py-2 px-3 text-gray-600 dark:text-gray-400">无</td>
              <td class="py-2 px-3 font-mono text-green-600 dark:text-green-400">(string|number)[]</td>
              <td class="py-2 px-3 text-gray-700 dark:text-gray-300">获取所有被选中节点的 key 数组</td>
            </tr>
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td class="py-2 px-3 font-mono text-blue-600 dark:text-blue-400">setChecked(key)</td>
              <td class="py-2 px-3 font-mono text-orange-600 dark:text-orange-400">key: string|number</td>
              <td class="py-2 px-3 text-gray-600 dark:text-gray-400">void</td>
              <td class="py-2 px-3 text-gray-700 dark:text-gray-300">切换指定节点的选中状态</td>
            </tr>
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td class="py-2 px-3 font-mono text-blue-600 dark:text-blue-400">append(node, parentId)</td>
              <td class="py-2 px-3 font-mono text-orange-600 dark:text-orange-400">node, parentId</td>
              <td class="py-2 px-3 text-gray-600 dark:text-gray-400">void</td>
              <td class="py-2 px-3 text-gray-700 dark:text-gray-300">在指定父节点下追加子节点</td>
            </tr>
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td class="py-2 px-3 font-mono text-blue-600 dark:text-blue-400">remove(key)</td>
              <td class="py-2 px-3 font-mono text-orange-600 dark:text-orange-400">key: string|number</td>
              <td class="py-2 px-3 text-gray-600 dark:text-gray-400">void</td>
              <td class="py-2 px-3 text-gray-700 dark:text-gray-300">根据 key 删除指定节点</td>
            </tr>
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td class="py-2 px-3 font-mono text-blue-600 dark:text-blue-400">insertBefore(node, refKey)</td>
              <td class="py-2 px-3 font-mono text-orange-600 dark:text-orange-400">node, refKey</td>
              <td class="py-2 px-3 text-gray-600 dark:text-gray-400">void</td>
              <td class="py-2 px-3 text-gray-700 dark:text-gray-300">在参考节点之前插入新节点</td>
            </tr>
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td class="py-2 px-3 font-mono text-blue-600 dark:text-blue-400">insertAfter(node, refKey)</td>
              <td class="py-2 px-3 font-mono text-orange-600 dark:text-orange-400">node, refKey</td>
              <td class="py-2 px-3 text-gray-600 dark:text-gray-400">void</td>
              <td class="py-2 px-3 text-gray-700 dark:text-gray-300">在参考节点之后插入新节点</td>
            </tr>
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td class="py-2 px-3 font-mono text-blue-600 dark:text-blue-400">filter(value, method?)</td>
              <td class="py-2 px-3 font-mono text-orange-600 dark:text-orange-400">value, method?</td>
              <td class="py-2 px-3 text-gray-600 dark:text-gray-400">void</td>
              <td class="py-2 px-3 text-gray-700 dark:text-gray-300">根据关键词过滤显示节点（见第二部分）</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 方法演示 Tree -->
      <div class="p-4 bg-white dark:bg-gray-900 border-t" style="max-height: 350px; overflow-y: auto;">
        <h4 class="font-semibold mb-2 text-sm text-gray-700 dark:text-gray-300">🎮 操作演示区域（点击上方按钮触发方法调用）：</h4>
        <Tree ref="methodTreeRef" :data="advancedTreeData" :show-checkbox="true" :highlight-current="true"
          :default-expand-all="true" :show-icon="true" @check="onTreeCheck" @check-change="onTreeCheckChange"
          @node-click="onTreeNodeClick" @expand="onTreeExpand">
          <template #default="{ node }">
            <template v-if="node.disabled">
              <span class="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded">DISABLED</span>
            </template>
          </template>
        </Tree>
      </div>
    </div>

    <!-- 技术原理说明 -->
    <div class="space-y-4">
      <div class="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
        <h3 class="font-semibold text-blue-800 dark:text-blue-300 mb-2">🔧 虚拟滚动技术原理</h3>
        <div class="text-sm text-blue-700 dark:text-blue-400 space-y-2">
          <p><strong>核心思想：</strong>只渲染用户当前能看到的部分节点，而不是一次性渲染所有节点。</p>
          <ul class="list-disc list-inside ml-2 space-y-1">
            <li><strong>占位容器：</strong>一个与实际内容等高的透明 div，用于产生正确的滚动条</li>
            <li><strong>可视区域计算：</strong>根据 scrollTop 和容器高度计算出应该渲染的节点范围</li>
            <li><strong>动态偏移：</strong>通过 translateY 将渲染的节点移动到正确的位置</li>
            <li><strong>缓冲机制：</strong>上下各多渲染几个节点，防止快速滚动时出现空白</li>
          </ul>
        </div>
      </div>

      <div class="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
        <h3 class="font-semibold text-green-800 dark:text-green-300 mb-2">📈 性能优势对比</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left">
            <thead>
              <tr class="border-b border-green-300 dark:border-green-700">
                <th class="py-2 px-3">数据规模</th>
                <th class="py-2 px-3">普通模式 DOM 数</th>
                <th class="py-2 px-3">虚拟滚动 DOM 数</th>
                <th class="py-2 px-3">性能提升</th>
              </tr>
            </thead>
            <tbody class="text-green-700 dark:text-green-400">
              <tr>
                <td class="py-2 px-3">100 节点</td>
                <td class="py-2 px-3">~150</td>
                <td class="py-2 px-3">~25</td>
                <td class="py-2 px-3 font-medium">6x</td>
              </tr>
              <tr>
                <td class="py-2 px-3">500 节点</td>
                <td class="py-2 px-3">~750</td>
                <td class="py-2 px-3">~25</td>
                <td class="py-2 px-3 font-medium">30x</td>
              </tr>
              <tr>
                <td class="py-2 px-3">1000 节点</td>
                <td class="py-2 px-3">~1500</td>
                <td class="py-2 px-3">~25</td>
                <td class="py-2 px-3 font-medium">60x</td>
              </tr>
              <tr>
                <td class="py-2 px-3">5000 节点</td>
                <td class="py-2 px-3">~7500</td>
                <td class="py-2 px-3">~25</td>
                <td class="py-2 px-3 font-medium">300x</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800">
        <h3 class="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">💡 最佳实践建议</h3>
        <ul class="list-disc list-inside space-y-1 text-sm text-yellow-700 dark:text-yellow-400">
          <li><strong>虚拟滚动适用场景：</strong>数据量超过 200 个节点时推荐启用</li>
          <li><strong>节点过滤：</strong>配合防抖函数（debounce）避免频繁触发过滤操作</li>
          <li><strong>懒加载策略：</strong>适用于远程 API 数据源，建议结合 loading 状态提供良好用户体验</li>
          <li><strong>事件监听：</strong>生产环境建议移除调试日志，仅保留必要的业务逻辑</li>
          <li><strong>方法调用：</strong>确保通过 ref 正确获取组件实例后再调用方法</li>
          <li><strong>TypeScript 支持：</strong>所有方法和事件都有完整的类型定义，享受类型安全</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
