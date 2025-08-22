<template>
  <div class="h-full flex flex-col">
    <!-- Header -->
    <div class="p-3 border-b border-gray-200 dark:border-gray-700">
      <h3 class="font-semibold text-gray-900 dark:text-white">
        {{ $t('messaging.friends') }}
      </h3>
    </div>

    <!-- Search -->
    <div class="p-3 border-b border-gray-200 dark:border-gray-700">
      <div class="relative">
        <font-awesome-icon 
          icon="search" 
          class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"
        />
        <input
          v-model="searchQuery"
          :placeholder="$t('messaging.searchFriends')"
          class="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>
    </div>

    <!-- Friends List -->
    <div class="flex-1 overflow-y-auto">
      <div v-if="loading" class="p-4 text-center text-gray-500 dark:text-gray-400">
        <font-awesome-icon icon="spinner" class="animate-spin mr-2" />
        {{ $t('common.loading') }}
      </div>

      <div 
        v-else-if="filteredFriends.length === 0" 
        class="p-4 text-center text-gray-500 dark:text-gray-400"
      >
        <font-awesome-icon icon="user-friends" class="text-2xl mb-2" />
        <p v-if="searchQuery">{{ $t('messaging.noFriendsFound') }}</p>
        <p v-else>{{ $t('messaging.noFriends') }}</p>
      </div>

      <div v-else>
        <div
          v-for="friend in filteredFriends"
          :key="friend.id"
          @click="startConversation(friend.contact)"
          class="p-3 border-b border-gray-100 dark:border-gray-600 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
        >
          <div class="flex items-center space-x-3">
            <!-- Avatar -->
            <div class="relative flex-shrink-0">
              <img
                :src="friend.contact.profile_photo_thumbnail_url || '/default-avatar.png'"
                :alt="getFullName(friend.contact)"
                class="w-10 h-10 rounded-full object-cover"
              />
              <!-- Status indicator -->
              <UserStatusIndicator 
                :user-id="friend.contact.id" 
                class="absolute -bottom-0.5 -right-0.5"
              />
            </div>

            <!-- User Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <h4 class="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {{ getFullName(friend.contact) }}
                </h4>
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  {{ formatConnectionDate(friend.connected_at) }}
                </span>
              </div>
              
              <div class="mt-1 space-y-1">
                <!-- Country -->
                <div 
                  v-if="friend.contact.countries"
                  class="flex items-center text-xs text-gray-500 dark:text-gray-400"
                >
                  <font-awesome-icon icon="map-marker-alt" class="mr-1" />
                  {{ friend.contact.countries.name_fr }}
                </div>
                
                <!-- Organization -->
                <div 
                  v-if="friend.contact.organizations"
                  class="flex items-center text-xs text-gray-500 dark:text-gray-400"
                >
                  <font-awesome-icon icon="building" class="mr-1" />
                  {{ friend.contact.organizations.name }}
                  <font-awesome-icon 
                    v-if="friend.contact.organizations.is_verified"
                    icon="check-circle" 
                    class="ml-1 text-green-500"
                  />
                </div>
                
                <!-- Biography preview -->
                <p 
                  v-if="friend.contact.biography"
                  class="text-xs text-gray-500 dark:text-gray-400 line-clamp-1"
                >
                  {{ friend.contact.biography }}
                </p>
              </div>
            </div>

            <!-- Action button -->
            <div class="flex-shrink-0">
              <button
                @click.stop="startConversation(friend.contact)"
                class="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                :title="$t('messaging.startConversation')"
              >
                <font-awesome-icon icon="comment" class="text-sm" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useConnections } from '@/composables/useConnections'
import { useMessagingStore } from '@/stores/messaging'
import { format } from 'date-fns'
import { fr, enUS } from 'date-fns/locale'
import UserStatusIndicator from './UserStatusIndicator.vue'

const { t, locale } = useI18n()
const { acceptedConnections, loading, getAcceptedConnections } = useConnections()
const messagingStore = useMessagingStore()

const searchQuery = ref('')

// Computed
const filteredFriends = computed(() => {
  if (!searchQuery.value.trim()) {
    return acceptedConnections.value
  }
  
  const query = searchQuery.value.toLowerCase()
  return acceptedConnections.value.filter(friend => {
    const fullName = getFullName(friend.contact).toLowerCase()
    const email = friend.contact.email?.toLowerCase() || ''
    const country = friend.contact.countries?.name_fr?.toLowerCase() || ''
    const organization = friend.contact.organizations?.name?.toLowerCase() || ''
    
    return fullName.includes(query) || 
           email.includes(query) || 
           country.includes(query) || 
           organization.includes(query)
  })
})

// Methods
const getFullName = (user) => {
  if (!user) return ''
  return `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email?.split('@')[0] || 'Utilisateur'
}

const formatConnectionDate = (timestamp) => {
  if (!timestamp) return ''
  
  const date = new Date(timestamp)
  return format(date, 'dd/MM/yyyy', {
    locale: locale.value === 'fr' ? fr : enUS
  })
}

const startConversation = async (user) => {
  try {
    // Créer ou récupérer la conversation avec cet utilisateur
    const result = await messagingStore.messagesService.getOrCreateConversation(user.id)
    
    if (result.success) {
      // Ouvrir la conversation directement
      await messagingStore.openConversation(user.id, user)
      
      // Émettre un événement pour indiquer qu'une conversation a été démarrée
      emit('conversationStarted', user)
    } else {
      console.error('Erreur lors de la création de la conversation:', result.error)
    }
  } catch (error) {
    console.error('Erreur lors du démarrage de la conversation:', error)
  }
}

// Events
const emit = defineEmits(['conversationStarted'])

// Lifecycle
onMounted(() => {
  getAcceptedConnections()
})
</script>