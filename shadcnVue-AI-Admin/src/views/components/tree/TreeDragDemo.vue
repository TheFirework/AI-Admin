<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Tree } from '@/components/tree'
import type { TreeNode } from '@/components/tree'

// ==================== 拖拽场景测试数据 ====================
//
// 【4种核心拖拽场景】
//
// 场景1: disabled 本节点被禁用 → 当前节点无法拖拽，子节点正常操作
// 场景2: allowDrag:false 当前节点不可拖拽 → 子节点可以自由拖拽
// 场景3: lockChildren:true 锁定子节点区域 → 子节点无法拖出也无法接收其他节点
// 场景4: 正常节点 可将其他节点拖入当前节点的子节点中
//
const treeData = reactive<TreeNode[]>([
  // ==================== 场景1：本节点被禁用（disabled: true）====================
  // 预期行为：
  //   - 当前节点（s1-parent）：无手柄、不可点击、不可选中
  //   - 子节点（s1-1, s1-2）：完全正常，有手柄、可自由拖拽、可接收拖入
  {
    id: 'scene1-disabled-parent',
    label: '🔒 场景1：本节点禁用（子节点正常）',
    disabled: true,
    children: [
      { id: 's1-1', label: '✅ 正常子节点A（可拖拽）', isLeaf: true },
      { id: 's1-2', label: '✅ 正常子节点B（可拖拽）', isLeaf: true },
      {
        id: 's1-3-dir',
        label: '📁 正常子目录C（可接收子节点）',
        children: [
          { id: 's1-3-1', label: '📄 深层文档', isLeaf: true },
        ]
      }
    ]
  },

  // ==================== 场景2：当前节点不可拖拽（allowDrag: false）====================
  // 预期行为：
  //   - 当前节点（s2-parent）：无手柄、不可被拖到其他位置
  //   - 子节点（s2-1, s2-2, s2-3-dir）：完全正常，可自由拖拽和接收
  {
    id: 'scene2-no-drag',
    label: '🚫 场景2：本节点不可拖出（子节点可拖拽）',
    allowDrag: false,
    children: [
      { id: 's2-1', label: '✅ 可移动子项A', isLeaf: true },
      { id: 's2-2', label: '✅ 可移动子项B', isLeaf: true },
      {
        id: 's2-3-dir',
        label: '📁 可移动子目录（✅ 可接收其他节点）',
        children: [
          { id: 's2-3-1', label: '📄 内部文档', isLeaf: true },
        ]
      }
    ]
  },

  // ==================== 场景3：锁定子节点区域（lockChildren: true）====================
  // 预期行为：
  //   - 当前节点（s3-parent）：正常，可作为容器接收拖入
  //   - 所有子节点（s3-1, s3-2, s3-3-subdir 及其内部所有后代）：无手柄、不可拖出、不可接收拖入（全部被锁定）
  //   - lockChildren 会继承给所有后代，不仅仅是直接子节点
  {
    id: 'scene3-lock-children',
    label: '🔐 场景3：子节点区域锁定（所有后代不可拖拽）',
    lockChildren: true,
    description: '此节点的所有后代都被锁定，不可拖出也不可接收；但可将节点拖到此节点下',
    children: [
      { id: 's3-1', label: '🚫 被锁定的子节点A', isLeaf: true },
      { id: 's3-2', label: '🚫 被锁定的子节点B', isLeaf: true },
      {
        id: 's3-3-subdir',
        label: '🚫 被锁定的子目录（内部所有节点也被锁定）',
        children: [
          { id: 's3-3-1', label: '🚫 深层文档（同样被锁定）', isLeaf: true },
        ]
      }
    ]
  },

  // ==================== 场景4：正常容器（可接收拖入的子节点）====================
  // 预期行为：
  //   - 当前节点（s4-parent）：完全正常
  //   - 可以将其他任何节点拖入此节点的子节点列表中
  //   - 子节点也可以自由移动
  {
    id: 'scene4-normal-container',
    label: '📂 场景4：正常容器（可接收拖入的子节点）',
    children: [
      { id: 's4-1', label: '📄 文档A（可拖走）', isLeaf: true },
      { id: 's4-2', label: '📄 文档B（可拖走）', isLeaf: true },
      {
        id: 's4-3-dir',
        label: '📁 子目录（也可接收拖入）',
        children: [
          { id: 's4-3-1', label: '📄 内部文档', isLeaf: true },
        ]
      }
    ]
  },

  // ==================== 补充：根级叶子节点（仅可拖出）====================
  { id: 'leaf-node-1', label: '📄 根级叶子X（仅可拖出，不可接收）', isLeaf: true },
  { id: 'leaf-node-2', label: '📄 根级叶子Y（仅可拖出，不可接收）', isLeaf: true },
])

// ==================== 控制选项 ====================
const showCheckbox = ref(true)
const checkStrictly = ref(false)
const highlightCurrent = ref(true)
const defaultExpandAll = ref(true)
const accordion = ref(false)
const showIcon = ref(true)
const blockNode = ref(false)
const draggable = ref(true)

// ==================== 组件级控制（双模式）====================
const componentDisabled = ref(false) // 组件级禁用：整个树禁用
const componentLockChildren = ref(false) // 组件级锁定：所有节点锁定
const height = ref(0)

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

function onDrop(info: any) {
  console.log('拖拽完成:', info)
}
</script>

