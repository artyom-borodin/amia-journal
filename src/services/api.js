import axios from "axios";
import { APP_CONSTANTS } from "../config/constants";
import { useAuthStore } from "../store/authStore";
import router from "../router";
import { storageUtils } from "../utils/storageUtils";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = storageUtils.getItem(APP_CONSTANTS.STORAGE_KEYS.TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isUnauthorized =
      error.response?.status === APP_CONSTANTS.HTTP_STATUS.UNAUTHORIZED;
    const isAuthRequest =
      error.config?.url === APP_CONSTANTS.API_ENDPOINTS.TOKEN;

    if (isUnauthorized && !isAuthRequest) {
      const authStore = useAuthStore();
      authStore.logout();
      router.push(APP_CONSTANTS.ROUTES.LOGIN);
    }

    return Promise.reject(error);
  },
);

export default apiClient;
