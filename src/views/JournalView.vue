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
      <div v-else-if="journalStore.lessons.length === 0" class="empty-state">
        <i class="pi pi-calendar empty-state-icon"></i>
        <span>{{ APP_CONSTANTS.UI.MESSAGES.NO_LESSONS }}</span>
      </div>

      <div v-else class="flex-col flex-1 overflow-hidden">
        <div class="flex-row gap-4 mb-4 align-end flex-shrink-0">
          <div class="field max-w-30rem">
            <label>{{ APP_CONSTANTS.UI.LABELS.PERIOD }}</label>
            <DatePicker
              v-model="dateFilter"
              selectionMode="range"
              showIcon
              :placeholder="APP_CONSTANTS.UI.PLACEHOLDERS.SELECT_PERIOD"
              :dateFormat="APP_CONSTANTS.LOCALE_CONFIG.dateFormat"
              class="w-full"
            />
          </div>
          <div class="field">
            <label>&nbsp;</label>
            <Button
              icon="pi pi-question-circle"
              text
              rounded
              :title="APP_CONSTANTS.UI.HELP.OPEN_TITLE"
              @click="openHelp"
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
            @edit-lesson="openEditLessonModal"
            @error="showError"
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
        :lesson="editingLesson"
        :dicts="dictionaryStore.dicts"
        :dicts-map="dictionaryStore.dictsMap"
        :is-saving="isSavingLesson"
        @update:visible="handleLessonsModalVisibility"
        @add="handleAddLesson"
        @save="handleEditLesson"
        @delete="openDeleteLesson"
      />

      <DeleteLessonDialog
        :visible="showDeleteDialog"
        :lesson-line="deleteLessonLine"
        :marks-count="deleteMarksCount"
        :is-deleting="isDeletingLesson"
        @update:visible="showDeleteDialog = $event"
        @confirm="handleDeleteLesson"
      />

      <HelpDialog
        :visible="showHelpDialog"
        :title="APP_CONSTANTS.UI.HELP.TITLE"
        :lines="APP_CONSTANTS.UI.HELP.LINES"
        @update:visible="showHelpDialog = $event"
        @confirm="handleHelpConfirm"
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
import DeleteLessonDialog from "../components/DeleteLessonDialog.vue";
import HelpDialog from "../components/HelpDialog.vue";
import ErrorDialog from "../components/ErrorDialog.vue";
import { useJournalStore } from "../store/journalStore";
import { useDictionaryStore } from "../store/dictionaryStore";
import { APP_CONSTANTS } from "../config/constants";
import { generateCellKey } from "../utils/journalUtils";
import { formatDate } from "../utils/dateUtils";
import { useHelpDialog } from "../composables/useHelpDialog";
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
const editingLesson = ref(null);
const selectedCell = ref(null);
const isSavingCell = ref(false);
const isSavingLesson = ref(false);

const showDeleteDialog = ref(false);
const deleteLessonLine = ref("");
const deleteMarksCount = ref(0);
const isDeletingLesson = ref(false);

const showErrorDialog = ref(false);
const errorMessage = ref("");

const { showHelpDialog, openHelp, handleHelpConfirm, maybeShowHelp } =
  useHelpDialog(APP_CONSTANTS.STORAGE_KEYS.JOURNAL_HELP_HIDE);

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
  if (isSavingCell.value) return;
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
  if (isSavingLesson.value) return;
  isSavingLesson.value = true;
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
    isSavingLesson.value = false;
  }
};

const openEditLessonModal = (lesson) => {
  editingLesson.value = lesson;
  showAddLessonModal.value = true;
};

const openDeleteLesson = () => {
  if (!editingLesson.value) return;
  const lesson = editingLesson.value;
  const subjectName =
    dictionaryStore.dictsMap.subjects[lesson.subject]?.subject_name || "";
  const group = (dictionaryStore.dicts.groups || []).find(
    (g) => g.id === lesson.group,
  );
  const groupName = group ? group.group_name : "";
  const parts = [subjectName, groupName, formatDate(lesson.date)].filter(
    Boolean,
  );
  if (lesson.topic) {
    parts.push(`"${lesson.topic}"`);
  }
  deleteLessonLine.value = parts.join(APP_CONSTANTS.FORMATTING.SEPARATOR);

  deleteMarksCount.value = Object.values(
    journalStore.gridMatrix || {},
  ).reduce(
    (sum, byLesson) => sum + (byLesson[lesson.id]?.records?.length || 0),
    0,
  );

  showDeleteDialog.value = true;
};

const handleDeleteLesson = async () => {
  if (isDeletingLesson.value || !editingLesson.value) return;
  isDeletingLesson.value = true;
  try {
    await journalStore.deleteLesson(editingLesson.value.id);
    showDeleteDialog.value = false;
    showAddLessonModal.value = false;
    editingLesson.value = null;
    await loadGridData(true);
  } catch (error) {
    console.error("Failed to delete lesson:", error);
    showError(error, APP_CONSTANTS.UI.ERRORS.DELETE_LESSON);
  } finally {
    isDeletingLesson.value = false;
  }
};

const handleLessonsModalVisibility = (visible) => {
  showAddLessonModal.value = visible;
  if (!visible) {
    editingLesson.value = null;
  }
};

const handleEditLesson = async (lessonData) => {
  if (isSavingLesson.value) return;
  isSavingLesson.value = true;
  try {
    await journalStore.updateLesson(editingLesson.value.id, lessonData);
    showAddLessonModal.value = false;
    editingLesson.value = null;
    await loadGridData(true);
  } catch (error) {
    console.error("Failed to edit lesson:", error);
    showError(
      extractLessonErrorMessage(error, APP_CONSTANTS.UI.ERRORS.EDIT_LESSON),
    );
  } finally {
    isSavingLesson.value = false;
  }
};

watch([selectedGroup, selectedSubject], () => {
  nameFilter.value = "";
  loadGridData(false);
});

watch(
  () => [journalStore.lessons.length, journalStore.isLoading],
  () => {
    maybeShowHelp(
      !journalStore.isLoading && journalStore.lessons.length > 0,
    );
  },
);

onMounted(() => {
  dictionaryStore.fetchDictionaries();
});
</script>
