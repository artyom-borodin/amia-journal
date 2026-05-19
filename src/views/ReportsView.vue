<template>
  <div class="layout-wrapper">
    <NavBar />
    <main class="reports-main">
      <h1 class="dashboard-title">{{ APP_CONSTANTS.UI.LABELS.REPORTS }}</h1>
      
      <ReportFilters 
        :dicts="journalStore.dicts"
        :semesters="reportStore.semesters"
        :is-loading="reportStore.isLoading"
        @generate="handleGenerateReport"
      />

      <div v-if="reportStore.reportData.length > 0" class="report-content mt-3">
        <div class="view-toggles">
          <Button 
            :label="APP_CONSTANTS.UI.LABELS.VIEW_TABLE" 
            icon="pi pi-table" 
            :severity="activeView === 'table' ? 'primary' : 'secondary'"
            @click="activeView = 'table'" 
          />
          <Button 
            :label="APP_CONSTANTS.UI.LABELS.VIEW_CHART" 
            icon="pi pi-chart-bar" 
            :severity="activeView === 'chart' ? 'primary' : 'secondary'"
            @click="activeView = 'chart'" 
          />
        </div>

        <div class="view-container mt-3">
          <ReportTable v-if="activeView === 'table'" :data="reportStore.reportData" />
          <ReportChart v-else :data="reportStore.reportData" />
        </div>
      </div>

      <div v-else-if="!reportStore.isLoading" class="empty-state mt-3">
        <i class="pi pi-filter empty-state-icon"></i>
        <span>Выберите параметры и нажмите "Сформировать отчет"</span>
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
import { useJournalStore } from "../store/journalStore";
import { useReportStore } from "../store/reportStore";
import { APP_CONSTANTS } from "../config/constants";

const journalStore = useJournalStore();
const reportStore = useReportStore();

const activeView = ref('table');

onMounted(async () => {
  await reportStore.fetchDictionaries();
});

const handleGenerateReport = async (filters) => {
  await reportStore.generateReport(filters);
};
</script>