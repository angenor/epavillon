<template>
  <Teleport to="body">
    <Transition name="modal" appear>
      <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black/50" @click="closeModal"></div>
        
        <!-- Modal Content -->
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl transform transition-all">
            <!-- Header -->
            <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
                {{ t('community.createPost.title') }}
              </h2>
              <button
                @click="closeModal"
                class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Post Type Tabs -->
            <div class="flex border-b border-gray-200 dark:border-gray-700">
              <button
                v-for="type in postTypes"
                :key="type.value"
                @click="selectedType = type.value"
                :class="[
                  'flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
                  selectedType === type.value
                    ? 'border-b-2 border-ifdd-green-600 text-ifdd-green-600'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                ]"
              >
                <component :is="type.icon" class="w-5 h-5" />
                {{ t(type.label) }}
              </button>
            </div>

            <!-- Form Content -->
            <form @submit.prevent="handleSubmit" class="p-6">
              <!-- User Info -->
              <div class="flex items-center gap-3 mb-4">
                <div class="flex-shrink-0">
                  <div 
                    v-if="profile?.profile_photo_url"
                    class="w-10 h-10 rounded-full overflow-hidden"
                  >
                    <img 
                      :src="profile.profile_photo_url" 
                      :alt="`${profile.first_name} ${profile.last_name}`"
                      class="w-full h-full object-cover"
                    >
                  </div>
                  <div 
                    v-else
                    class="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-ifdd-green-500 to-ifdd-blue-500 text-white font-semibold"
                  >
                    {{ getInitials(profile) }}
                  </div>
                </div>
                <div>
                  <p class="font-medium text-gray-900 dark:text-white">
                    {{ profile?.first_name }} {{ profile?.last_name }}
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    {{ profile?.organization?.name || t('community.createPost.noOrganization') }}
                  </p>
                </div>
              </div>

              <!-- Testimonial Form -->
              <div v-if="selectedType === 'testimonial'" class="space-y-4">
                <!-- Context Selection -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {{ t('community.createPost.contextType') }}
                  </label>
                  <select
                    v-model="formData.context_type"
                    required
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ifdd-green-500"
                  >
                    <option value="">{{ t('community.createPost.selectContext') }}</option>
                    <option value="innovation_practice">{{ t('community.createPost.contextTypes.innovation') }}</option>
                    <option value="training">{{ t('community.createPost.contextTypes.training') }}</option>
                    <option value="event">{{ t('community.createPost.contextTypes.event') }}</option>
                    <option value="platform">{{ t('community.createPost.contextTypes.platform') }}</option>
                  </select>
                </div>

                <!-- Testimonial Text -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {{ t('community.createPost.testimonialText') }}
                  </label>
                  <textarea
                    v-model="formData.testimonial_text"
                    required
                    rows="5"
                    :placeholder="t('community.createPost.testimonialPlaceholder')"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-ifdd-green-500 resize-none"
                  ></textarea>
                  <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {{ formData.testimonial_text.length }}/500 {{ t('common.characters') }}
                  </p>
                </div>

                <!-- Photo Upload -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {{ t('community.createPost.addPhoto') }}
                  </label>
                  <div 
                    @click="$refs.photoInput.click()"
                    class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-ifdd-green-500 transition-colors"
                  >
                    <div v-if="photoPreview" class="relative">
                      <img :src="photoPreview" alt="Preview" class="max-h-48 mx-auto rounded-lg">
                      <button
                        @click.stop="removePhoto"
                        type="button"
                        class="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div v-else>
                      <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                      <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {{ t('community.createPost.uploadPhotoText') }}
                      </p>
                    </div>
                  </div>
                  <input
                    ref="photoInput"
                    type="file"
                    accept="image/*"
                    @change="handlePhotoUpload"
                    class="hidden"
                  >
                </div>

                <!-- Background Color -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {{ t('community.createPost.backgroundColor') }}
                  </label>
                  <div class="flex gap-2">
                    <button
                      v-for="color in backgroundColors"
                      :key="color"
                      type="button"
                      @click="formData.background_color = color"
                      :class="[
                        'w-10 h-10 rounded-lg border-2 transition-all',
                        formData.background_color === color
                          ? 'border-gray-900 dark:border-white scale-110'
                          : 'border-transparent hover:scale-105'
                      ]"
                      :style="{ backgroundColor: color }"
                    ></button>
                  </div>
                </div>

                <!-- Featured Checkbox -->
                <div class="flex items-center">
                  <input
                    type="checkbox"
                    v-model="formData.featured"
                    id="featured"
                    class="h-4 w-4 text-ifdd-green-600 focus:ring-ifdd-green-500 border-gray-300 rounded"
                  >
                  <label for="featured" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    {{ t('community.createPost.markAsFeatured') }}
                  </label>
                </div>
              </div>

              <!-- Video Testimonial Form -->
              <div v-else-if="selectedType === 'video'" class="space-y-4">
                <!-- Context Selection -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {{ t('community.createPost.contextType') }}
                  </label>
                  <select
                    v-model="formData.context_type"
                    required
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ifdd-green-500"
                  >
                    <option value="">{{ t('community.createPost.selectContext') }}</option>
                    <option value="training">{{ t('community.createPost.contextTypes.training') }}</option>
                    <option value="activity">{{ t('community.createPost.contextTypes.activity') }}</option>
                    <option value="event">{{ t('community.createPost.contextTypes.event') }}</option>
                  </select>
                </div>

                <!-- Video Upload -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {{ t('community.createPost.uploadVideo') }}
                  </label>
                  <div 
                    @click="$refs.videoInput.click()"
                    class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-ifdd-green-500 transition-colors"
                  >
                    <div v-if="videoPreview" class="relative">
                      <video :src="videoPreview" controls class="max-h-48 mx-auto rounded-lg"></video>
                      <button
                        @click.stop="removeVideo"
                        type="button"
                        class="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div v-else>
                      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {{ t('community.createPost.uploadVideoText') }}
                      </p>
                      <div class="text-xs text-gray-500 dark:text-gray-500 mt-1 space-y-1">
                        <p>{{ t('community.createPost.videoMaxDuration') }}</p>
                        <p>{{ t('community.createPost.videoMaxSize') || 'Taille maximale : 10 MB' }}</p>
                      </div>
                    </div>
                  </div>
                  <input
                    ref="videoInput"
                    type="file"
                    accept="video/*"
                    @change="handleVideoUpload"
                    class="hidden"
                  >
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  @click="closeModal"
                  class="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {{ t('common.cancel') }}
                </button>
                <button
                  type="submit"
                  :disabled="isSubmitting || !isFormValid"
                  class="px-6 py-2 bg-ifdd-green-600 text-white rounded-lg hover:bg-ifdd-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <svg v-if="isSubmitting" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ isSubmitting ? t('common.publishing') : t('common.publish') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, h } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { useSupabase } from '@/composables/useSupabase'

