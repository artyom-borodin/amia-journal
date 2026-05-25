import apiClient, { fetchAllPages } from "./api";
import { APP_CONSTANTS } from "../config/constants";

export class ReportService {
  static async getSemesters() {
    return await fetchAllPages(APP_CONSTANTS.API_ENDPOINTS.SEMESTERS).catch(
      () => [],
    );
  }

  static _buildBaseParams(filters) {
    const params = {};
    if (
      filters.dates &&
      filters.dates.length === APP_CONSTANTS.RULES.DATE_RANGE_LENGTH
    ) {
      if (filters.dates[0]) params.start_date = filters.dates[0];
      if (filters.dates[1]) params.end_date = filters.dates[1];
    }
    if (filters.semester) params.semester = filters.semester;
    if (filters.faculty) params.faculty = filters.faculty;
    if (filters.specialty) params.specialty = filters.specialty;
    if (filters.group) params.group = filters.group;
    if (filters.student) params.student = filters.student;
    return params;
  }

  static async getPerformanceReport(filters) {
    const params = this._buildBaseParams(filters);
    if (filters.subject) params.subject = filters.subject;
    if (filters.markValue) params.mark_value = filters.markValue;
    if (filters.lessonType) params.lesson_type = filters.lessonType;
    if (filters.markKind) params.mark_kind = filters.markKind;

    const response = await apiClient
      .get(APP_CONSTANTS.API_ENDPOINTS.REPORTS_PERFORMANCE, { params })
      .catch(() => APP_CONSTANTS.API_FALLBACK_RESPONSE);
    return response.data;
  }

  static async getAttendanceReport(filters) {
    const params = this._buildBaseParams(filters);
    if (filters.reason) params.reason = filters.reason;

    const response = await apiClient
      .get(APP_CONSTANTS.API_ENDPOINTS.REPORTS_ATTENDANCE, { params })
      .catch(() => APP_CONSTANTS.API_FALLBACK_RESPONSE);
    return response.data;
  }
}
