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

    const userResponse = await apiClient.get(APP_CONSTANTS.API_ENDPOINTS.ME, {
      headers: {
        Authorization: `${APP_CONSTANTS.NETWORK.AUTH_PREFIX}${token}`,
      },
    });

    return {
      token,
      user: userResponse.data,
    };
  }
}