const { t } = useI18n()
const authStore = useAuthStore()
const { user, profile } = storeToRefs(authStore)
const { supabase } = useSupabase()

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['close', 'posted'])

// Icons as functional components
const TestimonialIcon = {
  render() {
    return h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
      h('path', { 
        'stroke-linecap': 'round', 
        'stroke-linejoin': 'round', 
        'stroke-width': '2', 
        d: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z' 
      })
    )
  }
}

const VideoIcon = {
  render() {
    return h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
      h('path', { 
        'stroke-linecap': 'round', 
        'stroke-linejoin': 'round', 
        'stroke-width': '2', 
        d: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' 
      })
    )
  }
}

// Post types configuration
const postTypes = [
  { value: 'testimonial', label: 'community.createPost.testimonial', icon: TestimonialIcon },
  { value: 'video', label: 'community.createPost.video', icon: VideoIcon }
]

// Form state
const selectedType = ref('testimonial')
const isSubmitting = ref(false)
const photoPreview = ref(null)
const videoPreview = ref(null)
const photoFile = ref(null)
const videoFile = ref(null)

const formData = ref({
  testimonial_text: '',
  context_type: '',
  background_color: '#10B981',
  featured: false,
  photo_url: null,
  video_url: null,
  duration_seconds: null
})

// Background color options
const backgroundColors = [
  '#10B981', // green
  '#3B82F6', // blue
  '#8B5CF6', // purple
  '#F59E0B', // amber
  '#EF4444', // red
  '#EC4899', // pink
  '#14B8A6', // teal
  '#6366F1'  // indigo
]

// Form validation
const isFormValid = computed(() => {
  if (selectedType.value === 'testimonial') {
    return formData.value.testimonial_text.trim().length > 0 && 
           formData.value.context_type !== ''
  } else if (selectedType.value === 'video') {
    return videoFile.value !== null && 
           formData.value.context_type !== ''
  }
  return false
})

