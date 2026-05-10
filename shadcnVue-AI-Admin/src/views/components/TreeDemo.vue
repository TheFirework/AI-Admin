<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Tree } from '@/components/ui/tree'
import type { TreeNode } from '@/components/ui/tree'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Plus, Trash2, ArrowLeft, ArrowRight } from 'lucide-vue-next'

const treeRef = ref<InstanceType<typeof Tree> | null>(null)

// ==================== 拖拽场景测试数据 ====================
// 场景说明：
//   1. 正常节点：显示 ⠿ 拖拽手柄，可自由拖入/拖出
//   2. disabled 节点：不显示手柄，不可拖拽，可展开，不可选中
//   3. allowDrag: false：不显示手柄，不可拖拽
//   4. allowDrop: false：显示手柄可被拖拽，但不能拖入该节点
//   5. 子节点不受父节点 disabled 影响
const treeData = reactive<TreeNode[]>([
  {
    id: 1,
    label: '📁 正常目录（可拖拽）',
    children: [
      { id: 11, label: '📄 文档 1-1', isLeaf: true },
      { id: 12, label: '📄 文档 1-2', isLeaf: true },
      {
        id: 13,
        label: '📁 子目录',
        children: [
          { id: 131, label: '📄 子文档 1-3-1', isLeaf: true },
          { id: 132, label: '📄 子文档 1-3-2', isLeaf: true },
        ]
      }
    ]
  },
  {
    id: 2,
    label: '🔒 禁用目录（不可拖拽）',
    disabled: true,
    children: [
      { id: 21, label: '📄 子文档 2-1（不受父禁用影响，可拖拽）', isLeaf: true },
      { id: 22, label: '📄 子文档 2-2（不受父禁用影响，可拖拽）', isLeaf: true },
    ]
  },
  {
    id: 3,
    label: '🚫 禁止拖入的节点',
    allowDrop: false,
    children: [
      { id: 31, label: '📄 可拖出但不能拖入', isLeaf: true },
      { id: 32, label: '📄 可拖出但不能拖入', isLeaf: true },
    ]
  },
  { id: 4, label: '📄 根级文档（可拖拽）', isLeaf: true },
  {
    id: 5,
    label: '🚫 不可拖拽目录',
    allowDrag: false,
    children: [
      { id: 51, label: '📄 父级不可拖，子级可拖', isLeaf: true },
    ]
  },
  { id: 6, label: '📄 另一个根级文档（可拖拽）', isLeaf: true },
])

const showCheckbox = ref(true)
const checkStrictly = ref(false)
const highlightCurrent = ref(true)
const defaultExpandAll = ref(false)
const accordion = ref(false)
const showIcon = ref(true)
const blockNode = ref(false)
const draggable = ref(true)
const height = ref(0)
const filterText = ref('')

const selectedNode = ref<TreeNode | null>(null)
const checkedKeys = ref<(string | number)[]>([11, 21])
const expandedKeys = ref<(string | number)[]>([1, 13])
const eventLog = ref<string[]>([])

function addLog(message: string) {
  eventLog.value.unshift(`[${new Date().toLocaleTimeString()}] ${message}`)
  if (eventLog.value.length > 50) {
    eventLog.value.pop()
  }
}

function handleNodeClick(node: TreeNode) {
  selectedNode.value = node
  addLog(`节点点击: ${node.label} (ID: ${node.id})`)
}

function handleCheck(node: TreeNode, checked: boolean) {
  addLog(`复选框点击: ${node.label} - ${checked ? '选中' : '取消'}`)
}

function handleCheckChange(node: TreeNode, checked: boolean, keys: (string | number)[]) {
  checkedKeys.value = [...keys]
  addLog(`勾选变化: ${node.label} - ${checked ? '选中' : '取消'} - 已选: ${keys.join(', ')}`)
}

function handleCurrentChange(current: TreeNode | null, old: TreeNode | null) {
  const currentLabel = current?.label || 'null'
  const oldLabel = old?.label || 'null'
  addLog(`当前节点变化: ${oldLabel} -> ${currentLabel}`)
}

function handleExpand(node: TreeNode, expanded: boolean) {
  addLog(`${expanded ? '展开' : '折叠'}: ${node.label}`)
}

function handleExpandChange(node: TreeNode, expanded: boolean, keys: (string | number)[]) {
  expandedKeys.value = [...keys]
}

function handleCollapse(node: TreeNode) {
  addLog(`折叠: ${node.label}`)
}

