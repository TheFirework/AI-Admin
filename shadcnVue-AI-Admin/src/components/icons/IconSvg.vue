<template>
  <div
    :class="clsx('icon-svg', className)"
    :style="svgStyle"
    v-html="svgContent"
  />
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { clsx } from 'clsx'

interface Props {
  src: string
  size?: number | string
  color?: string
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 24,
  color: 'currentColor',
  className: ''
})

const svgContent = ref('')

const svgStyle = computed(() => ({
  width: typeof props.size === 'number' ? `${props.size}px` : props.size,
  height: typeof props.size === 'number' ? `${props.size}px` : props.size,
  color: props.color,
  display: 'inline-block',
  verticalAlign: 'middle'
}))

const loadSvg = async () => {
  try {
    const response = await fetch(props.src)
    const text = await response.text()
    // 将SVG中的fill属性替换为currentColor以支持颜色自定义
    const processed = text.replace(/fill="[^"]*"/g, 'fill="currentColor"')
    svgContent.value = processed
  } catch (error) {
    console.error('Failed to load SVG:', error)
    svgContent.value = ''
  }
}

onMounted(loadSvg)
watch(() => props.src, loadSvg)
</script>

<style scoped>
.icon-svg {
  transition: color 0.2s ease;
}

.icon-svg svg {
  width: 100%;
  height: 100%;
}
</style>
