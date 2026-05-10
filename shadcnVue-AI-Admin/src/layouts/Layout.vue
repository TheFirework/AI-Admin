<template>
  <div class="min-h-screen bg-background">
    <Sidebar />
    <main class="ml-56">
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
import Sidebar from './Sidebar.vue'
import Header from './Header.vue'
</script>
