<template>
  <div class="min-h-screen relative flex items-center justify-center px-4 py-12">
    <!-- Image de fond avec repeat -->
    <div
      class="absolute inset-0 z-0 dark:opacity-20"
      :style="{
        backgroundImage: 'url(/images/people-bg/people-bg-1.jpg)',
        backgroundSize: 'auto',
        backgroundRepeat: 'repeat',
        backgroundPosition: 'top left'
      }"
    >
    </div>

    <!-- Contenu principal avec z-index élevé -->
    <div class="relative z-10 w-full max-w-2xl space-y-8">
      <!-- Logo -->
      <div class="text-center">
        <img class="mx-auto h-24 w-auto" src="/logo-ifdd.png" :alt="t('common.logoAlt')">
        <h1 class="mt-6 text-3xl font-bold tracking-tight text-black dark:text-white">
          {{ t('auth.register.title') }}
        </h1>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {{ t('auth.register.subtitle') }}
          <router-link to="/login" class="font-medium text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300">
            {{ t('auth.register.haveAccount') }}
          </router-link>
        </p>
      </div>

      <!-- Formulaire -->
      <form @submit.prevent="handleRegister" class="mt-8 space-y-6 bg-white text-black dark:text-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
        <!-- Informations personnelles -->
        <div>
          <h2 class="text-lg font-medium mb-4">{{ t('auth.register.personalInfo') }}</h2>
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <!-- Prénom -->
            <div>
              <label for="firstName" class="block text-sm font-medium mb-2">
                {{ t('auth.fields.firstName') }} *
              </label>
              <input
                id="firstName"
                v-model="form.firstName"
                type="text"
                required
                class="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                :placeholder="t('auth.placeholders.firstName')"
              >
            </div>

            <!-- Nom -->
            <div>
              <label for="lastName" class="block text-sm font-medium mb-2">
                {{ t('auth.fields.lastName') }} *
              </label>
              <input
                id="lastName"
                v-model="form.lastName"
                type="text"
                required
                class="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                :placeholder="t('auth.placeholders.lastName')"
              >
            </div>

            <!-- Email -->
            <div>
              <label for="email" class="block text-sm font-medium mb-2">
                {{ t('auth.fields.email') }} *
              </label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                required
                class="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                :placeholder="t('auth.placeholders.email')"
              >
            </div>

            <!-- Pays -->
            <div>
              <label for="country" class="block text-sm font-medium mb-2">
                {{ t('auth.fields.country') }} *
              </label>
              <select
                id="country"
                v-model="form.countryId"
                required
                class="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">{{ t('auth.placeholders.selectCountry') }}</option>
                <option v-for="country in countries" :key="country.id" :value="country.id">
                  {{ locale === 'fr' ? country.name_fr : country.name_en }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Sécurité -->
        <div>
          <h2 class="text-lg font-medium mb-4">{{ t('auth.register.security') }}</h2>
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <!-- Mot de passe -->
            <div>
              <label for="password" class="block text-sm font-medium mb-2">
                {{ t('auth.fields.password') }} *
              </label>
              <div class="relative">
                <input
                  id="password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  class="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  :placeholder="t('auth.placeholders.password')"
                  @input="checkPasswordStrength"
                >
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <font-awesome-icon
                    :icon="showPassword ? ['far', 'eye-slash'] : ['far', 'eye']"
                    class="h-5 w-5 text-gray-400"
                  />
                </button>
              </div>
              <!-- Indicateur de force du mot de passe -->
              <div v-if="form.password" class="mt-2">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs text-gray-500">{{ t('auth.register.passwordStrength') }}</span>
                  <span class="text-xs font-medium" :class="passwordStrengthColor">
                    {{ passwordStrengthText }}
                  </span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div
                    class="h-2 rounded-full transition-all duration-300"
                    :class="passwordStrengthColor"
                    :style="{ width: `${passwordStrength}%` }"
                  ></div>
                </div>
              </div>
            </div>

            <!-- Confirmer mot de passe -->
            <div>
              <label for="confirmPassword" class="block text-sm font-medium mb-2">
                {{ t('auth.fields.confirmPassword') }} *
              </label>
              <div class="relative">
                <input
                  id="confirmPassword"
                  v-model="form.confirmPassword"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  class="appearance-none relative block w-full px-3 py-2 pr-10 border rounded-lg placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white transition-colors"
                  :class="confirmPasswordClasses"
                  :placeholder="t('auth.placeholders.confirmPassword')"
                  @input="checkPasswordMatch"
                >
                <!-- Icône de validation -->
                <div v-if="form.confirmPassword" class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <font-awesome-icon
                    v-if="passwordsMatch"
                    icon="check-circle"
                    class="h-5 w-5 text-green-500"
                  />
                  <font-awesome-icon
                    v-else
                    icon="times-circle"
                    class="h-5 w-5 text-red-500"
                  />
                </div>
              </div>
              <!-- Message d'erreur -->
              <p v-if="form.confirmPassword && !passwordsMatch" class="mt-1 text-sm text-red-600 dark:text-red-400">
                {{ t('auth.errors.passwordsDontMatch') }}
              </p>
            </div>
          </div>
        </div>

        <!-- Conditions d'utilisation -->
        <div class="flex items-start">
          <input
            id="terms"
            v-model="form.acceptTerms"
            type="checkbox"
            required
            class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mt-0.5"
          >
          <label for="terms" class="ml-2 block text-sm">
            {{ t('auth.register.acceptTerms') }}
            <a href="/terms" target="_blank" class="text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300">
              {{ t('auth.register.termsOfService') }}
            </a>
            {{ t('auth.register.and') }}
            <a href="/privacy" target="_blank" class="text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300">
              {{ t('auth.register.privacyPolicy') }}
            </a>
          </label>
        </div>

        <!-- Message d'erreur -->
        <div v-if="error" class="rounded-lg bg-red-50 dark:bg-red-900/50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <font-awesome-icon icon="circle-exclamation" class="h-5 w-5 text-red-400" />
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-800 dark:text-red-300">{{ error }}</p>
            </div>
          </div>
        </div>

        <!-- Bouton d'inscription -->
        <div>
          <button
            type="submit"
            :disabled="loading || !formIsValid"
            class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <font-awesome-icon icon="spinner" class="h-5 w-5 text-green-500 animate-spin" />
            </span>
            {{ loading ? t('auth.register.registering') : t('auth.register.submit') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useSupabase } from '@/composables/useSupabase'

const { t, locale } = useI18n()
const router = useRouter()
const { auth, from } = useSupabase()

const loading = ref(false)
const error = ref('')
const showPassword = ref(false)
const countries = ref([])
const organizationSuggestions = ref([])
const passwordStrength = ref(0)
const passwordsMatch = ref(true)

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  countryId: '',
  organizationName: '',
  organizationId: null,
  password: '',
  confirmPassword: '',
  acceptTerms: false
})

