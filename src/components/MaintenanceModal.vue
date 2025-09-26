<template>
  <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 animate-fade-in">
      <div class="p-6">
        <!-- Icône de maintenance -->
        <div class="flex justify-center mb-4">
          <div class="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        </div>

        <!-- Titre -->
        <h2 class="text-xl font-bold text-gray-900 dark:text-white text-center mb-4">
          {{ $t('maintenance.title') }}
        </h2>

        <!-- Message -->
        <p class="text-gray-600 dark:text-gray-300 text-center mb-6">
          {{ $t('maintenance.message') }}
        </p>

        <!-- Section formation -->
        <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-6">
          <h3 class="font-semibold text-green-800 dark:text-green-300 mb-2">
            {{ $t('maintenance.training.title') }}
          </h3>
          <p class="text-sm text-green-700 dark:text-green-400 mb-3">
            {{ $t('maintenance.training.description') }}
          </p>
          <a
            href="https://us06web.zoom.us/j/89890219581?pwd=kTe42pwbPD9O8rmAJosh30N1n0bn5e.1"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center justify-center w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors cursor-pointer"
          >
            <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
            </svg>
            {{ $t('maintenance.training.joinButton') }}
          </a>
        </div>

        <!-- Boutons -->
        <div class="flex justify-center">
          <button
            @click="closeModal"
            class="px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-medium rounded-lg transition-colors cursor-pointer"
          >
            {{ $t('common.close') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const showModal = ref(false)
const route = useRoute()
const router = useRouter()

const openModal = () => {
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  // Rediriger vers /nego à la fermeture
  router.push('/nego')
}

// Fonction pour vérifier si on est sur une route /nego/:category
const shouldShowModal = () => {
  return route.path.startsWith('/nego/') && route.params.category
}

// Afficher le modal si on est sur la bonne route
onMounted(() => {
  if (shouldShowModal()) {
    openModal()
  }
})

// Surveiller les changements de route
watch(() => route.path, () => {
  if (shouldShowModal()) {
    openModal()
  } else {
    showModal.value = false
  }
})

defineExpose({
  openModal,
  closeModal
})
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>