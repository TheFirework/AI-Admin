import { setupWorker, http, HttpResponse } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)

export async function startWorker() {
  try {
    await worker.start({
      onUnhandledRequest: 'bypass',
      serviceWorker: {
        url: '/mockServiceWorker.js',
        options: {
          scope: '/',
          updateViaCache: 'none',
        },
      },
    })
    console.log('MSW worker started successfully')
  } catch (error) {
    console.error('Failed to start MSW worker:', error)
  }
}
