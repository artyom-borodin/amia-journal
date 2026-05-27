<template>
  <header class="navbar">
    <div class="navbar-breadcrumbs">
      <span
        class="breadcrumb-item"
        :class="{ 'is-link': !isDashboard }"
        @click="goHome"
      >
        <i class="pi pi-home" style="margin-right: 4px;"></i>{{ APP_CONSTANTS.UI.LABELS.HOME }}
      </span>

      <template v-for="(crumb, index) in breadcrumbs" :key="index">
        <span class="breadcrumb-separator">{{
          APP_CONSTANTS.UI.BREADCRUMB_SEPARATOR
        }}</span>
        <span
          class="breadcrumb-item"
          :class="{ 'is-link': crumb.route, current: !crumb.route }"
          @click="crumb.route ? navigateTo(crumb.route) : null"
        >
          {{ crumb.label }}
        </span>
      </template>
    </div>

    <div class="navbar-actions">
      <div class="user-info" style="flex-direction: row; align-items: center; gap: 10px;">
        <div style="display: flex; flex-direction: column; align-items: flex-end;">
          <span class="user-name">{{ userName }}</span>
          <span class="user-role">{{ userRole }}</span>
        </div>
        <Avatar v-if="authStore.user?.avatar" :image="authStore.user.avatar" shape="circle" />
        <Avatar v-else icon="pi pi-user" shape="circle" />
      </div>
      <Button
        :label="APP_CONSTANTS.UI.LABELS.LOGOUT_BTN"
        icon="pi pi-sign-out"
        severity="secondary"
        text
        @click="handleLogout"
      />
    </div>
  </header>
</template>

<script setup>
import { computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "../store/authStore";
import { APP_CONSTANTS } from "../config/constants";
import { getPersonFullName } from "../utils/journalUtils";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const userRole = computed(() => authStore.userRole);
const userName = computed(() => getPersonFullName(authStore.user));

const isDashboard = computed(
  () => route.name === APP_CONSTANTS.ROUTE_NAMES.DASHBOARD,
);

const breadcrumbs = computed(() => {
  const crumbs = [];
  if (isDashboard.value) return crumbs;

  if (route.name === APP_CONSTANTS.ROUTE_NAMES.STUDY_PLAN_DETAIL) {
    crumbs.push({
      label:
        APP_CONSTANTS.UI.PAGE_TITLES[APP_CONSTANTS.ROUTE_NAMES.STUDY_PLANS],
      route: APP_CONSTANTS.ROUTES.STUDY_PLANS,
    });
  }

  crumbs.push({
    label: APP_CONSTANTS.UI.PAGE_TITLES[route.name] || "",
    route: null,
  });

  return crumbs;
});

const goHome = () => {
  if (!isDashboard.value) {
    router.push(APP_CONSTANTS.ROUTES.DASHBOARD);
  }
};

const navigateTo = (path) => {
  if (path) {
    router.push(path);
  }
};

const handleLogout = () => {
  authStore.logout();
  router.push(APP_CONSTANTS.ROUTES.LOGIN);
};
</script>