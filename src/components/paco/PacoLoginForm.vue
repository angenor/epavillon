<template>
  <div>
    <h2 class="text-xl font-bold text-white mb-1">
      {{ t('paco.login.title') }}
    </h2>
    <p class="text-sm text-white/50 mb-6">
      {{ t('paco.login.subtitle') }}
    </p>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Email (pre-filled, read-only) -->
      <div>
        <label for="paco-login-email" class="block text-sm font-medium text-white/70 mb-1">
          {{ t('paco.emailCheck.emailLabel') }}
        </label>
        <input
          id="paco-login-email"
          :value="email"
          type="email"
          readonly
          class="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white/50 outline-none cursor-not-allowed"
        />
      </div>

      <!-- Password -->
      <div>
        <label for="paco-login-password" class="block text-sm font-medium text-white/70 mb-1">
          {{ t('paco.login.passwordLabel') }}
        </label>
        <input
          id="paco-login-password"
          v-model="password"
          type="password"
          :placeholder="t('paco.login.passwordPlaceholder')"
          required
          class="w-full px-4 py-2.5 rounded-xl border border-white/15 bg-white/10 text-white placeholder-white/30 focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50 outline-none transition backdrop-blur-sm"
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
        {{ submitting ? t('paco.login.submitting') : t('paco.login.submit') }}
      </button>

      <!-- Forgot password + back -->
      <div class="flex justify-between items-center">
        <router-link
          to="/forgot-password"
          class="text-sm text-green-400 hover:text-green-300 hover:underline transition"
        >
          {{ t('paco.login.forgotPassword') }}
        </router-link>
        <button
          type="button"
          @click="$emit('back')"
          class="text-sm text-green-400 hover:text-green-300 hover:underline cursor-pointer transition"
        >
          {{ t('paco.login.backToEmail') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { supabase } from '@/composables/useSupabase'

const { t } = useI18n()

const props = defineProps({
  email: { type: String, required: true }
})

const emit = defineEmits(['login-success', 'back'])

const password = ref('')
const submitting = ref(false)
const errorMessage = ref('')

const handleSubmit = async () => {
  submitting.value = true
  errorMessage.value = ''

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: props.email,
      password: password.value
    })

    if (error) {
      errorMessage.value = t('paco.login.error')
      return
    }

    emit('login-success', {
      userId: data.user.id,
      email: data.user.email
    })
  } catch (err) {
    console.error('Login error:', err)
    errorMessage.value = t('paco.login.error')
  } finally {
    submitting.value = false
  }
}
</script>
