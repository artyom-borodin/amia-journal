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
                filter
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
                filter
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
                class="w-full"
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
          :dicts-map="journalStore.dictsMap"
          @cell-click="openCellModal"
        />
      </div>

      <CellModal
        v-if="selectedCell"
        :visible="!!selectedCell"
        :person="selectedCell.person"
        :lesson="selectedCell.lesson"
        :records="selectedCell.records"
        :attendance="selectedCell.attendance"
        :dicts="journalStore.dicts"
        :is-saving="isSavingCell"
        @update:visible="selectedCell = null"
        @save="handleSaveCell"
      />

      <AddLessonModal
        :visible="showAddLessonModal"
        :dicts="journalStore.dicts"
        :dicts-map="journalStore.dictsMap"
        @update:visible="showAddLessonModal = $event"
        @add="handleAddLesson"
      />
    </main>

    <Dialog
      v-model:visible="showErrorDialog"
      modal
      :header="APP_CONSTANTS.UI.ERROR_SUMMARY"
      class="error-modal"
      :closable="false"
    >
      <div class="error-dialog-content">
        <i class="pi pi-exclamation-triangle error-icon"></i>
        <span class="error-text">{{ errorMessage }}</span>
      </div>
      <template #footer>
        <Button label="OK" @click="showErrorDialog = false" autofocus />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import NavBar from "../components/NavBar.vue";
import JournalGrid from "../components/JournalGrid.vue";
import CellModal from "../components/CellModal.vue";
import AddLessonModal from "../components/AddLessonModal.vue";
import { useJournalStore } from "../store/journalStore";
import { APP_CONSTANTS } from "../config/constants";
import { generateCellKey } from "../utils/journalUtils";
import { extractErrorMessage } from "../utils/errorUtils";

const journalStore = useJournalStore();

const selectedGroup = ref(null);
const selectedSubject = ref(null);

const showAddLessonModal = ref(false);
const selectedCell = ref(null);
const isSavingCell = ref(false);

const showErrorDialog = ref(false);
const errorMessage = ref("");

const showError = (error, defaultMsg) => {
  errorMessage.value = extractErrorMessage(error, defaultMsg);
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
  selectedCell.value = {
    person,
    lesson,
    records:
      journalStore.recordsMap[
        generateCellKey(person.id, lesson.date, lesson.lesson_time)
      ] || [],
    attendance:
      journalStore.attendancesMap[
        generateCellKey(person.id, lesson.date, lesson.lesson_time)
      ],
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
    showError(error, APP_CONSTANTS.UI.ERRORS.ADD_LESSON);
  }
};

watch([selectedGroup, selectedSubject], () => {
  loadGridData(false);
});

onMounted(() => {
  journalStore.fetchFilters();
});
</script>
