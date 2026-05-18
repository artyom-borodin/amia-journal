import { createRouter, createWebHistory } from "vue-router";
import { APP_CONSTANTS } from "../config/constants";
import { useAuthStore } from "../store/authStore";

const routes = [
  {
    path: APP_CONSTANTS.ROUTES.LOGIN,
    name: "Login",
    component: () => import("../views/LoginView.vue"),
    meta: { requiresGuest: true },
  },
  {
    path: APP_CONSTANTS.ROUTES.DASHBOARD,
    name: "Dashboard",
    component: () => import("../views/DashboardView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: APP_CONSTANTS.ROUTES.JOURNAL,
    name: "Journal",
    component: () => import("../views/JournalView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: APP_CONSTANTS.ROUTES.REPORTS,
    name: "Reports",
    component: () => import("../views/ReportsView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: APP_CONSTANTS.ROUTES.DOCUMENTS,
    name: "Documents",
    component: () => import("../views/DocumentsView.vue"),
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