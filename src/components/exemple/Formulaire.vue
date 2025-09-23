<template>
  <div
    class="min-h-screen bg-fixed w-screen bg-font-apporter-expertise bg-cover bg-center flex items-center justify-center p-4"
  >

    <div
      class="relative w-full max-w-2xl bg-white/50 shadow-2xl backdrop-blur-md mt-24 rounded-2xl border border-white border-opacity-20 transform transition-all duration-300 hover:shadow-3xl overflow-hidden"
      data-aos="fade-up"
      data-aos-duration="800"
    >
      <!-- En-tête moderne avec gradient -->
      <div
        class="bg-gradient-to-r from-custom-green to-emerald-700 bg-opacity-90 text-white p-6"
      >
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-2xl font-bold">Devenir Expert</h2>
            <p class="text-green-100 text-sm mt-1">
              Partagez votre expertise avec la communauté UAfricas
            </p>
          </div>
          <RouterLink to="/">
            <img
              class="h-12 rounded-lg bg-white p-1 hover:scale-105 transition-transform shadow-lg"
              src="/logos/logo_uafracas.png"
              alt="UAfricas Logo"
            />
          </RouterLink>
        </div>

        <!-- Barre de progression -->
        <div class="mt-4">
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm text-green-100">Progression du formulaire</span>
            <span class="text-sm font-semibold">{{ progress }}% complété</span>
          </div>
          <div class="w-full bg-green-800 bg-opacity-30 rounded-full h-2">
            <div
              :style="`width: ${progress}%`"
              class="bg-white h-2 rounded-full transition-all duration-500 ease-out shadow-sm"
            ></div>
          </div>
        </div>
      </div>

      <!-- Messages de succès/erreur modernisés -->
      <transition name="fade-slide">
        <div
          v-if="state.formSubmitted"
          class="m-6 mb-0 bg-green-50 bg-opacity-90 backdrop-blur-sm border-l-4 border-green-500 p-4 rounded-lg shadow-sm"
        >
          <div class="flex items-center">
            <svg
              class="w-6 h-6 text-green-500 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <p class="text-green-700 font-medium">
              Félicitations ! Votre expertise a été enregistrée avec succès.
            </p>
          </div>
        </div>
      </transition>

      <transition name="fade-slide">
        <div
          v-if="state.error"
          class="m-6 mb-0 bg-red-50 bg-opacity-90 backdrop-blur-sm border-l-4 border-red-500 p-4 rounded-lg shadow-sm"
        >
          <div class="flex items-center">
            <svg
              class="w-6 h-6 text-red-500 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <p class="text-red-700">{{ state.errorMessage }}</p>
          </div>
        </div>
      </transition>

      <!-- Formulaire modernisé avec fond semi-transparent -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-6 bg-white bg-opacity-50 backdrop-blur-sm">
        <!-- Section expertise -->
        <div class="space-y-4 bg-white bg-opacity-70 p-4 rounded-xl backdrop-blur-sm">
          <h3
            class="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 flex items-center"
          >
            <span class="text-2xl mr-2">🎯</span>
            Votre expertise
          </h3>

          <div class="group">
            <label
              for="domaine"
              class="block text-sm font-medium text-gray-700 mb-2 transition-colors group-focus-within:text-custom-green"
            >
              Domaine d'expertise *
            </label>
            <div class="relative">
              <select
                id="domaine"
                required
                v-model="state.domaine"
                class="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-custom-green focus:border-transparent transition-all duration-200 bg-white bg-opacity-90 shadow-sm hover:shadow-md appearance-none cursor-pointer backdrop-blur-sm"
                :class="{ 'border-red-500 focus:ring-red-500': state.formErrors.domaine }"
              >
                <option value="">Sélectionnez votre domaine d'expertise</option>
                <option
                  v-for="(expertise, index) in state.listeExpertise"
                  :key="index"
                  :value="expertise.nom"
                >
                  {{ expertise.nom }}
                </option>
              </select>
              <div class="absolute inset-y-0 left-0 flex items-center pl-3">
                <svg
                  class="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  ></path>
                </svg>
              </div>
              <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                  class="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </div>
            </div>
            <transition name="error-slide">
              <p
                v-if="state.formErrors.domaine"
                class="mt-1 text-sm text-red-600 flex items-center"
              >
                <svg
                  class="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                {{ state.formErrors.domaine }}
              </p>
            </transition>
          </div>

          <div class="group">
            <label
              for="experience"
              class="block text-sm font-medium text-gray-700 mb-2 transition-colors group-focus-within:text-custom-green"
            >
              Années d'expérience *
            </label>
            <div class="relative">
              <input
                id="experience"
                required
                v-model="state.nb_annee_experience"
                type="number"
                min="0"
                max="99"
                class="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-custom-green focus:border-transparent transition-all duration-200 bg-white bg-opacity-90 shadow-sm hover:shadow-md backdrop-blur-sm"
                :class="{
                  'border-red-500 focus:ring-red-500': state.formErrors.nb_annee_experience,
                }"
                placeholder="Nombre d'années"
              />
              <div class="absolute inset-y-0 left-0 flex items-center pl-3">
                <svg
                  class="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </div>
            </div>
            <transition name="error-slide">
              <p
                v-if="state.formErrors.nb_annee_experience"
                class="mt-1 text-sm text-red-600 flex items-center"
              >
                <svg
                  class="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                {{ state.formErrors.nb_annee_experience }}
              </p>
            </transition>
          </div>
        </div>

        <!-- Section professionnelle -->
        <div class="space-y-4 bg-white bg-opacity-70 p-4 rounded-xl backdrop-blur-sm">
          <h3
            class="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 flex items-center"
          >
            <span class="text-2xl mr-2">💼</span>
            Informations professionnelles
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="group">
              <label
                for="organisation"
                class="block text-sm font-medium text-gray-700 mb-2 transition-colors group-focus-within:text-custom-green"
              >
                Organisation *
              </label>
              <div class="relative">
                <input
                  id="organisation"
                  required
                  v-model="state.organisation"
                  type="text"
                  class="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-custom-green focus:border-transparent transition-all duration-200 bg-white bg-opacity-90 shadow-sm hover:shadow-md backdrop-blur-sm"
                  :class="{ 'border-red-500 focus:ring-red-500': state.formErrors.organisation }"
                  placeholder="Nom de votre organisation"
                />
                <div class="absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg
                    class="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    ></path>
                  </svg>
                </div>
              </div>
              <transition name="error-slide">
                <p
                  v-if="state.formErrors.organisation"
                  class="mt-1 text-sm text-red-600 flex items-center"
                >
                  <svg
                    class="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                  {{ state.formErrors.organisation }}
                </p>
              </transition>
            </div>

            <div class="group">
              <label
                for="fonction"
                class="block text-sm font-medium text-gray-700 mb-2 transition-colors group-focus-within:text-custom-green"
              >
                Fonction *
              </label>
              <div class="relative">
                <input
                  id="fonction"
                  required
                  v-model="state.fonction"
                  type="text"
                  class="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-custom-green focus:border-transparent transition-all duration-200 bg-white bg-opacity-90 shadow-sm hover:shadow-md backdrop-blur-sm"
                  :class="{ 'border-red-500 focus:ring-red-500': state.formErrors.fonction }"
                  placeholder="Votre titre professionnel"
                />
                <div class="absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg
                    class="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    ></path>
                  </svg>
                </div>
              </div>
              <transition name="error-slide">
                <p
                  v-if="state.formErrors.fonction"
                  class="mt-1 text-sm text-red-600 flex items-center"
                >
                  <svg
                    class="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                  {{ state.formErrors.fonction }}
                </p>
              </transition>
            </div>
          </div>
        </div>

        <!-- Section contact -->
        <div class="space-y-4 bg-white bg-opacity-70 p-4 rounded-xl backdrop-blur-sm">
          <h3
            class="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 flex items-center"
          >
            <span class="text-2xl mr-2">📞</span>
            Informations de contact
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="group">
              <label
                for="telephone"
                class="block text-sm font-medium text-gray-700 mb-2 transition-colors group-focus-within:text-custom-green"
              >
                Téléphone *
              </label>
              <div class="relative">
                <input
                  id="telephone"
                  required
                  v-model="state.tel"
                  type="tel"
                  class="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-custom-green focus:border-transparent transition-all duration-200 bg-white bg-opacity-90 shadow-sm hover:shadow-md backdrop-blur-sm"
                  :class="{ 'border-red-500 focus:ring-red-500': state.formErrors.tel }"
                  placeholder="+33 6 12 34 56 78"
                />
                <div class="absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg
                    class="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    ></path>
                  </svg>
                </div>
              </div>
              <transition name="error-slide">
                <p v-if="state.formErrors.tel" class="mt-1 text-sm text-red-600 flex items-center">
                  <svg
                    class="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                  {{ state.formErrors.tel }}
                </p>
              </transition>
            </div>

            <div class="group">
              <label
                for="portfolio"
                class="block text-sm font-medium text-gray-700 mb-2 transition-colors group-focus-within:text-custom-green"
              >
                Portfolio/LinkedIn *
              </label>
              <div class="relative">
                <input
                  id="portfolio"
                  required
                  v-model="state.portfolio"
                  type="url"
                  class="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-custom-green focus:border-transparent transition-all duration-200 bg-white bg-opacity-90 shadow-sm hover:shadow-md backdrop-blur-sm"
                  :class="{ 'border-red-500 focus:ring-red-500': state.formErrors.portfolio }"
                  placeholder="https://linkedin.com/in/..."
                />
                <div class="absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg
                    class="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    ></path>
                  </svg>
                </div>
              </div>
              <transition name="error-slide">
                <p
                  v-if="state.formErrors.portfolio"
                  class="mt-1 text-sm text-red-600 flex items-center"
                >
                  <svg
                    class="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                  {{ state.formErrors.portfolio }}
                </p>
              </transition>
            </div>
          </div>
        </div>

        <!-- Section biographie -->
        <div class="space-y-4 bg-white bg-opacity-70 p-4 rounded-xl backdrop-blur-sm">
          <h3
            class="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 flex items-center"
          >
            <span class="text-2xl mr-2">✍️</span>
            À propos de vous
          </h3>

          <div class="group">
            <label
              for="biographie"
              class="block text-sm font-medium text-gray-700 mb-2 transition-colors group-focus-within:text-custom-green"
            >
              Biographie *
            </label>
            <div class="relative">
              <textarea
                id="biographie"
                required
                v-model="state.biographie"
                rows="5"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-custom-green focus:border-transparent transition-all duration-200 bg-white bg-opacity-90 shadow-sm hover:shadow-md resize-none backdrop-blur-sm"
                :class="{ 'border-red-500 focus:ring-red-500': state.formErrors.biographie }"
                placeholder="Parlez-nous de votre parcours, vos réalisations et ce qui vous passionne dans votre domaine..."
              ></textarea>
              <div class="absolute bottom-3 right-3">
                <span class="text-xs text-gray-400">
                  {{ state.biographie?.length || 0 }} / 500 caractères
                </span>
              </div>
            </div>
            <transition name="error-slide">
              <p
                v-if="state.formErrors.biographie"
                class="mt-1 text-sm text-red-600 flex items-center"
              >
                <svg
                  class="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                {{ state.formErrors.biographie }}
              </p>
            </transition>
          </div>
        </div>

        <!-- Boutons d'action modernisés -->
        <div class="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
          <RouterLink
            to="/"
            class="flex-1 px-6 py-3 bg-gray-100 bg-opacity-90 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium flex items-center justify-center space-x-2 hover:shadow-md backdrop-blur-sm"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
            <span>Annuler</span>
          </RouterLink>
          <button
            type="submit"
            :disabled="state.isSubmitting"
            class="flex-1 px-6 py-3 bg-gradient-to-r from-custom-green to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-custom-green transition-all duration-200 font-medium flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transform hover:scale-[1.02]"
          >
            <svg
              v-if="state.isSubmitting"
              class="w-5 h-5 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <svg
              v-else
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span v-if="state.isSubmitting">Envoi en cours...</span>
            <span v-else>Devenir Expert</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import AOS from "aos";
