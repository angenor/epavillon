<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Navigation mobile -->
    <div class="lg:hidden">
      <div class="flex items-center justify-between bg-white dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h1 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ t('admin.layout.title') }}
        </h1>
        <button @click="sidebarOpen = !sidebarOpen"
                class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Overlay mobile -->
    <div v-if="sidebarOpen" @click="sidebarOpen = false"
         class="fixed inset-0 z-40 lg:hidden">
      <div class="absolute inset-0 bg-black opacity-50"></div>
    </div>

    <!-- Sidebar -->
    <aside :class="[
      'fixed inset-y-0 left-0 z-50 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-all duration-300 ease-in-out lg:translate-x-0',
      sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      collapsed ? 'lg:w-20' : 'lg:w-64',
      'w-64'
    ]">
      <!-- Logo and Toggle Button -->
      <div class="relative flex items-center h-16 bg-orange-600 dark:bg-orange-700" :class="collapsed ? 'justify-center px-2' : 'justify-between px-6'">
        <div class="flex items-center">
          <img src="/logo-ifdd.png" alt="IFDD" class="h-8 w-auto flex-shrink-0">
          <span v-if="!collapsed" class="ml-3 text-white font-semibold text-lg transition-opacity duration-300">
            {{ t('admin.layout.adminPanel') }}
          </span>
        </div>
        <!-- Collapse/Expand Button - Desktop Only -->
        <button @click="toggleCollapsed"
                class="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-colors">
          <svg class="w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform duration-300"
               :class="collapsed ? 'rotate-180' : ''"
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
      </div>

      <!-- Navigation -->
      <nav class="mt-8 space-y-2" :class="collapsed ? 'px-2' : 'px-4'">
        <router-link
          v-for="item in navigation"
          :key="item.name"
          :to="item.href"
          :class="[
            'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 relative',
            isActiveRoute(item.href)
              ? 'bg-orange-100 dark:bg-orange-900 text-orange-900 dark:text-orange-100'
              : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700',
            collapsed ? 'justify-center' : ''
          ]"
          :title="collapsed ? t(item.name) : null"
        >
          <font-awesome-icon
            :icon="item.icon"
            :class="[
              'h-5 w-5 flex-shrink-0',
              !collapsed ? 'mr-3' : '',
              isActiveRoute(item.href)
                ? 'text-orange-600 dark:text-orange-400'
                : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
            ]" />
          <span v-if="!collapsed" class="transition-opacity duration-300">
            {{ t(item.name) }}
          </span>
        </router-link>
      </nav>

      <!-- User Info -->
      <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
        <div :class="[
          'flex items-center',
          collapsed ? 'justify-center' : ''
        ]">
          <img :src="currentUser?.profile_photo_thumbnail_url || '/images/default-avatar.png'"
               :alt="currentUser?.first_name"
               class="h-8 w-8 rounded-full flex-shrink-0">
          <div v-if="!collapsed" class="ml-3 flex-1 min-w-0 transition-opacity duration-300">
            <p class="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
              {{ currentUser?.first_name }} {{ currentUser?.last_name }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ getUserRole(currentUser) }}
            </p>
          </div>
        </div>
      </div>
    </aside>

    <!-- Contenu principal -->
    <main :class="[
      'min-h-screen transition-all duration-300 ease-in-out',
      collapsed ? 'lg:ml-20' : 'lg:ml-64'
    ]">
      <!-- Header -->
      <header class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between px-6 py-4">
          <!-- Breadcrumbs -->
          <nav class="flex" aria-label="Breadcrumb">
            <ol class="inline-flex items-center space-x-1 md:space-x-3">
              <li class="inline-flex items-center">
                <router-link to="/admin"
                           class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-orange-600 dark:text-gray-300">
                  <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                  </svg>
                  {{ t('admin.layout.dashboard') }}
                </router-link>
              </li>
              <li v-for="(breadcrumb, index) in breadcrumbs" :key="index">
                <div class="flex items-center">
                  <svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
                  </svg>
                  <span v-if="index === breadcrumbs.length - 1"
                        class="ml-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                    {{ breadcrumb.name }}
                  </span>
                  <router-link v-else
                             :to="breadcrumb.href"
                             class="ml-1 text-sm font-medium text-gray-700 hover:text-orange-600 dark:text-gray-300">
                    {{ breadcrumb.name }}
                  </router-link>
                </div>
              </li>
            </ol>
          </nav>

          <!-- Actions header -->
          <div class="flex items-center space-x-4">
            <!-- Notifications -->
            <button class="relative p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5-5V9.09c0-2.58-2.12-4.67-4.73-4.67S5.55 6.51 5.55 9.09V12l-5 5h5.18c.45 2.39 2.39 4.18 4.82 4.18s4.37-1.79 4.82-4.18z"/>
              </svg>
              <div v-if="unreadNotifications > 0"
                   class="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
                <span class="text-xs text-white font-medium">{{ unreadNotifications }}</span>
              </div>
            </button>

            <!-- Retour au site -->
            <router-link to="/"
                       class="text-sm text-gray-600 hover:text-orange-600 dark:text-gray-300 font-medium">
              {{ t('admin.layout.backToSite') }}
            </router-link>
          </div>
        </div>
      </header>

      <!-- Contenu de la page -->
      <div class="p-6">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useAdmin } from '@/composables/useAdmin'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const { t } = useI18n()