function handleDragStart(node: TreeNode, event: DragEvent) {
  addLog(`开始拖拽: ${node.label}`)
}

function handleDragEnter(node: TreeNode) {
  addLog(`拖拽进入: ${node.label}`)
}

function handleDragLeave(node: TreeNode) {
  addLog(`拖拽离开: ${node.label}`)
}

function handleDragOver(node: TreeNode) {
  // 持续触发，不记录日志
}

function handleDragEnd(node: TreeNode) {
  addLog(`拖拽结束: ${node.label}`)
}

function handleDrop(node: TreeNode) {
  addLog(`放置到: ${node.label}`)
}

function resetTree() {
  checkedKeys.value = []
  expandedKeys.value = []
  selectedNode.value = null
  filterText.value = ''
  addLog('树形已重置')
}

function expandAll() {
  const getAllIds = (nodes: TreeNode[]): (string | number)[] => {
    const ids: (string | number)[] = []
    nodes.forEach(node => {
      ids.push(node.id)
      if (node.children) {
        ids.push(...getAllIds(node.children))
      }
    })
    return ids
  }
  expandedKeys.value = getAllIds(treeData)
  addLog('展开所有节点')
}

function collapseAll() {
  expandedKeys.value = []
  addLog('折叠所有节点')
}

function handleFilter() {
  treeRef.value?.filter(filterText.value)
  addLog(`过滤: ${filterText.value || '清空'}`)
}

function getCheckedNodes() {
  const nodes = treeRef.value?.getCheckedNodes()
  if (nodes) {
    const labels = nodes.map(n => n.label).join(', ')
    addLog(`获取选中节点: ${labels || '无'}`)
  }
}

function getCheckedKeys() {
  const keys = treeRef.value?.getCheckedKeys()
  addLog(`获取选中Keys: ${keys?.join(', ') || '无'}`)
}

function setCheckedKey() {
  treeRef.value?.setChecked(21, true)
  addLog('设置节点21为选中状态')
}

function appendNode() {
  const newNode: TreeNode = {
    id: Date.now(),
    label: `新节点 ${Date.now()}`,
    isLeaf: true
  }
  treeRef.value?.append(newNode, 1)
  addLog('在正常目录下添加新节点')
}

function removeNode() {
  treeRef.value?.remove(4)
  addLog('删除根级文档节点')
}

function insertBeforeNode() {
  const newNode: TreeNode = {
    id: Date.now(),
    label: '插入节点',
    isLeaf: true
  }
  treeRef.value?.insertBefore(newNode, 6)
  addLog('在另一个根级文档前插入节点')
}

function insertAfterNode() {
  const newNode: TreeNode = {
    id: Date.now(),
    label: '追加节点',
    isLeaf: true
  }
  treeRef.value?.insertAfter(newNode, 6)
  addLog('在另一个根级文档后插入节点')
}

onMounted(() => {
  addLog('Tree组件演示页面加载完成')
})
</script>

