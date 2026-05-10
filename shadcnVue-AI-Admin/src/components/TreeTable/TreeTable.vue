<script setup lang="ts">
import { ref, computed } from 'vue'
import type { MenuItem } from '@/api/modules/menu'
import { ChevronRight, ChevronDown, GripVertical, Eye, EyeOff, Plus, Edit2, Trash2 } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

interface Props {
  modelValue: MenuItem[]
  permissions?: string[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  permissions: () => [],
  loading: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: MenuItem[]): void
  (e: 'add', item: MenuItem | null): void
  (e: 'edit', item: MenuItem): void
  (e: 'delete', item: MenuItem): void
}>()

const expandedIds = ref<Set<string>>(new Set())
const draggingItem = ref<MenuItem | null>(null)
const dragOverItem = ref<MenuItem | null>(null)

const toggleExpand = (id: string) => {
  if (expandedIds.value.has(id)) {
    expandedIds.value.delete(id)
  } else {
    expandedIds.value.add(id)
  }
  expandedIds.value = new Set(expandedIds.value)
}

const isExpanded = (id: string) => expandedIds.value.has(id)
const hasChildren = (item: MenuItem) => item.children && item.children.length > 0

const getTypeLabel = (type: string) => {
  const types: Record<string, string> = {
    menu: '菜单',
    page: '页面',
    button: '按钮'
  }
  return types[type] || type
}

const getTypeClass = (type: string) => {
  const classes: Record<string, string> = {
    menu: 'bg-blue-100 text-blue-700',
    page: 'bg-green-100 text-green-700',
    button: 'bg-yellow-100 text-yellow-700'
  }
  return classes[type] || 'bg-gray-100 text-gray-700'
}

const handleDragStart = (e: DragEvent, item: MenuItem) => {
  draggingItem.value = item
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
  }
}

const handleDragOver = (e: DragEvent, item: MenuItem) => {
  e.preventDefault()
  dragOverItem.value = item
}

const handleDragLeave = () => {
  dragOverItem.value = null
}

const handleDrop = (e: DragEvent, targetItem: MenuItem) => {
  e.preventDefault()
  if (!draggingItem.value) return

  const sourceItem = draggingItem.value
  if (sourceItem.id === targetItem.id || isDescendant(sourceItem, targetItem)) {
    draggingItem.value = null
    dragOverItem.value = null
    return
  }

  const newTree = removeNode(props.modelValue, sourceItem.id)
  const updatedTree = addNode(newTree, targetItem.id, sourceItem)
  emit('update:modelValue', updatedTree)

  draggingItem.value = null
  dragOverItem.value = null
}

const removeNode = (tree: MenuItem[], nodeId: string): MenuItem[] => {
  return tree.filter(item => {
    if (item.id === nodeId) return false
    if (item.children) {
      item.children = removeNode(item.children, nodeId)
    }
    return true
  })
}

const addNode = (tree: MenuItem[], parentId: string, node: MenuItem): MenuItem[] => {
  return tree.map(item => {
    if (item.id === parentId) {
      if (!item.children) item.children = []
      item.children.push({ ...node, parentId })
    } else if (item.children) {
      item.children = addNode(item.children, parentId, node)
    }
    return item
  })
}

const isDescendant = (ancestor: MenuItem, descendant: MenuItem): boolean => {
  if (!ancestor.children) return false
  return ancestor.children.some(child => {
    if (child.id === descendant.id) return true
    return isDescendant(child, descendant)
  })
}

const getParentName = (item: MenuItem): string => {
  if (!item.parentId) return '-'
  return findParentName(props.modelValue, item.parentId) || '-'
}

const findParentName = (tree: MenuItem[], parentId: string): string | null => {
  for (const item of tree) {
    if (item.id === parentId) return item.name
    if (item.children) {
      const found = findParentName(item.children, parentId)
      if (found) return found
    }
  }
  return null
}

const treeData = computed(() => props.modelValue)
</script>

