import type { App } from 'vue'
import router from '../router'
import permDirective, { setPermissions } from '../directives/perm'

const isMockEnabled = import.meta.env.VITE_APP_ENABLE_MOCK === 'true'

export async function initApp(app: App): Promise<void> {
  if (isMockEnabled) {
    try {
      const { startWorker } = await import('../mocks/browser')
      await startWorker()
    } catch (error) {
      console.error('Failed to start MSW worker:', error)
    }
  }

  // 注册权限指令
  app.directive('perm', permDirective)

  // 设置模拟权限（实际应用中应从后端获取）
  setPermissions([
    'system:menus',
    'system:menus:create',
    'system:menus:edit',
    'system:menus:delete',
    'system:users',
    'system:users:create',
    'system:users:edit',
    'system:users:delete'
  ])

  app.use(router)
}
