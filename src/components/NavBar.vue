<template>
  <header class="navbar">
    <div class="navbar-breadcrumbs">
      <span
        class="breadcrumb-item"
        :class="{ 'is-link': !isDashboard }"
        @click="goHome"
      >
        {{ APP_CONSTANTS.UI.LABELS.HOME }}
      </span>
      <template v-if="!isDashboard && currentRouteLabel">
        <span class="breadcrumb-separator">{{
          APP_CONSTANTS.UI.BREADCRUMB_SEPARATOR
        }}</span>
        <span class="breadcrumb-item current">{{ currentRouteLabel }}</span>
      </template>
    </div>
    <div class="navbar-actions">
      <div class="user-info">
        <span class="user-name">{{ userName }}</span>
        <span class="user-role">{{ userRole }}</span>
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
const currentRouteLabel = computed(
  () => APP_CONSTANTS.UI.PAGE_TITLES[route.name] || "",
);

const goHome = () => {
  if (!isDashboard.value) {
    router.push(APP_CONSTANTS.ROUTES.DASHBOARD);
  }
};

const handleLogout = () => {
  authStore.logout();
  router.push(APP_CONSTANTS.ROUTES.LOGIN);
};
</script>
