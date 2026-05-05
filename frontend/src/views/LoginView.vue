<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
      <div>
        <h2 class="mt-5 text-center text-2xl font-extrabold text-gray-900">
          Журнал учета посещаемости и отметок обучающихся
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Войдите в свой аккаунт
        </p>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="rounded-md shadow-sm space-y-4">
          <div>
            <label for="login" class="sr-only">Войти</label>
            <input 
              id="login" 
              v-model="credentials.login" 
              type="text" 
              required 
              class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
              placeholder="Имя пользователя"
            >
          </div>
          <div>
            <label for="password" class="sr-only">Пароль</label>
            <input 
              id="password" 
              v-model="credentials.password" 
              type="password" 
              required 
              class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
              placeholder="Пароль"
            >
          </div>
        </div>

        <div v-if="errorMessage" class="text-red-500 text-sm text-center">
          {{ errorMessage }}
        </div>

        <div>
          <button 
            type="submit" 
            :disabled="isLoading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {{ isLoading ? 'Авторизация...' : 'Авторизоваться' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/authStore';
import { APP_CONSTANTS } from '../config/constants';

const router = useRouter();
const authStore = useAuthStore();

const credentials = reactive({ login: '', password: '' });
const isLoading = ref(false);
const errorMessage = ref('');

const handleLogin = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    await authStore.login(credentials);
    router.push(APP_CONSTANTS.ROUTES.DASHBOARD);
  } catch (error) {
    errorMessage.value = error.response?.data?.error || 'Ошибка авторизации. Попробуйте еще раз.';
  } finally {
    isLoading.value = false;
  }
};
</script>