<template>
  <div class="min-h-screen bg-background">
    <Sidebar />
    <!-- 根据侧边栏折叠状态动态调整主内容区域的左边距 -->
    <main :class="['transition-all duration-300 ease-in-out']"
      :style="{ marginLeft: sidebarCollapsed ? '64px' : '258px' }">
      <Header>
        <template #title>
          <slot name="title">管理后台</slot>
        </template>
        <template #actions>
          <slot name="actions"></slot>
        </template>
      </Header>
      <div class="p-6">
        <keep-alive>
          <router-view v-slot="{ Component }">
            <component :is="Component" />
          </router-view>
        </keep-alive>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, Ref, provide } from 'vue'
import Sidebar from './Sidebar/Sidebar.vue'
import Header from './Header.vue'

// ==================== 侧边栏折叠状态管理（提升到 Layout 层）====================

// 控制侧边栏是否折叠
const sidebarCollapsed = ref(false)

// 切换侧边栏折叠状态
function toggleSidebarCollapse() {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

// 向所有子组件提供状态和操作方法
provide('sidebarCollapsed', sidebarCollapsed)
provide('toggleSidebarCollapse', toggleSidebarCollapse)
</script>
