<template>
  <div class="layout-wrapper">
    <NavBar />

    <main class="journal-main">
      <JournalFilters
        v-model:group="selectedGroup"
        v-model:subject="selectedSubject"
        :groups="dictionaryStore.dicts.groups"
        :subjects="dictionaryStore.dicts.subjects"
        @add-lesson="showAddLessonModal = true"
      />

      <div v-if="!selectedGroup || !selectedSubject" class="empty-state">
        <i class="pi pi-search empty-state-icon"></i>
        <span>{{ APP_CONSTANTS.UI.MESSAGES.SELECT_FILTERS }}</span>
      </div>
      <div v-else-if="journalStore.isLoading" class="empty-state">
        <i class="pi pi-spin pi-spinner empty-state-icon"></i>
        <span>{{ APP_CONSTANTS.UI.MESSAGES.LOADING }}</span>
      </div>

      <div v-else class="flex-col flex-1 overflow-hidden">
        <div class="flex-row gap-4 mb-4 align-end flex-shrink-0">
          <div class="field max-w-30rem">
            <label>{{ APP_CONSTANTS.UI.LABELS.PERIOD }}</label>
            <DatePicker
              v-model="dateFilter"
              selectionMode="range"
              showIcon
              :dateFormat="APP_CONSTANTS.LOCALE_CONFIG.dateFormat"
              class="w-full"
            />
          </div>
        </div>

        <div class="grid-container">
          <JournalGrid
            :persons="journalStore.persons"
            :lessons="journalStore.lessons"
            :records-map="journalStore.recordsMap"
            :attendances-map="journalStore.attendancesMap"
            :dicts-map="dictionaryStore.dictsMap"
            :date-filter="dateFilter"
            :name-filter="nameFilter"
            @update:nameFilter="nameFilter = $event"
            @cell-click="openCellModal"
          />
        </div>
      </div>

      <CellModal
        v-if="selectedCell"
        :visible="!!selectedCell"
        :person="selectedCell.person"
        :lesson="selectedCell.lesson"
        :records="selectedCell.records"
        :attendance="selectedCell.attendance"
        :dicts="dictionaryStore.dicts"
        :is-saving="isSavingCell"
        @update:visible="selectedCell = null"
        @save="handleSaveCell"
      />

      <AddLessonModal
        :visible="showAddLessonModal"
        :dicts="dictionaryStore.dicts"
        :dicts-map="dictionaryStore.dictsMap"
        :is-saving="isAddingLesson"
        @update:visible="showAddLessonModal = $event"
        @add="handleAddLesson"
      />
    </main>

    <ErrorDialog v-model:visible="showErrorDialog" :message="errorMessage" />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import NavBar from "../components/NavBar.vue";
import JournalFilters from "../components/journal/JournalFilters.vue";
import JournalGrid from "../components/JournalGrid.vue";
import CellModal from "../components/CellModal.vue";
import AddLessonModal from "../components/AddLessonModal.vue";
import ErrorDialog from "../components/ErrorDialog.vue";
import { useJournalStore } from "../store/journalStore";
import { useDictionaryStore } from "../store/dictionaryStore";
import { APP_CONSTANTS } from "../config/constants";
import { generateCellKey } from "../utils/journalUtils";
import {
  extractErrorMessage,
  extractLessonErrorMessage,
} from "../utils/errorUtils";

const journalStore = useJournalStore();
const dictionaryStore = useDictionaryStore();

const selectedGroup = ref(null);
const selectedSubject = ref(null);
const dateFilter = ref(null);
const nameFilter = ref("");

const showAddLessonModal = ref(false);
const selectedCell = ref(null);
const isSavingCell = ref(false);
const isAddingLesson = ref(false);

const showErrorDialog = ref(false);
const errorMessage = ref("");

const showError = (errorOrMessage, defaultMsg) => {
  if (typeof errorOrMessage === "string") {
    errorMessage.value = errorOrMessage;
  } else {
    errorMessage.value = extractErrorMessage(errorOrMessage, defaultMsg);
  }
  showErrorDialog.value = true;
};

const loadGridData = async (silent = false) => {
  await journalStore.fetchGridData(
    selectedGroup.value,
    selectedSubject.value,
    silent,
  );
};

const openCellModal = ({ person, lesson }) => {
  const attendanceKey = generateCellKey(
    person.uniqueId,
    lesson.date,
    lesson.lesson_time,
  );
  const recordKey = `${person.uniqueId}_${lesson.id}`;

  selectedCell.value = {
    person,
    lesson,
    records: journalStore.recordsMap[recordKey] || [],
    attendance: journalStore.attendancesMap[attendanceKey],
  };
};

const handleSaveCell = async ({ reason, marks }) => {
  isSavingCell.value = true;
  try {
    await journalStore.saveCellData({
      reason,
      marks,
      person: selectedCell.value.person,
      lesson: selectedCell.value.lesson,
      attendance: selectedCell.value.attendance,
    });

    selectedCell.value = null;
  } catch (error) {
    console.error("Failed to save cell data:", error);
    showError(error, APP_CONSTANTS.UI.ERRORS.SAVE_DATA);
  } finally {
    isSavingCell.value = false;
  }
};

const handleAddLesson = async (lessonData) => {
  isAddingLesson.value = true;
  try {
    await journalStore.addLesson({
      ...lessonData,
      group: selectedGroup.value,
      subject: selectedSubject.value,
    });
    showAddLessonModal.value = false;
    await loadGridData(true);
  } catch (error) {
    console.error("Failed to add lesson:", error);
    showError(
      extractLessonErrorMessage(error, APP_CONSTANTS.UI.ERRORS.ADD_LESSON),
    );
  } finally {
    isAddingLesson.value = false;
  }
};

watch([selectedGroup, selectedSubject], () => {
  loadGridData(false);
});

onMounted(() => {
  dictionaryStore.fetchDictionaries();
});
</script>
