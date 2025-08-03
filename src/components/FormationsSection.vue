<template>
  <section class="py-20 bg-white dark:bg-gray-800 transition-colors">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid lg:grid-cols-2 gap-12 items-center">
        <!-- Contenu -->
        <div>
          <h2 class="text-4xl font-bold text-ifdd-gris-dark dark:text-gray-100 mb-4 font-maverick">
            Formations disponibles
          </h2>
          <p class="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Développez vos compétences en développement durable avec nos formations certifiantes en ligne et en présentiel.
          </p>

          <!-- Liste des formations -->
          <div class="space-y-6 mb-8">
            <!-- Formation en cours -->
            <div class="bg-gradient-to-r from-ifdd-bleu/10 to-ifdd-bleu/20 dark:from-ifdd-bleu/20 dark:to-ifdd-bleu/30 rounded-xl p-6 border border-ifdd-bleu/30 dark:border-ifdd-bleu/50">
              <div class="flex items-center justify-between mb-3">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-ifdd-bleu dark:bg-ifdd-bleu-light text-white">
                  EN COURS
                </span>
                <span class="text-sm text-gray-600 dark:text-gray-400">15 participants</span>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Négociations climatiques internationales
              </h3>
              <p class="text-gray-600 dark:text-gray-400 mb-4">
                Maîtrisez les enjeux et mécanismes des COP climat
              </p>
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <span class="flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    40 heures
                  </span>
                  <span class="flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Certifiante
                  </span>
                </div>
                <button class="dark:text-gray-100 text-ifdd-bleu hover:text-ifdd-bleu-dark dark:hover:text-ifdd-bleu font-medium transition-colors">
                  Voir plus →
                </button>
              </div>
            </div>

            <!-- Formations à venir -->
            <div class="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
              <div class="flex items-center justify-between mb-3">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-ifdd-vert/20 dark:bg-ifdd-vert/30 text-ifdd-vert dark:text-ifdd-vert-light">
                  PROCHAINEMENT
                </span>
                <span class="text-sm text-gray-600 dark:text-gray-400">Début: 1er Déc 2024</span>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Finance climat et adaptation
              </h3>
              <p class="text-gray-600 dark:text-gray-400 mb-4">
                Comprendre les mécanismes de financement climatique
              </p>
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <span class="flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    30 heures
                  </span>
                  <span class="flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    En ligne
                  </span>
                </div>
                <button class="dark:text-gray-100 text-ifdd-bleu hover:text-ifdd-bleu-dark dark:hover:text-ifdd-bleu font-medium transition-colors">
                  S'inscrire →
                </button>
              </div>
            </div>

            <!-- Formation passée -->
            <div class="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600 opacity-75">
              <div class="flex items-center justify-between mb-3">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300">
                  TERMINÉE
                </span>
                <span class="text-sm text-gray-600 dark:text-gray-400">Oct 2024</span>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Biodiversité et services écosystémiques
              </h3>
              <p class="text-gray-600 dark:text-gray-400 mb-4">
                Les fondamentaux de la conservation de la biodiversité
              </p>
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <span class="flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    127 diplômés
                  </span>
                </div>
                <button class="text-gray-500 dark:text-gray-400 font-medium">
                  Consulter →
                </button>
              </div>
            </div>
          </div>

          <!-- Bouton voir toutes -->
          <button class="w-full sm:w-auto px-6 py-3 bg-ifdd-bleu hover:bg-ifdd-bleu-dark dark:text-gray-100 dark:hover:bg-ifdd-bleu text-ifdd-bleu font-medium font-helvetica rounded-lg transition-colors shadow-lg hover:shadow-xl">
            Voir toutes les formations
          </button>
        </div>

        <!-- Image -->
        <div>
          <img 
            src="/images/formation.jpg" 
            alt="Formations" 
            class="rounded-2xl shadow-xl w-full h-auto object-cover"
          >
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'FormationsSection'
}
</script>