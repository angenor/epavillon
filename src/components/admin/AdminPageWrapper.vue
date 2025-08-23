<template>
  <!-- État de chargement pendant la vérification des permissions -->
  <div v-if="isCheckingAccess || isLoadingRoles" class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
      <p class="text-gray-600 dark:text-gray-300">{{ $t('common.loading') }}...</p>
    </div>
  </div>

  <!-- Contenu de la page admin si l'accès est autorisé -->
  <div v-else>
    <slot />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAdminAccess } from '@/composables/useAdminAccess'

const { isLoadingRoles, isCheckingAccess, checkAdminAccess } = useAdminAccess()

// Props pour permettre une vérification personnalisée si nécessaire
const props = defineProps({
  // Permet de désactiver la vérification automatique si nécessaire
  autoCheck: {
    type: Boolean,
    default: true
  }
})

// Emit pour notifier la page parente de l'état
const emit = defineEmits(['access-granted', 'access-denied'])

onMounted(async () => {
  if (props.autoCheck) {
    try {
      await checkAdminAccess()
      emit('access-granted')
    } catch (error) {
      emit('access-denied', error)
      throw error
    }
  }
})
</script>