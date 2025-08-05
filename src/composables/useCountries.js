import { ref } from 'vue'
import { useSupabase } from '@/composables/useSupabase'

const countries = ref([])
const loading = ref(false)
const error = ref(null)
const { supabase } = useSupabase() // Initialiser une seule fois

export function useCountries() {
  const fetchCountries = async () => {
    if (countries.value.length > 0) return // Cache simple
    
    loading.value = true
    error.value = null
    
    try {
      const { data, error: fetchError } = await supabase
        .from('countries')
        .select('*')
        .order('name_fr', { ascending: true })
      
      if (fetchError) throw fetchError
      
      countries.value = data || []
    } catch (err) {
      console.error('Error fetching countries:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  return {
    countries,
    loading,
    error,
    fetchCountries
  }
}