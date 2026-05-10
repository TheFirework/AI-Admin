<template>
  <div class="app-icon">
    <!-- 内联SVG组件 -->
    <Icon v-if="type === 'inline'" :size="size" :color="color" :className="className" :viewBox="viewBox">
      <slot />
    </Icon>

    <!-- 本地SVG文件 -->
    <IconSvg v-else-if="type === 'local'" :src="icon" :size="size" :color="color" :className="className" />

    <!-- Iconify图标 -->
    <IconIconify v-else-if="type === 'iconify'" :icon="icon" :size="size" :color="color" :className="className" />

    <!-- Lucide图标 -->
    <IconLucide v-else-if="type === 'lucide'" :icon="icon as keyof typeof LucideIcons" :size="size" :color="color"
      :className="className" />

    <!-- 默认使用Lucide -->
    <IconLucide v-else :icon="icon as keyof typeof LucideIcons" :size="size" :color="color" :className="className" />
  </div>
</template>

<script setup lang="ts">
import Icon from './Icon.vue'
import IconSvg from './IconSvg.vue'
import IconIconify from './IconIconify.vue'
import IconLucide from './IconLucide.vue'
import * as LucideIcons from 'lucide-vue-next'

interface Props {
  icon?: string
  type?: 'inline' | 'local' | 'iconify' | 'lucide'
  size?: number | string
  color?: string
  className?: string
  viewBox?: string
}

withDefaults(defineProps<Props>(), {
  icon: '',
  type: 'lucide',
  size: 24,
  color: 'currentColor',
  className: '',
  viewBox: '0 0 24 24'
})
</script>

<style scoped>
.app-icon {
  display: inline-block;
  vertical-align: middle;
}
</style>
