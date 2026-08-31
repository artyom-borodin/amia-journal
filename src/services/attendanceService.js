import apiClient, { fetchAllPages } from "./api";
import { APP_CONSTANTS } from "../config/constants";

export class AttendanceService {
  static async getAttendances({ groupId, dateFrom, dateTo }) {
    const params = { group: groupId };
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;
    return fetchAllPages(APP_CONSTANTS.API_ENDPOINTS.ATTENDANCES, params);
  }

  static async bulkSave(payload) {
    const res = await apiClient.post(
      `${APP_CONSTANTS.API_ENDPOINTS.ATTENDANCES}${APP_CONSTANTS.ENDPOINTS_SUFFIX.BULK}`,
      payload,
    );
    return res.data;
  }

  static async bulkDelete(payload) {
    const res = await apiClient.post(
      `${APP_CONSTANTS.API_ENDPOINTS.ATTENDANCES}${APP_CONSTANTS.ENDPOINTS_SUFFIX.BULK_DELETE}`,
      payload,
    );
    return res.data;
  }
}