// Helper functions
const getInitials = (user) => {
  if (!user) return '?'
  return `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase()
}

const closeModal = () => {
  // Reset form
  formData.value = {
    testimonial_text: '',
    context_type: '',
    background_color: '#10B981',
    featured: false,
    photo_url: null,
    video_url: null,
    duration_seconds: null
  }
  photoPreview.value = null
  videoPreview.value = null
  photoFile.value = null
  videoFile.value = null
  selectedType.value = 'testimonial'
  emit('close')
}

const handlePhotoUpload = (event) => {
  const file = event.target.files[0]
  if (file && file.type.startsWith('image/')) {
    photoFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      photoPreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const removePhoto = () => {
  photoPreview.value = null
  photoFile.value = null
  // Reset input element if it exists
  const photoInput = document.querySelector('input[type="file"][accept="image/*"]')
  if (photoInput) {
    photoInput.value = ''
  }
}

const handleVideoUpload = (event) => {
  const file = event.target.files[0]
  if (file && file.type.startsWith('video/')) {
    // Check file size (max 10 MB)
    const maxSizeInBytes = 10 * 1024 * 1024 // 10 MB
    if (file.size > maxSizeInBytes) {
      alert(t('community.createPost.videoTooLarge') || 'La vidéo ne doit pas dépasser 10 MB')
      event.target.value = '' // Reset input
      return
    }
    
    // Check video duration (max 60 seconds)
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.onloadedmetadata = () => {
      if (video.duration <= 60) {
        videoFile.value = file
        formData.value.duration_seconds = Math.round(video.duration)
        const reader = new FileReader()
        reader.onload = (e) => {
          videoPreview.value = e.target.result
        }
        reader.readAsDataURL(file)
      } else {
        alert(t('community.createPost.videoTooLong'))
        event.target.value = '' // Reset input
      }
    }
    video.src = URL.createObjectURL(file)
  }
}

const removeVideo = () => {
  videoPreview.value = null
  videoFile.value = null
  formData.value.duration_seconds = null
  // Reset input element if it exists
  const videoInput = document.querySelector('input[type="file"][accept="video/*"]')
  if (videoInput) {
    videoInput.value = ''
  }
}

const handleSubmit = async () => {
  if (!isFormValid.value || isSubmitting.value) return
  
  console.log('=== DEBUG: Starting submission ===')
  console.log('User from store:', user.value)
  console.log('Profile from store:', profile.value)
  
  isSubmitting.value = true
  
  try {
    // Vérifier la session Supabase directement
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    console.log('Session check:', { session, sessionError })
    
    if (sessionError || !session) {
      console.error('Session error:', sessionError || 'No session found')
      alert(t('common.sessionExpired') || 'Session expirée, veuillez vous reconnecter')
      isSubmitting.value = false
      return
    }
    
    const userId = session.user.id
    console.log('Using user ID from session:', userId)
    console.log('Session user email:', session.user.email)
    let uploadedPhotoUrl = null
    let uploadedVideoUrl = null
    
    // Upload photo if present
    if (photoFile.value) {
      const fileName = `temoignage/${userId}/${Date.now()}_${photoFile.value.name}`
      const { error: uploadError } = await supabase.storage
        .from('epavillonp')
        .upload(fileName, photoFile.value)
      
      if (uploadError) throw uploadError
      
      const { data: { publicUrl } } = supabase.storage
        .from('epavillonp')
        .getPublicUrl(fileName)
      
      uploadedPhotoUrl = publicUrl
    }
    
    // Upload video if present
    if (videoFile.value) {
      const fileName = `temoignage/${userId}/${Date.now()}_${videoFile.value.name}`
      const { error: uploadError } = await supabase.storage
        .from('epavillonv')
        .upload(fileName, videoFile.value)
      
      if (uploadError) throw uploadError
      
      const { data: { publicUrl } } = supabase.storage
        .from('epavillonv')
        .getPublicUrl(fileName)
      
      uploadedVideoUrl = publicUrl
    }
    
    if (selectedType.value === 'testimonial') {
      // Préparer les données avec l'ID de la session
      const testimonialData = {
        testimonial_text: formData.value.testimonial_text.trim(),
        context_type: formData.value.context_type,
        featured: formData.value.featured,
        background_color: formData.value.background_color,
        user_id: userId // Utiliser l'ID de la session active
      }
      
      // Ajouter les URLs seulement si elles existent
      if (uploadedPhotoUrl) {
        testimonialData.photo_url = uploadedPhotoUrl
      }
      
      console.log('Inserting testimonial with data:', testimonialData)
      
      const { data, error } = await supabase
        .from('user_testimonials')
        .insert(testimonialData)
        .select()
        .single()
      
      if (error) {
        console.error('Error inserting testimonial:', error)
        throw error
      }
      
      emit('posted', data)
    } else if (selectedType.value === 'video') {
      const videoData = {
        video_url: uploadedVideoUrl,
        duration_seconds: formData.value.duration_seconds,
        featured: false,
        context_type: formData.value.context_type,
        context_id: null,
        is_approved: false, // Videos need approval
        user_id: userId // Utiliser l'ID de la session active
      }
      
      console.log('Inserting video testimonial with data:', videoData)
      
      const { data, error } = await supabase
        .from('video_testimonials')
        .insert(videoData)
        .select()
        .single()
      
      if (error) {
        console.error('Error inserting video testimonial:', error)
        throw error
      }
      
      emit('posted', data)
    }
    
    // Close modal on success
    closeModal()
    
  } catch (error) {
    console.error('Error creating post:', error)
    if (error.message?.includes('row-level security')) {
      alert(t('common.authenticationError') || 'Erreur d\'authentification. Veuillez vous reconnecter.')
    } else if (error.message?.includes('violates foreign key constraint')) {
      alert(t('common.invalidData') || 'Données invalides. Veuillez vérifier vos informations.')
    } else {
      alert(error.message || t('community.createPost.error') || 'Une erreur est survenue lors de la création du post.')
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
/* Modal transitions */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.95) translateY(10px);
}
</style>