<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
    <h1 class="text-2xl font-bold mb-4">Debug Public Profile</h1>
    
    <!-- Test avec un ID spécifique -->
    <div class="bg-white p-4 rounded shadow mb-4">
      <h2 class="text-lg font-semibold mb-2">Test avec ID</h2>
      <input 
        v-model="testId" 
        placeholder="Entrez un ID utilisateur"
        class="border p-2 rounded mr-2"
      />
      <button 
        @click="testProfile" 
        class="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Tester
      </button>
    </div>

    <!-- État de chargement -->
    <div v-if="loading" class="text-blue-600">
      Chargement...
    </div>

    <!-- Erreur -->
    <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      <strong>Erreur:</strong> {{ error }}
    </div>

    <!-- Données de profil -->
    <div v-if="profile" class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
      <h3 class="font-semibold">Profil trouvé:</h3>
      <pre class="mt-2 text-sm">{{ JSON.stringify(profile, null, 2) }}</pre>
    </div>

    <!-- Test direct de la requête Supabase -->
    <div class="bg-white p-4 rounded shadow mb-4">
      <h2 class="text-lg font-semibold mb-2">Test direct Supabase</h2>
      <button 
        @click="testDirectSupabase" 
        class="bg-green-500 text-white px-4 py-2 rounded"
      >
        Test direct
      </button>
      
      <div v-if="directResult" class="mt-4">
        <h3 class="font-semibold">Résultat direct:</h3>
        <pre class="text-sm bg-gray-100 p-2 rounded">{{ JSON.stringify(directResult, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { usePublicProfiles } from '@/composables/usePublicProfiles'
import { supabase } from '@/composables/useSupabase'

const { getPublicProfile } = usePublicProfiles()

const testId = ref('')
const profile = ref(null)
const loading = ref(false)
const error = ref(null)
const directResult = ref(null)

const testProfile = async () => {
  if (!testId.value) {
    error.value = 'Veuillez entrer un ID'
    return
  }

  loading.value = true
  error.value = null
  profile.value = null

  try {
    const result = await getPublicProfile(testId.value)
    profile.value = result
    if (!result) {
      error.value = 'Aucun profil trouvé'
    }
  } catch (err) {
    error.value = err.message
    console.error('Erreur test profile:', err)
  } finally {
    loading.value = false
  }
}

const testDirectSupabase = async () => {
  try {
    // Test simple pour voir si on peut récupérer des utilisateurs
    const { data, error: queryError } = await supabase
      .from('users')
      .select(`
        id,
        first_name,
        last_name,
        address,
        created_at
      `)
      .eq('is_blocked', false)
      .eq('is_suspended', false)
      .limit(3)

    if (queryError) {
      throw queryError
    }

    directResult.value = {
      success: true,
      count: data?.length || 0,
      users: data || []
    }
    
    // Si on a des utilisateurs, prendre le premier ID pour le test
    if (data && data.length > 0) {
      testId.value = data[0].id
    }

  } catch (err) {
    directResult.value = {
      success: false,
      error: err.message
    }
    console.error('Erreur test direct:', err)
  }
}
</script>