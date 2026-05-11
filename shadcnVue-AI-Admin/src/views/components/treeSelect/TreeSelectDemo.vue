<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { TreeSelect } from '@/components/tree-select'
import type { TreeNode } from '@/components/tree'

const singleValue = ref<string | number>('')
const multiValue = ref<(string | number)[]>([])
const checkboxSingleValue = ref<string | number>('')
const strictValue = ref<string | number>('')
const lazyValue = ref<string | number>('')
const searchValue = ref<string | number>('')

const singleTreeRef = ref<InstanceType<typeof TreeSelect> | null>(null)

const treeData = reactive<TreeNode[]>([
  {
    id: '1',
    label: '项目管理',
    children: [
      {
        id: '1-1',
        label: '需求文档',
        children: [
          { id: '1-1-1', label: 'PRD 文档', isLeaf: true },
          { id: '1-1-2', label: '用户故事', isLeaf: true },
        ],
      },
      {
        id: '1-2',
        label: '开发任务',
        children: [
          { id: '1-2-1', label: '前端开发', isLeaf: true },
          { id: '1-2-2', label: '后端开发', isLeaf: true },
          { id: '1-2-3', label: '数据库设计', isLeaf: true, disabled: true },
        ],
      },
    ],
  },
  {
    id: '2',
    label: '设计资源',
    children: [
      { id: '2-1', label: 'UI 稿件', isLeaf: true },
      { id: '2-2', label: '图标库', isLeaf: true },
      { id: '2-3', label: '设计规范', isLeaf: true },
    ],
  },
  {
    id: '3',
    label: '技术文档',
    disabled: true,
    children: [
      { id: '3-1', label: 'API 文档', isLeaf: true },
      { id: '3-2', label: '部署指南', isLeaf: true },
    ],
  },
])

const strictData = reactive<TreeNode[]>([
  {
    id: 's1',
    label: '全部部门',
    children: [
      {
        id: 's1-1',
        label: '技术部',
        children: [
          { id: 's1-1-1', label: '前端组' },
          { id: 's1-1-2', label: '后端组' },
        ],
      },
      {
        id: 's1-2',
        label: '产品部',
        children: [
          { id: 's1-2-1', label: '产品经理组' },
        ],
      },
    ],
  },
])

const lazyBaseData = reactive<TreeNode[]>([
  {
    id: 'l1',
    label: '省市区数据',
    isLeaf: false,
    children: [],
  },
])

async function loadRegionData(node: TreeNode) {
  await new Promise(resolve => setTimeout(resolve, 600))
  const mockChildren: Record<string, TreeNode[]> = {
    'l1': [
      {
        id: 'l1-1',
        label: '广东省',
        isLeaf: false,
        children: [],
      },
      {
        id: 'l1-2',
        label: '浙江省',
        isLeaf: false,
        children: [],
      },
    ],
    'l1-1': [
      { id: 'l1-1-1', label: '广州市', isLeaf: true },
      { id: 'l1-1-2', label: '深圳市', isLeaf: true },
    ],
    'l1-2': [
      { id: 'l1-2-1', label: '杭州市', isLeaf: true },
      { id: 'l1-2-2', label: '宁波市', isLeaf: true },
    ],
  }
  const children = mockChildren[node.id as string]
  if (children) {
    node.children = children
  }
}

const searchEvents = ref<string[]>([])
const eventLog = ref<string[]>([])

function logEvent(msg: string) {
  eventLog.value.unshift(`${new Date().toLocaleTimeString()} - ${msg}`)
  if (eventLog.value.length > 10) eventLog.value.pop()
}

function logSearch(msg: string) {
  searchEvents.value.unshift(`${new Date().toLocaleTimeString()} - ${msg}`)
  if (searchEvents.value.length > 10) searchEvents.value.pop()
}

function handleChange(val: string | number | (string | number)[]) {
  logEvent(`change: ${JSON.stringify(val)}`)
}

