<template>
  <div class="login-container">
    <Card class="login-card">
      <template #title>
        <div class="text-center">{{ APP_CONSTANTS.UI.APP_TITLE }}</div>
      </template>
      <template #subtitle>
        <div class="text-center">{{ APP_CONSTANTS.UI.LOGIN_SUBTITLE }}</div>
      </template>
      <template #content>
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="field">
            <InputText 
              v-model="credentials.login" 
              :placeholder="APP_CONSTANTS.UI.LABELS.USERNAME" 
              required 
              class="w-full" 
            />
          </div>
          <div class="field">
            <Password 
              v-model="credentials.password" 
              :placeholder="APP_CONSTANTS.UI.LABELS.PASSWORD" 
              required 
              :feedback="false" 
              toggleMask 
              class="w-full" 
            />
          </div>
          
          <Message v-if="errorMessage" severity="error" :closable="false">
            {{ errorMessage }}
          </Message>
          
          <Button 
            type="submit" 
            :label="APP_CONSTANTS.UI.LABELS.LOGIN_BTN" 
            :loading="isLoading" 
            class="w-full mt-3" 
          />
        </form>
      </template>
    </Card>
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
    errorMessage.value = error.response?.data?.error || APP_CONSTANTS.UI.ERRORS.LOGIN;
  } finally {
    isLoading.value = false;
  }
};
</script>