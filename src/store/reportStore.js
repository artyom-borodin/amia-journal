import { defineStore } from "pinia";
import { ref } from "vue";
import { ReportService } from "../services/reportService";
import { useDictionaryStore } from "./dictionaryStore";
import { useLatestRequest } from "../composables/useLatestRequest";

export const useReportStore = defineStore("report", () => {
  const dictionaryStore = useDictionaryStore();

  const semesters = ref([]);
  const performanceData = ref([]);
  const attendanceData = ref([]);
  const isLoading = ref(false);

  const reportRequest = useLatestRequest();

  const fetchDictionaries = async () => {
    await dictionaryStore.fetchDictionaries();
    try {
      semesters.value = await ReportService.getSemesters();
    } catch (error) {
      console.error("Failed to fetch semesters:", error);
    }
  };

  const generatePerformanceReport = async (filters) => {
    const mySeq = reportRequest.begin();
    isLoading.value = true;
    try {
      const data = await ReportService.getPerformanceReport(filters);
      if (!reportRequest.isLatest(mySeq)) return;
      performanceData.value = data;
    } catch (error) {
      console.error("Failed to fetch performance report:", error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const generateAttendanceReport = async (filters) => {
    const mySeq = reportRequest.begin();
    isLoading.value = true;
    try {
      const data = await ReportService.getAttendanceReport(filters);
      if (!reportRequest.isLatest(mySeq)) return;
      attendanceData.value = data;
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
