# Intégration du formulaire d'inscription Guest

Ce document décrit les modifications à apporter au fichier `src/views/activities/Detail.vue` pour supporter l'inscription sans authentification.

## 1. Ajouter les états (dans la section script setup, après ligne 886)

```javascript
// États pour l'inscription guest
const showGuestRegistrationModal = ref(false)
const guestRegistrationForm = ref({
  email: '',
  firstName: '',
  lastName: '',
  organization: '',
  countryId: null
})
const guestFormErrors = ref({})
const countries = ref([])
```

## 2. Charger la liste des pays (dans onMounted, après loadActivity)

```javascript
onMounted(async () => {
  await loadActivity()
  // Charger les pays pour le formulaire guest
  await loadCountries()
})

// Fonction pour charger les pays
const loadCountries = async () => {
  try {
    const { data, error } = await supabase
      .from('countries')
      .select('id, name_fr, name_en')
      .order('name_fr')

    if (!error && data) {
      countries.value = data
    }
  } catch (error) {
    console.error('Error loading countries:', error)
  }
}
```

## 3. Modifier la fonction registerToActivity() (remplacer la fonction existante)

```javascript
const registerToActivity = async () => {
  if (!activity.value) return

  // Si l'utilisateur n'est pas authentifié, afficher le formulaire guest
  if (!authStore.user) {
    showGuestRegistrationModal.value = true
    return
  }

  // Si l'utilisateur est authentifié, procéder normalement
  try {
    isRegistering.value = true

    // Préparer les données pour l'inscription
    // Utiliser authStore.profile pour les données du profil utilisateur
    const registrationData = {
      activity_id: activity.value.id,
      guest_email: authStore.user.email,
      guest_first_name: authStore.profile?.first_name || '',
      guest_last_name: authStore.profile?.last_name || '',
      guest_organization: authStore.profile?.organization || '',
      guest_country_id: authStore.profile?.country_id || null
    }

    console.log('📝 Inscription à l\'activité:', registrationData)

    // Appeler la fonction edge pour l'inscription Zoom + Supabase
    const { data, error } = await supabase.functions.invoke('register-to-zoom-meeting', {
      body: registrationData
    })

    console.log('📩 Réponse de la fonction edge:', { data, error })

    // Gérer les erreurs HTTP
    if (error) {
      console.error('❌ Erreur lors de l\'inscription:', error)

      // Cas spécifique : déjà inscrit (code 409)
      if (error.message?.includes('Already registered') || error.message?.includes('409')) {
        registrationModal.value = {
          type: 'already_registered',
          title: t('activity.registration.alreadyRegistered.title'),
          message: t('activity.registration.alreadyRegistered.message'),
          zoomJoinUrl: data?.data?.zoom_join_url || ''
        }
        showRegistrationModal.value = true
        return
      }

      // Autres erreurs
      registrationModal.value = {
        type: 'error',
        title: t('activity.registration.error.title'),
        message: error.message || t('activity.registration.error.message'),
        zoomJoinUrl: ''
      }
      showRegistrationModal.value = true
      return
    }

    // Succès
    if (data?.success) {
      console.log('✅ Inscription réussie:', data.data)

      isRegistered.value = true

      registrationModal.value = {
        type: 'success',
        title: t('activity.registration.success.title'),
        message: t('activity.registration.success.message'),
        zoomJoinUrl: data.data?.zoom_join_url || ''
      }
      showRegistrationModal.value = true
    } else {
      // Réponse inattendue
      throw new Error('Réponse inattendue de la fonction edge')
    }

  } catch (error) {
    console.error('❌ Erreur inattendue lors de l\'inscription:', error)
    registrationModal.value = {
      type: 'error',
      title: t('activity.registration.error.title'),
      message: t('activity.registration.error.message'),
      zoomJoinUrl: ''
    }
    showRegistrationModal.value = true
  } finally {
    isRegistering.value = false
  }
}
```

## 4. Créer la fonction registerAsGuest() (nouvelle fonction)

