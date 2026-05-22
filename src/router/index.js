import { createRouter, createWebHistory } from "vue-router";
import { APP_CONSTANTS } from "../config/constants";
import { useAuthStore } from "../store/authStore";

const routes = [
  {
    path: APP_CONSTANTS.ROUTES.LOGIN,
    name: APP_CONSTANTS.ROUTE_NAMES.LOGIN,
    component: () => import("../views/LoginView.vue"),
    meta: { requiresGuest: true },
  },
  {
    path: APP_CONSTANTS.ROUTES.DASHBOARD,
    name: APP_CONSTANTS.ROUTE_NAMES.DASHBOARD,
    component: () => import("../views/DashboardView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: APP_CONSTANTS.ROUTES.JOURNAL,
    name: APP_CONSTANTS.ROUTE_NAMES.JOURNAL,
    component: () => import("../views/JournalView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: APP_CONSTANTS.ROUTES.REPORTS,
    name: APP_CONSTANTS.ROUTE_NAMES.REPORTS,
    component: () => import("../views/ReportsView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: APP_CONSTANTS.ROUTES.DOCUMENTS,
    name: APP_CONSTANTS.ROUTE_NAMES.DOCUMENTS,
    component: () => import("../views/DocumentsView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: APP_CONSTANTS.ROUTES.DICTIONARIES,
    name: APP_CONSTANTS.ROUTE_NAMES.DICTIONARIES,
    component: () => import("../views/DictionariesView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: APP_CONSTANTS.ROUTES.STUDY_PLANS,
    name: APP_CONSTANTS.ROUTE_NAMES.STUDY_PLANS,
    component: () => import("../views/StudyPlansView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: APP_CONSTANTS.ROUTES.STUDY_PLAN_DETAIL,
    name: APP_CONSTANTS.ROUTE_NAMES.STUDY_PLAN_DETAIL,
    component: () => import("../views/StudyPlanDetailView.vue"),
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated;

  if (to.meta.requiresAuth && !isAuthenticated) {
    next(APP_CONSTANTS.ROUTES.LOGIN);
  } else if (to.meta.requiresGuest && isAuthenticated) {
    next(APP_CONSTANTS.ROUTES.DASHBOARD);
  } else {
    next();
  }
});

export default router;
