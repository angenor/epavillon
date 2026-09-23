import { ref } from 'vue'
import { useSupabase } from '@/composables/useSupabase'

/**
 * Sélections alignées sur tools/export-programme/supabase_client.py :
 * le JSON téléchargé est consommé tel quel par le script Python local
 * (`npm run export:programme -- --json <fichier>`).
 */
const EVENT_SELECT = `
  id, title, acronym, year, city, timezone, event_status, participation_mode,
  in_person_start_date, in_person_end_date, online_start_datetime, online_end_datetime,
  country:countries(name_fr)
`

const ACTIVITY_SELECT = `
  id, title, validation_status,
  proposed_start_date, proposed_end_date, final_start_date, final_end_date,
  organization:organizations(name, acronym, country:countries(name_fr)),
  country:countries(name_fr)
`

// Le document sert à l'analyse des administrateurs : tout sauf les brouillons
const EXCLUDED_STATUSES = ['draft']

const sanitizeFilename = (value) =>
  (value || 'programme').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w-]+/g, '_').replace(/^_+|_+$/g, '')

const downloadJson = (payload, filename) => {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Export des activités d'un événement au format JSON, à destination de
 * l'outil local de génération du programme Word (serveur statique : la
 * création du .docx ne peut pas se faire côté hébergement).
 */
export function useProgrammeExport() {
  const { supabase } = useSupabase()
  const isExporting = ref(false)

  const fetchProgrammeData = async (eventId) => {
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select(EVENT_SELECT)
      .eq('id', eventId)
      .single()
    if (eventError) throw eventError

    const { data: activities, error: activitiesError } = await supabase
      .from('activities')
      .select(ACTIVITY_SELECT)
      .eq('event_id', eventId)
      .eq('is_deleted', false)
      .not('validation_status', 'in', `(${EXCLUDED_STATUSES.join(',')})`)
      .order('proposed_start_date', { ascending: true })
    if (activitiesError) throw activitiesError

    return { event, activities: activities || [] }
  }

  /**
   * Télécharge `programme_<acronyme>.json` et retourne le nombre d'activités exportées.
   */
  const exportProgrammeJson = async (eventId) => {
    isExporting.value = true
    try {
      const payload = await fetchProgrammeData(eventId)
      const data = {
        exported_at: new Date().toISOString(),
        excluded_statuses: EXCLUDED_STATUSES,
        ...payload
      }
      const label = payload.event.acronym || payload.event.title
      downloadJson(data, `programme_${sanitizeFilename(label)}.json`)
      return payload.activities.length
    } finally {
      isExporting.value = false
    }
  }

  return { isExporting, exportProgrammeJson }
}

export default useProgrammeExport