import {
  serverTimestamp,
  updateDoc,
  getDoc,
  doc,
  getDocs,
  collection,
} from "firebase/firestore";
import { onMounted, reactive, inject, computed } from "vue";
import { useRouter } from "vue-router";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default {
  setup() {
    const db = inject("db");
    const emitter = inject("emitter");
    const router = useRouter();
    const auth = getAuth();

    const state = reactive({
      listeExpertise: [],
      formSubmitted: false,
      isSubmitting: false,
      error: false,
      errorMessage: "",
      domaine: "",
      organisation: "",
      fonction: "",
      tel: "",
      nb_annee_experience: "",
      portfolio: "",
      biographie: "",
      formErrors: {},
    });

    // Calcul de la progression du formulaire
    const progress = computed(() => {
      const fields = [
        state.domaine,
        state.organisation,
        state.fonction,
        state.tel,
        state.nb_annee_experience,
        state.portfolio,
        state.biographie,
      ];
      const filledFields = fields.filter(field => field && field.toString().trim() !== "").length;
      return Math.round((filledFields / fields.length) * 100);
    });

    // Validate form inputs
    const validateForm = () => {
      const errors = {};

      // Reset errors
      state.formErrors = {};

      if (!state.domaine) {
        errors.domaine = "Veuillez sélectionner un domaine d'expertise";
      }

      if (!state.organisation || state.organisation.trim() === "") {
        errors.organisation = "Veuillez indiquer votre organisation";
      }

      if (!state.fonction || state.fonction.trim() === "") {
        errors.fonction = "Veuillez indiquer votre fonction";
      }

      if (!state.nb_annee_experience) {
        errors.nb_annee_experience =
          "Veuillez indiquer votre nombre d'années d'expérience";
      } else if (
        isNaN(Number(state.nb_annee_experience)) ||
        Number(state.nb_annee_experience) < 0
      ) {
        errors.nb_annee_experience = "Veuillez entrer un nombre valide";
      }

      if (!state.tel || state.tel.trim() === "") {
        errors.tel = "Veuillez indiquer votre numéro de téléphone";
      }

      if (!state.portfolio || state.portfolio.trim() === "") {
        errors.portfolio = "Veuillez indiquer votre lien LinkedIn ou Portfolio";
      } else if (!isValidURL(state.portfolio)) {
        errors.portfolio = "Veuillez entrer une URL valide";
      }

      if (!state.biographie || state.biographie.trim() === "") {
        errors.biographie = "Veuillez remplir votre biographie";
      } else if (state.biographie.length > 500) {
        errors.biographie = "La biographie ne doit pas dépasser 500 caractères";
      }

      state.formErrors = errors;
      return Object.keys(errors).length === 0;
    };

    // Validate URL format
    const isValidURL = (url) => {
      try {
        new URL(url);
        return true;
      } catch (e) {
        return false;
      }
    };

    const handleSubmit = async () => {
      if (!validateForm()) {
        return;
      }

      state.isSubmitting = true;
      state.error = false;

      try {
        if (!auth.currentUser) {
          state.error = true;
          state.errorMessage =
            "Vous devez être connecté pour soumettre ce formulaire";
          state.isSubmitting = false;
          return;
        }

        // Référence vers le document utilisateur dans la collection 'users' (modèle Firebase)
        const userRef = doc(db, "users", auth.currentUser.uid);
        const userSnapshot = await getDoc(userRef);

        if (!userSnapshot.exists()) {
          state.error = true;
          state.errorMessage = "Utilisateur non trouvé. Veuillez vous reconnecter.";
          state.isSubmitting = false;
          return;
        }

        const userData = userSnapshot.data();
        const currentRoles = userData.roles || [];

        // Ajouter le rôle 'expert' s'il n'existe pas déjà
        const updatedRoles = currentRoles.includes('expert')
          ? currentRoles
          : [...currentRoles, 'expert'];

        // Mise à jour du profil avec les informations d'expertise selon le modèle Firebase
        await updateDoc(userRef, {
          dateDerniereMiseAJour: serverTimestamp(),

          // Informations personnelles
          tel: state.tel,
          biographie: state.biographie,

          // Organisation professionnelle
          organisation: {
            nom: state.organisation,
            fonction: state.fonction,
          },

          // Attribution automatique du rôle expert
          roles: updatedRoles,

          // Informations d'expertise
          expertiseInfo: {
            domaine: state.domaine,
            nbAnneesExperience: Number(state.nb_annee_experience),
            portfolio: state.portfolio,
            biographie: state.biographie,
            dateValidation: serverTimestamp(),
            statut: 'validé', // Expert approuvé automatiquement
          },

          // Statut de disponibilité par défaut
          statusAppel: 'disponible',
        });

        state.formSubmitted = true;
        emitter.emit("expertise-submitted");

        // Redirection vers la page des experts après succès
        setTimeout(() => {
          router.push("/experts/index");
        }, 2000);
      } catch (error) {
        console.error("Erreur lors de la mise à jour du document:", error);
        state.error = true;
        state.errorMessage =
          "Une erreur est survenue. Veuillez réessayer plus tard.";
      } finally {
        state.isSubmitting = false;
      }
    };

    const fetchExpertise = async () => {
      try {
        const expertisesRef = collection(db, "Expertises");
        const querySnapshot = await getDocs(expertisesRef);

        state.listeExpertise = [];
        querySnapshot.forEach((doc) => {
          state.listeExpertise.push(doc.data());
        });

        // Sort expertise list alphabetically
        state.listeExpertise.sort((a, b) => a.nom.localeCompare(b.nom));
      } catch (error) {
        console.error("Erreur lors de la récupération des expertises:", error);
        state.error = true;
        state.errorMessage = "Impossible de charger les domaines d'expertise";
      }
    };

    const checkUserAuthentication = () => {
      onAuthStateChanged(auth, (user) => {
        if (!user) {
          router.push("/login?redirect=expertise");
        }
      });
    };

    onMounted(() => {
      AOS.init();
      fetchExpertise();
      checkUserAuthentication();
    });

    return {
      state,
      handleSubmit,
      progress,
    };
  },
};
</script>

