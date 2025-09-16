<template>
  <section class="relative h-screen flex items-center justify-center overflow-hidden">
    <!-- Vidéo de fond -->
    <video
      v-if="currentTestimonial?.type === 'video' && currentTestimonial.video_url"
      :key="currentTestimonial.id"
      class="absolute inset-0 z-0 w-full h-full object-cover dark:sepia"
      :src="currentTestimonial.video_url || '/videos/IFDD_Roumanie.mp4'"
      autoplay
      muted
      loop
      playsinline
      @error="handleVideoError"
    ></video>

    <!-- Photo de fond pour témoignage écrit -->
    <div
      v-else-if="currentTestimonial?.type === 'written' && currentTestimonial.photo_url"
      :key="currentTestimonial.id"
      class="absolute inset-0 z-0 w-full h-full"
    >
      <img
        :src="currentTestimonial.photo_url"
        class="w-full h-full object-cover dark:sepia"
        :alt="`Témoignage de ${currentTestimonial.user?.first_name} ${currentTestimonial.user?.last_name}`"
      />
      <!-- Texte du témoignage avec animation -->
      <transition name="fade-slide" appear>
        <div :key="`text-${currentTestimonial.id}`" class="absolute z-50 left-0 top-32 max-w-md p-6 bg-blue-800/30 font-bold backdrop-blur-xl rounded-r-lg">
          <p class="text-white text-xl italic mb-4 animate-fade-in">"{{ currentTestimonial.testimonial_text }}"</p>
          <p class="text-white font-semibold animate-fade-in-delay">
            — {{ currentTestimonial.user?.first_name }} {{ currentTestimonial.user?.last_name }}
            <span v-if="currentTestimonial.user?.organization?.name" class="text-sm font-normal">
              , {{ currentTestimonial.user.organization.name }}
            </span>
          </p>
        </div>
      </transition>
    </div>

    <!-- Vidéo par défaut si aucun témoignage -->
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
    <!-- <div class="absolute z-0 inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/50 dark:from-black/70 dark:via-black/50 dark:to-black/70"></div> -->

    <!-- Scroll indicator -->
    <div class="absolute z-20 bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
      <font-awesome-icon :icon="['fas', 'chevron-down']" class="text-2xl text-white" />
    </div>

    <!-- galerie témoignages -->
    <div v-if="allTestimonials.length > 0" class="z-0 absolute bottom-0 left-0 w-full h-56 bg-gradient-to-t from-black to-transparent">

      <!-- Etiquette -->
      <div class="ml-5 absolute top-7 flex justify-center items-center">
        <div class="h-2 w-2 rounded-full bg-green-600"></div>
        <!-- Etiquette dynamique selon le type -->
        <div v-if="currentTestimonial?.type === 'video'" class="ml-2 text-white font-bold">Innovation/Bonne pratique</div>
        <div v-else-if="currentTestimonial?.type === 'written'" class="ml-2 text-white font-bold">Témoignage négociatrice Francophone</div>
      </div>

      <div class="flex space-x-3 mt-16 ml-10 overflow-x-auto pb-4">
        <!-- Témoignages (vidéo et écrits) -->
        <div
          v-for="testimonial in allTestimonials"
          :key="testimonial.id"
          :class="[
            'flex-shrink-0 transition-all duration-300',
            currentTestimonial?.id === testimonial.id ? 'p-1 bg-white/70 rounded-md backdrop-blur-sm border border-white' : ''
          ]"
          >
          <div
            :style="{
              backgroundImage: testimonial.type === 'video'
                ? (testimonial.thumbnail_url ? `url(${testimonial.thumbnail_url})` : '')
                : (testimonial.photo_url ? `url(${testimonial.photo_url})` : '')
            }"
            :class="[
              'h-16 w-24 rounded-md flex bg-cover bg-center',
              (!testimonial.thumbnail_url && testimonial.type === 'video') || (!testimonial.photo_url && testimonial.type === 'written')
                ? 'bg-gradient-to-br from-ifdd-bleu to-ifdd-violet' : ''
            ]"
          >
            <button
              @click.stop="toggleTestimonial(testimonial)"
              class="flex items-center justify-center h-full w-full cursor-pointer group relative"
              type="button"
            >
              <!-- Overlay sombre au survol -->
              <div class="absolute inset-0 bg-black/30 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

              <!-- Icône selon le type -->
              <div class="p-2 bg-white/80 rounded-full backdrop-blur-sm border border-white z-10 transform group-hover:scale-110 transition-transform pointer-events-none">
                <font-awesome-icon
                  v-if="testimonial.type === 'video'"
                  :icon="['fas', currentTestimonial?.id === testimonial.id ? 'pause' : 'play']"
                  class="text-ifdd-violet-dark text-sm"
                />
                <font-awesome-icon
                  v-else
                  :icon="['fas', 'quote-left']"
                  class="text-ifdd-violet-dark text-sm"
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- titre du témoignage en cours -->
      <div v-if="currentTestimonial?.type === 'video' && currentTestimonial?.title" class="ml-5 max-w-1/2 text-white absolute bottom-5 bg-white/20 p-2 rounded-md text-xl font-bold">
        <a class="hover:underline" :href="currentTestimonial?.detail_url" target="_blank">{{ currentTestimonial?.title }}</a>
      </div>

      <!-- Indicateur de navigation si plus de témoignages -->
      <div v-if="allTestimonials.length > 6" class="absolute right-4 top-1/2 -translate-y-1/2">
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
    const { fetchFeaturedVideoTestimonials, fetchWrittenTestimonials } = useTestimonials()
    const { generateThumbnailsForVideos } = useVideoThumbnails()

    const videoTestimonials = ref([])
    const writtenTestimonials = ref([])
    const allTestimonials = ref([])
    const currentTestimonial = ref(null)
    const currentTestimonialIndex = ref(0)
    let autoPlayInterval = null
    let photoDisplayTimeout = null

    // Données mockées pour le développement/test
    // TÉMOIGNAGES VIDÉOS TEMPORAIREMENT DÉSACTIVÉS
    // const mockVideoTestimonials = [
    //   {
    //     id: 'mock-video-1',
    //     type: 'video',
    //     video_url: '/videos/video_couverture.mp4',
    //     thumbnail_url: null,
    //     title: 'Témoignage ePavillon',
    //     user: {
    //       first_name: 'Utilisateur',
    //       last_name: 'ePavillon',
    //       profile_photo_url: null
    //     },
    //     featured: true,
    //     duration_seconds: 30
    //   },
    //   // {
    //   //   id: 'mock-video-2',
    //   //   type: 'video',
    //   //   video_url: '/videos/video_couverture.mp4',
    //   //   thumbnail_url: null,
    //   //   user: {
    //   //     first_name: 'Marie',
    //   //     last_name: 'Martin',
    //   //     profile_photo_url: null
    //   //   },
    //   //   featured: false,
    //   //   duration_seconds: 45
    //   // }
    // ]
    const mockVideoTestimonials = []

    const mockWrittenTestimonials = [
      {
        id: 'mock-written-biligua',
        type: 'written',
        photo_url: '/images/temoignages/temoignage-Biligua-Koivogui.jpg',
        testimonial_text: 'Ma participation aux formations de l\'IFDD sur les négociations climatiques a été transformatrice pour ma carrière de négociatrice. Grâce aux outils pratiques et aux simulations de négociations, j\'ai développé une meilleure compréhension des enjeux complexes du financement climatique et de l\'adaptation.',
        user: {
          first_name: 'Biligua',
          last_name: 'Koivogui',
          organization: {
            name: 'Ministère de l\'Environnement de Guinée'
          }
        },
        featured: true,
        background_color: '#1e40af'
      },
      {
        id: 'mock-written-1',
        type: 'written',
        photo_url: '/images/temoignages/Antoine_Faye.jpg',
        testimonial_text: 'En effet, pour celles et ceux parmi nous qui participent annuellement aux Conférences des Parties (CdP), le Pavillon de la Francophonie nous sert toujours de « bouée de sauvetage », lorsqu\'en plein dans les négociations, les textes en anglais deviennent un peu confus.',
        user: {
          first_name: 'Antoine',
          last_name: 'Faye',
          organization: {
            name: 'Consultant indépendant'
          }
        },
        featured: true
      },
      {
        id: 'mock-written-2',
        type: 'written',
        photo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800',
        testimonial_text: 'Les formations ePavillon nous ont permis de renforcer nos capacités en négociation climatique.',
        user: {
          first_name: 'Fatou',
          last_name: 'Ndiaye',
          organization: {
            name: 'Ministère de l\'Environnement du Sénégal'
          }
        },
        featured: false
      }
    ]

    // Charger tous les témoignages
    const loadTestimonials = async () => {
      // Charger les vidéos featured uniquement
      const videos = await fetchFeaturedVideoTestimonials()
      console.log('Featured videos loaded:', videos)

      // Charger les témoignages écrits featured uniquement
      const written = await fetchWrittenTestimonials(true) // true pour featured uniquement
      console.log('Featured written testimonials loaded:', written)

      // Utiliser les données de la DB en priorité, sinon utiliser les données mockées
      // TÉMOIGNAGES VIDÉOS TEMPORAIREMENT DÉSACTIVÉS
      videoTestimonials.value = []

      // Témoignages écrits : utiliser les données de la DB, sinon les données mockées
      if (written.length === 0) {
        console.log('No featured written testimonials in DB, using mock written data')
        // Filtrer seulement les témoignages écrits mockés featured
        writtenTestimonials.value = mockWrittenTestimonials.filter(w => w.featured)
      } else {
        writtenTestimonials.value = written.slice(0, 10).map(w => ({ ...w, type: 'written' }))
      }

      // Si aucune donnée de la DB et pas en mode DEV, utiliser les mockées comme fallback
      if (writtenTestimonials.value.length === 0) {
        console.log('Using fallback mock data for testimonials')
        writtenTestimonials.value = mockWrittenTestimonials.filter(w => w.featured)
      }

      // Combiner tous les témoignages
      allTestimonials.value = [...videoTestimonials.value, ...writtenTestimonials.value]
      console.log('All testimonials combined:', allTestimonials.value)

      // Sélectionner le premier témoignage par défaut
      if (allTestimonials.value.length > 0) {
        currentTestimonial.value = allTestimonials.value[0]
        console.log('Current testimonial set to:', currentTestimonial.value)
        startAutoPlay()
      }
    }

    // Basculer entre les témoignages
    const toggleTestimonial = (testimonial) => {
      // Toujours changer vers le témoignage cliqué
      currentTestimonial.value = testimonial
      currentTestimonialIndex.value = allTestimonials.value.findIndex(t => t.id === testimonial.id)

      // Redémarrer le timer approprié
      restartAutoPlay()
    }

    // Gestion de l'erreur de chargement vidéo
    const handleVideoError = () => {
      // Passer au témoignage suivant en cas d'erreur
      nextTestimonial()
    }

    // Passer au témoignage suivant
    const nextTestimonial = () => {
      if (allTestimonials.value.length > 0) {
        currentTestimonialIndex.value = (currentTestimonialIndex.value + 1) % allTestimonials.value.length
        currentTestimonial.value = allTestimonials.value[currentTestimonialIndex.value]
        restartAutoPlay()
      }
    }


    // Démarrer la lecture automatique
    const startAutoPlay = () => {
      if (autoPlayInterval) clearInterval(autoPlayInterval)
      if (photoDisplayTimeout) clearTimeout(photoDisplayTimeout)

      // Durée différente selon le type de témoignage
      const duration = currentTestimonial.value?.type === 'written' ? 7000 : 15000

      if (currentTestimonial.value?.type === 'written') {
        // Pour les témoignages écrits, utiliser un timeout
        photoDisplayTimeout = setTimeout(() => {
          nextTestimonial()
        }, duration)
      } else {
        // Pour les vidéos, utiliser un interval
        autoPlayInterval = setInterval(() => {
          nextTestimonial()
        }, duration)
      }
    }

    // Arrêter la lecture automatique
    const stopAutoPlay = () => {
      if (autoPlayInterval) {
        clearInterval(autoPlayInterval)
        autoPlayInterval = null
      }
      if (photoDisplayTimeout) {
        clearTimeout(photoDisplayTimeout)
        photoDisplayTimeout = null
      }
    }

    // Redémarrer la lecture automatique
    const restartAutoPlay = () => {
      stopAutoPlay()
      startAutoPlay()
    }

    onMounted(() => {
      loadTestimonials()
    })

    onUnmounted(() => {
      stopAutoPlay()
    })

    return {
      t,
      allTestimonials,
      currentTestimonial,
      toggleTestimonial,
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

@keyframes slide-in-left {
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
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

/* Animation pour la transition Vue */
.fade-slide-enter-active {
  transition: all 0.8s ease-out;
}

.fade-slide-leave-active {
  transition: all 0.5s ease-in;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
