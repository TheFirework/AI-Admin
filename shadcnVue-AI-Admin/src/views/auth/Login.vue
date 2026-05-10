<template>
  <div class="min-h-screen bg-white flex items-center justify-center p-8">
    <div class="w-full max-w-7xl flex items-center justify-end gap-[16px]">
      <!-- 左侧区域：Lottie 动画 + 标题 -->
      <div class="flex-1 flex flex-col items-center justify-center">
        <div class="relative" style="width: 400px; height: 400px;">
          <LottieAnimation :animation-data="loginAnimation" :width="400" :height="400" :loop="true" :autoplay="true"
            class="drop-shadow-2xl relative z-10" />
          <div class="absolute inset-0 bg-gradient-to-br from-purple-400/30 to-blue-400/30 rounded-full blur-3xl"></div>
        </div>

      </div>

      <!-- 右侧表单区域 - 增大尺寸并向右移动 -->
      <div class="w-[450px]">

        <div class="bg-gray-50 rounded-2xl p-10 border border-gray-200 shadow-xl">
          <div class="text-center mt-6">
            <h1 class="text-4xl font-bold text-gray-800 mb-2">AI Admin</h1>
          </div>

          <form @submit.prevent="handleLogin" class="space-y-6">
            <!-- 用户名输入 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-3">用户名</label>
              <div class="relative">
                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <AppIcon type="lucide" icon="user" :size="20" />
                </div>
                <input v-model="form.username" type="text" placeholder="请输入用户名"
                  class="w-full pl-12 pr-4 py-4 bg-white border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-base" />
              </div>
              <p v-if="!form.username && submitted" class="mt-2 text-sm text-red-500">请输入用户名</p>
            </div>

            <!-- 密码输入 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-3">密码</label>
              <div class="relative">
                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <AppIcon type="lucide" icon="lock" :size="20" />
                </div>
                <input v-model="form.password" :type="showPassword ? 'text' : 'password'" placeholder="请输入密码"
                  class="w-full pl-12 pr-14 py-4 bg-white border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-base" />
                <button type="button" @click="showPassword = !showPassword"
                  class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  <AppIcon type="lucide" :icon="showPassword ? 'eye-off' : 'eye'" :size="20" />
                </button>
              </div>
              <p v-if="!form.password && submitted" class="mt-2 text-sm text-red-500">请输入密码</p>
            </div>

            <!-- 登录按钮 -->
            <button type="submit" :disabled="loading"
              class="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-xl hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 text-base">
              <svg v-if="loading" class="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
              </svg>
              {{ loading ? '登录中...' : '登录' }}
            </button>
          </form>

          <!-- 测试账号提示 -->
          <div class="mt-8 text-center">
            <div class="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 rounded-full text-gray-500 text-sm">
              <AppIcon type="lucide" icon="info" :size="14" />
              <span>测试账号：admin / 123456</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { authApi } from '@/api'
import storage from '@/utils/storage'
import { LottieAnimation } from '@/components/lottie'
import AppIcon from '@/components/icons/AppIcon.vue'
import loginAnimation from '@/assets/lottie/login.json'

const loading = ref(false)
const submitted = ref(false)
const showPassword = ref(false)

const form = reactive({
  username: '',
  password: ''
})

async function handleLogin() {
  submitted.value = true

  if (!form.username || !form.password) return

  loading.value = true

  try {
    const result = await authApi.login(form)
    storage.setToken(result.token)
    window.location.href = '/'
  } catch (error) {
    console.error('登录失败:', error)
    alert('登录失败，请检查用户名和密码')
  } finally {
    loading.value = false
  }
}
</script>
