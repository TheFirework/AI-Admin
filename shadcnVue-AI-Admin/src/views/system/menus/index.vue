<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Plus, Save, AlertCircle } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import type { MenuItem, MenuCreateRequest } from '@/api/modules/menu'
import { menuApi } from '@/api/modules/menuApi'
import TreeTable from '@/components/TreeTable/TreeTable.vue'

const menus = ref<MenuItem[]>([])
const permissions = ref<string[]>(['system:menus:create', 'system:menus:edit', 'system:menus:delete'])
const isLoading = ref(false)
const showModal = ref(false)
const editingItem = ref<MenuItem | null>(null)

const formData = ref<MenuCreateRequest>({
  name: '',
  parentId: null,
  visible: true,
  icon: '',
  type: 'menu',
  routePath: '',
  keepAlive: false,
  filePath: '',
  permission: '',
  sort: 0
})

const loadMenus = async () => {
  isLoading.value = true
  try {
    const response = await menuApi.getAll()
    if (response.code === 200) {
      menus.value = response.data
    }
  } catch (error) {
    toast.error('加载菜单失败')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadMenus()
})

const handleAdd = (parent: MenuItem | null) => {
  editingItem.value = null
  formData.value = {
    name: '',
    parentId: parent?.id || null,
    visible: true,
    icon: '',
    type: parent?.type === 'button' ? 'button' : 'page',
    routePath: '',
    keepAlive: false,
    filePath: '',
    permission: '',
    sort: 0
  }
  showModal.value = true
}

const handleEdit = (item: MenuItem) => {
  editingItem.value = item
  formData.value = {
    name: item.name,
    parentId: item.parentId,
    visible: item.visible,
    icon: item.icon,
    type: item.type,
    routePath: item.routePath,
    keepAlive: item.keepAlive,
    filePath: item.filePath,
    permission: item.permission,
    sort: item.sort
  }
  showModal.value = true
}

const handleDelete = async (item: MenuItem) => {
  if (item.children && item.children.length > 0) {
    toast.error('请先删除子菜单')
    return
  }
  if (!confirm(`确定删除菜单 "${item.name}" 吗？`)) return
  try {
    const response = await menuApi.delete(item.id)
    if (response.code === 200) {
      toast.success('删除成功')
      loadMenus()
    }
  } catch (error) {
    toast.error('删除失败')
  }
}

const handleSave = async () => {
  if (!formData.value.name.trim()) {
    toast.error('请输入菜单名称')
    return
  }
  try {
    if (editingItem.value) {
      const response = await menuApi.update(editingItem.value.id, {
        ...formData.value,
        id: editingItem.value.id
      })
      if (response.code === 200) {
        toast.success('更新成功')
      }
    } else {
      const response = await menuApi.create(formData.value)
      if (response.code === 200) {
        toast.success('创建成功')
      }
    }
    showModal.value = false
    loadMenus()
  } catch (error) {
    toast.error(editingItem.value ? '更新失败' : '创建失败')
  }
}

const handleTreeUpdate = (newTree: MenuItem[]) => {
  menus.value = newTree
}

const getParentOptions = (items: MenuItem[], prefix: string = '', parentId: string | null = null): {
  value: string
  label: string
}[] => {
  let options: {
    value: string
    label: string
  }[] = []
  for (const item of items) {
    if (item.id !== editingItem.value?.id) {
      options.push({
        value: item.id,
        label: `${prefix}${item.name}`
      })
      if (item.children) {
        options = options.concat(getParentOptions(item.children, prefix + '├─ ', item.id))
      }
    }
  }
  return options
}

const parentOptions = computed(() => getParentOptions(menus.value))

const typeOptions = [
  { value: 'menu', label: '菜单' },
  { value: 'page', label: '页面' },
  { value: 'button', label: '按钮' }
]
</script>

<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <Button v-perm="'system:menus:create'" class="flex items-center gap-2" @click="handleAdd(null)">
        <Plus class="w-4 h-4" />
        新增菜单
      </Button>
    </div>

    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
      <TreeTable v-model="menus" :permissions="permissions" :loading="isLoading" @add="handleAdd" @edit="handleEdit"
        @delete="handleDelete" @update:model-value="handleTreeUpdate" />
    </div>

    <Dialog :open="showModal" @update:open="showModal = $event">
      <DialogContent class="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{{ editingItem ? '编辑菜单' : '新增菜单' }}</DialogTitle>
          <DialogDescription>
            {{ editingItem ? '修改菜单信息' : '创建新的菜单节点' }}
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-4 py-4">
          <div class="space-y-2">
            <Label for="name">名称 <span class="text-red-500">*</span></Label>
            <Input id="name" v-model="formData.name" placeholder="请输入菜单名称" class="w-full" />
          </div>

          <div class="space-y-2">
            <Label for="parent">上级节点</Label>
            <Select v-model="formData.parentId">
              <SelectTrigger id="parent">
                <SelectValue placeholder="选择上级节点" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem :value="null">无（顶级菜单）</SelectItem>
                <SelectItem v-for="option in parentOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label for="type">类型 <span class="text-red-500">*</span></Label>
            <Select v-model="formData.type">
              <SelectTrigger id="type">
                <SelectValue placeholder="选择类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="option in typeOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label for="icon">图标</Label>
            <Input id="icon" v-model="formData.icon" placeholder="如: settings" class="w-full" />
          </div>

          <div class="space-y-2">
            <Label for="routePath">节点路由</Label>
            <Input id="routePath" v-model="formData.routePath" placeholder="如: /system/users" class="w-full" />
          </div>

          <div class="space-y-2">
            <Label for="filePath">文件路径</Label>
            <Input id="filePath" v-model="formData.filePath" placeholder="如: @/views/system/users/index.vue"
              class="w-full" />
          </div>

          <div class="space-y-2">
            <Label for="permission">权限标识</Label>
            <Input id="permission" v-model="formData.permission" placeholder="如: system:users:create" class="w-full" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="flex items-center space-x-3">
              <Checkbox id="visible" v-model="formData.visible" />
              <Label for="visible">是否显示</Label>
            </div>
            <div class="flex items-center space-x-3">
              <Checkbox id="keepAlive" v-model="formData.keepAlive" />
              <Label for="keepAlive">路由缓存</Label>
            </div>
          </div>

          <div class="space-y-2">
            <Label for="sort">排序</Label>
            <Input id="sort" v-model.number="formData.sort" type="number" placeholder="数字越小越靠前" class="w-full" />
          </div>

          <div class="flex items-start gap-2 p-3 bg-amber-50 rounded-lg">
            <AlertCircle class="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p class="text-sm text-amber-700">
              按钮类型的菜单不需要填写路由和文件路径，只需要设置权限标识。
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" @click="showModal = false">取消</Button>
          <Button class="flex items-center gap-2" @click="handleSave">
            <Save class="w-4 h-4" />
            {{ editingItem ? '保存修改' : '创建菜单' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
