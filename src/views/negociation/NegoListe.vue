<template>
    <div class="h-screen w-screen relative overflow-hidden bg-fixed"
    style="background-image: url('public/images/nego-bg/biodiversite.jpeg');"
    >
        <!-- Overlay pour l'image de fond principale -->
        <div class="absolute inset-0 backdrop-blur"></div>
        <div class="h-full w-full relative">
            <!-- Triangle Climat - Haut Gauche (z-30 pour être au-dessus) -->
            <router-link
                :to="{ name: 'negotiations', params: { category: 'climat' } }"
                class="absolute inset-0 bg-cover bg-center flex items-center justify-center bg-fixed cursor-pointer group z-30"
                style="background-image: url('/images/nego-bg/climat.jpg'); clip-path: polygon(0 0, 70% 0, 0 70%);">
                <!-- Overlay pour l'image climat -->
                <div class="absolute inset-0 backdrop-blur-sm transition-all duration-300" style="clip-path: polygon(0 0, 70% 0, 0 70%);"></div>
                <div class="absolute top-[10%] left-[10%] pointer-events-none">
                    <div class="bg-blue-900/60 backdrop-blur-sm rounded-lg px-6 py-4 border border-blue-300/20 group-hover:bg-blue-800/70 group-hover:border-blue-200/30 group-hover:shadow-2xl group-hover:shadow-blue-500/20 transition-all duration-300 transform group-hover:scale-110">
                        <h2 class="text-6xl font-bold text-white drop-shadow-lg group-hover:text-blue-100 transition-colors duration-300">Climat</h2>
                    </div>
                </div>
            </router-link>

            <!-- Biodiversité au centre (z-10 pour être en dessous) -->
            <router-link
                :to="{ name: 'negotiations', params: { category: 'biodiversite' } }"
                class="absolute w-full h-full flex justify-center items-center transition-transform duration-300 ease-in-out hover:scale-105 cursor-pointer group z-10">
                <div class="bg-green-800/60 backdrop-blur-sm rounded-lg px-6 py-4 border border-green-300/20 group-hover:bg-green-700/70 group-hover:border-green-200/30 group-hover:shadow-2xl group-hover:shadow-green-500/20 transition-all duration-300 transform group-hover:scale-110">
                    <h2 class="text-6xl font-bold text-white drop-shadow-lg group-hover:text-green-100 transition-colors duration-300">Biodiversité</h2>
                </div>
            </router-link>

            <!-- Triangle Désertification - Bas Droite (z-20 pour être au milieu) -->
            <router-link
                :to="{ name: 'negotiations', params: { category: 'desertification' } }"
                class="absolute inset-0 bg-cover bg-center flex items-center justify-center bg-fixed transition-transform duration-300 ease-in-out cursor-pointer group z-20"
                style="background-image: url('/images/nego-bg/desertification.jpeg'); clip-path: polygon(30% 100%, 100% 30%, 100% 100%);">
                <!-- Overlay pour l'image désertification -->
                <div class="absolute inset-0 backdrop-blur-sm transition-all duration-300" style="clip-path: polygon(30% 100%, 100% 30%, 100% 100%);"></div>
                <div class="absolute bottom-[15%] right-[10%] pointer-events-none">
                    <div class="bg-orange-900/60 backdrop-blur-sm rounded-lg px-6 py-4 border border-orange-300/20 group-hover:bg-orange-800/70 group-hover:border-orange-200/30 group-hover:shadow-2xl group-hover:shadow-orange-500/20 transition-all duration-300 transform group-hover:scale-110">
                        <h2 class="text-6xl font-bold text-white drop-shadow-lg group-hover:text-orange-100 transition-colors duration-300">Désertification</h2>
                    </div>
                </div>
            </router-link>
        </div>
    </div>
</template>
