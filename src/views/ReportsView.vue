<template>
  <div class="layout-wrapper">
    <NavBar />
    <main class="dashboard-main">
      <h1 class="dashboard-title">{{ APP_CONSTANTS.UI.LABELS.REPORTS }}</h1>
      <div class="empty-state">
        <i class="pi pi-chart-bar empty-state-icon"></i>
        <span>{{ APP_CONSTANTS.UI.MESSAGES.UNDER_CONSTRUCTION }}</span>
      </div>
    </main>
  </div>
</template>

<script setup>
import NavBar from "../components/NavBar.vue";
import { APP_CONSTANTS } from "../config/constants";
</script>
