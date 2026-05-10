import { computed } from 'vue'
import * as LucideIcons from 'lucide-vue-next'

export function useIcon() {
  // 获取Lucide图标组件
  const getLucideIcon = (iconName: string) => {
    const pascalCase = iconName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('')

    return (LucideIcons as Record<string, unknown>)[pascalCase] || null
  }

  // 动态图标组件
  const IconComponent = computed(() => {
    return {
      Lucide: LucideIcons
    }
  })

  return {
    getLucideIcon,
    IconComponent,
    icons: LucideIcons
  }
}
