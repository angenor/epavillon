<template>
  <div class="relative w-full">
    <!-- Zone des chips (emails sélectionnés) -->
    <div class="flex flex-wrap gap-2 mb-2" v-if="modelValue.length > 0">
      <div
        v-for="(email, index) in modelValue"
        :key="index"
        class="flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm"
      >
        <span>{{ formatEmailDisplay(email) }}</span>
        <button
          type="button"
          @click="removeEmail(index)"
          class="hover:text-red-600 dark:hover:text-red-400 cursor-pointer"
        >
          ×
        </button>
      </div>
    </div>

    <!-- Champ de saisie -->
    <div class="relative">
      <input
        ref="inputRef"
        v-model="searchQuery"
        @input="handleInput"
        @focus="showDropdown = true"
        @blur="handleBlur"
        @keydown.enter.prevent="handleEnter"
        @keydown.escape="handleEscape"
        @keydown.down.prevent="navigateDown"
        @keydown.up.prevent="navigateUp"
        type="text"
        :placeholder="placeholder"
        class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent dark:bg-gray-700 dark:text-white"
      />

      <!-- Dropdown de suggestions -->
      <div
        v-if="showDropdown && (filteredResults.length > 0 || isSearching)"
        class="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"
      >
        <!-- Loading state -->
        <div v-if="isSearching" class="px-4 py-2 text-gray-500 dark:text-gray-400">
          Recherche en cours...
        </div>

        <!-- Résultats -->
        <div
          v-for="(result, index) in filteredResults"
          :key="result.email"
          @mousedown.prevent="selectResult(result)"
          @mouseenter="selectedIndex = index"
          :class="[
            'px-4 py-2 cursor-pointer',
            selectedIndex === index
              ? 'bg-green-100 dark:bg-green-900/30'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
          ]"
        >
          <div class="font-medium text-gray-900 dark:text-white">
            {{ result.first_name }} {{ result.last_name }}
          </div>
          <div class="text-sm text-gray-500 dark:text-gray-400">
            {{ result.email }}
          </div>
        </div>

        <!-- Message si aucun résultat -->
        <div
          v-if="!isSearching && filteredResults.length === 0 && searchQuery.length >= 3"
          class="px-4 py-2 text-gray-500 dark:text-gray-400"
        >
          Aucun utilisateur trouvé
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useUserSearch } from '@/composables/useUserSearch'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  placeholder: {
    type: String,
    default: 'Entrez un email...'
  }
})

const emit = defineEmits(['update:modelValue'])

const { searchUsersByEmail, searchResults, isSearching } = useUserSearch()

const searchQuery = ref('')
const showDropdown = ref(false)
const selectedIndex = ref(0)
const inputRef = ref(null)

// Cache pour stocker les informations des utilisateurs trouvés
const userCache = ref(new Map())

// Filtrer les résultats pour exclure les emails déjà sélectionnés
const filteredResults = computed(() => {
  return searchResults.value.filter(
    result => !props.modelValue.some(email => email === result.email)
  )
})

// Surveiller les changements de la recherche
watch(searchQuery, async (newValue) => {
  selectedIndex.value = 0

  if (newValue.length >= 3) {
    await searchUsersByEmail(newValue)
  } else {
    searchResults.value = []
  }
})

const handleInput = () => {
  showDropdown.value = true
}

const handleBlur = () => {
  // Délai pour permettre le clic sur un résultat
  setTimeout(() => {
    showDropdown.value = false
  }, 200)
}

const handleEscape = () => {
  showDropdown.value = false
  searchQuery.value = ''
}

const navigateDown = () => {
  if (selectedIndex.value < filteredResults.value.length - 1) {
    selectedIndex.value++
  }
}

const navigateUp = () => {
  if (selectedIndex.value > 0) {
    selectedIndex.value--
  }
}

const handleEnter = () => {
  if (filteredResults.value.length > 0 && selectedIndex.value >= 0) {
    selectResult(filteredResults.value[selectedIndex.value])
  } else if (searchQuery.value && isValidEmail(searchQuery.value)) {
    // Si aucun résultat mais email valide, ajouter l'email directement
    addEmail(searchQuery.value)
  }
}

const selectResult = (result) => {
  // Stocker les informations de l'utilisateur dans le cache
  userCache.value.set(result.email, {
    first_name: result.first_name,
    last_name: result.last_name,
    email: result.email
  })

  addEmail(result.email)
  searchQuery.value = ''
  showDropdown.value = false
  selectedIndex.value = 0
}

const addEmail = (email) => {
  if (!props.modelValue.includes(email) && isValidEmail(email)) {
    emit('update:modelValue', [...props.modelValue, email])
  }
}

const removeEmail = (index) => {
  const newValue = [...props.modelValue]
  newValue.splice(index, 1)
  emit('update:modelValue', newValue)
}

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const formatEmailDisplay = (email) => {
  // Vérifier si l'utilisateur existe dans le cache
  const user = userCache.value.get(email)

  if (user && user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name} (${email})`
  }

  return email
}
</script>
