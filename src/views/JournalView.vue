<template>
  <div class="layout-wrapper">
    <NavBar />
    
    <main class="journal-main">
      <Card class="filters-card">
        <template #content>
          <div class="filters-row">
            <div class="filter-item">
              <label>{{ APP_CONSTANTS.UI.LABELS.GROUP }}</label>
              <Select 
                v-model="selectedGroup" 
                :options="journalStore.dicts.groups" 
                optionLabel="group_name" 
                optionValue="id" 
                :placeholder="APP_CONSTANTS.UI.PLACEHOLDERS.SELECT_GROUP" 
                class="w-full" 
              />
            </div>
            <div class="filter-item">
              <label>{{ APP_CONSTANTS.UI.LABELS.SUBJECT }}</label>
              <Select 
                v-model="selectedSubject" 
                :options="journalStore.dicts.subjects" 
                optionLabel="subject_name" 
                optionValue="id" 
                :placeholder="APP_CONSTANTS.UI.PLACEHOLDERS.SELECT_SUBJECT" 
                class="w-full" 
              />
            </div>
            <div class="filter-action">
              <Button 
                v-if="selectedGroup && selectedSubject" 
                :label="APP_CONSTANTS.UI.LABELS.ADD_LESSON" 
                icon="pi pi-plus" 
                severity="success" 
                @click="showAddLessonModal = true" 
              />
            </div>
          </div>
        </template>
      </Card>

      <div v-if="!selectedGroup || !selectedSubject" class="empty-state">
        <i class="pi pi-search empty-state-icon"></i>
        <span>{{ APP_CONSTANTS.UI.MESSAGES.SELECT_FILTERS }}</span>
      </div>
      <div v-else-if="journalStore.isLoading" class="empty-state">
        <i class="pi pi-spin pi-spinner empty-state-icon"></i>
        <span>{{ APP_CONSTANTS.UI.MESSAGES.LOADING }}</span>
      </div>

      <div v-else class="grid-container">
        <JournalGrid 
          :persons="journalStore.persons"
          :lessons="journalStore.lessons"
          :records-map="journalStore.recordsMap"
          :attendances-map="journalStore.attendancesMap"
          :dicts="journalStore.dicts"
          @cell-click="openCellModal"
        />
      </div>

      <CellModal 
        v-if="selectedCell"
        :visible="!!selectedCell"
        :person="selectedCell.person"
        :lesson="selectedCell.lesson"
        :record="selectedCell.record"
        :attendance="selectedCell.attendance"
        :dicts="journalStore.dicts"
        :is-saving="isSavingCell"
        @update:visible="selectedCell = null"
        @save="handleSaveCell"
      />

      <AddLessonModal 
        :visible="showAddLessonModal"
        :dicts="journalStore.dicts"
        @update:visible="showAddLessonModal = $event"
        @add="handleAddLesson"
      />

    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import NavBar from '../components/NavBar.vue';
import JournalGrid from '../components/JournalGrid.vue';
import CellModal from '../components/CellModal.vue';
import AddLessonModal from '../components/AddLessonModal.vue';
import { useAuthStore } from '../store/authStore';
import { useJournalStore } from '../store/journalStore';
import { APP_CONSTANTS } from '../config/constants';
import { generateCellKey } from '../utils/journalUtils';

const props = defineProps({ studentType: String });
const authStore = useAuthStore();
const journalStore = useJournalStore();

const selectedGroup = ref('');
const selectedSubject = ref('');

const showAddLessonModal = ref(false);
const selectedCell = ref(null);
const isSavingCell = ref(false);

const loadGridData = async () => {
  await journalStore.fetchGridData(props.studentType, selectedGroup.value, selectedSubject.value);
};

const openCellModal = ({ person, lesson }) => {
  selectedCell.value = {
    person,
    lesson,
    record: journalStore.recordsMap[generateCellKey(person.id, lesson.date, lesson.lesson_time)],
    attendance: journalStore.attendancesMap[generateCellKey(person.id, lesson.date, lesson.lesson_time)]
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

const handleAddLesson = async (lessonData) => {
  try {
    await journalStore.addLesson({
      ...lessonData,
      group: selectedGroup.value,
      subject: selectedSubject.value
    });
    showAddLessonModal.value = false;
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