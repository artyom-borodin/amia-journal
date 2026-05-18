import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { AuthService } from "../services/authService";
import { APP_CONSTANTS } from "../config/constants";

export const useAuthStore = defineStore("auth", () => {
  const token = ref(
    localStorage.getItem(APP_CONSTANTS.STORAGE_KEYS.TOKEN) || null,
  );

  const getStoredUser = () => {
    try {
      const stored = localStorage.getItem(APP_CONSTANTS.STORAGE_KEYS.USER);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      localStorage.removeItem(APP_CONSTANTS.STORAGE_KEYS.USER);
      return null;
    }
  };

  const user = ref(getStoredUser());

  const isAuthenticated = computed(() => !!token.value);
  const userRole = computed(() => user.value?.role || null);

  const login = async (credentials) => {
    const data = await AuthService.login(credentials);
    token.value = data.token;
    user.value = data.user;

    localStorage.setItem(APP_CONSTANTS.STORAGE_KEYS.TOKEN, data.token);
    localStorage.setItem(
      APP_CONSTANTS.STORAGE_KEYS.USER,
      JSON.stringify(data.user),
    );
  };

  const logout = () => {
    token.value = null;
    user.value = null;
    localStorage.removeItem(APP_CONSTANTS.STORAGE_KEYS.TOKEN);
    localStorage.removeItem(APP_CONSTANTS.STORAGE_KEYS.USER);
  };

  return { token, user, isAuthenticated, userRole, login, logout };
});