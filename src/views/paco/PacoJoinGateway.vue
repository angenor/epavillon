<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-600 mx-auto mb-4"></div>
      <p class="text-gray-500 text-sm">{{ t('paco.gateway.loading') }}</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { isPacoRegisteredLocally } from '@/composables/paco/usePacoRegistration'
import { PACO_TEAMS_LINK } from '@/composables/paco/constants'

const { t } = useI18n()
const router = useRouter()

onMounted(() => {
  // URGENCE: vérification par localStorage uniquement (pas d'auth)
  if (isPacoRegisteredLocally()) {
    window.location.href = PACO_TEAMS_LINK
  } else {
    router.replace('/paco')
  }
})
</script>
