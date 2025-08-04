<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-12">
    <div class="text-center">
      <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 animate-pulse">
        <font-awesome-icon icon="spinner" class="h-8 w-8 text-green-600 dark:text-green-400 animate-spin" />
      </div>
      <h2 class="mt-6 text-2xl font-semibold">
        {{ t('auth.callback.processing') }}
      </h2>
      <p class="mt-2 text-gray-600 dark:text-gray-400">
        {{ t('auth.callback.pleaseWait') }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useSupabase } from '@/composables/useSupabase'

const { t } = useI18n()
const router = useRouter()
const { auth } = useSupabase()

onMounted(async () => {
  try {
    // Supabase gère automatiquement le callback OAuth
    const { data: { session } } = await auth.getSession()
    
    if (session) {
      // Connexion réussie, rediriger vers la page d'accueil
      router.push('/')
    } else {
      // Pas de session, rediriger vers la page de connexion
      router.push('/login')
    }
  } catch (error) {
    console.error('Auth callback error:', error)
    router.push('/login')
  }
})
</script>