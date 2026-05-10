<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Tree } from '@/components/ui/tree'
import type { TreeNode } from '@/components/ui/tree'

// ==================== 基础示例数据 ====================
const basicData = reactive<TreeNode[]>([
  {
    id: '1',
    label: '📁 项目管理',
    children: [
      {
        id: '1-1',
        label: '📋 需求文档',
        children: [
          { id: '1-1-1', label: '📄 PRD 文档', isLeaf: true },
          { id: '1-1-2', label: '📄 用户故事', isLeaf: true },
        ]
      },
      {
        id: '1-2',
        label: '💻 开发任务',
        children: [
          { id: '1-2-1', label: '🔧 前端开发', isLeaf: true },
          { id: '1-2-2', label: '⚙️ 后端开发', isLeaf: true },
          { id: '1-2-3', label: '🗄️ 数据库设计', isLeaf: true, disabled: true },
        ]
      },
    ]
  },
  {
    id: '2',
    label: '🎨 设计资源',
    children: [
      { id: '2-1', label: '🖼️ UI 稿件', isLeaf: true },
      { id: '2-2', label: '🎭 图标库', isLeaf: true },
      { id: '2-3', label: '📐 设计规范', isLeaf: true },
    ]
  },
  {
    id: '3',
    label: '📚 技术文档',
    disabled: true,
    children: [
      { id: '3-1', label: '📘 API 文档', isLeaf: true },
      { id: '3-2', label: '📙 部署指南', isLeaf: true },
    ]
  },
])

// ==================== 场景：禁用但可展开 ====================
// 节点被禁用，但如果是有子节点的，仍可以点击展开图标查看子节点
const disabledButExpandableData = reactive<TreeNode[]>([
  {
    id: 'd1',
    label: '🔒 已归档项目（禁用但可展开）',
    disabled: true,
    description: '此节点已禁用，但仍可点击箭头展开查看子节点内容',
    children: [
      { id: 'd1-1', label: '📋 历史需求文档', isLeaf: true },
      { id: 'd1-2', label: '💾 备份数据', isLeaf: true, disabled: true },
      {
        id: 'd1-3',
        label: '📁 归档子目录（也可展开）',
        disabled: true,
        children: [
          { id: 'd1-3-1', label: '📄 旧版本文件 v1.0', isLeaf: true },
          { id: 'd1-3-2', label: '📄 旧版本文件 v2.0', isLeaf: true },
        ]
      }
    ]
  },
  {
    id: 'd2',
    label: '✅ 正常可用节点',
    children: [
      { id: 'd2-1', label: '📝 当前任务', isLeaf: true },
      { id: 'd2-2', label: '🎯 进行中项目', isLeaf: true },
    ]
  },
  {
    id: 'd3',
    label: '🚫 完全禁用的叶子节点',
    disabled: true,
    isLeaf: true,
    description: '叶子节点被禁用后完全无法交互'
  }
])

// ==================== 控制选项 ====================
const showCheckbox = ref(true)
const checkStrictly = ref(false)
const highlightCurrent = ref(true)
const defaultExpandAll = ref(true)
const accordion = ref(false)
const showIcon = ref(true)
const blockNode = ref(false)

// ==================== 事件处理 ====================
function onCheck(data: TreeNode, checked: boolean, node: unknown) {
  console.log('选中节点:', data, checked, node)
}

function onExpand(data: TreeNode, expanded: boolean, node: unknown) {
  console.log('展开节点:', data, expanded, node)
}

function onSelect(data: TreeNode, node: unknown) {
  console.log('选中项:', data, node)
}
</script>

