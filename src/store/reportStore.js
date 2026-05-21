import { defineStore } from "pinia";
import { ref } from "vue";
import { ReportService } from "../services/reportService";
import { useDictionaryStore } from "./dictionaryStore";

export const useReportStore = defineStore("report", () => {
  const dictionaryStore = useDictionaryStore();

  const semesters = ref([]);
  const reportData = ref([]);
  const isLoading = ref(false);

  const fetchDictionaries = async () => {
    await dictionaryStore.fetchDictionaries();

    try {
      semesters.value = await ReportService.getSemesters();
    } catch (error) {
      console.error("Failed to fetch semesters:", error);
    }
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
    clearReport,
  };
});
