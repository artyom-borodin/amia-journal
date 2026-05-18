<template>
  <div class="layout-wrapper">
    <NavBar />
    <main class="dashboard-main">
      <h1 class="dashboard-title">{{ APP_CONSTANTS.UI.DASHBOARD_TITLE }}</h1>

      <div class="cards-container">
        <Button
          :label="APP_CONSTANTS.UI.LABELS.JOURNAL"
          icon="pi pi-book"
          class="dashboard-btn"
          @click="goTo(APP_CONSTANTS.ROUTES.JOURNAL)"
        />
        <Button
          :label="APP_CONSTANTS.UI.LABELS.REPORTS"
          icon="pi pi-chart-bar"
          severity="info"
          class="dashboard-btn"
          @click="goTo(APP_CONSTANTS.ROUTES.REPORTS)"
        />
        <Button
          :label="APP_CONSTANTS.UI.LABELS.DOCUMENTS"
          icon="pi pi-file"
          severity="help"
          class="dashboard-btn"
          @click="goTo(APP_CONSTANTS.ROUTES.DOCUMENTS)"
        />
      </div>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import NavBar from "../components/NavBar.vue";
import { APP_CONSTANTS } from "../config/constants";

const router = useRouter();

const goTo = (route) => {
  router.push(route);
};
</script>
