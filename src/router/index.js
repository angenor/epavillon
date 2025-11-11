import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/auth/Login.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/auth/Register.vue'),
    },
    {
      path: '/verify-email',
      name: 'verify-email',
      component: () => import('../views/auth/VerifyEmail.vue'),
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('../views/auth/ForgotPassword.vue'),
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: () => import('../views/auth/ResetPassword.vue'),
    },
    {
      path: '/auth/callback',
      name: 'auth-callback',
      component: () => import('../views/auth/AuthCallback.vue'),
    },
    {
      path: '/organization/setup',
      name: 'organization-setup',
      component: () => import('../views/organization/Setup.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/events/create',
      name: 'create-event',
      component: () => import('../views/events/Create.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/events/dashboard',
      name: 'events-dashboard',
      component: () => import('../views/events/Dashboard.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/events/:id',
      name: 'event-detail',
      component: () => import('../views/events/Detail.vue'),
    },
    {
      path: '/events/:id/edit',
      name: 'event-edit',
      component: () => import('../views/events/Edit.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/events/:eventId/activities/create',
      name: 'create-activity',
      component: () => import('../views/activities/Create.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/activities/:id',
      name: 'activity-detail',
      component: () => import('../views/activities/Detail.vue'),
    },
    {
      path: '/activities/:id/manage',
      name: 'activity-management',
      component: () => import('../views/activities/ManagementRefactored.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/activities/:id/edit',
      name: 'activity-edit',
      component: () => import('../views/activities/Edit.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/activities/preview/:id',
      name: 'activity-preview',
      component: () => import('../views/activities/Preview.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/community',
      name: 'community',
      component: () => import('../views/community/Community.vue'),
    },
    {
      path: '/programmations',
      name: 'programmations',
      component: () => import('../views/programmations/Programmations.vue'),
    },
    {
      path: '/programmations/:year/:eventId',
      name: 'programmation-detail',
      component: () => import('../views/programmations/ProgrammationDetail.vue'),
    },
    {
      path: '/programmations/2025/journee-jeunesse',
      name: 'journee-jeunesse-cop30',
      component: () => import('../views/programmations/JourneeJeunesseCOP30.vue'),
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/profils/Profile.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/organizations',
      name: 'organizations',
      component: () => import('../views/organization/Organizations.vue'),
    },
    {
      path: '/organizations/:id',
      name: 'organization-detail',
      component: () => import('../views/organization/OrganizationDetail.vue'),
    },
    // Routes pour l'annuaire public des profils
    {
      path: '/directory',
      name: 'public-directory',
      component: () => import('../views/profils/PublicDirectory.vue'),
      meta: { public: true }
    },
    {
      path: '/directory/:id',
      name: 'public-profile',
      component: () => import('../views/profils/PublicProfile.vue'),
      meta: { public: true }
    },
    {
      path: '/debug-profile',
      name: 'debug-profile',
      component: () => import('../views/profils/PublicProfileDebug.vue'),
      meta: { public: true }
    },
    {
      path: '/notifications',
      name: 'notifications',
      component: () => import('../views/notifications/Notifications.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/messages',
      name: 'messages',
      component: () => import('../views/messagerie/Messagerie.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/appointments',
      name: 'appointments',
      component: () => import('../views/appointments/Appointments.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/formations',
      name: 'formations',
      component: () => import('../views/formation/Index.vue'),
    },
    {
      path: '/formations/create',
      name: 'create-formation',
      component: () => import('../views/formation/Create.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/formations/:id',
      name: 'formation-detail',
      component: () => import('../views/formation/Detail.vue'),
    },
    // Négociations routes
    // {
    //   path: '/nego',
    //   redirect: '/nego/climat',
    // },
    {
      path: '/nego',
      name: 'nego',
      component: () => import('../views/negociation/NegoListe.vue'),
      meta: { requiresAuth: true, requiresRole: ['negotiator', 'admin', 'super_admin'] }
    },
    {
      path: '/nego/:category',
      name: 'negotiations',
      component: () => import('../views/negociation/Negociation.vue'),
      meta: { requiresAuth: true, requiresRole: ['negotiator', 'admin', 'super_admin'] },
      beforeEnter: (to, _from, next) => {
        const validCategories = ['climat', 'biodiversite', 'desertification']
        if (validCategories.includes(to.params.category)) {
          next()
        } else {
          next('/nego/climat')
        }
      }
    },
    // Route du chatbot IA pour les négociations
    {
      path: '/ai/chatbot',
      name: 'ai-chatbot',
      component: () => import('../views/ai/NegotiationChatbot.vue'),
      meta: { requiresAuth: true, requiresRole: ['negotiator', 'admin', 'super_admin'] }
    },
    // Routes d'administration
    {
      path: '/admin',
      component: () => import('../views/admin/AdminLayout.vue'),
      meta: { requiresAuth: true, requiresRole: ['admin', 'super_admin', 'revisionniste'] },
      children: [
        {
          path: '',
          name: 'admin-dashboard',
          component: () => import('../views/admin/Dashboard.vue'),
          meta: { requiresRole: ['admin', 'super_admin'] }
        },
        {
          path: 'users',
          name: 'admin-users',
          component: () => import('../views/admin/users/UsersList.vue'),
          meta: { requiresRole: ['admin', 'super_admin'] }
        },
        {
          path: 'users/:id',
          name: 'admin-user-detail',
          component: () => import('../views/admin/users/UserDetail.vue'),
          meta: { requiresRole: ['admin', 'super_admin'] }
        },
        {
          path: 'users/:id/edit',
          name: 'admin-user-edit',
          component: () => import('../views/admin/users/UserEdit.vue'),
          meta: { requiresRole: ['admin', 'super_admin'] }
        },
        {
          path: 'activities',
          name: 'admin-activities',
          component: () => import('../views/admin/activities/ActivitiesList.vue'),
          meta: { requiresRole: ['admin', 'super_admin', 'revisionniste'] }
        },
        {
          path: 'activities/:id',
          name: 'admin-activity-detail',
          component: () => import('../views/admin/activities/ActivityDetail.vue'),
          meta: { requiresRole: ['admin', 'super_admin', 'revisionniste'] }
        },
        {
          path: 'activities-dates-manager',
          name: 'admin-activities-dates-manager',
          component: () => import('../views/admin/activities/ActivityDatesManager.vue'),
          meta: { requiresRole: ['admin', 'super_admin'] }
        },
        {
          path: 'organizations',
          name: 'admin-organizations',
          component: () => import('../views/admin/organizations/OrganizationsList.vue'),
          meta: { requiresRole: ['admin', 'super_admin'] }
        },
        {
          path: 'organizations/:id',
          name: 'admin-organization-detail',
          component: () => import('../views/admin/organizations/OrganizationDetail.vue'),
          meta: { requiresRole: ['admin', 'super_admin'] }
        },
        {
          path: 'events',
          name: 'admin-events',
          component: () => import('../views/admin/events/EventsList.vue'),
          meta: { requiresRole: ['admin', 'super_admin'] }
        },
        {
          path: 'events/create',
          name: 'admin-event-create',
          component: () => import('../views/admin/events/EventCreate.vue'),
          meta: { requiresRole: ['admin', 'super_admin'] }
        },
        {
          path: 'events/:id',
          name: 'admin-event-detail',
          component: () => import('../views/admin/events/EventDetail.vue'),
          meta: { requiresRole: ['admin', 'super_admin'] }
        },
        {
          path: 'trainings',
          name: 'admin-trainings',
          component: () => import('../views/admin/trainings/TrainingsList.vue'),
          meta: { requiresRole: ['admin', 'super_admin'] }
        },
        {
          path: 'content',
          name: 'admin-content',
          component: () => import('../views/admin/content/ContentModeration.vue'),
          meta: { requiresRole: ['admin', 'super_admin'] }
        },
        {
          path: 'communications',
          name: 'admin-communications',
          component: () => import('../views/admin/communications/Communications.vue'),
          meta: { requiresRole: ['admin', 'super_admin'] }
        },
        {
          path: 'reports',
          name: 'admin-reports',
          component: () => import('../views/admin/reports/Reports.vue'),
          meta: { requiresRole: ['admin', 'super_admin'] }
        },
        {
          path: 'roles',
          name: 'admin-roles',
          component: () => import('../views/admin/roles/RolesList.vue'),
          meta: { requiresRole: ['admin', 'super_admin'] }
        },
        {
          path: 'negotiations',
          name: 'admin-negotiations',
          component: () => import('../views/admin/negotiations/NegotiationsList.vue'),
          meta: { requiresRole: ['admin', 'super_admin'] }
        },
        {
          path: 'negotiations/sessions/:id',
          name: 'admin-session-detail',
          component: () => import('../views/admin/negotiations/SessionDetail.vue'),
          meta: { requiresRole: ['admin', 'super_admin'] }
        },
        {
          path: 'emails',
          name: 'admin-emails',
          component: () => import('../views/admin/EmailManager.vue'),
          meta: { requiresRole: ['admin', 'super_admin'] }
        },
        {
          path: 'youtube-streams',
          name: 'admin-youtube-streams',
          component: () => import('../views/admin/YoutubeStreamManager.vue'),
          meta: { requiresRole: ['admin', 'super_admin'] }
        },
        {
          path: 'incident-messages',
          name: 'admin-incident-messages',
          component: () => import('../views/admin/IncidentMessages.vue'),
          meta: { requiresRole: ['admin', 'super_admin'] }
        }
      ]
    },
    // Page d'erreur 403 - Accès refusé
    {
      path: '/403',
      name: 'access-denied',
      component: () => import('../views/error/403.vue')
    },
  ],
})

// Guard de navigation pour vérifier l'authentification et les rôles
router.beforeEach(async (to, _from, next) => {
  const { useAuth } = await import('@/composables/useAuth')
  const { useUserRoles } = await import('@/composables/useUserRoles')

  const { currentUser, isAuthenticated } = useAuth()
  const { getUserRoles } = useUserRoles()

  // Vérifier si la route nécessite une authentification
  if (to.meta.requiresAuth && !isAuthenticated.value) {
    // Sauvegarder la route de destination dans le query param
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
    return
  }

  // Vérifier si la route nécessite des rôles spécifiques
  if (to.meta.requiresRole && currentUser.value) {
    try {
      // Récupérer les rôles actifs de l'utilisateur
      const userRoles = await getUserRoles(currentUser.value.id)
      const activeRoles = userRoles
        .filter(role => role.is_active && (!role.valid_until || new Date(role.valid_until) > new Date()))
        .map(role => role.role)

      // Vérifier si l'utilisateur a au moins un des rôles requis
      const hasRequiredRole = to.meta.requiresRole.some(role => activeRoles.includes(role))

      if (!hasRequiredRole) {
        // Rediriger vers une page d'erreur ou d'accès refusé avec l'information de la route tentée
        next({ path: '/403', query: { from: to.path } })
        return
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des rôles:', error)
      next({ path: '/403', query: { from: to.path } })
      return
    }
  }

  next()
})

export default router
