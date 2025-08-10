<template>
  <section class="relative h-screen flex items-center justify-center overflow-hidden">
    <!-- Vidéo de fond -->
    <video 
      v-if="currentVideo"
      :key="currentVideo.id"
      class="absolute inset-0 z-0 w-full h-full object-cover dark:sepia"
      :src="currentVideo.video_url || '/videos/IFDD_Roumanie.mp4'"
      autoplay
      muted
      loop
      playsinline
      @error="handleVideoError"
    ></video>
    
    <!-- Vidéo par défaut si aucune vidéo de témoignage -->
    <video 
      v-else
      class="absolute inset-0 z-0 w-full h-full object-cover dark:sepia"
      src="/videos/IFDD_Roumanie.mp4"
      autoplay
      muted
      loop
      playsinline
    ></video>
    
    <!-- Overlay gradient -->
    <div class="absolute inset-0 z-[1] bg-gradient-to-b from-black/50 via-black/30 to-black/50 dark:from-black/70 dark:via-black/50 dark:to-black/70"></div>

    <!-- Contenu -->
    <div class="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <h1 class="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 animate-fade-in font-maverick">
        {{ t('hero.welcome') }}
      </h1>
      <p class="text-lg sm:text-xl md:text-2xl text-gray-200 mb-8 animate-fade-in-delay">
        {{ t('hero.subtitle') }}
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-delay-2">
        <button class="px-8 py-3 bg-ifdd-bleu hover:bg-ifdd-bleu-dark text-white font-medium font-helvetica rounded-lg transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
          {{ t('common.discover') }}
        </button>
        <button class="px-8 py-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-medium font-helvetica rounded-lg transition-colors border border-white/30">
          {{ t('common.learnMore') }}
        </button>
      </div>
    </div>

    <!-- Scroll indicator -->
    <div class="absolute z-20 bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
      <font-awesome-icon :icon="['fas', 'chevron-down']" class="text-2xl text-white" />
    </div>

    <!-- galerie video -->
    <div v-if="videoTestimonials.length > 0" class="z-0 absolute bottom-0 left-0 w-full h-56 bg-gradient-to-t from-black to-transparent">
      <div class="flex space-x-3 mt-16 ml-10 overflow-x-auto pb-4">
        
        <!-- Vidéo témoignage -->
        <div 
          v-for="video in videoTestimonials" 
          :key="video.id"
          :class="[
            'flex-shrink-0 transition-all duration-300',
            currentVideo?.id === video.id ? 'p-1 bg-white/70 rounded-md backdrop-blur-sm border border-white' : ''
          ]"
        >
          <div 
            :style="{ backgroundImage: video.thumbnail_url ? `url(${video.thumbnail_url})` : '' }"
            :class="[
              'h-16 w-24 rounded-md flex bg-cover bg-center',
              !video.thumbnail_url ? 'bg-gradient-to-br from-ifdd-bleu to-ifdd-violet' : ''
            ]"
          >
            <button 
              @click="toggleVideo(video)"
              class="flex items-center justify-center h-full w-full cursor-pointer group relative"
            >
              <!-- Overlay sombre au survol -->
              <div class="absolute inset-0 bg-black/30 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <!-- Bouton play/pause -->
              <div class="p-2 bg-white/80 rounded-full backdrop-blur-sm border border-white z-10 transform group-hover:scale-110 transition-transform">
                <font-awesome-icon 
                  :icon="['fas', currentVideo?.id === video.id ? 'pause' : 'play']" 
                  class="text-ifdd-violet-dark text-sm" 
                />
              </div>
              
              <!-- Info sur la vidéo au survol -->
              <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1 rounded-b-md opacity-0 group-hover:opacity-100 transition-opacity">
                <p class="text-white text-xs truncate">
                  {{ video.user?.first_name }} {{ video.user?.last_name }}
                </p>
              </div>
            </button>
          </div>
        </div>

      </div>
      
      <!-- Indicateur de navigation si plus de vidéos -->
      <div v-if="videoTestimonials.length > 6" class="absolute right-4 top-1/2 -translate-y-1/2">
        <font-awesome-icon :icon="['fas', 'chevron-right']" class="text-white/60 animate-pulse" />
      </div>
    </div>

    <!-- Panneau des activités -->
    <div class="h-screen absolute top-0 right-0 z-20">
      <UpcomingActivities />
    </div>
  </section>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTestimonials } from '@/composables/useTestimonials'
import { useVideoThumbnails } from '@/composables/useVideoThumbnails'
import UpcomingActivities from './UpcomingActivities.vue'