<template>
  <div class="p-6 space-y-8">
    <!-- 页面标题 -->
    <div>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Tree 基础功能演示</h1>
      <p class="mt-2 text-gray-600 dark:text-gray-400">
        展示 Tree 组件的基础功能：复选框、展开/折叠、手风琴模式、图标显示等
      </p>
    </div>

    <!-- 功能说明卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div class="p-4 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/20">
        <h3 class="font-semibold text-blue-700 dark:text-blue-400">✅ 复选框功能</h3>
        <p class="text-sm text-blue-600 dark:text-blue-300 mt-1">
          支持多选/单选，可配置严格模式（父子不关联）
        </p>
      </div>

      <div class="p-4 rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/20">
        <h3 class="font-semibold text-green-700 dark:text-green-400">🔄 展开/折叠</h3>
        <p class="text-sm text-green-600 dark:text-green-300 mt-1">
          支持默认全部展开或手动控制
        </p>
      </div>

      <div class="p-4 rounded-lg border border-purple-200 bg-purple-50 dark:bg-purple-950/20">
        <h3 class="font-semibold text-purple-700 dark:text-purple-400">🎵 手风琴模式</h3>
        <p class="text-sm text-purple-600 dark:text-purple-300 mt-1">
          同时只展开一个节点，自动收起其他节点
        </p>
      </div>

      <div class="p-4 rounded-lg border border-orange-200 bg-orange-50 dark:bg-orange-950/20">
        <h3 class="font-semibold text-orange-700 dark:text-orange-400">🎨 图标显示</h3>
        <p class="text-sm text-orange-600 dark:text-orange-300 mt-1">
          自动显示文件夹/文件图标，支持自定义
        </p>
      </div>

      <div class="p-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20">
        <h3 class="font-semibold text-red-700 dark:text-red-400">🔒 节点禁用</h3>
        <p class="text-sm text-red-600 dark:text-red-300 mt-1">
          可禁用单个节点，有子节点时仍可展开查看
        </p>
      </div>

      <div class="p-4 rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
        <h3 class="font-semibold text-yellow-700 dark:text-yellow-400">💡 禁用但可展开</h3>
        <p class="text-sm text-yellow-600 dark:text-yellow-300 mt-1">
          禁用的父节点仍可点击箭头展开，但其他操作不可用
        </p>
      </div>

      <div class="p-4 rounded-lg border border-gray-200 bg-gray-50 dark:bg-gray-900/20">
        <h3 class="font-semibold text-gray-700 dark:text-gray-400">📍 高亮当前</h3>
        <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">
          点击节点高亮显示当前选中项
        </p>
      </div>
    </div>

    <!-- 控制面板 -->
    <div class="flex flex-wrap gap-4 p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
      <label class="flex items-center gap-2 cursor-pointer">
        <input v-model="showCheckbox" type="checkbox" />
        <span>显示复选框</span>
      </label>
      <label class="flex items-center gap-2 cursor-pointer">
        <input v-model="checkStrictly" type="checkbox" />
        <span>严格模式</span>
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
        <input v-model="accordion" type="checkbox" />
        <span>手风琴</span>
      </label>
      <label class="flex items-center gap-2 cursor-pointer">
        <input v-model="showIcon" type="checkbox" />
        <span>显示图标</span>
      </label>
      <label class="flex items-center gap-2 cursor-pointer">
        <input v-model="blockNode" type="checkbox" />
        <span>块级节点</span>
      </label>
    </div>

    <!-- Tree 组件 -->
    <div class="border rounded-lg overflow-auto p-4">
      <h3 class="text-lg font-semibold mb-3">基础功能演示</h3>
      <Tree :data="basicData" :show-checkbox="showCheckbox" :check-strictly="checkStrictly"
        :highlight-current="highlightCurrent" :default-expand-all="defaultExpandAll" :accordion="accordion"
        :show-icon="showIcon" :block-node="blockNode" @check="onCheck" @expand="onExpand" @select="onSelect">
        <!-- 自定义 slot 示例 -->
        <template #default="{ node }">
          <template v-if="node.disabled">
            <span class="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded">DISABLED</span>
          </template>
        </template>
      </Tree>
    </div>

    <!-- ==================== 场景：禁用但可展开 ==================== -->
    <div
      class="border rounded-lg overflow-auto p-4 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
      <div class="flex items-start gap-3 mb-4">
        <span class="text-2xl">💡</span>
        <div>
          <h3 class="text-lg font-semibold text-yellow-800 dark:text-yellow-300">场景：禁用但可展开</h3>
          <p class="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
            节点被禁用时，如果<strong>有子节点</strong>，仍可点击<strong>展开箭头图标</strong>查看内容；
            但<strong>其他操作（选中、复选框、自定义 slot）均不可用</strong>。
            叶子节点被禁用后则完全无法交互。
          </p>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-900 rounded p-3 border border-yellow-100 dark:border-yellow-900">
        <Tree :data="disabledButExpandableData" :show-checkbox="true" :highlight-current="true"
          :default-expand-all="false" :show-icon="true">
          <!-- 自定义 slot：仅未禁用的节点才显示额外内容 -->
          <template #default="{ node }">
            <template v-if="node.disabled">
              <span class="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded font-medium">
                {{ node.children?.length ? '🔒 禁用(可展开)' : '🚫 完全禁用' }}
              </span>
              <span v-if="node.description" class="ml-1 text-xs text-gray-500">{{ node.description }}</span>
            </template>
          </template>
        </Tree>
      </div>

      <!-- 场景说明 -->
      <div class="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded text-sm space-y-2">
        <p class="font-semibold text-yellow-800 dark:text-yellow-300">📌 交互说明：</p>
        <ul class="list-disc list-inside space-y-1 text-yellow-700 dark:text-yellow-400 ml-2">
          <li><strong>🔒 已归档项目</strong>：禁用状态，半透明显示，<span class="text-green-600 font-medium">✅ 可点击箭头展开/折叠</span></li>
          <li><strong>📁 归档子目录</strong>：嵌套的禁用节点，同样<span class="text-green-600 font-medium">✅ 可展开</span>查看子项</li>
          <li><strong>💾 备份数据</strong>：禁用的叶子节点，<span class="text-red-600 font-medium">❌ 完全无法交互</span></li>
          <li><strong>🚫 完全禁用的叶子节点</strong>：<span class="text-red-600 font-medium">❌ pointer-events-none</span>，鼠标无法穿透
          </li>
          <li><strong>✅ 正常可用节点</strong>：所有功能正常使用</li>
        </ul>
      </div>
    </div>

    <!-- 使用说明 -->
    <div class="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border">
      <h3 class="font-semibold mb-2">基础功能说明：</h3>
      <ul class="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
        <li><strong>复选框</strong>：勾选父节点会自动勾选/取消所有子节点（除非开启严格模式）</li>
        <li><strong>严格模式</strong>：父子节点的选中状态互不影响</li>
        <li><strong>手风琴</strong>：展开一个节点时自动收起其他同级节点</li>
        <li><strong>默认展开</strong>：初始化时展开所有有子节点的项目</li>
        <li><strong>块级节点</strong>：节点内容占满整行宽度</li>
        <li><strong>节点禁用</strong>：
          <ul class="list-disc list-inside ml-4 mt-1 space-y-0.5">
            <li>有子节点的禁用节点：<span class="text-green-600 font-medium">仍可点击箭头展开/折叠</span></li>
            <li>叶子节点被禁用：<span class="text-red-600 font-medium">完全无法交互</span>（pointer-events-none）</li>
          </ul>
        </li>
      </ul>
    </div>
  </div>
</template>
