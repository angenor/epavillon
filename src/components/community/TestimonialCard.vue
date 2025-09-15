<template>
  <div 
    :class="[
      'group relative bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden',
      props.style === 'facebook' ? 'max-w-none' : ''
    ]"
    @click="$emit('click')"
  >
    <!-- Gradient Border Effect -->
    <div class="absolute inset-0 bg-gradient-to-r from-ifdd-green-500 to-ifdd-blue-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
    
    <div class="relative p-6">
      <!-- Header -->
      <div class="flex items-start gap-4 mb-4">
        <!-- Avatar -->
        <div class="flex-shrink-0">
          <div 
            v-if="getUserPhoto()"
            class="w-12 h-12 rounded-full overflow-hidden ring-2 ring-white dark:ring-gray-700"
          >
            <img 
              :src="getUserPhoto()" 
              :alt="getUserFullName()"
              class="w-full h-full object-cover"
            >
          </div>
          <div 
            v-else
            class="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ring-2 ring-white dark:ring-gray-700"
            :style="{ backgroundColor: testimonial.background_color || getRandomColor() }"
          >
            {{ getInitials() }}
          </div>
        </div>

        <!-- User Info -->
        <div class="flex-1 min-w-0">
          <h4 class="font-semibold text-gray-900 dark:text-white truncate">
            {{ getUserFullName() }}
          </h4>
          <p class="text-sm text-gray-500 dark:text-gray-400 truncate">
            {{ getOrganizationName() }}
          </p>
          <time class="text-xs text-gray-400 dark:text-gray-500">
            {{ formatDate(testimonial.created_at) }}
          </time>
        </div>

        <!-- Actions and Type Badge -->
        <div class="flex items-center gap-2">
          <!-- Edit Button - Only for post author -->
          <button
            v-if="canEditPost()"
            @click.stop="$emit('edit', testimonial)"
            class="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            :title="t('common.edit')"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
          </button>

          <!-- Delete Button - Only for post author -->
          <button
            v-if="canEditPost()"
            @click.stop="$emit('delete', testimonial)"
            class="flex-shrink-0 p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
            :title="t('common.delete')"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>

          <!-- Type Badge -->
          <div 
            :class="[
              'flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium',
              getTypeBadgeClass()
            ]"
          >
            {{ getTypeLabel() }}
          </div>
        </div>
      </div>

      <!-- Content based on post type -->
      <div class="mb-4">
        <!-- Testimonial Text -->
        <p v-if="testimonial.testimonial_text" class="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          "{{ testimonial.testimonial_text }}"
        </p>

        <!-- Innovation/Practice Title and Description -->
        <div v-if="testimonial.title">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {{ testimonial.title }}
          </h3>
          <p class="text-gray-700 dark:text-gray-300 line-clamp-3 mb-4">
            {{ testimonial.description }}
          </p>
        </div>

        <!-- Image based on content type -->
        <div v-if="getMainImage()" class="mb-4">
          <img 
            :src="getMainImage()" 
            :alt="getContentTitle()"
            class="w-full h-48 object-cover rounded-xl"
          >
        </div>

        <!-- Video Testimonial -->
        <div v-if="testimonial.type === 'video_testimonial' && testimonial.video_url" class="mb-4">
          <video 
            :src="testimonial.video_url" 
            class="w-full h-48 object-cover rounded-xl"
            controls
            :poster="getUserPhoto()"
          >
            Votre navigateur ne supporte pas la lecture de vidéos.
          </video>
          <p class="text-xs text-gray-500 mt-1">
            Durée: {{ testimonial.duration_seconds }}s
          </p>
        </div>
      </div>

      <!-- Context Info -->
      <div v-if="getContextTitle()" class="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <component :is="getContextIcon()" class="w-4 h-4" />
          <span class="truncate font-medium">{{ getContextTitle() }}</span>
        </div>
      </div>

      <!-- Stats for innovations/practices -->
      <div v-if="testimonial.view_count || testimonial.application_sector" class="mb-4">
        <div class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <div v-if="testimonial.view_count" class="flex items-center gap-1">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
              <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
            </svg>
            {{ testimonial.view_count }} vues
          </div>
          <div v-if="testimonial.application_sector" class="flex items-center gap-1">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/>
            </svg>
            {{ getSectorLabel(testimonial.application_sector) }}
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
        <!-- Interaction buttons -->
        <div class="flex items-center gap-4">
          <button class="flex items-center gap-1 text-gray-500 hover:text-ifdd-green-600 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
            <span class="text-sm">J'aime</span>
          </button>
          <button class="flex items-center gap-1 text-gray-500 hover:text-ifdd-blue-600 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
            <span class="text-sm">Commenter</span>
          </button>
        </div>
        
        <!-- Featured Badge -->
        <div 
          v-if="testimonial.featured"
          class="flex items-center gap-1 text-yellow-600 dark:text-yellow-400"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span class="text-xs font-medium">En vedette</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { h } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

