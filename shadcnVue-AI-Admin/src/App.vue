<!-- eslint-disable no-console -->
<!-- eslint-disable no-template-curly-in-string -->
<template>
  <div class="app-container">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    <Toaster />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { Toaster } from 'vue-sonner'

onMounted(() => {
  console.log('Admin App Mounted')
})
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
