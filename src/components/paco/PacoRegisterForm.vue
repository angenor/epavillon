<template>
  <div>
    <h2 class="text-xl font-bold text-white mb-1">
      {{ t('paco.register.title') }}
    </h2>
    <p class="text-sm text-white/50 mb-5">
      {{ t('paco.register.subtitle') }}
    </p>

    <form @submit.prevent="handleSubmit" class="space-y-3">
      <!-- Name fields -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label for="paco-firstname" class="block text-sm font-medium text-white/70 mb-1">
            {{ t('paco.register.firstNameLabel') }}
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
            {{ t('paco.register.lastNameLabel') }}
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
          {{ t('paco.register.emailLabel') }}
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
          {{ t('paco.register.passwordLabel') }}
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

      <!-- Country -->
      <div>
        <label for="paco-country" class="block text-sm font-medium text-white/70 mb-1">
          {{ t('paco.register.countryLabel') }}
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

      <!-- Organization -->
      <div>
        <label for="paco-organization" class="block text-sm font-medium text-white/70 mb-1">
          {{ t('paco.register.organizationLabel') }}
        </label>
        <input
          id="paco-organization"
          v-model="form.organizationName"
          type="text"
          :placeholder="t('paco.register.organizationPlaceholder')"
          class="w-full px-3 py-2 rounded-xl border border-white/15 bg-white/10 text-white placeholder-white/30 focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50 outline-none transition backdrop-blur-sm text-sm"
        />
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
  countryId: '',
  organizationName: ''
})

const submitting = ref(false)
const errorMessage = ref('')

onMounted(() => {
  fetchCountries()
})

const handleSubmit = async () => {
  submitting.value = true
  errorMessage.value = ''

  try {
    // 1. Create auth user via Supabase Auth
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: props.email,
      password: form.password,
      options: {
        data: {
          first_name: form.firstName,
          last_name: form.lastName
        },
        emailRedirectTo: `${window.location.origin}/login`
      }
    })

    if (signUpError) {
      if (signUpError.message?.includes('already registered')) {
        errorMessage.value = t('paco.register.emailUsed')
      } else {
        errorMessage.value = signUpError.message || t('paco.register.error')
      }
      return
    }

    if (!authData?.user) {
      errorMessage.value = t('paco.register.error')
      return
    }

    // 2. Wait for the trigger to create the profile in public.users
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

    // 4. Emit success with user data
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
