import { createApp } from 'vue'
import App from './App.vue'
import { initApp } from './init'
import './index.css'

async function bootstrap() {
  const app = createApp(App)

  await initApp(app)

  app.mount('#app')
}

bootstrap()
