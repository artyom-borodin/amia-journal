import apiClient from "./api";
import { APP_CONSTANTS } from "../config/constants";

export class ReportService {
  static async getSemesters() {
    const response = await apiClient.get(APP_CONSTANTS.API_ENDPOINTS.SEMESTERS);
    return response.data.results || response.data;
  }

  static async getReportSummary(filters) {
    const params = {};
    
    if (filters.dates && filters.dates.length === 2) {
      if (filters.dates[0]) params.start_date = filters.dates[0];
      if (filters.dates[1]) params.end_date = filters.dates[1];
    }
    
    if (filters.group) params.group = filters.group;
    if (filters.subject) params.subject = filters.subject;
    if (filters.teacher) params.teacher = filters.teacher;
    if (filters.student) params.student = filters.student;
    if (filters.markValue) params.mark_value = filters.markValue;
    if (filters.reason) params.reason = filters.reason;

    const response = await apiClient.get(APP_CONSTANTS.API_ENDPOINTS.REPORTS_SUMMARY, { params });
    return response.data;
  }
}