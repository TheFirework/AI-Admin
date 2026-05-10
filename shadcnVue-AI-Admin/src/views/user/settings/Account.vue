<template>
  <div class="max-w-2xl mx-auto">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">账号管理</h1>
      <p class="text-gray-500 mt-1">管理您的账号信息和安全设置</p>
    </div>

    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
      <div class="divide-y divide-gray-200">
        <div class="p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">基本信息</h2>
          <div class="flex items-center gap-4">
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
        </div>

        <div class="p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">修改密码</h2>
          <form @submit.prevent="handleChangePassword" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">原密码</label>
              <input
                v-model="form.oldPassword"
                type="password"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                placeholder="请输入原密码"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">新密码</label>
              <input
                v-model="form.newPassword"
                type="password"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                placeholder="请输入新密码"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">确认新密码</label>
              <input
                v-model="form.confirmPassword"
                type="password"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                placeholder="请确认新密码"
              />
            </div>
            <div class="flex justify-end">
              <Button type="submit" class="bg-primary-500 hover:bg-primary-600 text-white">
                修改密码
              </Button>
            </div>
          </form>
        </div>

        <div class="p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">安全设置</h2>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium text-gray-900">登录提醒</p>
                <p class="text-sm text-gray-500">登录时发送通知</p>
              </div>
              <Switch :checked="settings.loginAlert" @update:checked="toggleLoginAlert" />
            </div>
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium text-gray-900">双因素认证</p>
                <p class="text-sm text-gray-500">登录时需要额外验证</p>
              </div>
              <Switch :checked="settings.twoFactor" @update:checked="toggleTwoFactor" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { User } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const user = reactive({
  name: '管理员',
  role: '超级管理员'
})

const form = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const settings = reactive({
  loginAlert: true,
  twoFactor: false
})

const handleChangePassword = () => {
  console.log('修改密码:', form)
}

const toggleLoginAlert = (value: boolean) => {
  settings.loginAlert = value
  console.log('登录提醒:', value)
}

const toggleTwoFactor = (value: boolean) => {
  settings.twoFactor = value
  console.log('双因素认证:', value)
}
</script>
