<template>
  <header class="bg-white shadow-sm border-b px-6 py-4">
    <div class="flex items-center justify-between">
      <div class="text-xl font-semibold">
        <slot name="title">管理后台</slot>
      </div>
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
