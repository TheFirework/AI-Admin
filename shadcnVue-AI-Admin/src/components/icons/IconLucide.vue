<template>
  <component
    :is="iconComponent"
    :size="size"
    :color="color"
    :class="clsx('icon-lucide', className)"
    :style="{ display: 'inline-block', verticalAlign: 'middle' }"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { clsx } from 'clsx'
import * as LucideIcons from 'lucide-vue-next'

interface Props {
  icon: keyof typeof LucideIcons
  size?: number | string
  color?: string
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 24,
  color: 'currentColor',
  className: ''
})

const iconComponent = computed(() => {
  const pascalCase = props.icon
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
  
  return (LucideIcons as Record<string, unknown>)[pascalCase] || null
})
</script>

<style scoped>
.icon-lucide {
  transition: color 0.2s ease;
}
</style>
