import { defineStore } from "pinia";
import { ref } from "vue";
import { ReportService } from "../services/reportService";
import { useDictionaryStore } from "./dictionaryStore";

export const useReportStore = defineStore("report", () => {
  const dictionaryStore = useDictionaryStore();

  const semesters = ref([]);
  const performanceData = ref([]);
  const attendanceData = ref([]);
  const isLoading = ref(false);

  const fetchDictionaries = async () => {
    await dictionaryStore.fetchDictionaries();
    try {
      semesters.value = await ReportService.getSemesters();
    } catch (error) {
      console.error("Failed to fetch semesters:", error);
    }
  };

  const generatePerformanceReport = async (filters) => {
    isLoading.value = true;
    try {
      performanceData.value = await ReportService.getPerformanceReport(filters);
    } catch (error) {
      console.error("Failed to fetch performance report:", error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const generateAttendanceReport = async (filters) => {
    isLoading.value = true;
    try {
      attendanceData.value = await ReportService.getAttendanceReport(filters);
    } catch (error) {
      console.error("Failed to fetch attendance report:", error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const clearReports = () => {
    performanceData.value = [];
    attendanceData.value = [];
  };

  return {
    semesters,
    performanceData,
    attendanceData,
    isLoading,
    fetchDictionaries,
    generatePerformanceReport,
    generateAttendanceReport,
    clearReports,
  };
});
