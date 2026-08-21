<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-150"
      leave-to-class="opacity-0"
    >
      <div
        v-if="event"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        :aria-label="t('programmations.unavailable.title')"
        @click.self="close"
      >
        <!-- Fond -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

        <!-- Fenêtre -->
        <div class="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          <!-- En-tête -->
          <div class="flex items-start gap-4 p-6 pb-4">
            <div class="w-11 h-11 flex-shrink-0 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
              <svg class="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <div class="min-w-0">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ t('programmations.unavailable.title') }}
              </h2>
              <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {{ t('programmations.unavailable.message', { event: event.title }) }}
              </p>
            </div>
            <button
              type="button"
              @click="close"
              :aria-label="t('common.close')"
              class="cursor-pointer ml-auto -mt-1 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Invitation à soumettre, si l'appel est ouvert -->
          <div v-if="isSubmissionOpen" class="mx-6 mb-4 p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
            <p class="text-sm text-orange-800 dark:text-orange-200">
              {{ t('programmations.unavailable.submitHint') }}
            </p>
            <p v-if="remainingDays !== null" class="mt-1 text-xs font-medium text-orange-700 dark:text-orange-300">
              {{ t('event.submissionDeadline') }} : {{ remainingDays }} {{ t('event.daysRemaining') }}
            </p>
          </div>

          <!-- Actions -->
          <div class="flex flex-col sm:flex-row gap-3 px-6 pb-6">
            <button
              type="button"
              @click="viewCall"
              class="cursor-pointer flex-1 px-4 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium transition-colors"
            >
              {{ t('programmations.viewCall') }}
            </button>
            <button
              v-if="isSubmissionOpen"
              type="button"
              @click="submitActivity"
              class="cursor-pointer flex-1 px-4 py-2.5 rounded-lg border-2 border-orange-500 text-orange-600 dark:text-orange-300 hover:bg-orange-500 hover:text-white text-sm font-medium transition-colors"
            >
              {{ t('event.submitActivity') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, watch, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { eventDetailPath } from '@/utils/eventSlug'

const props = defineProps({
  // Événement concerné, null quand le modal est fermé
  event: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close'])

const { t } = useI18n()
const router = useRouter()

const isSubmissionOpen = computed(() => props.event?.submission_status === 'open')

// Jours restants avant la date limite de soumission
const remainingDays = computed(() => {
  const deadline = props.event?.submission_deadline
  if (!deadline || !isSubmissionOpen.value) return null

  const days = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24))
  return days > 0 ? days : null
})

const close = () => emit('close')

const viewCall = () => {
  router.push(eventDetailPath(props.event))
  close()
}

const submitActivity = () => {
  router.push({ name: 'create-activity', params: { eventId: props.event.id } })
  close()
}

const onKeydown = (keyEvent) => {
  if (keyEvent.key === 'Escape') close()
}

// Verrouille le défilement de la page et permet la fermeture au clavier
watch(() => props.event, (value) => {
  if (value) {
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeydown)
  } else {
    document.body.style.overflow = ''
    document.removeEventListener('keydown', onKeydown)
  }
})

onUnmounted(() => {
  document.body.style.overflow = ''
  document.removeEventListener('keydown', onKeydown)
})
</script>