<template>
  <div class="p-6 space-y-8">
    <!-- 页面标题 -->
    <div>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Tree 拖拽功能演示</h1>
      <p class="mt-2 text-gray-600 dark:text-gray-400">
        展示 Tree 组件的 4 种核心拖拽场景及其交互行为，以及组件级/节点级的双模式控制系统
      </p>
    </div>

    <!-- 场景说明卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="p-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20">
        <h3 class="font-semibold text-red-700 dark:text-red-400">🔒 场景1：本节点禁用</h3>
        <p class="text-sm text-red-600 dark:text-red-300 mt-1">
          当前节点 disabled → 无法拖拽/点击；子节点完全正常
        </p>
      </div>

      <div class="p-4 rounded-lg border border-orange-200 bg-orange-50 dark:bg-orange-950/20">
        <h3 class="font-semibold text-orange-700 dark:text-orange-400">🚫 场景2：本节点不可拖出</h3>
        <p class="text-sm text-orange-600 dark:text-orange-300 mt-1">
          当前节点 allowDrag:false → 无手柄/不可拖动；子节点可自由操作
        </p>
      </div>

      <div class="p-4 rounded-lg border border-purple-200 bg-purple-50 dark:bg-purple-950/20">
        <h3 class="font-semibold text-purple-700 dark:text-purple-400">🔐 场景3：子节点区域锁定</h3>
        <p class="text-sm text-purple-600 dark:text-purple-300 mt-1">
          当前节点 lockChildren:true → 所有后代不可拖出/不可接收（继承锁定）
        </p>
      </div>

      <div class="p-4 rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/20">
        <h3 class="font-semibold text-green-700 dark:text-green-400">📂 场景4：正常容器</h3>
        <p class="text-sm text-green-600 dark:text-green-300 mt-1">
          完全正常的目录 → 可接收任何节点的拖入
        </p>
      </div>
    </div>

    <!-- 控制面板 -->
    <div class="flex flex-wrap gap-4 p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
      <!-- 组件级控制（双模式） -->
      <div class="w-full border-b border-gray-300 dark:border-gray-600 pb-3 mb-2">
        <h4 class="font-semibold text-sm text-blue-600 dark:text-blue-400 mb-2">🔒 组件级控制</h4>
        <div class="flex flex-wrap gap-4">
          <label
            class="flex items-center gap-2 cursor-pointer bg-red-50 dark:bg-red-950/20 px-3 py-1.5 rounded border border-red-200">
            <input v-model="componentDisabled" type="checkbox" />
            <span class="text-sm font-medium text-red-600">组件级禁用</span>
          </label>
          <label
            class="flex items-center gap-2 cursor-pointer bg-purple-50 dark:bg-purple-950/20 px-3 py-1.5 rounded border border-purple-200">
            <input v-model="componentLockChildren" type="checkbox" />
            <span class="text-sm font-medium text-purple-600">组件级锁定</span>
          </label>
        </div>
      </div>

      <!-- 节点功能开关 -->
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
      <label class="flex items-center gap-2 cursor-pointer">
        <input v-model="draggable" type="checkbox" />
        <span>启用拖拽</span>
      </label>
    </div>

    <!-- Tree 组件 -->
    <div class="border rounded-lg overflow-auto" :style="{ height: height ? `${height}px` : 'auto' }">
      <Tree :data="treeData" :show-checkbox="showCheckbox" :check-strictly="checkStrictly"
        :highlight-current="highlightCurrent" :default-expand-all="defaultExpandAll" :accordion="accordion"
        :show-icon="showIcon" :block-node="blockNode" :draggable="draggable" :height="height"
        :disabled="componentDisabled" :lock-children="componentLockChildren" @check="onCheck" @expand="onExpand"
        @select="onSelect" @drop="onDrop">
        <!-- 自定义 slot 示例 -->
        <template #default="{ node }">
          <template v-if="node.disabled">
            <span class="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded">NODE-DISABLED</span>
          </template>
          <template v-else-if="node.allowDrag === false">
            <span class="ml-2 px-2 py-0.5 text-xs bg-orange-100 text-orange-600 rounded">NO DRAG</span>
          </template>
          <template v-else-if="(node as any).lockChildren">
            <span class="ml-2 px-2 py-0.5 text-xs bg-purple-100 text-purple-600 rounded">NODE-LOCK</span>
          </template>
        </template>
      </Tree>
    </div>

    <!-- 操作日志 -->
    <div class="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border">
      <h3 class="font-semibold mb-2">双模式系统说明：</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
        <div class="p-3 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200">
          <h4 class="font-semibold text-blue-700 dark:text-blue-400">🔒 组件级控制</h4>
          <ul class="list-disc list-inside space-y-1 text-sm text-blue-600 dark:text-blue-300 mt-2">
            <li><strong>组件级 disabled</strong>：整个树禁用（所有节点不可交互）</li>
            <li><strong>组件级 lockChildren</strong>：所有节点锁定（不可拖拽）</li>
          </ul>
        </div>
        <div class="p-3 bg-green-50 dark:bg-green-950/20 rounded border border-green-200">
          <h4 class="font-semibold text-green-700 dark:text-green-400">🎯 节点级控制</h4>
          <ul class="list-disc list-inside space-y-1 text-sm text-green-600 dark:text-green-300 mt-2">
            <li><strong>节点级 disabled</strong>：仅当前节点禁用（子节点正常）</li>
            <li><strong>节点级 lockChildren</strong>：当前节点的子区域锁定</li>
          </ul>
        </div>
      </div>
      <h3 class="font-semibold mt-4 mb-2">场景测试：</h3>
      <ul class="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
        <li>场景1（🔒 节点级 disabled）：父节点禁用，子节点正常可拖拽</li>
        <li>场景2（🚫 节点级 allowDrag:false）：父节点无手柄，子节点有手柄</li>
        <li>场景3（🔐 节点级 lockChildren）：父节点的所有后代都锁定</li>
        <li>场景4（📂 正常容器）：完全正常，可自由拖入拖出</li>
        <li>切换"组件级禁用/锁定"观察全局效果</li>
      </ul>
    </div>
  </div>
</template>
