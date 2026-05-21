<template>
  <div class="layout-wrapper">
    <NavBar />
    <main class="reports-main">
      <h1 class="dashboard-title">{{ APP_CONSTANTS.UI.LABELS.REPORTS }}</h1>

      <ReportFilters
        :dicts="dictionaryStore.dicts"
        :semesters="reportStore.semesters"
        :is-loading="reportStore.isLoading"
        @generate="handleGenerateReport"
      />

      <div v-if="reportStore.reportData.length > 0" class="report-content mt-3">
        <div class="view-toggles">
          <Button
            :label="APP_CONSTANTS.UI.LABELS.VIEW_TABLE"
            icon="pi pi-table"
            :severity="
              activeView === APP_CONSTANTS.REPORT_VIEWS.TABLE
                ? 'primary'
                : 'secondary'
            "
            @click="activeView = APP_CONSTANTS.REPORT_VIEWS.TABLE"
          />
          <Button
            :label="APP_CONSTANTS.UI.LABELS.VIEW_CHART"
            icon="pi pi-chart-bar"
            :severity="
              activeView === APP_CONSTANTS.REPORT_VIEWS.CHART
                ? 'primary'
                : 'secondary'
            "
            @click="activeView = APP_CONSTANTS.REPORT_VIEWS.CHART"
          />
        </div>

        <div class="view-container mt-3">
          <ReportTable
            v-if="activeView === APP_CONSTANTS.REPORT_VIEWS.TABLE"
            :data="reportStore.reportData"
          />
          <ReportChart v-else :data="reportStore.reportData" />
        </div>
      </div>

      <div v-else-if="!reportStore.isLoading" class="empty-state mt-3">
        <i class="pi pi-filter empty-state-icon"></i>
        <span>{{ APP_CONSTANTS.UI.MESSAGES.SELECT_REPORT_FILTERS }}</span>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import NavBar from "../components/NavBar.vue";
import ReportFilters from "../components/reports/ReportFilters.vue";
import ReportTable from "../components/reports/ReportTable.vue";
import ReportChart from "../components/reports/ReportChart.vue";
import { useDictionaryStore } from "../store/dictionaryStore";
import { useReportStore } from "../store/reportStore";
import { APP_CONSTANTS } from "../config/constants";

const dictionaryStore = useDictionaryStore();
const reportStore = useReportStore();

const activeView = ref(APP_CONSTANTS.REPORT_VIEWS.TABLE);

onMounted(async () => {
  await reportStore.fetchDictionaries();
});

const handleGenerateReport = async (filters) => {
  await reportStore.generateReport(filters);
};
</script>
