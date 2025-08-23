import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-vue': ['vue', 'vue-router', 'pinia'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-ui': ['@fortawesome/fontawesome-svg-core', '@fortawesome/free-solid-svg-icons', '@fortawesome/free-brands-svg-icons', '@fortawesome/vue-fontawesome'],
          'vendor-editor': ['@tiptap/vue-3', '@tiptap/starter-kit', '@tiptap/extension-link', '@tiptap/extension-highlight', '@tiptap/extension-text-align'],
          'vendor-utils': ['date-fns', 'vue-i18n'],
        },
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop().replace(/\.\w+$/, '') : 'chunk';
          return `assets/${facadeModuleId}-[hash].js`;
        }
      }
    },
    chunkSizeWarningLimit: 600,
  },
})