// Chargement des pays
onMounted(async () => {
  try {
    console.log('Starting to load countries...')
    const { data, error: queryError } = await from('countries')
      .select('*')
      .order('name_fr', { ascending: true })

    if (queryError) {
      console.error('Supabase query error:', queryError)
      throw queryError
    }

    console.log('Countries loaded:', data?.length || 0, 'countries')
    countries.value = data || []
  } catch (err) {
    console.error('Error loading countries:', err)
    console.error('Error details:', err.message)
  }
})

// Recherche d'organisations
const searchOrganizations = async () => {
  if (form.organizationName.length < 2) {
    organizationSuggestions.value = []
    return
  }

  try {
    const { data } = await from('organizations')
      .select('id, name')
      .ilike('name', `%${form.organizationName}%`)
      .eq('is_active', true)
      .limit(5)

    organizationSuggestions.value = data || []
  } catch (err) {
    console.error('Error searching organizations:', err)
  }
}

const selectOrganization = (org) => {
  form.organizationName = org.name
  form.organizationId = org.id
  organizationSuggestions.value = []
}

// Vérification de la force du mot de passe
const checkPasswordStrength = () => {
  const password = form.password
  let strength = 0

  if (password.length >= 8) strength += 25
  if (password.length >= 12) strength += 25
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25
  if (/[0-9]/.test(password)) strength += 12.5
  if (/[^A-Za-z0-9]/.test(password)) strength += 12.5

  passwordStrength.value = strength

  // Vérifier aussi la correspondance si confirmPassword est rempli
  if (form.confirmPassword) {
    checkPasswordMatch()
  }
}

