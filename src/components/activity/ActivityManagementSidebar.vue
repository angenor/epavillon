<template>
  <div class="sticky top-24">
    <nav class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 uppercase tracking-wider">
        {{ t('activities.navigation') }}
      </h3>

      <ul class="space-y-2">
        <li v-for="section in sections" :key="section.id">
          <button
            @click="scrollToSection(section.id)"
            :class="[
              'w-full text-left px-3 py-2 rounded-md transition-all duration-200 flex items-center gap-2 cursor-pointer',
              activeSection === section.id
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-medium'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-100'
            ]"
          >
            <font-awesome-icon :icon="section.icon" class="w-4 h-4 flex-shrink-0" />
            <span class="text-sm">{{ section.label }}</span>

            <!-- Badge pour les sections avec compteur -->
            <span
              v-if="section.count !== undefined"
              class="ml-auto text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              {{ section.count }}
            </span>

            <!-- Indicateur de statut -->
            <span
              v-if="section.status"
              :class="[
                'ml-auto w-2 h-2 rounded-full',
                getStatusColor(section.status)
              ]"
            />
          </button>
        </li>
      </ul>

      <!-- Actions rapides -->
      <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h4 class="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">
          {{ t('activities.quickActions') }}
        </h4>

        <div class="space-y-2">
          <button
            v-if="showPreviewButton"
            @click="$emit('preview')"
            class="w-full text-left px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-100 rounded-md transition-colors duration-200 flex items-center gap-2 cursor-pointer"
          >
            <font-awesome-icon :icon="['fas', 'eye']" class="w-4 h-4" />
            {{ t('activities.preview') }}
          </button>

          <button
            v-if="showValidationButton"
            @click="$emit('submit-validation')"
            class="w-full text-left px-3 py-2 text-sm text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors duration-200 flex items-center gap-2 cursor-pointer"
          >
            <font-awesome-icon :icon="['fas', 'check-circle']" class="w-4 h-4" />
            {{ t('activities.submitForValidation') }}
          </button>
        </div>
      </div>

      <!-- Statut de l'activité -->
      <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between text-xs">
          <span class="text-gray-500 dark:text-gray-400">
            {{ t('activities.statusLabel') }}
          </span>
          <span :class="[
            'px-2 py-1 rounded-full font-medium',
            getValidationStatusClass(validationStatus)
          ]">
            {{ t(`activities.validationStatus.${validationStatus}`) }}
          </span>
        </div>

        <!-- Barre de progression -->
        <div v-if="completionPercentage < 100" class="mt-3">
          <div class="flex items-center justify-between text-xs mb-1">
            <span class="text-gray-500 dark:text-gray-400">
              {{ t('activities.completion') }}
            </span>
            <span class="text-gray-700 dark:text-gray-300 font-medium">
              {{ completionPercentage }}%
            </span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
            <div
              :style="{ width: `${completionPercentage}%` }"
              class="bg-green-600 h-1.5 rounded-full transition-all duration-300"
            />
          </div>
        </div>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const { t } = useI18n()

const props = defineProps({
  activity: {
    type: Object,
    required: true
  },
  speakersCount: {
    type: Number,
    default: 0
  },
  documentsCount: {
    type: Number,
    default: 0
  },
  tagsCount: {
    type: Number,
    default: 0
  },
  canEdit: {
    type: Boolean,
    default: true
  },
  validationStatus: {
    type: String,
    default: 'draft'
  }
})

const emit = defineEmits(['scroll-to', 'preview', 'submit-validation'])

const activeSection = ref('banner')

// Sections de navigation
const sections = computed(() => [
  {
    id: 'banner',
    label: t('activities.sections.banner'),
    icon: ['fas', 'image'],
    status: props.activity?.cover_image_high_url ? 'complete' : 'incomplete'
  },
  {
    id: 'general-info',
    label: t('activities.sections.generalInfo'),
    icon: ['fas', 'info-circle'],
    status: checkGeneralInfoComplete() ? 'complete' : 'incomplete'
  },
  {
    id: 'dates',
    label: t('activities.sections.dates'),
    icon: ['fas', 'calendar'],
    status: checkDatesComplete() ? 'complete' : 'incomplete'
  },
  {
    id: 'speakers',
    label: t('activities.sections.speakers'),
    icon: ['fas', 'users'],
    count: props.speakersCount,
    status: props.speakersCount > 0 ? 'complete' : 'incomplete'
  },
  {
    id: 'documents',
    label: t('activities.sections.documents'),
    icon: ['fas', 'file-alt'],
    count: props.documentsCount,
    status: props.documentsCount > 0 ? 'complete' : 'optional'
  },
  {
    id: 'tags',
    label: t('activities.sections.tags'),
    icon: ['fas', 'tags'],
    count: props.tagsCount,
    status: props.tagsCount > 0 ? 'complete' : 'optional'
  }
])

// Vérifications de complétude
function checkGeneralInfoComplete() {
  const required = ['title', 'description', 'activity_type']
  return required.every(field => props.activity?.[field])
}

function checkDatesComplete() {
  return props.activity?.start_date && props.activity?.end_date
}

// Calcul du pourcentage de complétude
const completionPercentage = computed(() => {
  const totalSections = sections.value.filter(s => s.status !== 'optional').length
  const completedSections = sections.value.filter(s => s.status === 'complete').length
  return Math.round((completedSections / totalSections) * 100)
})

// Afficher le bouton prévisualiser (uniquement pour draft, submitted et under_review)
const showPreviewButton = computed(() => {
  const allowedStatuses = ['draft', 'submitted', 'under_review']
  console.log('🔍 Debug validationStatus:', props.validationStatus, 'showPreview:', allowedStatuses.includes(props.validationStatus))
  return allowedStatuses.includes(props.validationStatus)
})

// Afficher le bouton de validation
const showValidationButton = computed(() => {
  return props.validationStatus === 'draft' && completionPercentage.value === 100
})

// Scroll vers une section
function scrollToSection(sectionId) {
  const element = document.getElementById(sectionId)
  if (element) {
    const offset = 100 // Offset pour le header fixe
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
    window.scrollTo({
      top: elementPosition - offset,
      behavior: 'smooth'
    })
    activeSection.value = sectionId
  }
  emit('scroll-to', sectionId)
}

// Observer l'intersection des sections pour mettre à jour la section active
let observer = null

onMounted(() => {
  const options = {
    root: null,
    rootMargin: '-100px 0px -70% 0px',
    threshold: 0
  }

  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const sectionId = entry.target.id
        if (sections.value.some(s => s.id === sectionId)) {
          activeSection.value = sectionId
        }
      }
    })
  }, options)

  // Observer toutes les sections
  sections.value.forEach(section => {
    const element = document.getElementById(section.id)
    if (element) {
      observer.observe(element)
    }
  })
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})

// Helpers pour les classes CSS
function getStatusColor(status) {
  switch(status) {
    case 'complete':
      return 'bg-green-500'
    case 'incomplete':
      return 'bg-yellow-500'
    case 'optional':
      return 'bg-gray-400'
    default:
      return 'bg-gray-400'
  }
}

function getValidationStatusClass(status) {
  switch(status) {
    case 'draft':
      return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
    case 'pending':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
    case 'approved':
      return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
    case 'rejected':
      return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
    case 'live':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
    case 'completed':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400'
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
  }
}
</script>