<template>
  <div class="min-h-full">
    <table class="w-full">
      <thead>
        <tr class="bg-gray-50 border-b border-gray-200">
          <th class="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">名称</th>
          <th
            class="hidden sm:table-cell text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
            上级节点</th>
          <th class="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">是否显示</th>
          <th class="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">类型</th>
          <th
            class="hidden md:table-cell text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
            节点路由</th>
          <th class="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">路由缓存</th>
          <th
            class="hidden lg:table-cell text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
            文件路径</th>
          <th
            class="hidden xl:table-cell text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
            权限</th>
          <th
            class="hidden sm:table-cell text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
            更新时间</th>
          <th class="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">排序</th>
          <th class="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!modelValue.length">
          <td colspan="11" class="text-center py-8 text-gray-500">暂无数据</td>
        </tr>
      </tbody>
    </table>

    <div v-if="modelValue.length" class="border border-gray-200 rounded-lg overflow-hidden">
      <template v-for="item in treeData" :key="item.id">
        <div :draggable="true" @dragstart="(e) => handleDragStart(e, item)" @dragover="(e) => handleDragOver(e, item)"
          @dragleave="handleDragLeave" @drop="(e) => handleDrop(e, item)" :class="[
            'group relative transition-colors',
            dragOverItem?.id === item.id ? 'border-2 border-primary-500 bg-primary-50' : 'border-2 border-transparent'
          ]">
          <div class="flex items-center gap-2 py-3 px-2 hover:bg-gray-50 transition-colors">
            <div class="flex items-center gap-1 cursor-pointer">
              <button v-if="hasChildren(item)" @click="toggleExpand(item.id)"
                class="p-1 hover:bg-gray-200 rounded transition-colors">
                <ChevronDown v-if="isExpanded(item.id)" class="w-4 h-4 text-gray-500" />
                <ChevronRight v-else class="w-4 h-4 text-gray-500" />
              </button>
              <span v-else class="w-5"></span>
              <span class="grip cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical class="w-4 h-4 text-gray-400" />
              </span>
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span v-if="item.icon" class="text-gray-400">{{ item.icon }}</span>
                <span class="font-medium text-gray-900 truncate">{{ item.name }}</span>
              </div>
            </div>

            <div class="hidden sm:flex items-center gap-2 px-2">
              <span class="text-sm text-gray-500">{{ getParentName(item) }}</span>
            </div>

            <div class="flex items-center gap-2 px-2">
              <Eye v-if="item.visible" class="w-4 h-4 text-green-500" />
              <EyeOff v-else class="w-4 h-4 text-gray-400" />
            </div>

            <div class="flex items-center gap-2 px-2">
              <span class="text-xs px-2 py-1 rounded-full font-medium" :class="getTypeClass(item.type)">
                {{ getTypeLabel(item.type) }}
              </span>
            </div>

            <div class="hidden md:flex items-center gap-2 px-2">
              <span class="text-sm text-gray-500 truncate max-w-[120px]">{{ item.routePath }}</span>
            </div>

            <div class="flex items-center gap-2 px-2">
              <span :class="item.keepAlive ? 'text-green-500' : 'text-gray-400'">
                {{ item.keepAlive ? '是' : '否' }}
              </span>
            </div>

            <div class="hidden lg:flex items-center gap-2 px-2">
              <span class="text-sm text-gray-500 truncate max-w-[120px]">{{ item.filePath }}</span>
            </div>

            <div class="hidden xl:flex items-center gap-2 px-2">
              <span class="text-sm text-gray-500 truncate max-w-[100px]">{{ item.permission }}</span>
            </div>

            <div class="hidden sm:flex items-center gap-2 px-2">
              <span class="text-sm text-gray-400">{{ item.updateTime }}</span>
            </div>

            <div class="flex items-center gap-2 px-2">
              <span class="text-sm text-gray-500 w-8">{{ item.sort }}</span>
            </div>

            <div class="flex items-center gap-1 px-2">
              <Button size="icon" variant="ghost" class="h-8 w-8" @click="emit('add', item)">
                <Plus class="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" class="h-8 w-8" @click="emit('edit', item)">
                <Edit2 class="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" class="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                @click="emit('delete', item)">
                <Trash2 class="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div v-if="hasChildren(item) && isExpanded(item.id)" class="ml-4 border-l-2 border-gray-100">
            <div v-for="child in item.children" :key="child.id">
              <div :draggable="true" @dragstart="(e) => handleDragStart(e, child)"
                @dragover="(e) => handleDragOver(e, child)" @dragleave="handleDragLeave"
                @drop="(e) => handleDrop(e, child)" :class="[
                  'group relative transition-colors',
                  dragOverItem?.id === child.id ? 'border-2 border-primary-500 bg-primary-50' : 'border-2 border-transparent'
                ]">
                <div class="flex items-center gap-2 py-3 px-2 hover:bg-gray-50 transition-colors"
                  style="padding-left: 32px;">
                  <div class="flex items-center gap-1 cursor-pointer">
                    <button v-if="hasChildren(child)" @click="toggleExpand(child.id)"
                      class="p-1 hover:bg-gray-200 rounded transition-colors">
                      <ChevronDown v-if="isExpanded(child.id)" class="w-4 h-4 text-gray-500" />
                      <ChevronRight v-else class="w-4 h-4 text-gray-500" />
                    </button>
                    <span v-else class="w-5"></span>
                    <span class="grip cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
                      <GripVertical class="w-4 h-4 text-gray-400" />
                    </span>
                  </div>

                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <span v-if="child.icon" class="text-gray-400">{{ child.icon }}</span>
                      <span class="font-medium text-gray-900 truncate">{{ child.name }}</span>
                    </div>
                  </div>

                  <div class="hidden sm:flex items-center gap-2 px-2">
                    <span class="text-sm text-gray-500">{{ getParentName(child) }}</span>
                  </div>

                  <div class="flex items-center gap-2 px-2">
                    <Eye v-if="child.visible" class="w-4 h-4 text-green-500" />
                    <EyeOff v-else class="w-4 h-4 text-gray-400" />
                  </div>

                  <div class="flex items-center gap-2 px-2">
                    <span class="text-xs px-2 py-1 rounded-full font-medium" :class="getTypeClass(child.type)">
                      {{ getTypeLabel(child.type) }}
                    </span>
                  </div>

                  <div class="hidden md:flex items-center gap-2 px-2">
                    <span class="text-sm text-gray-500 truncate max-w-[120px]">{{ child.routePath }}</span>
                  </div>

                  <div class="flex items-center gap-2 px-2">
                    <span :class="child.keepAlive ? 'text-green-500' : 'text-gray-400'">
                      {{ child.keepAlive ? '是' : '否' }}
                    </span>
                  </div>

                  <div class="hidden lg:flex items-center gap-2 px-2">
                    <span class="text-sm text-gray-500 truncate max-w-[120px]">{{ child.filePath }}</span>
                  </div>

                  <div class="hidden xl:flex items-center gap-2 px-2">
                    <span class="text-sm text-gray-500 truncate max-w-[100px]">{{ child.permission }}</span>
                  </div>

                  <div class="hidden sm:flex items-center gap-2 px-2">
                    <span class="text-sm text-gray-400">{{ child.updateTime }}</span>
                  </div>

                  <div class="flex items-center gap-2 px-2">
                    <span class="text-sm text-gray-500 w-8">{{ child.sort }}</span>
                  </div>

                  <div class="flex items-center gap-1 px-2">
                    <Button size="icon" variant="ghost" class="h-8 w-8" @click="emit('add', child)">
                      <Plus class="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" class="h-8 w-8" @click="emit('edit', child)">
                      <Edit2 class="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" class="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                      @click="emit('delete', child)">
                      <Trash2 class="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div v-if="hasChildren(child) && isExpanded(child.id)" class="ml-4 border-l-2 border-gray-100">
                  <div v-for="grandchild in child.children" :key="grandchild.id">
                    <div :draggable="true" @dragstart="(e) => handleDragStart(e, grandchild)"
                      @dragover="(e) => handleDragOver(e, grandchild)" @dragleave="handleDragLeave"
                      @drop="(e) => handleDrop(e, grandchild)" :class="[
                        'group relative transition-colors',
                        dragOverItem?.id === grandchild.id ? 'border-2 border-primary-500 bg-primary-50' : 'border-2 border-transparent'
                      ]">
                      <div class="flex items-center gap-2 py-3 px-2 hover:bg-gray-50 transition-colors"
                        style="padding-left: 52px;">
                        <div class="flex items-center gap-1 cursor-pointer">
                          <span class="w-5"></span>
                          <span class="grip cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
                            <GripVertical class="w-4 h-4 text-gray-400" />
                          </span>
                        </div>

                        <div class="flex-1 min-w-0">
                          <div class="flex items-center gap-2">
                            <span v-if="grandchild.icon" class="text-gray-400">{{ grandchild.icon }}</span>
                            <span class="font-medium text-gray-900 truncate">{{ grandchild.name }}</span>
                          </div>
                        </div>

                        <div class="hidden sm:flex items-center gap-2 px-2">
                          <span class="text-sm text-gray-500">{{ getParentName(grandchild) }}</span>
                        </div>

                        <div class="flex items-center gap-2 px-2">
                          <Eye v-if="grandchild.visible" class="w-4 h-4 text-green-500" />
                          <EyeOff v-else class="w-4 h-4 text-gray-400" />
                        </div>

                        <div class="flex items-center gap-2 px-2">
                          <span class="text-xs px-2 py-1 rounded-full font-medium"
                            :class="getTypeClass(grandchild.type)">
                            {{ getTypeLabel(grandchild.type) }}
                          </span>
                        </div>

                        <div class="hidden md:flex items-center gap-2 px-2">
                          <span class="text-sm text-gray-500 truncate max-w-[120px]">{{ grandchild.routePath }}</span>
                        </div>

                        <div class="flex items-center gap-2 px-2">
                          <span :class="grandchild.keepAlive ? 'text-green-500' : 'text-gray-400'">
                            {{ grandchild.keepAlive ? '是' : '否' }}
                          </span>
                        </div>

                        <div class="hidden lg:flex items-center gap-2 px-2">
                          <span class="text-sm text-gray-500 truncate max-w-[120px]">{{ grandchild.filePath }}</span>
                        </div>

                        <div class="hidden xl:flex items-center gap-2 px-2">
                          <span class="text-sm text-gray-500 truncate max-w-[100px]">{{ grandchild.permission }}</span>
                        </div>

                        <div class="hidden sm:flex items-center gap-2 px-2">
                          <span class="text-sm text-gray-400">{{ grandchild.updateTime }}</span>
                        </div>

                        <div class="flex items-center gap-2 px-2">
                          <span class="text-sm text-gray-500 w-8">{{ grandchild.sort }}</span>
                        </div>

                        <div class="flex items-center gap-1 px-2">
                          <Button size="icon" variant="ghost" class="h-8 w-8" @click="emit('add', grandchild)">
                            <Plus class="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" class="h-8 w-8" @click="emit('edit', grandchild)">
                            <Edit2 class="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost"
                            class="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                            @click="emit('delete', grandchild)">
                            <Trash2 class="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
