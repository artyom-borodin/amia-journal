<template>
  <div class="layout-wrapper">
    <NavBar />
    <main class="dashboard-main">
      <h1 class="dashboard-title">{{ APP_CONSTANTS.UI.DASHBOARD_TITLE }}</h1>

      <div class="cards-container">
        <Button
          :label="APP_CONSTANTS.UI.LABELS.CADETS"
          icon="pi pi-users"
          class="dashboard-btn"
          @click="goToJournal(APP_CONSTANTS.STUDENT_TYPES.CADET)"
        />
        <Button
          :label="APP_CONSTANTS.UI.LABELS.STUDENTS"
          icon="pi pi-graduation-cap"
          severity="success"
          class="dashboard-btn"
          @click="goToJournal(APP_CONSTANTS.STUDENT_TYPES.STUDENT)"
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

const goToJournal = (type) => {
  router.push(`${APP_CONSTANTS.ROUTES.JOURNAL}/${type}`);
};
</script>