// Vérification de la correspondance des mots de passe
const checkPasswordMatch = () => {
  passwordsMatch.value = form.password === form.confirmPassword
}

const passwordStrengthText = computed(() => {
  if (passwordStrength.value < 25) return t('auth.register.weak')
  if (passwordStrength.value < 50) return t('auth.register.fair')
  if (passwordStrength.value < 75) return t('auth.register.good')
  return t('auth.register.strong')
})

const passwordStrengthColor = computed(() => {
  if (passwordStrength.value < 25) return 'text-red-600 bg-red-600'
  if (passwordStrength.value < 50) return 'text-orange-600 bg-orange-600'
  if (passwordStrength.value < 75) return 'text-yellow-600 bg-yellow-600'
  return 'text-green-600 bg-green-600'
})

const confirmPasswordClasses = computed(() => {
  if (!form.confirmPassword) {
    return 'border-gray-300 dark:border-gray-600 focus:ring-green-500 focus:border-transparent'
  }

  if (passwordsMatch.value) {
    return 'border-green-500 dark:border-green-500 focus:ring-green-500 focus:border-green-500'
  } else {
    return 'border-red-500 dark:border-red-500 focus:ring-red-500 focus:border-red-500'
  }
})

const formIsValid = computed(() => {
  return (
    form.firstName &&
    form.lastName &&
    form.email &&
    form.countryId &&
    form.password &&
    form.password === form.confirmPassword &&
    form.acceptTerms &&
    passwordStrength.value >= 50
  )
})

const handleRegister = async () => {
  if (!formIsValid.value) return

  loading.value = true
  error.value = ''

  try {
    // 1. Créer le compte utilisateur avec Supabase Auth
    const { data: authData, error: signUpError } = await auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          first_name: form.firstName,
          last_name: form.lastName
        },
        emailRedirectTo: 'https://epavillonclimatique.francophonie.org/login'
      }
    })

    if (signUpError) throw signUpError

    // 2. Le profil utilisateur sera créé automatiquement par le trigger
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 3. Mettre à jour le profil avec les informations supplémentaires
    const { error: updateError } = await from('users')
      .update({
        country_id: form.countryId,
        phone: form.phone || null,
        organization_id: form.organizationId || null
      })
      .eq('id', authData.user.id)

    if (updateError) {
      console.warn('Profile update error:', updateError)
      // Ne pas bloquer l'inscription si la mise à jour échoue
    }

    // 4. L'email de confirmation sera envoyé automatiquement par l'Auth Hook
    console.log('Inscription réussie. Email de confirmation envoyé automatiquement à:', authData.user.email)

    // Redirection après inscription réussie - temporairement vers login
    // TODO: Revenir à '/verify-email' une fois le problème de build résolu
    alert('Inscription réussie ! Un email de confirmation a été envoyé à ' + authData.user.email)
    router.push('/login')
  } catch (err) {
    console.error('Registration error:', err)

    // Si c'est une erreur de timeout du hook, ne pas bloquer l'inscription
    if (err.message?.includes('Failed to reach hook within maximum time')) {
      console.warn('Auth Hook timeout, but registration was successful')
      // Rediriger quand même vers la page de vérification
      router.push('/verify-email')
      return
    }

    if (err.message?.includes('already registered')) {
      error.value = t('auth.errors.emailAlreadyUsed')
    } else if (err.message?.includes('after 16 seconds') || err.status === 429) {
      error.value = t('auth.errors.tooManyRequests')
    } else if (err.message?.includes('row-level security policy')) {
      error.value = t('auth.errors.registrationFailed') + ' (RLS)'
    } else {
      error.value = t('auth.errors.registrationFailed')
    }
  } finally {
    loading.value = false
  }
}
</script>
