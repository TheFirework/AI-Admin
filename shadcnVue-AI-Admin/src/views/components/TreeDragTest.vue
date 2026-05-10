<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import Sortable from 'sortablejs'

const listRef = ref<HTMLElement | null>(null)
const items = ref([
  { id: 1, name: '项目1' },
  { id: 2, name: '项目2' },
  { id: 3, name: '项目3' },
  { id: 4, name: '项目4' },
  { id: 5, name: '项目5' }
])

onMounted(() => {
  nextTick(() => {
    if (listRef.value) {
      Sortable.create(listRef.value, {
        group: 'test',
        animation: 200,
        ghostClass: 'sortable-ghost',
        dragClass: 'sortable-drag',
        forceFallback: true,
        fallbackOnBody: true,

        onStart(evt) {
          console.log('拖拽开始:', evt.item)
        },

        onEnd(evt) {
          console.log('拖拽结束:', evt.oldIndex, '->', evt.newIndex)
          const oldIndex = evt.oldIndex
          const newIndex = evt.newIndex
          if (oldIndex !== newIndex) {
            const item = items.value.splice(oldIndex, 1)[0]
            items.value.splice(newIndex, 0, item)
          }
        }
      })
    }
  })
})
</script>

<template>
  <div class="min-h-screen bg-background p-6">
    <div class="max-w-2xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">拖拽测试</h1>
      <ul ref="listRef" class="list-none p-0 space-y-2">
        <li v-for="item in items" :key="item.id"
          class="flex items-center gap-3 p-4 bg-gray-100 rounded-lg cursor-grab active:cursor-grabbing hover:bg-gray-200 transition-colors">
          <span class="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-full">
            {{ item.id }}
          </span>
          <span class="text-lg">{{ item.name }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>
