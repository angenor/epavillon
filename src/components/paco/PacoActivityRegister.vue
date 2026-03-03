<template>
  <div>
    <h2 class="text-xl font-bold text-white mb-1">
      {{ t('paco.activityRegister.title') }}
    </h2>
    <p class="text-sm text-white/50 mb-5">
      {{ t('paco.activityRegister.subtitle') }}
    </p>

    <form @submit.prevent="handleSubmit" class="space-y-3">
      <!-- Name (read-only, from profile) -->
      <div>
        <label class="block text-sm font-medium text-white/70 mb-1">
          {{ t('paco.register.firstNameLabel') }} / {{ t('paco.register.lastNameLabel') }}
        </label>
        <input
          :value="displayName"
          type="text"
          readonly
          class="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-white/50 outline-none cursor-not-allowed text-sm"
        />
      </div>

      <!-- Email (read-only) -->
      <div>
        <label class="block text-sm font-medium text-white/70 mb-1">
          {{ t('paco.register.emailLabel') }}
        </label>
        <input
          :value="user?.email"
          type="email"
          readonly
          class="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-white/50 outline-none cursor-not-allowed text-sm"
        />
      </div>

      <!-- Country (editable, pre-filled from profile) -->
      <div>
        <label for="paco-activity-country" class="block text-sm font-medium text-white/70 mb-1">
          {{ t('paco.activityRegister.countryLabel') }}
        </label>
        <select
          id="paco-activity-country"
          v-model="form.countryId"
          class="w-full px-3 py-2 rounded-xl border border-white/15 bg-white/10 text-white focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50 outline-none transition cursor-pointer text-sm"
        >
          <option value="" disabled class="bg-gray-800 text-white">{{ t('paco.activityRegister.countryPlaceholder') }}</option>
          <option v-for="country in countries" :key="country.id" :value="country.id" class="bg-gray-800 text-white">
            {{ locale === 'fr' ? country.name_fr : country.name_en }}
          </option>
        </select>
      </div>

      <!-- Organization (editable, pre-filled from profile) -->
      <div>
        <label for="paco-activity-org" class="block text-sm font-medium text-white/70 mb-1">
          {{ t('paco.activityRegister.organizationLabel') }}
        </label>
        <input
          id="paco-activity-org"
          v-model="form.organizationName"
          type="text"
          :placeholder="t('paco.activityRegister.organizationPlaceholder')"
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
        {{ submitting ? t('paco.activityRegister.submitting') : t('paco.activityRegister.submit') }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { supabase } from '@/composables/useSupabase'
import { useCountries } from '@/composables/useCountries'
import { usePacoRegistration } from '@/composables/paco/usePacoRegistration'
import { usePacoEmail } from '@/composables/paco/usePacoEmail'

const { t, locale } = useI18n()

const props = defineProps({
  user: { type: Object, required: true },
  profile: { type: Object, default: null }
})

const emit = defineEmits(['registration-complete'])

const { countries, fetchCountries } = useCountries()
const { registerForPaco } = usePacoRegistration()
const { sendPacoEmail } = usePacoEmail()

const form = reactive({
  countryId: '',
  organizationName: ''
})

const submitting = ref(false)
const errorMessage = ref('')

const displayName = computed(() => {
  if (!props.profile) return props.user?.email || ''
  return `${props.profile.first_name || ''} ${props.profile.last_name || ''}`.trim() || props.user?.email || ''
})

onMounted(async () => {
  await fetchCountries()
  prefillFromProfile()
})

function prefillFromProfile() {
  if (!props.profile) return
  if (props.profile.country_id) form.countryId = props.profile.country_id
  if (props.profile.organization_name) {
    form.organizationName = props.profile.organization_name
  }
}

const handleSubmit = async () => {
  submitting.value = true
  errorMessage.value = ''

  try {
    // 1. Register for PACO activity
    const registered = await registerForPaco(props.user.id)
    if (!registered) {
      errorMessage.value = t('paco.errors.registration')
      return
    }

    // 2. Update profile with country/organization if changed
    const updateData = {}
    if (form.countryId && form.countryId !== props.profile?.country_id) {
      updateData.country_id = form.countryId
    }
    if (form.organizationName) {
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
        .eq('id', props.user.id)
    }

    // 3. Send confirmation email (best-effort — don't block on failure)
    try {
      const email = props.user.email
      const name = displayName.value || email
      await sendPacoEmail(email, name)
    } catch (emailErr) {
      console.warn('Email sending failed (non-blocking):', emailErr)
    }

    // 4. Emit success
    emit('registration-complete')
  } catch (err) {
    console.error('Activity registration error:', err)
    errorMessage.value = t('paco.errors.registration')
  } finally {
    submitting.value = false
  }
}
</script>