function handleNodeClick(data: TreeNode) {
  logEvent(`node-click: ${data.label}`)
}

function handleVisibleChange(visible: boolean) {
  logEvent(`面板${visible ? '展开' : '收起'}`)
}

function handleRemoveTag(key: string | number) {
  logEvent(`移除标签: ${key}`)
}

function customFilterMethod(text: string, node: TreeNode) {
  const label = (node.label || '').toLowerCase()
  return label.includes(text.toLowerCase())
}

const clearable = ref(true)
const placeholder = ref('请选择节点')

const selectedLabel = computed(() => {
  if (!singleValue.value) return '未选择'
  const findLabel = (nodes: TreeNode[]): string => {
    for (const n of nodes) {
      if (n.id === singleValue.value) return n.label
      if (n.children) {
        const found = findLabel(n.children)
        if (found) return found
      }
    }
    return ''
  }
  return findLabel(treeData)
})
</script>

<template>
  <div class="p-6 space-y-8">
    <div>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">TreeSelect 树形选择器</h1>
      <p class="mt-2 text-gray-600 dark:text-gray-400">
        结合 Tree 组件和 Popover 组件实现的树形下拉选择器，支持单选、多选、搜索、懒加载等功能
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      <div class="p-4 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/20">
        <h3 class="font-semibold text-blue-700 dark:text-blue-400">🎯 单选</h3>
        <p class="text-sm text-blue-600 dark:text-blue-300 mt-1">点击叶子节点直接选中，自动关闭面板</p>
      </div>
      <div class="p-4 rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/20">
        <h3 class="font-semibold text-green-700 dark:text-green-400">✅ 多选</h3>
        <p class="text-sm text-green-600 dark:text-green-300 mt-1">开启 multiple 后自动显示复选框</p>
      </div>
      <div class="p-4 rounded-lg border border-purple-200 bg-purple-50 dark:bg-purple-950/20">
        <h3 class="font-semibold text-purple-700 dark:text-purple-400">🔍 搜索</h3>
        <p class="text-sm text-purple-600 dark:text-purple-300 mt-1">filterMethod 自定义筛选逻辑</p>
      </div>
      <div class="p-4 rounded-lg border border-orange-200 bg-orange-50 dark:bg-orange-950/20">
        <h3 class="font-semibold text-orange-700 dark:text-orange-400">⏳ 懒加载</h3>
        <p class="text-sm text-orange-600 dark:text-orange-300 mt-1">展开时异步加载子节点数据</p>
      </div>
      <div class="p-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20">
        <h3 class="font-semibold text-red-700 dark:text-red-400">🔒 严格模式</h3>
        <p class="text-sm text-red-600 dark:text-red-300 mt-1">checkStrictly 使任意节点可选</p>
      </div>
    </div>

    <div class="flex flex-wrap gap-4 p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
      <label class="flex items-center gap-2 cursor-pointer">
        <input v-model="clearable" type="checkbox">
        <span>可清空</span>
      </label>
    </div>

    <!-- 单选演示 -->
    <div class="border rounded-lg overflow-hidden shadow-sm">
      <div
        class="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-b">
        <h2 class="text-lg font-semibold text-blue-800 dark:text-blue-300">🎯 单选模式</h2>
        <p class="text-sm text-blue-600 dark:text-blue-400 mt-1">默认仅叶子节点可选，选中后自动关闭面板</p>
      </div>
      <div class="p-4 bg-white dark:bg-gray-950 space-y-4">
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex items-center gap-2">
            <span class="text-sm text-muted-foreground w-16">选中值：</span>
            <code class="text-sm bg-muted px-2 py-0.5 rounded">{{ singleValue || '(空)' }}</code>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm text-muted-foreground w-16">标签：</span>
            <code class="text-sm bg-muted px-2 py-0.5 rounded">{{ selectedLabel }}</code>
          </div>
        </div>
        <TreeSelect ref="singleTreeRef" v-model="singleValue" :data="treeData" :placeholder="placeholder"
          :clearable="clearable" size="default" @change="handleChange" @node-click="handleNodeClick"
          @visible-change="handleVisibleChange" />
      </div>
    </div>

    <!-- 复选框单选演示 -->
    <div class="border rounded-lg overflow-hidden shadow-sm">
      <div
        class="px-4 py-3 bg-gradient-to-r from-cyan-50 to-teal-50 dark:from-cyan-950/30 dark:to-teal-950/30 border-b">
        <h2 class="text-lg font-semibold text-cyan-800 dark:text-cyan-300">☑️ 复选框单选</h2>
        <p class="text-sm text-cyan-600 dark:text-cyan-400 mt-1">showCheckbox=true 且非多选，通过复选框做唯一选择</p>
      </div>
      <div class="p-4 bg-white dark:bg-gray-950 space-y-4">
        <div class="flex items-center gap-2">
          <span class="text-sm text-muted-foreground w-16">选中值：</span>
          <code class="text-sm bg-muted px-2 py-0.5 rounded">{{ checkboxSingleValue || '(空)' }}</code>
        </div>
        <TreeSelect v-model="checkboxSingleValue" :data="treeData" show-checkbox :clearable="clearable"
          placeholder="通过复选框单选" @change="handleChange" />
      </div>
    </div>

    <!-- 多选演示 -->
    <div class="border rounded-lg overflow-hidden shadow-sm">
      <div
        class="px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-b">
        <h2 class="text-lg font-semibold text-green-800 dark:text-green-300">✅ 多选模式</h2>
        <p class="text-sm text-green-600 dark:text-green-400 mt-1">开启 multiple 自动显示复选框，支持多标签展示和逐个移除</p>
      </div>
      <div class="p-4 bg-white dark:bg-gray-950 space-y-4">
        <div class="flex items-center gap-2">
          <span class="text-sm text-muted-foreground w-16">选中值：</span>
          <code
            class="text-sm bg-muted px-2 py-0.5 rounded">{{ multiValue.length ? multiValue.join(', ') : '(空)' }}</code>
        </div>
        <TreeSelect v-model="multiValue" :data="treeData" multiple :clearable="clearable" placeholder="请选择多个节点"
          @change="handleChange" @remove-tag="handleRemoveTag" />
      </div>
    </div>

    <!-- 严格模式演示 -->
    <div class="border rounded-lg overflow-hidden shadow-sm">
      <div class="px-4 py-3 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 border-b">
        <h2 class="text-lg font-semibold text-red-800 dark:text-red-300">🔒 checkStrictly 严格模式</h2>
        <p class="text-sm text-red-600 dark:text-red-400 mt-1">checkStrictly=true 时任意节点都可被选择，不受父子关联限制</p>
      </div>
      <div class="p-4 bg-white dark:bg-gray-950 space-y-4">
        <div class="flex items-center gap-2">
          <span class="text-sm text-muted-foreground w-16">选中值：</span>
          <code class="text-sm bg-muted px-2 py-0.5 rounded">{{ strictValue || '(空)' }}</code>
        </div>
        <TreeSelect v-model="strictValue" :data="strictData" check-strictly :clearable="clearable"
          placeholder="任意节点可选（父子不关联）" @change="handleChange" />
      </div>
    </div>

    <!-- 搜索功能演示 -->
    <div class="border rounded-lg overflow-hidden shadow-sm">
      <div
        class="px-4 py-3 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 border-b">
        <h2 class="text-lg font-semibold text-purple-800 dark:text-purple-300">🔍 关键字搜索</h2>
        <p class="text-sm text-purple-600 dark:text-purple-400 mt-1">通过 filterMethod 自定义筛选方法，面板内显示搜索框</p>
      </div>
      <div class="p-4 bg-white dark:bg-gray-950 space-y-4">
        <div class="flex items-center gap-2">
          <span class="text-sm text-muted-foreground w-16">选中值：</span>
          <code class="text-sm bg-muted px-2 py-0.5 rounded">{{ searchValue || '(空)' }}</code>
        </div>
        <TreeSelect v-model="searchValue" :data="treeData" :filter-method="customFilterMethod" :clearable="clearable"
          default-expand-all placeholder="输入关键字搜索..."
          @change="(val) => { handleChange(val); logSearch(`筛选结果选中: ${val}`) }" />
        <div v-if="searchEvents.length"
          class="p-3 rounded bg-green-50 dark:bg-green-950/20 border border-green-200 text-sm space-y-1 max-h-32 overflow-y-auto">
          <p v-for="(msg, i) in searchEvents" :key="i" class="text-green-700 dark:text-green-400">{{ msg }}</p>
        </div>
      </div>
    </div>

    <!-- 懒加载演示 -->
    <div class="border rounded-lg overflow-hidden shadow-sm">
      <div
        class="px-4 py-3 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border-b">
        <h2 class="text-lg font-semibold text-orange-800 dark:text-orange-300">⏳ 懒加载</h2>
        <p class="text-sm text-orange-600 dark:text-orange-400 mt-1">展开节点时通过 loadData 异步获取子节点数据，适合大数据量场景</p>
      </div>
      <div class="p-4 bg-white dark:bg-gray-950 space-y-4">
        <div class="flex items-center gap-2">
          <span class="text-sm text-muted-foreground w-16">选中值：</span>
          <code class="text-sm bg-muted px-2 py-0.5 rounded">{{ lazyValue || '(空)' }}</code>
        </div>
        <TreeSelect v-model="lazyValue" :data="lazyBaseData" lazy :load-data="loadRegionData" :clearable="clearable"
          placeholder="展开节点加载子数据" @change="handleChange" />
      </div>
    </div>

    <!-- 事件日志 -->
    <div class="border rounded-lg overflow-hidden shadow-sm">
      <div
        class="px-4 py-3 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-950/30 dark:to-slate-950/30 border-b">
        <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-300">📋 事件日志</h2>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">实时展示 change、node-click、visible-change、remove-tag 事件</p>
      </div>
      <div class="p-4 bg-white dark:bg-gray-950">
        <div
          class="p-3 rounded bg-gray-50 dark:bg-gray-900 border font-mono text-sm space-y-1 max-h-48 overflow-y-auto">
          <p v-if="!eventLog.length" class="text-muted-foreground">暂无事件</p>
          <p v-for="(msg, i) in eventLog" :key="i" class="text-gray-700 dark:text-gray-300">{{ msg }}</p>
        </div>
      </div>
    </div>

    <!-- 使用说明 -->
    <div class="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border">
      <h3 class="font-semibold mb-2">使用说明：</h3>
      <ul class="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
        <li><strong>v-model</strong>：单选绑定 string | number，多选绑定 (string | number)[]</li>
        <li><strong>checkStrictly</strong>：true 时任意节点可选，false（默认）时仅叶子节点可选</li>
        <li><strong>disabled</strong>：数据中的 disabled 字段可禁用单个节点</li>
        <li><strong>filterMethod</strong>：自定义数据筛选方法，接收 (value, node) 返回 boolean</li>
        <li><strong>filterNodeMethod</strong>：自定义节点筛选方法，效果同 filterMethod</li>
        <li><strong>lazy + loadData</strong>：启用懒加载后，展开无数据的节点时自动调用 loadData</li>
        <li><strong>node-key</strong>：自定义数据结构的 key 字段名，默认 'id'</li>
        <li><strong>fieldNames</strong>：自定义 label/children/disabled 等字段映射</li>
        <li><strong>showCheckbox</strong>：显式控制是否显示复选框，多选时自动为 true</li>
        <li><strong>对外暴露</strong>：通过 ref 获取 treeRef、selectRef、isOpen、selectedKeys</li>
      </ul>
    </div>
  </div>
</template>
