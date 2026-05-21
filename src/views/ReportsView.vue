<template>
  <div class="layout-wrapper">
    <NavBar />
    <main class="reports-main">
      <h1 class="dashboard-title">{{ APP_CONSTANTS.UI.LABELS.REPORTS }}</h1>

      <div class="view-toggles">
        <Button
          :label="APP_CONSTANTS.UI.LABELS.TAB_PERFORMANCE"
          icon="pi pi-star"
          :severity="activeTab === APP_CONSTANTS.REPORT_TABS.PERFORMANCE ? 'primary' : 'secondary'"
          @click="switchTab(APP_CONSTANTS.REPORT_TABS.PERFORMANCE)"
        />
        <Button
          :label="APP_CONSTANTS.UI.LABELS.TAB_ATTENDANCE"
          icon="pi pi-calendar-times"
          :severity="activeTab === APP_CONSTANTS.REPORT_TABS.ATTENDANCE ? 'primary' : 'secondary'"
          @click="switchTab(APP_CONSTANTS.REPORT_TABS.ATTENDANCE)"
        />
      </div>

      <template v-if="activeTab === APP_CONSTANTS.REPORT_TABS.PERFORMANCE">
        <PerformanceFilters
          :dicts="dictionaryStore.dicts"
          :semesters="reportStore.semesters"
          :is-loading="reportStore.isLoading"
          @generate="handleGeneratePerformance"
        />
        <div v-if="reportStore.performanceData.length > 0" class="view-container mt-3">
          <PerformanceTable :data="reportStore.performanceData" />
        </div>
        <div v-else-if="!reportStore.isLoading" class="empty-state mt-3">
          <i class="pi pi-filter empty-state-icon"></i>
          <span>{{ APP_CONSTANTS.UI.MESSAGES.SELECT_REPORT_FILTERS }}</span>
        </div>
      </template>

      <template v-if="activeTab === APP_CONSTANTS.REPORT_TABS.ATTENDANCE">
        <AttendanceFilters
          :dicts="dictionaryStore.dicts"
          :semesters="reportStore.semesters"
          :is-loading="reportStore.isLoading"
          @generate="handleGenerateAttendance"
        />
        <div v-if="reportStore.attendanceData.length > 0" class="view-container mt-3">
          <AttendanceTable :data="reportStore.attendanceData" />
        </div>
        <div v-else-if="!reportStore.isLoading" class="empty-state mt-3">
          <i class="pi pi-filter empty-state-icon"></i>
          <span>{{ APP_CONSTANTS.UI.MESSAGES.SELECT_REPORT_FILTERS }}</span>
        </div>
      </template>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import NavBar from "../components/NavBar.vue";
import PerformanceFilters from "../components/reports/PerformanceFilters.vue";
import AttendanceFilters from "../components/reports/AttendanceFilters.vue";
import PerformanceTable from "../components/reports/PerformanceTable.vue";
import AttendanceTable from "../components/reports/AttendanceTable.vue";
import { useDictionaryStore } from "../store/dictionaryStore";
import { useReportStore } from "../store/reportStore";
import { APP_CONSTANTS } from "../config/constants";

const dictionaryStore = useDictionaryStore();
const reportStore = useReportStore();

const activeTab = ref(APP_CONSTANTS.REPORT_TABS.PERFORMANCE);

onMounted(async () => {
  await reportStore.fetchDictionaries();
});

const switchTab = (tab) => {
  activeTab.value = tab;
  reportStore.clearReports();
};

const handleGeneratePerformance = async (filters) => {
  await reportStore.generatePerformanceReport(filters);
};

const handleGenerateAttendance = async (filters) => {
  await reportStore.generateAttendanceReport(filters);
};
</script>