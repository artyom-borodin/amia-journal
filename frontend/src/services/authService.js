import apiClient from './api';
import { APP_CONSTANTS } from '../config/constants';

export class AuthService {
  static async login(credentials) {
    const response = await apiClient.post(APP_CONSTANTS.API_ENDPOINTS.LOGIN, credentials);
    return response.data;
  }
}