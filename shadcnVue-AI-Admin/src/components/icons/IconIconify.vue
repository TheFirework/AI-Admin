<template>
  <Icon
    :icon="icon"
    :width="size"
    :height="size"
    :color="color"
    :class="clsx('icon-iconify', className)"
    :style="{ display: 'inline-block', verticalAlign: 'middle' }"
  />
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { clsx } from 'clsx'

interface Props {
  icon: string
  size?: number | string
  color?: string
  className?: string
}

withDefaults(defineProps<Props>(), {
  size: 24,
  color: 'currentColor',
  className: ''
})
</script>

<style scoped>
.icon-iconify {
  transition: color 0.2s ease;
}
</style>
