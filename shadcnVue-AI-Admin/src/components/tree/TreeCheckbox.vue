<script setup lang="ts">
import { computed } from 'vue'
import { Check, Minus } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

interface Props {
  checked?: boolean
  indeterminate?: boolean
  disabled?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  checked: false,
  indeterminate: false,
  disabled: false
})

const emit = defineEmits<{
  (e: 'change'): void
}>()

const state = computed(() => {
  if (props.indeterminate) return 'indeterminate'
  if (props.checked) return 'checked'
  return 'unchecked'
})

function handleChange(e: MouseEvent) {
  if (!props.disabled) {
    emit('change')
  }
}
</script>

<template>
  <button
    type="button"
    :class="cn(
      'size-4 shrink-0 rounded border shadow-xs transition-all outline-none focus-visible:ring-[3px]',
      'border-input data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary',
      'data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground data-[state=indeterminate]:border-primary',
      'focus-visible:border-ring focus-visible:ring-ring/50',
      'disabled:cursor-not-allowed disabled:opacity-50',
      props.class
    )"
    :data-state="state"
    :disabled="disabled"
    @click="handleChange"
  >
    <div class="grid place-content-center text-current transition-none">
      <Minus v-if="indeterminate" class="size-3" />
      <Check v-else-if="checked" class="size-3" />
    </div>
  </button>
</template>
