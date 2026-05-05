import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../store/authStore';
import { APP_CONSTANTS } from '../config/constants';

const routes = [
  {
    path: APP_CONSTANTS.ROUTES.LOGIN,
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: APP_CONSTANTS.ROUTES.DASHBOARD,
    name: 'Dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: `${APP_CONSTANTS.ROUTES.JOURNAL}/:groupId/:subjectId`,
    name: 'Journal',
    component: () => import('../views/JournalView.vue'),
    meta: { requiresAuth: true },
    props: true
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next(APP_CONSTANTS.ROUTES.LOGIN);
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next(APP_CONSTANTS.ROUTES.DASHBOARD);
  } else {
    next();
  }
});

export default router;