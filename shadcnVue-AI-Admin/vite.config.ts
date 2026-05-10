import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import viteImagemin from 'vite-plugin-imagemin'
import svgLoader from 'vite-svg-loader'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const baseEnv = loadEnv('', process.cwd(), 'VITE_APP_')
  const modeEnv = loadEnv(mode, process.cwd(), 'VITE_APP_')
  const env = { ...baseEnv, ...modeEnv }

  const isProduction = mode === 'production'

  return {
    plugins: [
      vue({
        script: {
          defineModel: true,
          propsDestructure: true
        },
        template: {
          compilerOptions: {
            hoistStatic: true,
            cacheHandlers: true
          }
        }
      }),
      tailwindcss(),
      svgLoader({
        defaultImport: 'component',
        svgo: true
      }),
      isProduction && viteImagemin({
        gifsicle: { optimizationLevel: 3 },
        optipng: { optimizationLevel: 5 },
        mozjpeg: { quality: 75 }
      })
    ],

    optimizeDeps: {
      include: ['vue', 'vue-router', '@vueuse/core', 'axios', 'clsx', 'tailwind-merge'],
      esbuildOptions: {
        target: 'es2020'
      }
    },

    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '~': resolve(__dirname, 'src')
      }
    },

    server: {
      host: '0.0.0.0',
      port: 5173,
      sourcemap: false,
      warmup: {
        clientFiles: [
          './src/layout/**/*.vue',
          './src/views/**/*.vue'
        ]
      },
      proxy: {
        // '/api': {
        //   target: env.VITE_APP_API_BASE_URL?.replace('/api', '') || 'http://localhost:3000',
        //   changeOrigin: true,
        //   rewrite: (path) => path.replace(/^\/api/, '')
        // }
      }
    },

    build: {
      target: 'es2020',
      minify: isProduction ? 'terser' : 'esbuild',
      cssCodeSplit: true,
      sourcemap: false,
      assetsInlineLimit: 4096,

      ...(isProduction && {
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true
          }
        }
      }),

      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('vue') || id.includes('vue-router')) {
                return 'vue'
              }
              if (id.includes('@vueuse') || id.includes('axios') || id.includes('clsx') || id.includes('tailwind-merge')) {
                return 'utils'
              }
              if (id.includes('@sentry')) {
                return 'sentry'
              }
            }
          }
        }
      }
    }
  }
})