const route = useRoute()
const { currentUser } = useAuth()
const { getUserRole, loadUserRoles, canAccessAdmin, isLoadingRoles } = useAdmin()

// État
const sidebarOpen = ref(false)
const collapsed = ref(localStorage.getItem('adminSidebarCollapsed') === 'true')
const unreadNotifications = ref(0)

// Navigation
const navigation = [
  {
    name: 'admin.nav.dashboard',
    href: '/admin',
    icon: ['fas', 'tachometer-alt']
  },
  {
    name: 'admin.nav.users',
    href: '/admin/users',
    icon: ['fas', 'users']
  },
  {
    name: 'admin.nav.activities',
    href: '/admin/activities',
    icon: ['fas', 'calendar-check']
  },
  {
    name: 'admin.nav.organizations',
    href: '/admin/organizations',
    icon: ['fas', 'building']
  },
  {
    name: 'admin.nav.events',
    href: '/admin/events',
    icon: ['fas', 'calendar-alt']
  },
  {
    name: 'admin.nav.trainings',
    href: '/admin/trainings',
    icon: ['fas', 'graduation-cap']
  },
  {
    name: 'admin.nav.content',
    href: '/admin/content',
    icon: ['fas', 'file-alt']
  },
  {
    name: 'admin.nav.communications',
    href: '/admin/communications',
    icon: ['fas', 'bullhorn']
  },
  {
    name: 'admin.nav.emails',
    href: '/admin/emails',
    icon: ['fas', 'envelope']
  },
  {
    name: 'admin.nav.reports',
    href: '/admin/reports',
    icon: ['fas', 'chart-bar']
  },
  {
    name: 'admin.nav.roles',
    href: '/admin/roles',
    icon: ['fas', 'user-shield']
  },
  {
    name: 'admin.nav.negotiations',
    href: '/admin/negotiations',
    icon: ['fas', 'handshake']
  }
]

// Computed
const breadcrumbs = computed(() => {
  const paths = route.path.split('/').filter(Boolean).slice(1) // Enlever 'admin'
  const breadcrumbs = []

  for (let i = 0; i < paths.length; i++) {
    const path = paths[i]
    const href = '/admin/' + paths.slice(0, i + 1).join('/')

    breadcrumbs.push({
      name: t(`admin.nav.${path}`, path),
      href
    })
  }

  return breadcrumbs
})

// Méthodes
const isActiveRoute = (href) => {
  if (href === '/admin') {
    return route.path === '/admin'
  }
  return route.path.startsWith(href)
}

const toggleCollapsed = () => {
  collapsed.value = !collapsed.value
  localStorage.setItem('adminSidebarCollapsed', collapsed.value.toString())
}

// Watchers
watch(collapsed, (newVal) => {
  // Fermer le menu mobile si on collapse en desktop
  if (newVal && window.innerWidth >= 1024) {
    sidebarOpen.value = false
  }
})

onMounted(async () => {
  // Attendre que les rôles soient chargés
  await loadUserRoles()

  // Vérification des permissions après chargement
  if (!canAccessAdmin.value && !isLoadingRoles.value) {
    throw new Error('Accès non autorisé')
  }

  // Charger les notifications non lues
  // TODO: Implémenter le chargement des notifications
})
</script>
