import axios from 'axios';
import { APP_CONSTANTS } from '../config/constants';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(APP_CONSTANTS.STORAGE_KEYS.TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === APP_CONSTANTS.HTTP_STATUS.UNAUTHORIZED) {
      localStorage.removeItem(APP_CONSTANTS.STORAGE_KEYS.TOKEN);
      localStorage.removeItem(APP_CONSTANTS.STORAGE_KEYS.USER);
      window.location.href = APP_CONSTANTS.ROUTES.LOGIN;
    }
    return Promise.reject(error);
  }
);

export default apiClient;