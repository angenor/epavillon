import { ref, computed } from 'vue'
import { useSupabase } from '@/composables/useSupabase'

const STORAGE_KEY = 'adminSelectedEventId'

// État global partagé entre toutes les vues admin
const events = ref([])
const selectedEventId = ref(localStorage.getItem(STORAGE_KEY) || '')
const isLoading = ref(false)
const isLoaded = ref(false)
let loadingPromise = null

/**
 * Gestion de l'événement sélectionné dans le panel admin.
 * Le choix est partagé par toutes les pages (tableau de bord, activités, ...)
 * et persisté dans le localStorage.
 */
export function useAdminEvent() {
  const { supabase } = useSupabase()

  const selectedEvent = computed(
    () => events.value.find(e => e.id === selectedEventId.value) || null
  )

  const setSelectedEventId = (eventId) => {
    selectedEventId.value = eventId || ''
    if (selectedEventId.value) {
      localStorage.setItem(STORAGE_KEY, selectedEventId.value)
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  // Sélection par défaut : l'événement en cours (ou à venir) le plus récent
  const applyDefaultSelection = () => {
    if (selectedEventId.value) {
      // Vérifier que l'événement mémorisé existe toujours
      if (events.value.some(e => e.id === selectedEventId.value)) return
      setSelectedEventId('')
    }

    const activeEvent = events.value.find(e =>
      ['ongoing', 'upcoming'].includes(e.event_status)
    )

    if (activeEvent) {
      setSelectedEventId(activeEvent.id)
    }
  }

  const loadEvents = async () => {
    if (isLoaded.value) return events.value
    if (loadingPromise) return loadingPromise

    isLoading.value = true
    loadingPromise = (async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('id, title, acronym, year, event_status, submission_status')
          .order('year', { ascending: false })

        if (error) throw error

        events.value = data || []
        isLoaded.value = true
        applyDefaultSelection()
      } catch (error) {
        console.error('Erreur lors du chargement des événements admin:', error)
      } finally {
        isLoading.value = false
        loadingPromise = null
      }

      return events.value
    })()

    return loadingPromise
  }

  return {
    events,
    selectedEventId,
    selectedEvent,
    isLoading,
    isLoaded,
    loadEvents,
    setSelectedEventId
  }
}

export default useAdminEvent
