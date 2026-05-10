import { ref, createApp, h } from 'vue'
import { Spinner } from '@/components/ui/spinner'

const loadingVisible = ref(false)
let instance: any = null

export function useLoading() {
  const show = () => {
    loadingVisible.value = true
    if (!instance) {
      const app = createApp({
        render() {
          return loadingVisible.value
            ? h('div', {
              class: 'fixed inset-0 flex items-center justify-center bg-black/50 z-50 backdrop-blur-sm'
            }, [h(Spinner, { class: 'w-8 h-8 text-white' })])
            : null
        }
      })
      instance = app.mount(document.body)
    }
  }

  const hide = () => {
    loadingVisible.value = false
  }

  return { show, hide }
}

export const loadingActions = useLoading()
