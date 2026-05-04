<template>
  <div>
    <h2 class="text-xl font-bold text-white mb-1">
      {{ t('paco.register.title') }}
    </h2>
    <p class="text-sm text-white/50 mb-5">
      {{ t('paco.register.subtitle') }}
    </p>

    <!-- Password warning -->
    <div class="bg-amber-500/15 border border-amber-400/30 rounded-xl p-3 mb-4">
      <p class="text-sm text-amber-300 flex items-start gap-2">
        <font-awesome-icon :icon="['fas', 'triangle-exclamation']" class="mt-0.5 shrink-0" />
        <span>{{ t('paco.register.passwordWarning') }}</span>
      </p>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-3">
      <!-- Name fields -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label for="paco-firstname" class="block text-sm font-medium text-white/70 mb-1">
            {{ t('paco.register.firstNameLabel') }} <span class="text-red-400">*</span>
          </label>
          <input
            id="paco-firstname"
            v-model="form.firstName"
            type="text"
            :placeholder="t('paco.register.firstNamePlaceholder')"
            required
            class="w-full px-3 py-2 rounded-xl border border-white/15 bg-white/10 text-white placeholder-white/30 focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50 outline-none transition backdrop-blur-sm text-sm"
          />
        </div>
        <div>
          <label for="paco-lastname" class="block text-sm font-medium text-white/70 mb-1">
            {{ t('paco.register.lastNameLabel') }} <span class="text-red-400">*</span>
          </label>
          <input
            id="paco-lastname"
            v-model="form.lastName"
            type="text"
            :placeholder="t('paco.register.lastNamePlaceholder')"
            required
            class="w-full px-3 py-2 rounded-xl border border-white/15 bg-white/10 text-white placeholder-white/30 focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50 outline-none transition backdrop-blur-sm text-sm"
          />
        </div>
      </div>

      <!-- Email (pre-filled, read-only) -->
      <div>
        <label for="paco-register-email" class="block text-sm font-medium text-white/70 mb-1">
          {{ t('paco.register.emailLabel') }} <span class="text-red-400">*</span>
        </label>
        <input
          id="paco-register-email"
          :value="email"
          type="email"
          readonly
          class="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-white/50 outline-none cursor-not-allowed text-sm"
        />
      </div>

      <!-- Password -->
      <div>
        <label for="paco-register-password" class="block text-sm font-medium text-white/70 mb-1">
          {{ t('paco.register.passwordLabel') }} <span class="text-red-400">*</span>
        </label>
        <input
          id="paco-register-password"
          v-model="form.password"
          type="password"
          :placeholder="t('paco.register.passwordPlaceholder')"
          required
          minlength="6"
          class="w-full px-3 py-2 rounded-xl border border-white/15 bg-white/10 text-white placeholder-white/30 focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50 outline-none transition backdrop-blur-sm text-sm"
        />
      </div>

      <!-- Confirm Password -->
      <div>
        <label for="paco-register-confirm-password" class="block text-sm font-medium text-white/70 mb-1">
          {{ t('paco.register.confirmPasswordLabel') }} <span class="text-red-400">*</span>
        </label>
        <input
          id="paco-register-confirm-password"
          v-model="form.confirmPassword"
          type="password"
          :placeholder="t('paco.register.confirmPasswordPlaceholder')"
          required
          minlength="6"
          class="w-full px-3 py-2 rounded-xl border border-white/15 bg-white/10 text-white placeholder-white/30 focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50 outline-none transition backdrop-blur-sm text-sm"
        />
        <p v-if="form.confirmPassword && form.password !== form.confirmPassword" class="text-xs text-red-400 mt-1">
          {{ t('paco.register.passwordMismatch') }}
        </p>
      </div>

      <!-- Gender -->
      <div>
        <label class="block text-sm font-medium text-white/70 mb-1">
          {{ t('paco.demographic.genderLabel') }} <span class="text-red-400">*</span>
        </label>
        <div class="flex gap-4">
          <label class="flex items-center gap-2 cursor-pointer text-sm text-white/80">
            <input type="radio" v-model="form.gender" value="male" required class="accent-green-500" />
            {{ t('paco.demographic.male') }}
          </label>
          <label class="flex items-center gap-2 cursor-pointer text-sm text-white/80">
            <input type="radio" v-model="form.gender" value="female" required class="accent-green-500" />
            {{ t('paco.demographic.female') }}
          </label>
        </div>
      </div>

      <!-- Age Profile -->
      <div>
        <label class="block text-sm font-medium text-white/70 mb-1">
          {{ t('paco.demographic.ageProfileLabel') }} <span class="text-red-400">*</span>
        </label>
        <div class="flex gap-4">
          <label class="flex items-center gap-2 cursor-pointer text-sm text-white/80">
            <input type="radio" v-model="form.ageProfile" value="over_35" required class="accent-green-500" />
            {{ t('paco.demographic.over35') }}
          </label>
          <label class="flex items-center gap-2 cursor-pointer text-sm text-white/80">
            <input type="radio" v-model="form.ageProfile" value="under_35" required class="accent-green-500" />
            {{ t('paco.demographic.under35') }}
          </label>
        </div>
      </div>

      <!-- City -->
      <div>
        <label for="paco-city" class="block text-sm font-medium text-white/70 mb-1">
          {{ t('paco.demographic.cityLabel') }} <span class="text-red-400">*</span>
        </label>
        <input
          id="paco-city"
          v-model="form.city"
          type="text"
          :placeholder="t('paco.demographic.cityPlaceholder')"
          required
          class="w-full px-3 py-2 rounded-xl border border-white/15 bg-white/10 text-white placeholder-white/30 focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50 outline-none transition backdrop-blur-sm text-sm"
        />
      </div>

      <!-- Country -->
      <div>
        <label for="paco-country" class="block text-sm font-medium text-white/70 mb-1">
          {{ t('paco.register.countryLabel') }} <span class="text-red-400">*</span>
        </label>
        <select
          id="paco-country"
          v-model="form.countryId"
          required
          class="w-full px-3 py-2 rounded-xl border border-white/15 bg-white/10 text-white focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50 outline-none transition cursor-pointer text-sm"
        >
          <option value="" disabled class="bg-gray-800 text-white">{{ t('paco.register.countryPlaceholder') }}</option>
          <option v-for="country in countries" :key="country.id" :value="country.id" class="bg-gray-800 text-white">
            {{ locale === 'fr' ? country.name_fr : country.name_en }}
          </option>
        </select>
      </div>

      <!-- Professional Status -->
      <div>
        <label for="paco-status" class="block text-sm font-medium text-white/70 mb-1">
          {{ t('paco.demographic.professionalStatusLabel') }} <span class="text-red-400">*</span>
        </label>
        <select
          id="paco-status"
          v-model="form.professionalStatus"
          required
          class="w-full px-3 py-2 rounded-xl border border-white/15 bg-white/10 text-white focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50 outline-none transition cursor-pointer text-sm"
        >
          <option value="" disabled class="bg-gray-800 text-white">{{ t('paco.demographic.professionalStatusPlaceholder') }}</option>
          <option value="employed" class="bg-gray-800 text-white">{{ t('paco.demographic.employed') }}</option>
          <option value="student" class="bg-gray-800 text-white">{{ t('paco.demographic.student') }}</option>
          <option value="unemployed" class="bg-gray-800 text-white">{{ t('paco.demographic.unemployed') }}</option>
          <option value="entrepreneur" class="bg-gray-800 text-white">{{ t('paco.demographic.entrepreneur') }}</option>
        </select>
      </div>

      <!-- Organization -->
      <div>
        <label for="paco-organization" class="block text-sm font-medium text-white/70 mb-1">
          {{ t('paco.register.organizationLabel') }} <span class="text-red-400">*</span>
        </label>
        <input
          id="paco-organization"
          v-model="form.organizationName"
          type="text"
          :placeholder="t('paco.register.organizationPlaceholder')"
          required
          class="w-full px-3 py-2 rounded-xl border border-white/15 bg-white/10 text-white placeholder-white/30 focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50 outline-none transition backdrop-blur-sm text-sm"
        />
      </div>

      <!-- Recording Consent -->
      <div>
        <label class="flex items-start gap-2 cursor-pointer text-sm text-white/80">
          <input
            type="checkbox"
            v-model="form.recordingConsent"
            required
            class="accent-green-500 mt-0.5 shrink-0"
          />
          <span>{{ t('paco.demographic.recordingConsent') }}</span>
        </label>
      </div>

      <!-- Error message -->
      <p v-if="errorMessage" class="text-sm text-red-300">
        {{ errorMessage }}
      </p>

      <!-- Submit -->
      <button
        type="submit"
        :disabled="submitting"
        class="w-full cursor-pointer bg-green-600 hover:bg-green-500 text-white font-semibold py-3 px-4 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ submitting ? t('paco.register.submitting') : t('paco.register.submit') }}
      </button>

      <!-- Back link -->
      <button
        type="button"
        @click="$emit('back')"
        class="w-full cursor-pointer text-sm text-green-400 hover:text-green-300 hover:underline transition"
      >
        {{ t('paco.register.backToEmail') }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { supabase } from '@/composables/useSupabase'
import { useCountries } from '@/composables/useCountries'
import { savePendingRegistration } from '@/composables/paco/usePacoRegistration'

const { t, locale } = useI18n()

const props = defineProps({
  email: { type: String, required: true }
})

const emit = defineEmits(['register-success', 'back'])

const { countries, fetchCountries } = useCountries()

const form = reactive({
  firstName: '',
  lastName: '',
  password: '',
  confirmPassword: '',
  countryId: '',
  organizationName: '',
  gender: '',
  ageProfile: '',
  city: '',
  professionalStatus: '',
  recordingConsent: false
})

const submitting = ref(false)
const errorMessage = ref('')

onMounted(() => {
  fetchCountries()
})

const handleSubmit = async () => {
  submitting.value = true
  errorMessage.value = ''

  if (form.password !== form.confirmPassword) {
    errorMessage.value = t('paco.register.passwordMismatch')
    submitting.value = false
    return
  }

  // Garde defensive : la CHECK constraint sur paco_demographic_data rejette
  // toute valeur hors liste. Verifie explicitement avant savePendingRegistration.
  if (!['male', 'female'].includes(form.gender) ||
      !['over_35', 'under_35'].includes(form.ageProfile)) {
    errorMessage.value = t('paco.errors.missingDemographic')
    submitting.value = false
    return
  }

  try {
    // 1. Create auth user via Supabase Auth
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: props.email,
      password: form.password,
      options: {
        data: {
          first_name: form.firstName,
          last_name: form.lastName,
          source: 'paco'
        },
        emailRedirectTo: `${window.location.origin}/paco`
      }
    })

    if (signUpError) {
      if (signUpError.message?.includes('already registered')) {
        errorMessage.value = t('paco.register.emailUsed')
      } else if (signUpError.message?.includes('rate limit')) {
        errorMessage.value = t('paco.register.rateLimited')
      } else {
        errorMessage.value = signUpError.message || t('paco.register.error')
      }
      return
    }

    if (!authData?.user) {
      errorMessage.value = t('paco.register.error')
      return
    }

    // 2. URGENCE: auto-login après signup (bypass vérification email)
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: props.email,
      password: form.password
    })
    if (signInError) {
      console.warn('Auto-login after signup failed:', signInError.message)
    }

    // Wait for the trigger to create the profile in public.users
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 3. Update profile with additional fields (country, organization)
    const updateData = {}
    if (form.countryId) updateData.country_id = form.countryId
    if (form.organizationName) {
      // Search for existing organization or leave as text in profile
      const { data: orgData } = await supabase
        .from('organizations')
        .select('id')
        .ilike('name', form.organizationName)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle()

      if (orgData) updateData.organization_id = orgData.id
    }

    if (Object.keys(updateData).length > 0) {
      await supabase
        .from('users')
        .update(updateData)
        .eq('id', authData.user.id)
    }

    // 4. Save pending registration data to sessionStorage (for post-email-verification finalization)
    savePendingRegistration({
      userId: authData.user.id,
      email: props.email,
      name: `${form.firstName} ${form.lastName}`.trim(),
      demographicData: {
        gender: form.gender,
        ageProfile: form.ageProfile,
        city: form.city,
        countryId: form.countryId,
        professionalStatus: form.professionalStatus,
        organization: form.organizationName,
        recordingConsent: form.recordingConsent
      }
    })

    // 5. Emit success (demographic data now in sessionStorage, not in payload)
    emit('register-success', {
      userId: authData.user.id,
      email: props.email,
      name: `${form.firstName} ${form.lastName}`.trim()
    })
  } catch (err) {
    console.error('Registration error:', err)
    errorMessage.value = t('paco.register.error')
  } finally {
    submitting.value = false
  }
}
</script>
