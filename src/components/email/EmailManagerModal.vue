<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform opacity-0"
      enter-to-class="transform opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform opacity-100"
      leave-to-class="transform opacity-0"
    >
      <div v-if="isOpen" class="fixed inset-0 z-50 overflow-hidden">
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
          @click="close"
        />

        <!-- Modal Container -->
        <div class="flex items-center justify-center min-h-screen p-4">
          <Transition
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="transform scale-95 opacity-0"
            enter-to-class="transform scale-100 opacity-100"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="transform scale-100 opacity-100"
            leave-to-class="transform scale-95 opacity-0"
          >
            <div
              v-if="isOpen"
              class="relative w-full max-w-5xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden"
              @click.stop
            >
              <!-- Header -->
              <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-500 to-blue-600">
                <div class="flex items-center justify-between">
                  <h2 class="text-xl font-semibold text-white">
                    {{ t('email.title') || 'Gestionnaire d\'emails' }}
                  </h2>
                  <button
                    @click="close"
                    class="text-white hover:text-gray-200 transition-colors cursor-pointer"
                    aria-label="Close modal"
                  >
                    <font-awesome-icon icon="times" class="text-xl" />
                  </button>
                </div>
              </div>

              <!-- Content -->
              <div class="max-h-[calc(100vh-200px)] overflow-y-auto">
                <!-- Vérification des permissions -->
                <div v-if="!isSuperAdmin" class="p-8 text-center">
                  <font-awesome-icon icon="exclamation-triangle" class="text-5xl text-yellow-500 mb-4" />
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {{ t('email.access_denied') || 'Accès refusé' }}
                  </h3>
                  <p class="text-gray-600 dark:text-gray-400">
                    {{ t('email.super_admin_only') || 'Seuls les super-administrateurs peuvent envoyer des emails groupés.' }}
                  </p>
                </div>

                <!-- Formulaire d'email pour super_admin -->
                <SimpleEmailSender
                  v-else
                  :initial-recipients="initialRecipients"
                  :initial-event="initialEvent"
                  :initial-activity="initialActivity"
                  :initial-filter="initialFilter"
                  @email-sent="handleEmailSent"
                />
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
import { computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useEmailModalStore } from '@/stores/emailModal'
import { useAuthStore } from '@/stores/auth'
import SimpleEmailSender from '@/components/email/SimpleEmailSender.vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faTimes, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faTimes, faExclamationTriangle)

export default {
  name: 'EmailManagerModal',
  components: {
    SimpleEmailSender,
    FontAwesomeIcon
  },
  setup() {
    const { t } = useI18n()
    const emailModalStore = useEmailModalStore()
    const authStore = useAuthStore()

    const isOpen = computed(() => emailModalStore.isOpen)
    const initialRecipients = computed(() => emailModalStore.initialRecipients)
    const initialEvent = computed(() => emailModalStore.initialEvent)
    const initialActivity = computed(() => emailModalStore.initialActivity)
    const initialFilter = computed(() => emailModalStore.initialFilter)

    // Vérifier si l'utilisateur est super_admin
    const isSuperAdmin = computed(() => authStore.isSuperAdmin)

    const close = () => {
      emailModalStore.close()
    }

    const handleEmailSent = () => {
      // Fermer le modal après un délai pour permettre à l'utilisateur de voir le message de succès
      setTimeout(() => {
        close()
      }, 2000)
    }

    // Fermer avec Escape
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen.value) {
        close()
      }
    }

    // Ajouter/retirer l'écouteur d'événements
    onMounted(() => {
      document.addEventListener('keydown', handleEscape)
    })

    onUnmounted(() => {
      document.removeEventListener('keydown', handleEscape)
    })

    return {
      t,
      isOpen,
      isSuperAdmin,
      initialRecipients,
      initialEvent,
      initialActivity,
      initialFilter,
      close,
      handleEmailSent
    }
  }
}
</script>