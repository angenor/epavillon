<template>
  <div class="min-h-screen relative transition-colors duration-200">
    <!-- Logo de l'événement parent de cette activité -->
    <div class="absolute right-5 top-5 h-20 w-20 bg-amber-100 z-10 rounded-full shadow-xl"></div>
    <!-- Image de fond avec repeat -->
    <div 
      class="absolute inset-0 z-0 dark:opacity-20"
      :style="{
        backgroundImage: 'url(/images/people-bg/people-bg-2.jpg)',
        backgroundSize: 'auto',
        backgroundRepeat: 'repeat',
        backgroundPosition: 'top left'
      }"
    >
    </div>
    
    <!-- Hero Section avec effet parallaxe -->
    <div class="relative h-[50vh] min-h-[300px] overflow-hidden">
      <!-- Image de couverture de l'événement père de cette activité -->
      <div class="absolute inset-0">
        <img 
          :src="'/images/example/event_banniere_par_defaut_32_9.jpg'" 
          alt="activity.title"
          class="w-full h-full object-cover scale-105 animate-subtle-zoom"
          loading="eager"
        >
        <!-- Overlay avec gradient complexe -->
        <div class="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/80"></div>
        <div class="absolute inset-0 bg-gradient-to-r from-orange-900/20 to-transparent"></div>
      </div>
      
      <!-- Contenu Hero -->
      <div class="relative h-full flex flex-col justify-end">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <!-- Badges flottants -->
          <div class="flex flex-wrap gap-3 mb-6">
            <span class="backdrop-blur-md bg-white/10 border border-white/20 text-white px-4 py-2 rounded-full text-sm font-medium animate-fade-in-up">
              <span class="inline-block w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
              'activity status'
            </span>
            
            <span class="backdrop-blur-md bg-white/10 border border-white/20 text-white px-4 py-2 rounded-full text-sm font-medium animate-fade-in-up animation-delay-100">
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                <span>activity_format</span>
              </div>
            </span>

            <button class="backdrop-blur-md bg-orange-500/80 border border-orange-400/50 text-white px-4 py-2 rounded-full text-sm font-bold animate-fade-in-up animation-delay-300">
              S'inscrire
            </button>
          </div>

          <!-- Titre avec animation -->
          <h1 class="text-4xl text-shadow-lg/80 md:text-6xl lg:text-7xl font-bold text-white mb-4 animate-fade-in-up animation-delay-400">
            Fabrication d'engrais bio à base d'algues de mers
          </h1>

          <!-- Informations rapides -->
          <div class="flex flex-wrap items-center font-bold text-xl gap-6 text-white/90 animate-fade-in-up animation-delay-500">
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Baky<span>, Azerbaidjan</span></span>
            </div>

            <div class="flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>14 Février 2025</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex space-x-2 w-screen h-screen relative -top-10 justify-center">
      <div class="w-full max-w-3xl bg-white rounded-t-xl h-min pb-10 shadow rounded-b-xl">
        <div 
          :style="{
            // Image poster de l'activité par défaut, si non défini
              backgroundImage: 'url(/images/example/poster-default.png)',
              backgroundRepeat: 'no-repeat',
            }"
            class="h-96 rounded-xl shadow-xl"
          >

        </div>
        <div class="p-4">
          <div class="border-l-4 border-blue-700 pl-2 text-xl font-bold my-3">Détail</div>
          Lorem ipsum, dolor sit amet consectetur adipisicing elit. Animi, fuga, praesentium sunt magni fugiat nam nesciunt magnam nemo minus non repellendus? Molestiae rem accusamus autem amet soluta quasi consectetur odit.
        </div>
      </div>
      <div class="w-96 h-min bg-white/50 backdrop-blur-xl shadow-sm rounded-b-md">
        <div class="w-full h-2 bg-blue-800"></div>
          <div class="p-4">
            <h2 class="text-lg font-semibold text-center mb-2">Thèmes </h2>
            <div class="flex flex-wrap justify-center space-x-1 space-y-1">
              <div class=" border border-green-700 px-2 rounded-full">santé</div>
              <div class=" border border-green-700 px-2 rounded-full">Femme/jeunesse</div>
              <div class=" border border-green-700 px-2 rounded-full">santé</div>
              <div class=" border border-green-700 px-2 rounded-full">Femme/jeunesse</div>
              <div class=" border border-green-700 px-2 rounded-full">santé</div>
              <div class=" border border-green-700 px-2 rounded-full">Femme/jeunesse</div>
            </div>

            <h2 class="text-lg font-semibold mt-2 text-center  mb-2">Categories </h2>
            <div class="flex flex-wrap space-x-1 space-y-1 justify-center">
              <div class=" border border-green-700 px-2 rounded-full">Categories 1</div>
              <div class=" border border-green-700 px-2 rounded-full">cat 2</div>
              <div class=" border border-green-700 px-2 rounded-full">Categories 3</div>
              <div class=" border border-green-700 px-2 rounded-full">Categories 1</div>
              <div class=" border border-green-700 px-2 rounded-full">cat 2</div>
              <div class=" border border-green-700 px-2 rounded-full">Categories 3</div>
            </div>

            <h2 class="text-lg font-semibold mt-4 text-center">Panéliste </h2>
            <div class="flex flex-wrap space-x-2 justify-center font-extrabold">
              
              <div class="flex flex-col justify-center mt-2 items-center">
                <div class="h-14 w-14 bg-amber-200 shadow-md rounded-full"></div>
                <div class="text-sm w-40 text-center line-clamp-2">
                  <span class=" font-bold">Nom </span>
                  <span>prénom Panéliste</span>
                </div>
                <div class="text-sm italic font-normal">Fonction Panéliste</div>
              </div>

              <div class="flex flex-col justify-center mt-2 items-center">
                <div class="h-14 w-14 bg-amber-200 shadow-md rounded-full"></div>
                <div class="text-sm w-40 text-center line-clamp-2">
                  <span class=" font-bold">Nom </span>
                  <span>prénom Panéliste</span>
                </div>
                <div class="text-sm italic font-normal">Fonction Panéliste</div>
              </div>
              
              <div class="flex flex-col justify-center mt-2 items-center">
                <div class="h-14 w-14 bg-amber-200 shadow-md rounded-full"></div>
                <div class="text-sm w-40 text-center line-clamp-2">
                  <span class=" font-bold">Nom </span>
                  <span>prénom Panéliste</span>
                </div>
                <div class="text-sm italic font-normal">Fonction Panéliste</div>
              </div>

              <div class="flex flex-col justify-center mt-2 items-center">
                <div class="h-14 w-14 bg-amber-200 shadow-md rounded-full"></div>
                <div class="text-sm w-40 text-center line-clamp-2">
                  <span class=" font-bold">Nom </span>
                  <span>prénom Panéliste</span>
                </div>
                <div class="text-sm italic font-normal">Fonction Panéliste</div>
              </div>

              <button class="mt-4 bg-green-800 text-white py-2 px-4 rounded-full shadow-md">Poser une question à un panéliste</button>
            </div>
          </div>
      </div>
    </div>

  </div>
</template>
<script>
export default {
  
  setup(){

    return {

    }
  }
};
</script>