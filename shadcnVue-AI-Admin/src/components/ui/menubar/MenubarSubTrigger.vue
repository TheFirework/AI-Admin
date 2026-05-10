<script setup lang="ts">
import type { MenubarSubTriggerProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { ChevronRight } from "lucide-vue-next"
import { MenubarSubTrigger, useForwardProps } from "reka-ui"
import { cn } from "@/lib/utils"

const props = defineProps<MenubarSubTriggerProps & { class?: HTMLAttributes["class"], inset?: boolean }>()

const delegatedProps = reactiveOmit(props, "class", "inset")
const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <MenubarSubTrigger data-slot="menubar-sub-trigger" :data-inset="inset ? '' : undefined" v-bind="forwardedProps"
    :class="cn(
      'focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none data-[inset]:pl-8',
      props.class,
    )">
    <span class="inline-flex items-center gap-2 min-w-0">
      <slot />
    </span>
    <ChevronRight class="ml-auto size-4 shrink-0" />
  </MenubarSubTrigger>
</template>
