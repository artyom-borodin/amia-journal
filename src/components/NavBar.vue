<template>
  <header class="navbar">
    <div class="navbar-brand" @click="goHome">
      {{ APP_CONSTANTS.UI.APP_TITLE }}
    </div>
    <div class="navbar-actions">
      <span class="user-role">{{ userRole }}</span>
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
import { useRouter } from "vue-router";
import { useAuthStore } from "../store/authStore";
import { APP_CONSTANTS } from "../config/constants";

const router = useRouter();
const authStore = useAuthStore();

const userRole = computed(() => authStore.userRole);

const goHome = () => {
  router.push(APP_CONSTANTS.ROUTES.DASHBOARD);
};

const handleLogout = () => {
  authStore.logout();
  router.push(APP_CONSTANTS.ROUTES.LOGIN);
};
</script>