```javascript
const registerAsGuest = async () => {
  // Validation
  guestFormErrors.value = {}

  if (!guestRegistrationForm.value.email) {
    guestFormErrors.value.email = t('activity.guestRegistration.errors.emailRequired')
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestRegistrationForm.value.email)) {
    guestFormErrors.value.email = t('activity.guestRegistration.errors.emailInvalid')
  }

  if (!guestRegistrationForm.value.firstName || guestRegistrationForm.value.firstName.length < 2) {
    guestFormErrors.value.firstName = t('activity.guestRegistration.errors.firstNameRequired')
  }

  if (!guestRegistrationForm.value.lastName || guestRegistrationForm.value.lastName.length < 2) {
    guestFormErrors.value.lastName = t('activity.guestRegistration.errors.lastNameRequired')
  }

  if (Object.keys(guestFormErrors.value).length > 0) {
    return
  }

  try {
    isRegistering.value = true

    // Préparer les données pour l'inscription guest
    const registrationData = {
      activity_id: activity.value.id,
      guest_email: guestRegistrationForm.value.email,
      guest_first_name: guestRegistrationForm.value.firstName,
      guest_last_name: guestRegistrationForm.value.lastName,
      guest_organization: guestRegistrationForm.value.organization || '',
      guest_country_id: guestRegistrationForm.value.countryId || null
    }

    console.log('📝 Inscription guest à l\'activité:', registrationData)

    // Appeler la fonction edge pour l'inscription Zoom + Supabase
    const { data, error } = await supabase.functions.invoke('register-to-zoom-meeting', {
      body: registrationData
    })

    console.log('📩 Réponse de la fonction edge:', { data, error })

    // Fermer le modal guest
    showGuestRegistrationModal.value = false

    // Gérer les erreurs HTTP
    if (error) {
      console.error('❌ Erreur lors de l\'inscription:', error)

      // Cas spécifique : déjà inscrit (code 409)
      if (error.message?.includes('Already registered') || error.message?.includes('409')) {
        registrationModal.value = {
          type: 'already_registered',
          title: t('activity.registration.alreadyRegistered.title'),
          message: t('activity.registration.alreadyRegistered.message'),
          zoomJoinUrl: data?.data?.zoom_join_url || ''
        }
        showRegistrationModal.value = true
        return
      }

      // Autres erreurs
      registrationModal.value = {
        type: 'error',
        title: t('activity.registration.error.title'),
        message: error.message || t('activity.registration.error.message'),
        zoomJoinUrl: ''
      }
      showRegistrationModal.value = true
      return
    }

    // Succès
    if (data?.success) {
      console.log('✅ Inscription guest réussie:', data.data)

      registrationModal.value = {
        type: 'success',
        title: t('activity.registration.success.title'),
        message: t('activity.registration.success.message'),
        zoomJoinUrl: data.data?.zoom_join_url || ''
      }
      showRegistrationModal.value = true

      // Réinitialiser le formulaire
      guestRegistrationForm.value = {
        email: '',
        firstName: '',
        lastName: '',
        organization: '',
        countryId: null
      }
    } else {
      // Réponse inattendue
      throw new Error('Réponse inattendue de la fonction edge')
    }

  } catch (error) {
    console.error('❌ Erreur inattendue lors de l\'inscription:', error)
    registrationModal.value = {
      type: 'error',
      title: t('activity.registration.error.title'),
      message: t('activity.registration.error.message'),
      zoomJoinUrl: ''
    }
    showRegistrationModal.value = true
  } finally {
    isRegistering.value = false
  }
}

const closeGuestRegistrationModal = () => {
  showGuestRegistrationModal.value = false
  guestFormErrors.value = {}
}
```

## 5. Ajouter le modal d'inscription guest dans le template (après le modal d'inscription)

