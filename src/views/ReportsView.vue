<template>
  <div class="layout-wrapper">
    <NavBar />
    <main class="reports-main">
      <h1 class="dashboard-title">{{ APP_CONSTANTS.UI.LABELS.REPORTS }}</h1>

      <div class="view-toggles">
        <Button
          :label="APP_CONSTANTS.UI.LABELS.TAB_PERFORMANCE"
          icon="pi pi-star"
          :severity="
            activeTab === APP_CONSTANTS.REPORT_TABS.PERFORMANCE
              ? 'primary'
              : 'secondary'
          "
          @click="switchTab(APP_CONSTANTS.REPORT_TABS.PERFORMANCE)"
        />
        <Button
          :label="APP_CONSTANTS.UI.LABELS.TAB_ATTENDANCE"
          icon="pi pi-calendar-times"
          :severity="
            activeTab === APP_CONSTANTS.REPORT_TABS.ATTENDANCE
              ? 'primary'
              : 'secondary'
          "
          @click="switchTab(APP_CONSTANTS.REPORT_TABS.ATTENDANCE)"
        />
      </div>

      <ReportFilters
        :mode="activeTab"
        :dicts="dictionaryStore.dicts"
        :semesters="reportStore.semesters"
        :is-loading="reportStore.isLoading"
        @generate="handleGenerate"
      />

      <div v-if="currentData.length > 0" class="view-container mt-3">
        <PerformanceTable
          v-if="activeTab === APP_CONSTANTS.REPORT_TABS.PERFORMANCE"
          :data="reportStore.performanceData"
        />
        <AttendanceTable v-else :data="reportStore.attendanceData" />
      </div>
      <div v-else-if="!reportStore.isLoading" class="empty-state mt-3">
        <i class="pi pi-filter empty-state-icon"></i>
        <span>{{ APP_CONSTANTS.UI.MESSAGES.SELECT_REPORT_FILTERS }}</span>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import NavBar from "../components/NavBar.vue";
import ReportFilters from "../components/reports/ReportFilters.vue";
import PerformanceTable from "../components/reports/PerformanceTable.vue";
import AttendanceTable from "../components/reports/AttendanceTable.vue";
import { useDictionaryStore } from "../store/dictionaryStore";
import { useReportStore } from "../store/reportStore";
import { APP_CONSTANTS } from "../config/constants";

const dictionaryStore = useDictionaryStore();
const reportStore = useReportStore();

const activeTab = ref(APP_CONSTANTS.REPORT_TABS.PERFORMANCE);

const currentData = computed(() =>
  activeTab.value === APP_CONSTANTS.REPORT_TABS.PERFORMANCE
    ? reportStore.performanceData
    : reportStore.attendanceData,
);

onMounted(async () => {
  await reportStore.fetchDictionaries();
});

const switchTab = (tab) => {
  activeTab.value = tab;
  reportStore.clearReports();
};

const handleGenerate = async (filters) => {
  if (activeTab.value === APP_CONSTANTS.REPORT_TABS.PERFORMANCE) {
    await reportStore.generatePerformanceReport(filters);
  } else {
    await reportStore.generateAttendanceReport(filters);
  }
};
</script>
