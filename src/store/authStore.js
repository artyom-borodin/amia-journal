import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { AuthService } from "../services/authService";
import { APP_CONSTANTS } from "../config/constants";
import { storageUtils } from "../utils/storageUtils";

export const useAuthStore = defineStore("auth", () => {
  const token = ref(storageUtils.getItem(APP_CONSTANTS.STORAGE_KEYS.TOKEN));
  const user = ref(storageUtils.getJSON(APP_CONSTANTS.STORAGE_KEYS.USER));

  const isAuthenticated = computed(() => !!token.value);
  const userRole = computed(() => user.value?.role || null);

  const login = async (credentials) => {
    const data = await AuthService.login(credentials);
    token.value = data.token;
    user.value = data.user;

    storageUtils.setItem(APP_CONSTANTS.STORAGE_KEYS.TOKEN, data.token);
    storageUtils.setJSON(APP_CONSTANTS.STORAGE_KEYS.USER, data.user);
  };

  const logout = () => {
    token.value = null;
    user.value = null;
    storageUtils.removeItem(APP_CONSTANTS.STORAGE_KEYS.TOKEN);
    storageUtils.removeItem(APP_CONSTANTS.STORAGE_KEYS.USER);
  };

  return { token, user, isAuthenticated, userRole, login, logout };
});
