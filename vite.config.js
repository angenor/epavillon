import { fileURLToPath, URL } from 'node:url'
import { writeFileSync } from 'node:fs'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// Plugin : met à jour version.json automatiquement à chaque build
function versionPlugin() {
  return {
    name: 'auto-version',
    closeBundle() {
      const version = new Date().toISOString()
      writeFileSync('dist/version.json', JSON.stringify({ version }) + '\n')
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    versionPlugin(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // Alias pour résoudre le problème d'import CSS de vue-cal
      'vue-cal/style.css': fileURLToPath(new URL('./src/assets/vuecal.css', import.meta.url)),
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
