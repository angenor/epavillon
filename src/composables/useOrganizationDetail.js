import { ref, computed } from 'vue'
import { useSupabase } from '@/composables/useSupabase'

export function useOrganizationDetail() {
  const { supabase, auth, from } = useSupabase()
  
  const organization = ref(null)
  const activities = ref([])
  const events = ref([])
  const loading = ref(false)
  const activitiesLoading = ref(false)
  const error = ref(null)

  // Filtres et tri pour les activités
  const activeTab = ref('all') // all, upcoming, live, completed
  const selectedEvent = ref('')
  const selectedTheme = ref('')
  const sortBy = ref('proposed_start_date')
  const sortOrder = ref('desc')

  // Pagination pour les activités
  const currentPage = ref(1)
  const itemsPerPage = ref(10)
  const totalActivities = ref(0)

  // Options pour les filtres
  const activityThemes = [
    { value: 'mitigation', label: 'Atténuation' },
    { value: 'adaptation', label: 'Adaptation' },
    { value: 'climate_resilience', label: 'Résilience climatique' },
    { value: 'loss_and_damage', label: 'Pertes et dommages' },
    { value: 'clean_tech_innovations', label: 'Innovations technologiques propres' },
    { value: 'renewable_energy_land', label: 'Énergies renouvelables terrestres' },
    { value: 'health_solidarity', label: 'Santé et solidarité' },
    { value: 'industry_transition', label: 'Transition industrielle' },
    { value: 'transport_urbanization', label: 'Transport et urbanisation' },
    { value: 'nature_oceans', label: 'Nature et océans' },
    { value: 'agriculture_food', label: 'Agriculture et alimentation' },
    { value: 'sustainable_livestock', label: 'Élevage durable' },
    { value: 'gender', label: 'Genre' },
    { value: 'youth', label: 'Jeunesse' },
    { value: 'technology', label: 'Technologie' },
    { value: 'finance', label: 'Finance' },
    { value: 'other', label: 'Autre' }
  ]

  const sortOptions = [
    { value: 'proposed_start_date', label: 'Date de début' },
    { value: 'title', label: 'Titre' },
    { value: 'validation_status', label: 'Statut' },
    { value: 'created_at', label: 'Date de création' }
  ]

  // Computed
  const totalPages = computed(() => Math.ceil(totalActivities.value / itemsPerPage.value))
  const hasNextPage = computed(() => currentPage.value < totalPages.value)
  const hasPrevPage = computed(() => currentPage.value > 1)

  const organizationStats = computed(() => {
    if (!organization.value) return null
    
    const totalActivitiesCount = activities.value.length
    const completedActivities = activities.value.filter(a => a.activity_status === 'completed').length
    const liveActivities = activities.value.filter(a => a.activity_status === 'live').length
    const upcomingActivities = activities.value.filter(a => 
      a.validation_status === 'approved' && 
      new Date(a.proposed_start_date) > new Date()
    ).length

    return {
      total: totalActivitiesCount,
      completed: completedActivities,
      live: liveActivities,
      upcoming: upcomingActivities
    }
  })

  // Méthodes
  async function fetchOrganizationDetail(organizationId) {
    try {
      loading.value = true
      error.value = null

      const { data, error: queryError } = await from('organizations')
        .select(`
          id,
          name,
          email,
          email_verified,
          organization_type,
          logo_url,
          website,
          description,
          is_active,
          is_verified,
          verified_by,
          verified_at,
          created_at,
          updated_at,
          countries!inner(
            id,
            name_fr,
            name_en,
            code
          ),
          organization_validations(
            id,
            validated_by,
            validated_at,
            users!organization_validations_validated_by_fkey(
              id,
              first_name,
              last_name
            )
          ),
          organization_aliases(
            id,
            alias_name,
            is_acronym
          )
        `)
        .eq('id', organizationId)
        .eq('is_active', true)
        .single()

      if (queryError) throw queryError

      organization.value = data
      
      // Récupérer les activités après avoir chargé l'organisation
      await fetchOrganizationActivities(organizationId)
      
    } catch (err) {
      console.error('Erreur lors du chargement de l\'organisation:', err)
      error.value = err.message
      organization.value = null
    } finally {
      loading.value = false
    }
  }

  async function fetchOrganizationActivities(organizationId) {
    try {
      activitiesLoading.value = true

      let query = from('activities')
        .select(`
          id,
          title,
          objectives,
          detailed_presentation,
          activity_type,
          format,
          main_themes,
          categories,
          proposed_start_date,
          proposed_end_date,
          final_start_date,
          final_end_date,
          validation_status,
          activity_status,
          cover_image_high_url,
          cover_image_low_url,
          tags,
          created_at,
          events!inner(
            id,
            title,
            year
          )
        `, { count: 'exact' })
        .eq('organization_id', organizationId)
        .eq('is_deleted', false)

      // Filtrage par onglet temporel
      if (activeTab.value === 'completed') {
        query = query.eq('activity_status', 'completed')
      } else if (activeTab.value === 'live') {
        query = query.eq('activity_status', 'live')
      } else if (activeTab.value === 'upcoming') {
        query = query
          .eq('validation_status', 'approved')
          .gte('proposed_start_date', new Date().toISOString())
      }
      // Pour 'all', pas de filtre temporel - on récupère toutes les activités

      // Filtrage par événement
      if (selectedEvent.value) {
        query = query.eq('event_id', selectedEvent.value)
      }

      // Filtrage par thème
      if (selectedTheme.value) {
        query = query.contains('main_themes', [selectedTheme.value])
      }

      // Tri
      query = query.order(sortBy.value, { ascending: sortOrder.value === 'asc' })

      // Pagination
      const startIndex = (currentPage.value - 1) * itemsPerPage.value
      query = query.range(startIndex, startIndex + itemsPerPage.value - 1)

      const { data, error: queryError, count } = await query

      if (queryError) throw queryError

      activities.value = data || []
      totalActivities.value = count || 0

    } catch (err) {
      console.error('Erreur lors du chargement des activités:', err)
      activities.value = []
    } finally {
      activitiesLoading.value = false
    }
  }

  async function fetchEvents() {
    try {
      const { data, error: queryError } = await from('events')
        .select('id, title, year, acronym')
        .order('year', { ascending: false })

      if (queryError) throw queryError
      events.value = data || []
    } catch (err) {
      console.error('Erreur lors du chargement des événements:', err)
      events.value = []
    }
  }

  async function validateOrganization(organizationId) {
    try {
      const { data: { user } } = await auth.getUser()
      if (!user) throw new Error('Utilisateur non connecté')

      const { error: insertError } = await from('organization_validations')
        .insert({
          organization_id: organizationId,
          validated_by: user.id
        })

      if (insertError) throw insertError
      
      // Recharger les données de l'organisation
      await fetchOrganizationDetail(organizationId)
      
      return true
    } catch (err) {
      console.error('Erreur lors de la validation:', err)
      throw err
    }
  }

  // Méthodes de navigation et filtrage
  function changeTab(tab) {
    activeTab.value = tab
    currentPage.value = 1
    if (organization.value) {
      fetchOrganizationActivities(organization.value.id)
    }
  }

  function applyFilters() {
    currentPage.value = 1
    if (organization.value) {
      fetchOrganizationActivities(organization.value.id)
    }
  }

  function goToPage(page) {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
      if (organization.value) {
        fetchOrganizationActivities(organization.value.id)
      }
    }
  }

  function nextPage() {
    if (hasNextPage.value) {
      currentPage.value++
      if (organization.value) {
        fetchOrganizationActivities(organization.value.id)
      }
    }
  }

  function prevPage() {
    if (hasPrevPage.value) {
      currentPage.value--
      if (organization.value) {
        fetchOrganizationActivities(organization.value.id)
      }
    }
  }

  function toggleSortOrder() {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
    applyFilters()
  }

  // Utilitaires
  function getActivityStatusLabel(activity) {
    if (activity.activity_status) {
      return activity.activity_status
    }
    return activity.validation_status
  }

  function getActivityStatusColor(activity) {
    const status = getActivityStatusLabel(activity)
    const colorMap = {
      'live': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'completed': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      'approved': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'under_review': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'draft': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      'rejected': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    }
    return colorMap[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }

  function formatDate(dateString) {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return {
    // State
    organization,
    activities,
    events,
    loading,
    activitiesLoading,
    error,
    
    // Filtres et tri
    activeTab,
    selectedEvent,
    selectedTheme,
    sortBy,
    sortOrder,
    
    // Pagination
    currentPage,
    itemsPerPage,
    totalActivities,
    totalPages,
    hasNextPage,
    hasPrevPage,
    
    // Options
    activityThemes,
    sortOptions,
    
    // Computed
    organizationStats,
    
    // Méthodes
    fetchOrganizationDetail,
    fetchOrganizationActivities,
    fetchEvents,
    validateOrganization,
    changeTab,
    applyFilters,
    goToPage,
    nextPage,
    prevPage,
    toggleSortOrder,
    getActivityStatusLabel,
    getActivityStatusColor,
    formatDate
  }
}