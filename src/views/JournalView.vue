<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <NavBar />
    
    <main class="flex-1 max-w-[100vw] w-full mx-auto py-6 sm:px-6 lg:px-8 flex flex-col overflow-hidden">
      
      <!-- Фильтры -->
      <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4 shrink-0">
        <div class="flex flex-col md:flex-row md:items-end gap-4">
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Группа</label>
            <select v-model="selectedGroup" class="w-full border-gray-300 rounded-md shadow-sm p-2 border">
              <option value="">-- Выберите группу --</option>
              <option v-for="g in journalStore.dicts.groups" :key="g.id" :value="g.id">{{ g.group_name || `Группа ${g.id}` }}</option>
            </select>
          </div>
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Дисциплина</label>
            <select v-model="selectedSubject" class="w-full border-gray-300 rounded-md shadow-sm p-2 border">
              <option value="">-- Выберите дисциплину --</option>
              <option v-for="s in journalStore.dicts.subjects" :key="s.id" :value="s.id">{{ s.subject_name }}</option>
            </select>
          </div>
          <button 
            v-if="selectedGroup && selectedSubject" 
            @click="showAddLessonModal = true" 
            class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 font-medium h-11"
          >
            + Добавить занятие
          </button>
        </div>
      </div>

      <div v-if="!selectedGroup || !selectedSubject" class="flex-1 flex items-center justify-center bg-white rounded-lg border border-dashed">
        <span class="text-gray-500 text-lg">Выберите группу и дисциплину</span>
      </div>
      <div v-else-if="journalStore.isLoading" class="flex-1 flex items-center justify-center">
        <span class="text-gray-500 text-lg">Загрузка данных...</span>
      </div>

      <!-- Сетка -->
      <div v-else class="flex-1 overflow-hidden bg-white shadow rounded-lg flex flex-col">
        <JournalGrid 
          :persons="journalStore.persons"
          :lessons="journalStore.lessons"
          :records-map="journalStore.recordsMap"
          :attendances-map="journalStore.attendancesMap"
          :dicts="journalStore.dicts"
          @cell-click="openCellModal"
        />
      </div>

      <!-- Модалка редактирования ячейки -->
      <CellModal 
        v-if="selectedCell"
        :person="selectedCell.person"
        :lesson="selectedCell.lesson"
        :record="selectedCell.record"
        :attendance="selectedCell.attendance"
        :dicts="journalStore.dicts"
        :is-saving="isSavingCell"
        @close="selectedCell = null"
        @save="handleSaveCell"
      />

      <!-- Модалка добавления занятия -->
      <div v-if="showAddLessonModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 max-w-lg w-full shadow-xl">
          <h3 class="text-lg font-bold mb-4">Добавить занятие</h3>
          <form @submit.prevent="handleAddLesson" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Дата</label>
                <input type="date" v-model="newLesson.date" required class="mt-1 w-full border p-2 rounded-md">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Пара</label>
                <select v-model="newLesson.lesson_time" required class="mt-1 w-full border p-2 rounded-md">
                  <option v-for="lt in journalStore.dicts.lessonTimes" :key="lt.id" :value="lt.id">{{ lt.number }} {{ APP_CONSTANTS.UI.LESSON_SUFFIX }}</option>
                </select>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Вид контроля</label>
              <select v-model="newLesson.mark_kind" required class="mt-1 w-full border p-2 rounded-md">
                <option v-for="mk in journalStore.dicts.markKinds" :key="mk.id" :value="mk.id">{{ mk.mark_kind }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Тема занятия</label>
              <textarea v-model="newLesson.topic" rows="2" class="mt-1 w-full border p-2 rounded-md"></textarea>
            </div>
            <div class="mt-6 flex justify-end space-x-3">
              <button type="button" @click="showAddLessonModal = false" class="px-4 py-2 border rounded-md">Отмена</button>
              <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-md">Добавить</button>
            </div>
          </form>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import NavBar from '../components/NavBar.vue';
import JournalGrid from '../components/JournalGrid.vue';
import CellModal from '../components/CellModal.vue';
import { useAuthStore } from '../store/authStore';
import { useJournalStore } from '../store/journalStore';
import { APP_CONSTANTS } from '../config/constants';

const props = defineProps({ studentType: String });
const authStore = useAuthStore();
const journalStore = useJournalStore();

const selectedGroup = ref('');
const selectedSubject = ref('');

const showAddLessonModal = ref(false);
const newLesson = ref({ date: '', lesson_time: '', mark_kind: '', topic: '' });

const selectedCell = ref(null);
const isSavingCell = ref(false);

const loadGridData = async () => {
  await journalStore.fetchGridData(props.studentType, selectedGroup.value, selectedSubject.value);
  
  nextTick(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayCol = document.querySelector(`[data-date="${todayStr}"]`);
    if (todayCol) {
      todayCol.scrollIntoView({ behavior: 'smooth', inline: 'center' });
    } else {
      const container = document.getElementById('journal-scroll-container');
      if(container) container.scrollLeft = container.scrollWidth;
    }
  });
};

const openCellModal = ({ person, lesson }) => {
  selectedCell.value = {
    person,
    lesson,
    record: journalStore.recordsMap[`${person.id}_${lesson.date}_${lesson.lesson_time}`],
    attendance: journalStore.attendancesMap[`${person.id}_${lesson.date}_${lesson.lesson_time}`]
  };
};

const handleSaveCell = async ({ reason, mark_value }) => {
  isSavingCell.value = true;
  try {
    await journalStore.saveCellData({
      reason,
      mark_value,
      person: selectedCell.value.person,
      lesson: selectedCell.value.lesson,
      record: selectedCell.value.record,
      attendance: selectedCell.value.attendance,
      studentType: props.studentType,
      userId: authStore.user.id
    });
    
    selectedCell.value = null;
    await loadGridData();
  } catch (error) {
    alert(APP_CONSTANTS.UI.ERRORS.SAVE_DATA);
  } finally {
    isSavingCell.value = false;
  }
};

const handleAddLesson = async () => {
  try {
    await journalStore.addLesson({
      ...newLesson.value,
      group: selectedGroup.value,
      subject: selectedSubject.value
    });
    showAddLessonModal.value = false;
    newLesson.value = { date: '', lesson_time: '', mark_kind: '', topic: '' };
    await loadGridData();
  } catch (error) {
    alert(APP_CONSTANTS.UI.ERRORS.ADD_LESSON);
  }
};

watch([selectedGroup, selectedSubject], loadGridData);

onMounted(() => {
  journalStore.fetchFilters(props.studentType);
});
</script>