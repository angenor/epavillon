<template>
  <div class="min-h-screen relative flex items-center justify-center px-4 py-12">
    <!-- Image de fond avec repeat -->
    <div 
      class="absolute inset-0 z-0 dark:opacity-20"
      :style="{
        backgroundImage: 'url(/images/people-bg/people-bg-1.jpg)',
        backgroundSize: 'auto',
        backgroundRepeat: 'repeat',
        backgroundPosition: 'top left'
      }"
    >
    </div>
    
    <!-- Contenu principal avec z-index élevé -->
    <div class="relative z-10 text-center">
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
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useSupabase } from '@/composables/useSupabase'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const { auth } = useSupabase()

onMounted(async () => {
  try {
    // Supabase gère automatiquement le callback OAuth
    const { data: { session } } = await auth.getSession()

    if (session) {
      // Connexion réussie, récupérer l'URL de redirection depuis les query params
      const redirectTo = route.query.redirect || '/'
      router.push(redirectTo)
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