const props = defineProps({
  testimonial: {
    type: Object,
    required: true
  },
  style: {
    type: String,
    default: 'card'
  }
})

const emit = defineEmits(['click', 'edit', 'delete'])
const { t } = useI18n()
const authStore = useAuthStore()
const { user: currentUser } = storeToRefs(authStore)

// Helper functions for user information
const getUserPhoto = () => {
  // Photo du profil utilisateur depuis la table users
  return props.testimonial.user?.profile_photo_url || props.testimonial.submitted_by?.profile_photo_url || props.testimonial.user?.profile?.profile_photo_url
}

const getMainImage = () => {
  // Pour un témoignage simple : utiliser photo_url
  if (props.testimonial.type === 'testimonial' && props.testimonial.photo_url) {
    return props.testimonial.photo_url
  }
  
  // Pour une innovation ou pratique : utiliser cover_image
  if ((props.testimonial.type === 'innovation' || props.testimonial.type === 'practice')) {
    return props.testimonial.innovation?.cover_image_hd_16_9_url || 
           props.testimonial.practice?.cover_image_hd_16_9_url ||
           props.testimonial.cover_image_hd_16_9_url ||
           props.testimonial.innovation_practice?.cover_image_hd_16_9_url
  }
  
  // Pas d'image
  return null
}

const getUserFullName = () => {
  const user = props.testimonial.user || props.testimonial.submitted_by
  if (!user) return 'Utilisateur anonyme'
  return `${user.first_name || ''} ${user.last_name || ''}`.trim()
}

const getInitials = () => {
  const user = props.testimonial.user || props.testimonial.submitted_by
  if (!user) return '?'
  return `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase()
}

const getOrganizationName = () => {
  const user = props.testimonial.user || props.testimonial.submitted_by
  return user?.organization?.name || props.testimonial.organization?.name || 'Organisation'
}

const getRandomColor = () => {
  const colors = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4']
  return colors[Math.floor(Math.random() * colors.length)]
}

// Helper functions for content
const getContentTitle = () => {
  return props.testimonial.title || 
         props.testimonial.innovation_practice?.title || 
         props.testimonial.training?.title || 
         'Contenu'
}

const getContextTitle = () => {
  if (props.testimonial.innovation_practice?.title) {
    return props.testimonial.innovation_practice.title
  }
  if (props.testimonial.training?.title) {
    return props.testimonial.training.title
  }
  return null
}

const getContextIcon = () => {
  if (props.testimonial.context_type === 'training') {
    return {
      render() {
        return h('svg', { fill: 'currentColor', viewBox: '0 0 20 20' }, [
          h('path', { d: 'M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z' })
        ])
      }
    }
  }
  
  return {
    render() {
      return h('svg', { fill: 'currentColor', viewBox: '0 0 20 20' }, [
        h('path', { d: 'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' })
      ])
    }
  }
}

// Helper functions for type and category
const getTypeLabel = () => {
  switch (props.testimonial.type) {
    case 'testimonial':
      if (props.testimonial.context_type === 'training') {
        return 'Témoignage Formation'
      }
      return 'Témoignage'
    case 'innovation':
      return 'Innovation'
    case 'practice':
      return 'Bonne Pratique'
    case 'video_testimonial':
      return 'Vidéo Témoignage'
    default:
      return 'Contenu'
  }
}

const getTypeBadgeClass = () => {
  switch (props.testimonial.type) {
    case 'innovation':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    case 'practice':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case 'video_testimonial':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    case 'testimonial':
      if (props.testimonial.context_type === 'training') {
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      }
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
  }
}

const getSectorLabel = (sector) => {
  const sectorLabels = {
    agriculture: 'Agriculture',
    livestock: 'Élevage',
    industry: 'Industrie',
    other: 'Autre'
  }
  return sectorLabels[sector] || sector
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 1) {
    return 'Aujourd\'hui'
  } else if (diffDays === 1) {
    return 'Hier'
  } else if (diffDays < 7) {
    return `Il y a ${diffDays} jours`
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return `Il y a ${weeks} semaine${weeks > 1 ? 's' : ''}`
  } else {
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }
}

// Check if current user can edit this post
const canEditPost = () => {
  if (!currentUser.value) return false
  
  const postAuthor = props.testimonial.user || props.testimonial.submitted_by
  if (!postAuthor) return false
  
  return currentUser.value.id === postAuthor.id
}
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-4 {
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Facebook-like post styling */
.group:hover .group-hover\:opacity-100 {
  opacity: 1;
}

/* Smooth image transitions */
img {
  transition: all 0.3s ease;
}

/* Interactive buttons */
button:hover svg {
  transform: scale(1.1);
  transition: transform 0.2s ease;
}

/* Avatar ring effect */
.ring-2:hover {
  --tw-ring-width: 3px;
  transition: all 0.2s ease;
}

/* Enhanced card shadow on hover */
.group:hover {
  transform: translateY(-2px);
}
</style>