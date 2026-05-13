import apiClient from "./api";
import { APP_CONSTANTS } from "../config/constants";

export class AuthService {
  static async login(credentials) {
    const tokenResponse = await apiClient.post(
      APP_CONSTANTS.API_ENDPOINTS.TOKEN,
      {
        username: credentials.login,
        password: credentials.password,
      },
    );

    const token = tokenResponse.data.access;
    localStorage.setItem(APP_CONSTANTS.STORAGE_KEYS.TOKEN, token);

    const userResponse = await apiClient.get(APP_CONSTANTS.API_ENDPOINTS.ME);

    return {
      token,
      user: userResponse.data,
    };
  }
}
