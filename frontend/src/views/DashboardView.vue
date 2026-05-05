<template>
  <div class="min-h-screen bg-gray-50">
    <NavBar />
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <h1 class="text-2xl font-bold text-gray-900 mb-6">Мои дисциплины и группы</h1>
        
        <div v-if="isLoading" class="text-center py-10">
          <span class="text-gray-500">Загрузка...</span>
        </div>
        
        <div v-else-if="items.length === 0" class="text-center py-10 bg-white rounded-lg shadow">
          <span class="text-gray-500">Нет дисциплин связанных с Вами.</span>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <SubjectCard 
            v-for="(item, index) in items" 
            :key="index" 
            :item="item" 
            @select="navigateToJournal"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import NavBar from '../components/NavBar.vue';
import SubjectCard from '../components/SubjectCard.vue';
import { JournalService } from '../services/journalService';
import { APP_CONSTANTS } from '../config/constants';

const router = useRouter();
const items = ref([]);
const isLoading = ref(true);

const fetchDashboard = async () => {
  try {
    items.value = await JournalService.getDashboard();
  } catch (error) {
    console.error('Failed to fetch dashboard', error);
  } finally {
    isLoading.value = false;
  }
};

const navigateToJournal = (item) => {
  router.push(`${APP_CONSTANTS.ROUTES.JOURNAL}/${item.groupId}/${item.subjectId}`);
};

onMounted(fetchDashboard);
</script>