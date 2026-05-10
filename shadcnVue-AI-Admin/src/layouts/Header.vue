<template>
  <header class="bg-white shadow-sm border-b px-6 py-4">
    <div class="flex items-center justify-between">
      <!-- 左侧：折叠/展开按钮（优化版） -->
      <button @click="handleToggleCollapse" :class="[
        'group relative w-9 h-9 rounded-lg border transition-all duration-200 ease-out',
        'flex items-center justify-center cursor-pointer select-none',
        'bg-gray-50/80 border-gray-200 hover:border-primary-400',
        'hover:bg-primary-50 hover:shadow-md hover:shadow-primary-500/10',
        'active:scale-95 active:shadow-sm',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2'
      ]" :title="isCollapsed ? '展开侧边栏菜单' : '收起侧边栏菜单'" :aria-label="isCollapsed ? '展开菜单' : '折叠菜单'">
        <!-- 按钮背景装饰（hover 时显示） -->
        <div
          class="absolute inset-0 rounded-lg bg-gradient-to-br from-primary-500/0 to-primary-600/0 group-hover:from-primary-500/5 group-hover:to-primary-600/10 transition-all duration-300" />

        <!-- 折叠/展开箭头图标 -->
        <svg :class="[
          'relative w-[18px] h-[18px] transition-all duration-300 ease-out',
          'text-gray-500 group-hover:text-primary-600',
          isCollapsed ? 'rotate-180 text-primary-600' : ''
        ]" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round"
          stroke-linejoin="round">
          <path d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <!-- 右侧：用户操作区域 -->
      <div class="flex items-center gap-4">
        <slot name="actions"></slot>
        <Drawer direction="right">
          <DrawerTrigger as-child>
            <button class="rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
              <Avatar class="h-10 w-10">
                <AvatarFallback class="bg-primary-500 text-white">
                  <User class="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
            </button>
          </DrawerTrigger>
          <DrawerContent class="w-80 bg-white border-l border-gray-200">
            <div class="flex flex-col h-full">
              <div class="flex items-center gap-4 p-6 border-b border-gray-200">
                <Avatar class="h-16 w-16">
                  <AvatarFallback class="bg-primary-500 text-white text-xl">
                    <User class="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p class="text-lg font-semibold text-gray-900">{{ user.name }}</p>
                  <p class="text-sm text-gray-500">{{ user.role }}</p>
                </div>
              </div>
              <div class="flex flex-col p-4">
                <button @click="handleAccount"
                  class="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors w-full">
                  <Settings class="h-5 w-5" />
                  <span>账号管理</span>
                </button>
                <div class="border-t border-gray-200 my-2"></div>
                <button @click="handleLogout"
                  class="flex items-center gap-3 px-4 py-3 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full">
                  <LogOut class="h-5 w-5" />
                  <span>退出登录</span>
                </button>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { inject, Ref, ref } from 'vue'
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { User, LogOut, Settings } from 'lucide-vue-next'
import {
  Drawer,
  DrawerContent,
  DrawerTrigger
} from '@/components/ui/drawer'
import {
  Avatar,
  AvatarFallback
} from '@/components/ui/avatar'

const router = useRouter()

// 注入侧边栏折叠状态和切换函数（带默认值防止报错）
const isCollapsed = inject<Ref<boolean>>('sidebarCollapsed', ref(false))
const toggleCollapse = inject<() => void>('toggleSidebarCollapse', () => {
  console.warn('toggleSidebarCollapse not provided')
})

// 包装点击处理函数，增加调试信息
function handleToggleCollapse() {
  if (toggleCollapse) {
    toggleCollapse()
  } else {
    console.error('折叠功能未正确初始化')
  }
}

const user = reactive({
  name: '管理员',
  role: '超级管理员'
})

const handleAccount = () => {
  router.push('/account')
}

const handleLogout = () => {
  console.log('退出登录')
}
</script>
