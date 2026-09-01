<template>
  <div class="layout-wrapper">
    <NavBar />
    <main class="dashboard-main">
      <h1 class="dashboard-title">{{ APP_CONSTANTS.UI.DASHBOARD_TITLE }}</h1>

      <div class="cards-container">
        <Button
          v-for="card in dashboardCards"
          :key="card.route"
          :label="card.label"
          :icon="card.icon"
          :severity="card.severity"
          :disabled="card.disabled"
          class="dashboard-btn"
          @click="goTo(card.route)"
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

const dashboardCards = [
  {
    route: APP_CONSTANTS.ROUTES.JOURNAL,
    label: APP_CONSTANTS.UI.LABELS.JOURNAL,
    icon: "pi pi-book",
    severity: null,
  },
  {
    route: APP_CONSTANTS.ROUTES.REPORTS,
    label: APP_CONSTANTS.UI.LABELS.REPORTS,
    icon: "pi pi-chart-bar",
    severity: "info",
  },
  {
    route: APP_CONSTANTS.ROUTES.ATTENDANCE,
    label: APP_CONSTANTS.UI.LABELS.ATTENDANCE,
    icon: "pi pi-calendar-times",
    severity: "warning",
  },
];

const goTo = (route) => {
  router.push(route);
};
</script>
