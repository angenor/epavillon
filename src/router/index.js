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
      path: '/activities/:id/edit',
      name: 'activity-edit',
      component: () => import('../views/activities/Edit.vue'),
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
    {
      path: '/nego',
      redirect: '/nego/climat',
    },
    {
      path: '/nego/:category',
      name: 'negotiations',
      component: () => import('../views/negociation/Negociation.vue'),
      meta: { requiresAuth: true, requiresRole: ['negotiator', 'admin', 'super_admin'] },
      beforeEnter: (to, from, next) => {
        const validCategories = ['climat', 'biodiversite', 'desertification']
        if (validCategories.includes(to.params.category)) {
          next()
        } else {
          next('/nego/climat')
        }
      }
    },
    // Routes d'administration
    {
      path: '/admin',
      component: () => import('../views/admin/AdminLayout.vue'),
      meta: { requiresAuth: true, requiresRole: ['admin', 'super_admin'] },
      children: [
        {
          path: '',
          name: 'admin-dashboard',
          component: () => import('../views/admin/Dashboard.vue')
        },
        {
          path: 'users',
          name: 'admin-users',
          component: () => import('../views/admin/users/UsersList.vue')
        },
        {
          path: 'users/:id',
          name: 'admin-user-detail',
          component: () => import('../views/admin/users/UserDetail.vue')
        },
        {
          path: 'users/:id/edit',
          name: 'admin-user-edit',
          component: () => import('../views/admin/users/UserEdit.vue')
        },
        {
          path: 'activities',
          name: 'admin-activities',
          component: () => import('../views/admin/activities/ActivitiesList.vue')
        },
        {
          path: 'activities/:id',
          name: 'admin-activity-detail',
          component: () => import('../views/admin/activities/ActivityDetail.vue')
        },
        {
          path: 'organizations',
          name: 'admin-organizations',
          component: () => import('../views/admin/organizations/OrganizationsList.vue')
        },
        {
          path: 'organizations/:id',
          name: 'admin-organization-detail',
          component: () => import('../views/admin/organizations/OrganizationDetail.vue')
        },
        {
          path: 'events',
          name: 'admin-events',
          component: () => import('../views/admin/events/EventsList.vue')
        },
        {
          path: 'events/create',
          name: 'admin-event-create',
          component: () => import('../views/admin/events/EventCreate.vue')
        },
        {
          path: 'events/:id',
          name: 'admin-event-detail',
          component: () => import('../views/admin/events/EventDetail.vue')
        },
        {
          path: 'trainings',
          name: 'admin-trainings',
          component: () => import('../views/admin/trainings/TrainingsList.vue')
        },
        {
          path: 'content',
          name: 'admin-content',
          component: () => import('../views/admin/content/ContentModeration.vue')
        },
        {
          path: 'communications',
          name: 'admin-communications',
          component: () => import('../views/admin/communications/Communications.vue')
        },
        {
          path: 'reports',
          name: 'admin-reports',
          component: () => import('../views/admin/reports/Reports.vue')
        }
      ]
    },
  ],
})

export default router
