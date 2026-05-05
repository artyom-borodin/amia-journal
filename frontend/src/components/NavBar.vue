<template>
  <nav class="bg-blue-800 text-white shadow-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16 items-center">
        <div class="flex items-center cursor-pointer" @click="goHome">
          <span class="font-bold text-xl tracking-tight">Журнал учета посещаемости и отметок обучающихся</span>
        </div>
        <div class="flex items-center space-x-4">
          <span class="text-sm text-blue-200">{{ userRole }}</span>
          <button 
            @click="handleLogout" 
            class="bg-blue-700 hover:bg-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Выйти
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/authStore';
import { APP_CONSTANTS } from '../config/constants';

const router = useRouter();
const authStore = useAuthStore();

const userRole = computed(() => authStore.userRole);

const goHome = () => {
  router.push(APP_CONSTANTS.ROUTES.DASHBOARD);
};

const handleLogout = () => {
  authStore.logout();
  router.push(APP_CONSTANTS.ROUTES.LOGIN);
};
</script>