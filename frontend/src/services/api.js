import axios from 'axios';
import { APP_CONSTANTS } from '../config/constants';

const apiClient = axios.create({
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
    if (error.response && error.response.status === 401) {
      localStorage.removeItem(APP_CONSTANTS.STORAGE_KEYS.TOKEN);
      localStorage.removeItem(APP_CONSTANTS.STORAGE_KEYS.USER);
      window.location.href = APP_CONSTANTS.ROUTES.LOGIN;
    }
    return Promise.reject(error);
  }
);

export default apiClient;