<template>
  <div class="min-h-screen bg-background p-6">
    <div class="max-w-7xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-foreground">Tree 组件演示</h1>
          <p class="text-gray-500 mt-1">拖拽测试：拖拽 ⠿ 手柄可调整节点位置或拖入其他节点作为子节点</p>
        </div>
        <div class="flex gap-2">
          <Button @click="expandAll">展开全部</Button>
          <Button @click="collapseAll">折叠全部</Button>
          <Button variant="outline" @click="resetTree">重置</Button>
        </div>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <Card class="xl:col-span-1">
          <CardHeader>
            <CardTitle>组件配置</CardTitle>
            <CardDescription>调整 Tree 组件的各项参数</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">显示复选框</span>
              <Switch v-model="showCheckbox" />
            </div>

            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">严格勾选模式</span>
              <Switch v-model="checkStrictly" />
            </div>

            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">高亮当前节点</span>
              <Switch v-model="highlightCurrent" />
            </div>

            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">默认展开全部</span>
              <Switch v-model="defaultExpandAll" />
            </div>

            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">手风琴模式</span>
              <Switch v-model="accordion" />
            </div>

            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">显示图标</span>
              <Switch v-model="showIcon" />
            </div>

            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">显示图标</span>
              <Switch v-model="showIcon" />
            </div>

            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">块级节点</span>
              <Switch v-model="blockNode" />
            </div>

            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">可拖拽</span>
              <Switch v-model="draggable" />
            </div>

            <div class="space-y-2">
              <span class="text-sm text-gray-600">高度(虚拟滚动)</span>
              <Input type="number" v-model.number="height" placeholder="输入高度(px)" class="w-full" />
            </div>

            <div class="space-y-2">
              <span class="text-sm text-gray-600">过滤搜索</span>
              <div class="flex gap-2">
                <Input v-model="filterText" placeholder="输入关键词" class="flex-1" @keyup.enter="handleFilter" />
                <Button size="sm" @click="handleFilter">搜索</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card class="xl:col-span-2">
          <CardHeader>
            <CardTitle>树形结构</CardTitle>
            <CardDescription>点击节点可展开/折叠，支持复选框选择</CardDescription>
          </CardHeader>
          <CardContent>
            <Tree ref="treeRef" :data="treeData" :show-checkbox="showCheckbox" :check-strictly="checkStrictly"
              :highlight-current="highlightCurrent" :default-expand-all="defaultExpandAll"
              :default-expanded-keys="defaultExpandAll ? [] : expandedKeys" :default-checked-keys="checkedKeys"
              :accordion="accordion" :show-icon="showIcon" :block-node="blockNode" :draggable="draggable"
              :height="height" @node-click="handleNodeClick" @check="handleCheck" @check-change="handleCheckChange"
              @current-change="handleCurrentChange" @expand="handleExpand" @expand-change="handleExpandChange"
              @collapse="handleCollapse" @drag-start="handleDragStart" @drag-enter="handleDragEnter"
              @drag-leave="handleDragLeave" @drag-over="handleDragOver" @drag-end="handleDragEnd" @drop="handleDrop"
              class="max-h-[500px] overflow-y-auto">
              <template #default="{ node }">
                <div v-if="!node.isLeaf" class="flex items-center gap-1">
                  <Button size="icon" class="w-6 h-6 text-xs" @click.stop="appendNode">
                    <Plus class="w-3 h-3" />
                  </Button>
                  <Button size="icon" class="w-6 h-6 text-xs" @click.stop="removeNode">
                    <Trash2 class="w-3 h-3" />
                  </Button>
                </div>
              </template>
            </Tree>
          </CardContent>
        </Card>

        <Card class="xl:col-span-1">
          <CardHeader>
            <CardTitle>方法调用</CardTitle>
            <CardDescription>测试 Tree 组件对外暴露的方法</CardDescription>
          </CardHeader>
          <CardContent class="space-y-2">
            <Button variant="outline" class="w-full" @click="getCheckedNodes">
              获取选中节点
            </Button>
            <Button variant="outline" class="w-full" @click="getCheckedKeys">
              获取选中Keys
            </Button>
            <Button variant="outline" class="w-full" @click="setCheckedKey">
              设置选中(节点21)
            </Button>
            <Button variant="outline" class="w-full" @click="appendNode">
              <Plus class="w-4 h-4 mr-2" />
              追加子节点
            </Button>
            <Button variant="outline" class="w-full" @click="removeNode">
              <Trash2 class="w-4 h-4 mr-2" />
              删除节点
            </Button>
            <Button variant="outline" class="w-full" @click="insertBeforeNode">
              <ArrowLeft class="w-4 h-4 mr-2" />
              前插节点
            </Button>
            <Button variant="outline" class="w-full" @click="insertAfterNode">
              <ArrowRight class="w-4 h-4 mr-2" />
              后插节点
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card class="mt-6">
        <CardHeader>
          <CardTitle>事件日志</CardTitle>
        </CardHeader>
        <CardContent>
          <div v-if="selectedNode" class="space-y-2 mb-4">
            <div class="text-sm">
              <span class="text-gray-500">当前选中节点：</span>
              <span class="font-medium">{{ selectedNode.label }}</span>
              <span class="text-gray-400"> (ID: {{ selectedNode.id }})</span>
            </div>
          </div>
          <div class="mt-4">
            <span class="text-sm text-gray-500">展开的节点：</span>
            <span class="text-sm font-medium">{{ expandedKeys.join(', ') || '无' }}</span>
          </div>
          <div class="mt-2">
            <span class="text-sm text-gray-500">选中的节点：</span>
            <span class="text-sm font-medium">{{ checkedKeys.join(', ') || '无' }}</span>
          </div>
          <div class="mt-4 border-t pt-4">
            <div class="max-h-40 overflow-y-auto space-y-1">
              <div v-for="(log, index) in eventLog" :key="index" class="text-xs text-gray-500">
                {{ log }}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
