import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
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
  ],
})

export default router
