import { defineStore } from "pinia";
import { ref } from "vue";
import { ReportService } from "../services/reportService";
import { useJournalStore } from "./journalStore";

export const useReportStore = defineStore("report", () => {
  const journalStore = useJournalStore();
  
  const semesters = ref([]);
  const reportData = ref([]);
  const isLoading = ref(false);

  const fetchDictionaries = async () => {
    if (journalStore.dicts.groups.length === 0) {
      await journalStore.fetchFilters();
    }
    semesters.value = await ReportService.getSemesters();
  };

  const generateReport = async (filters) => {
    isLoading.value = true;
    try {
      reportData.value = await ReportService.getReportSummary(filters);
    } catch (error) {
      console.error("Failed to fetch report:", error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const clearReport = () => {
    reportData.value = [];
  };

  return {
    semesters,
    reportData,
    isLoading,
    fetchDictionaries,
    generateReport,
    clearReport
  };
});