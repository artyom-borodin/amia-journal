<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <NavBar />
    
    <main class="flex-1 max-w-7xl w-full mx-auto py-6 sm:px-6 lg:px-8 flex flex-col">
      <div class="px-4 sm:px-0 mb-4 flex justify-between items-center">
        <h1 class="text-2xl font-bold text-gray-900">Журнал</h1>
        
        <div class="flex items-center space-x-4 bg-white p-2 rounded-lg shadow-sm border border-gray-200">
          <button @click="changeWeek(-1)" class="p-1 hover:bg-gray-100 rounded text-gray-600">
            &larr; Пред.
          </button>
          <span class="text-sm font-medium text-gray-700">
            {{ formattedDateRange }}
          </span>
          <button @click="changeWeek(1)" class="p-1 hover:bg-gray-100 rounded text-gray-600">
            След. &rarr;
          </button>
        </div>
      </div>

      <div v-if="isLoading" class="flex-1 flex items-center justify-center">
        <span class="text-gray-500">Загрузка...</span>
      </div>

      <JournalGrid 
        v-else
        :students="gridData.students"
        :lessons="gridData.lessons"
        :marks="gridData.marks"
        :attendance="gridData.attendance"
        :user-role="authStore.userRole"
        @update-cell="handleCellUpdate"
      />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import NavBar from '../components/NavBar.vue';
import JournalGrid from '../components/JournalGrid.vue';
import { JournalService } from '../services/journalService';
import { useAuthStore } from '../store/authStore';
import { DateUtils } from '../utils/dateUtils';

const route = useRoute();
const authStore = useAuthStore();

const groupId = route.params.groupId;
const subjectId = route.params.subjectId;

const currentDate = ref(new Date());
const isLoading = ref(true);

const gridData = ref({
  students: [],
  lessons: [],
  marks: [],
  attendance: []
});

const currentWeekStart = computed(() => DateUtils.getStartOfWeek(currentDate.value));
const currentWeekEnd = computed(() => DateUtils.getEndOfWeek(currentDate.value));

const formattedDateRange = computed(() => {
  return `${DateUtils.formatShortDate(currentWeekStart.value)} - ${DateUtils.formatShortDate(currentWeekEnd.value)}`;
});

const fetchGridData = async () => {
  isLoading.value = true;
  try {
    const startISO = DateUtils.formatToISO(currentWeekStart.value);
    const endISO = DateUtils.formatToISO(currentWeekEnd.value);
    
    gridData.value = await JournalService.getGridData(groupId, subjectId, startISO, endISO);
  } catch (error) {
    console.error('Failed to fetch grid data', error);
  } finally {
    isLoading.value = false;
  }
};

const changeWeek = (offset) => {
  currentDate.value = DateUtils.addWeeks(currentDate.value, offset);
};

const handleCellUpdate = async (payload) => {
  try {
    await JournalService.updateCell(payload);
    await fetchGridData(); // Refresh data to ensure sync with backend
  } catch (error) {
    console.error('Failed to update cell', error);
    alert('Не удалось сохранить данные. Попробуйте еще раз.');
  }
};

watch(currentDate, fetchGridData);

onMounted(fetchGridData);
</script>