export default {
  name: 'HeroSection',
  components: {
    UpcomingActivities
  },
  setup() {
    const { t } = useI18n()
    const { fetchVideoTestimonials } = useTestimonials()
    const { generateThumbnailsForVideos } = useVideoThumbnails()
    
    const videoTestimonials = ref([])
    const currentVideo = ref(null)
    const currentVideoIndex = ref(0)
    let autoPlayInterval = null
    
    // Données mockées pour le développement/test
    const mockVideoTestimonials = [
      {
        id: 'mock-1',
        video_url: '/videos/IFDD_Roumanie.mp4',
        thumbnail_url: null,
        user: {
          first_name: 'Jean',
          last_name: 'Dupont',
          profile_photo_url: null
        },
        featured: true,
        duration_seconds: 30
      },
      {
        id: 'mock-2',
        video_url: '/videos/IFDD_Roumanie.mp4',
        thumbnail_url: null,
        user: {
          first_name: 'Marie',
          last_name: 'Martin',
          profile_photo_url: null
        },
        featured: false,
        duration_seconds: 45
      },
      {
        id: 'mock-3',
        video_url: '/videos/IFDD_Roumanie.mp4',
        thumbnail_url: null,
        user: {
          first_name: 'Pierre',
          last_name: 'Bernard',
          profile_photo_url: null
        },
        featured: false,
        duration_seconds: 25
      }
    ]
    
    // Charger les vidéos de témoignage
    const loadVideoTestimonials = async () => {
      // En développement, récupérer toutes les vidéos, sinon seulement les approuvées
      const videos = await fetchVideoTestimonials(import.meta.env.DEV ? null : true)
      
      console.log('Vidéos récupérées:', videos)
      
      // Utiliser les données mockées si aucune vidéo dans la base de données (développement)
      if (videos.length === 0 && import.meta.env.DEV) {
        console.log('Aucune vidéo dans la base de données, utilisation des données mockées')
        videoTestimonials.value = mockVideoTestimonials.slice(0, 10)
      } else {
        // Générer les miniatures manquantes (localement uniquement, pas de sauvegarde en DB)
        const videosWithThumbnails = await generateThumbnailsForVideos(videos.slice(0, 10), false)
        videoTestimonials.value = videosWithThumbnails
      }
      
      // Sélectionner la première vidéo par défaut
      if (videoTestimonials.value.length > 0) {
        currentVideo.value = videoTestimonials.value[0]
        startAutoPlay()
      }
    }
    
    // Basculer entre les vidéos
    const toggleVideo = (video) => {
      if (currentVideo.value?.id === video.id) {
        // Si c'est la même vidéo, revenir à la vidéo par défaut
        currentVideo.value = null
        stopAutoPlay()
      } else {
        currentVideo.value = video
        currentVideoIndex.value = videoTestimonials.value.findIndex(v => v.id === video.id)
        restartAutoPlay()
      }
    }
    
    // Gestion de l'erreur de chargement vidéo
    const handleVideoError = () => {
      console.error('Erreur de chargement de la vidéo')
      // Passer à la vidéo suivante en cas d'erreur
      nextVideo()
    }
    
    // Passer à la vidéo suivante
    const nextVideo = () => {
      if (videoTestimonials.value.length > 0) {
        currentVideoIndex.value = (currentVideoIndex.value + 1) % videoTestimonials.value.length
        currentVideo.value = videoTestimonials.value[currentVideoIndex.value]
      }
    }
    
    // Démarrer la lecture automatique
    const startAutoPlay = () => {
      if (autoPlayInterval) clearInterval(autoPlayInterval)
      autoPlayInterval = setInterval(() => {
        nextVideo()
      }, 15000) // Changer de vidéo toutes les 15 secondes
    }
    
    // Arrêter la lecture automatique
    const stopAutoPlay = () => {
      if (autoPlayInterval) {
        clearInterval(autoPlayInterval)
        autoPlayInterval = null
      }
    }
    
    // Redémarrer la lecture automatique
    const restartAutoPlay = () => {
      stopAutoPlay()
      startAutoPlay()
    }
    
    onMounted(() => {
      loadVideoTestimonials()
    })
    
    onUnmounted(() => {
      stopAutoPlay()
    })
    
    return { 
      t,
      videoTestimonials,
      currentVideo,
      toggleVideo,
      handleVideoError
    }
  }
}
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 1s ease-out;
}

.animate-fade-in-delay {
  animation: fade-in 1s ease-out 0.3s both;
}

.animate-fade-in-delay-2 {
  animation: fade-in 1s ease-out 0.6s both;
}
</style>