```vue
<!-- Modal d'inscription Guest -->
<div v-if="showGuestRegistrationModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full mx-4 transform transition-all max-h-[90vh] overflow-y-auto">
    <div class="p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ t('activity.guestRegistration.title') }}
        </h3>
        <button
          @click="closeGuestRegistrationModal"
          class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
        >
          <font-awesome-icon :icon="['fas', 'times']" class="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      <!-- Info -->
      <div class="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div class="flex items-start gap-3">
          <font-awesome-icon :icon="['fas', 'info-circle']" class="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div class="flex-1">
            <p class="text-sm text-blue-800 dark:text-blue-200">
              {{ t('activity.guestRegistration.info') }}
            </p>
          </div>
        </div>
      </div>

      <!-- Formulaire -->
      <form @submit.prevent="registerAsGuest" class="space-y-4">
        <!-- Email -->
        <div>
          <label class="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
            {{ t('activity.guestRegistration.email') }} *
          </label>
          <input
            v-model="guestRegistrationForm.email"
            type="email"
            required
            :class="[
              'w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all',
              guestFormErrors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            ]"
            :placeholder="t('activity.guestRegistration.emailPlaceholder')"
          />
          <p v-if="guestFormErrors.email" class="mt-1 text-sm text-red-600 dark:text-red-400">
            {{ guestFormErrors.email }}
          </p>
        </div>

        <!-- Prénom -->
        <div>
          <label class="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
            {{ t('activity.guestRegistration.firstName') }} *
          </label>
          <input
            v-model="guestRegistrationForm.firstName"
            type="text"
            required
            :class="[
              'w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all',
              guestFormErrors.firstName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            ]"
            :placeholder="t('activity.guestRegistration.firstNamePlaceholder')"
          />
          <p v-if="guestFormErrors.firstName" class="mt-1 text-sm text-red-600 dark:text-red-400">
            {{ guestFormErrors.firstName }}
          </p>
        </div>

        <!-- Nom -->
        <div>
          <label class="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
            {{ t('activity.guestRegistration.lastName') }} *
          </label>
          <input
            v-model="guestRegistrationForm.lastName"
            type="text"
            required
            :class="[
              'w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all',
              guestFormErrors.lastName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            ]"
            :placeholder="t('activity.guestRegistration.lastNamePlaceholder')"
          />
          <p v-if="guestFormErrors.lastName" class="mt-1 text-sm text-red-600 dark:text-red-400">
            {{ guestFormErrors.lastName }}
          </p>
        </div>

        <!-- Organisation (optionnel) -->
        <div>
          <label class="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
            {{ t('activity.guestRegistration.organization') }}
          </label>
          <input
            v-model="guestRegistrationForm.organization"
            type="text"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            :placeholder="t('activity.guestRegistration.organizationPlaceholder')"
          />
        </div>

        <!-- Pays (optionnel) -->
        <div>
          <label class="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
            {{ t('activity.guestRegistration.country') }}
          </label>
          <select
            v-model="guestRegistrationForm.countryId"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
          >
            <option :value="null">{{ t('activity.guestRegistration.selectCountry') }}</option>
            <option v-for="country in countries" :key="country.id" :value="country.id">
              {{ t('common.locale') === 'fr' ? country.name_fr : country.name_en }}
            </option>
          </select>
        </div>

        <!-- Boutons -->
        <div class="flex gap-3 pt-4">
          <button
            type="button"
            @click="closeGuestRegistrationModal"
            class="flex-1 px-4 py-2.5 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors cursor-pointer"
            :disabled="isRegistering"
          >
            {{ t('common.cancel') }}
          </button>
          <button
            type="submit"
            class="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            :disabled="isRegistering"
          >
            <font-awesome-icon
              v-if="isRegistering"
              :icon="['fas', 'spinner']"
              class="animate-spin"
            />
            <span>{{ isRegistering ? t('activity.registering') : t('activity.guestRegistration.submit') }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</div>
```

## 6. Modifier le computed `canRegister` (remplacer l'existant)

```javascript
const canRegister = computed(() => {
  // Permettre l'inscription même sans authentification
  if (isRegistered.value) return false
  if (!activity.value) return false

  // Vérifier si l'activité n'est pas passée
  const now = new Date()
  const endDate = displayEndDate.value
  if (endDate && new Date(endDate) < now) return false

  return activity.value.validation_status === 'approved'
})
```

Cette structure permet de maintenir le code organisé et fonctionnel !
