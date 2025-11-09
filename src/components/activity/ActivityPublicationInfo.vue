<template>
  <div class="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/10 dark:to-blue-900/10 rounded-lg border-2 border-green-200 dark:border-green-700 p-6 shadow-lg">
    <!-- Header avec icône -->
    <div class="flex items-start gap-4 mb-6">
      <div class="flex-shrink-0 w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
        <font-awesome-icon :icon="['fas', 'check-circle']" class="text-white text-xl" />
      </div>
      <div class="flex-1">
        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {{ t('activities.publicationInfo.title') }}
        </h3>
        <p class="text-gray-600 dark:text-gray-400">
          {{ t('activities.publicationInfo.description') }}
        </p>
      </div>
    </div>

    <!-- Grille d'informations -->
    <div class="grid md:grid-cols-2 gap-6">
      <!-- Section QR Code -->
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <font-awesome-icon :icon="['fas', 'qrcode']" class="text-green-600" />
          {{ t('activities.publicationInfo.qrCode') }}
        </h4>

        <!-- QR Code -->
        <div class="flex flex-col items-center gap-4">
          <div class="bg-white p-4 rounded-lg shadow-inner">
            <img
              :src="qrCodeUrl"
              alt="QR Code"
              class="w-[200px] h-[200px]"
            />
          </div>

          <!-- Bouton de téléchargement -->
          <button
            @click="downloadQRCode"
            class="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <font-awesome-icon :icon="['fas', 'download']" />
            {{ t('activities.publicationInfo.downloadQR') }}
          </button>

          <p class="text-xs text-gray-500 dark:text-gray-400 text-center">
            {{ t('activities.publicationInfo.qrDescription') }}
          </p>
        </div>
      </div>

      <!-- Section Lien Public -->
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <font-awesome-icon :icon="['fas', 'link']" class="text-blue-600" />
          {{ t('activities.publicationInfo.publicLink') }}
        </h4>

        <div class="space-y-4">
          <!-- URL publique -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('activities.publicationInfo.activityUrl') }}
            </label>
            <div class="flex gap-2">
              <input
                type="text"
                :value="publicUrl"
                readonly
                class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
              />
              <button
                @click="copyUrl"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer flex items-center gap-2"
                :title="t('activities.publicationInfo.copyUrl')"
              >
                <font-awesome-icon :icon="['fas', copied ? 'check' : 'copy']" />
              </button>
            </div>
            <p v-if="copied" class="text-sm text-green-600 dark:text-green-400 mt-2">
              {{ t('activities.publicationInfo.urlCopied') }}
            </p>
          </div>

          <!-- Bouton vers la page publique -->
          <a
            :href="publicUrl"
            target="_blank"
            class="block w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all cursor-pointer text-center font-medium shadow-md hover:shadow-lg"
          >
            <font-awesome-icon :icon="['fas', 'external-link-alt']" class="mr-2" />
            {{ t('activities.publicationInfo.viewPublic') }}
          </a>

          <!-- Informations supplémentaires -->
          <div class="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <h5 class="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
              <font-awesome-icon :icon="['fas', 'info-circle']" />
              {{ t('activities.publicationInfo.registrationInfo') }}
            </h5>
            <ul class="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li class="flex items-start gap-2">
                <font-awesome-icon :icon="['fas', 'user-plus']" class="mt-0.5 flex-shrink-0" />
                <span>{{ t('activities.publicationInfo.speakerRegistration') }}</span>
              </li>
              <li class="flex items-start gap-2">
                <font-awesome-icon :icon="['fas', 'users']" class="mt-0.5 flex-shrink-0" />
                <span>{{ t('activities.publicationInfo.audienceRegistration') }}</span>
              </li>
              <li class="flex items-start gap-2">
                <font-awesome-icon :icon="['fas', 'chart-bar']" class="mt-0.5 flex-shrink-0" />
                <span>{{ t('activities.publicationInfo.statsTracking') }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions supplémentaires -->
    <div class="mt-6 pt-6 border-t border-green-200 dark:border-green-700">
      <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
        {{ t('activities.publicationInfo.shareActivity') }}
      </h4>
      <div class="flex flex-wrap gap-3">
        <button
          @click="shareOnSocialMedia('whatsapp')"
          class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors cursor-pointer flex items-center gap-2"
        >
          <font-awesome-icon :icon="['fab', 'whatsapp']" />
          {{ t('activities.publicationInfo.shareWhatsApp') }}
        </button>

        <button
          @click="shareOnSocialMedia('twitter')"
          class="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors cursor-pointer flex items-center gap-2"
        >
          <font-awesome-icon :icon="['fab', 'twitter']" />
          {{ t('activities.publicationInfo.shareTwitter') }}
        </button>

        <button
          @click="shareOnSocialMedia('linkedin')"
          class="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-colors cursor-pointer flex items-center gap-2"
        >
          <font-awesome-icon :icon="['fab', 'linkedin']" />
          {{ t('activities.publicationInfo.shareLinkedIn') }}
        </button>

        <button
          @click="shareOnSocialMedia('facebook')"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer flex items-center gap-2"
        >
          <font-awesome-icon :icon="['fab', 'facebook']" />
          {{ t('activities.publicationInfo.shareFacebook') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const { t } = useI18n()

const props = defineProps({
  activityId: {
    type: String,
    required: true
  },
  activityTitle: {
    type: String,
    required: true
  },
  activityDescription: {
    type: String,
    default: ''
  },
  activityImage: {
    type: String,
    default: ''
  },
  activityDate: {
    type: String,
    default: ''
  }
})

const copied = ref(false)

// URL publique de l'activité
const publicUrl = computed(() => {
  const baseUrl = window.location.origin
  return `${baseUrl}/activities/${props.activityId}`
})

// URL du QR Code généré via API externe
const qrCodeUrl = computed(() => {
  // Utilisation de l'API QR Server (gratuite et sans limite)
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(publicUrl.value)}&color=059669&bgcolor=ffffff`
})

// Copier l'URL
const copyUrl = async () => {
  try {
    await navigator.clipboard.writeText(publicUrl.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 3000)
  } catch (error) {
    console.error('Error copying URL:', error)
    alert(t('activities.publicationInfo.errorCopyUrl'))
  }
}

// Télécharger le QR code
const downloadQRCode = async () => {
  try {
    // Télécharger l'image du QR code depuis l'API
    const response = await fetch(qrCodeUrl.value)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.download = `qrcode-activite-${props.activityId}.png`
    link.href = url
    link.click()

    // Libérer la mémoire
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error downloading QR code:', error)
    alert(t('activities.publicationInfo.errorDownloadQR'))
  }
}

// Partager sur les réseaux sociaux
const shareOnSocialMedia = (platform) => {
  const url = publicUrl.value

  // Créer un message de base
  let shareText = props.activityTitle

  if (props.activityDate) {
    shareText += `\n${props.activityDate}`
  }

  if (props.activityDescription) {
    // Limiter la description à 200 caractères pour les réseaux sociaux
    const truncatedDesc = props.activityDescription.length > 200
      ? props.activityDescription.substring(0, 200) + '...'
      : props.activityDescription
    shareText += `\n\n${truncatedDesc}`
  }

  shareText += `\n\n${t('activities.publicationInfo.registerNow')}`

  let shareUrl = ''

  switch (platform) {
    case 'twitter':
      // Twitter supporte le texte et l'URL avec emojis
      let twitterText = props.activityTitle
      if (props.activityDate) {
        twitterText += ` 📅 ${props.activityDate}`
      }
      shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(twitterText)}`
      break
    case 'linkedin':
      // LinkedIn avec URL et description
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
      break
    case 'facebook':
      // Facebook avec URL et citation
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(shareText)}`
      break
    case 'whatsapp':
      // WhatsApp - texte simple sans emojis problématiques
      const whatsappText = `${shareText}\n${url}`
      shareUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`
      break
  }

  if (shareUrl) {
    window.open(shareUrl, '_blank', 'width=600,height=400')
  }
}
</script>
