<template>
  <div class="min-h-screen bg-gray-50">
    <NavBar />
    <main class="max-w-7xl mx-auto py-12 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold text-center text-gray-900 mb-10">
        Выберите категорию обучающихся
      </h1>
      
      <div class="flex flex-col sm:flex-row justify-center items-center gap-8">
        <button 
          @click="goToJournal(APP_CONSTANTS.STUDENT_TYPES.CADET)" 
          class="w-64 h-40 bg-blue-600 text-white text-2xl font-bold rounded-xl shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all flex items-center justify-center"
        >
          Курсанты
        </button>
        
        <button 
          @click="goToJournal(APP_CONSTANTS.STUDENT_TYPES.STUDENT)" 
          class="w-64 h-40 bg-green-600 text-white text-2xl font-bold rounded-xl shadow-lg hover:bg-green-700 hover:shadow-xl transition-all flex items-center justify-center"
        >
          Студенты
        </button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import NavBar from '../components/NavBar.vue';
import { APP_CONSTANTS } from '../config/constants';

const router = useRouter();

const goToJournal = (type) => {
  router.push(`${APP_CONSTANTS.ROUTES.JOURNAL}/${type}`);
};
</script>