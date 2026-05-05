import apiClient from './api';
import { APP_CONSTANTS } from '../config/constants';

export class JournalService {
  static async getDashboard() {
    const response = await apiClient.get(APP_CONSTANTS.API_ENDPOINTS.DASHBOARD);
    return response.data;
  }

  static async getGridData(groupId, subjectId, startDate, endDate) {
    const response = await apiClient.get(APP_CONSTANTS.API_ENDPOINTS.GRID, {
      params: { groupId, subjectId, startDate, endDate }
    });
    return response.data;
  }

  static async updateCell(payload) {
    const response = await apiClient.post(APP_CONSTANTS.API_ENDPOINTS.UPDATE_CELL, payload);
    return response.data;
  }
}