<style scoped>
/* Animations modernes */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.error-slide-enter-active,
.error-slide-leave-active {
  transition: all 0.3s ease;
}

.error-slide-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.error-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Effet de focus amélioré */
.group:focus-within label {
  color: #2c7a51;
}

/* Hover effects */
.hover\:shadow-3xl:hover {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

/* Style personnalisé pour le select */
select {
  background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2714%27%20height%3D%278%27%20viewBox%3D%270%200%2014%208%27%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%3E%3Cpath%20d%3D%27M1%201l6%206%206-6%27%20stroke%3D%27%236B7280%27%20stroke-width%3D%272%27%20fill%3D%27none%27%20fill-rule%3D%27evenodd%27/%3E%3C/svg%3E');
  background-repeat: no-repeat;
  background-position: right 0.7rem center;
  background-size: 1rem;
  padding-right: 2.5rem;
}

/* Scrollbar personnalisée pour le textarea */
textarea::-webkit-scrollbar {
  width: 6px;
}

textarea::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 10px;
}

textarea::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

textarea::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Effet glassmorphisme */
.backdrop-blur-sm {
  backdrop-filter: blur(4px);
}

.backdrop-blur-md {
  backdrop-filter: blur(12px);
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .form-group {
    margin-bottom: 1rem;
  }
}
</style>
