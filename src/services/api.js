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
      error.response?.status === APP_CONSTANTS.HTTP_STATUS.UNAUTHORIZED ||
      error.response?.status === APP_CONSTANTS.HTTP_STATUS.FORBIDDEN;
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

export const fetchAllPages = async (endpoint, params = {}) => {
  let results = [];
  let currentUrl = endpoint;
  let currentParams = { ...params };

  while (currentUrl) {
    const response = await apiClient.get(currentUrl, { params: currentParams });
    const data = response.data;

    if (data && Array.isArray(data.results)) {
      results = [...results, ...data.results];
      if (data.next) {
        if (data.next.startsWith("http")) {
          const urlObj = new URL(data.next);
          currentUrl = urlObj.pathname + urlObj.search;
        } else {
          currentUrl = data.next;
        }
        currentParams = {};
      } else {
        currentUrl = null;
      }
    } else {
      results = Array.isArray(data) ? data : data.results || [];
      currentUrl = null;
    }
  }
  return results;
};

export default apiClient;
