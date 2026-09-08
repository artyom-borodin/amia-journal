<template>
  <div class="layout-wrapper">
    <NavBar />

    <main class="journal-main">
      <JournalFilters
        v-model:group="selectedGroup"
        v-model:subject="selectedSubject"
        :groups="dictionaryStore.dicts.groups"
        :subjects="dictionaryStore.dicts.subjects"
        :downloading-roster="isDownloadingRoster"
        @add-lesson="showAddLessonModal = true"
        @download-roster="handleDownloadRoster"
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

      <div v-else class="flex-col flex-1 overflow-hidden min-w-0">
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
            :grid-matrix="journalStore.gridMatrix"
            :date-filter="dateFilter"
            :name-filter="nameFilter"
            :quick-filter="quickFilter"
            @update:nameFilter="nameFilter = $event"
            @update:quickFilter="quickFilter = $event"
            @cell-click="openCellModal"
            @edit-lesson="openEditLessonModal"
            @error="showError"
            @saved="notifySuccess(APP_CONSTANTS.UI.NOTIFY.SAVED)"
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
        :position-text="selectedCellPosition"
        :prev-disabled="isFirstCell"
        :next-disabled="isLastCell"
        @update:visible="selectedCell = null"
        @save="handleSaveCell"
        @prev="goToSiblingCell(-1)"
        @next="goToSiblingCell(1)"
      />

      <AddLessonModal
        :visible="showAddLessonModal"
        :lesson="editingLesson"
        :last-lesson="lastLesson"
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
import { ref, computed, onMounted, watch } from "vue";
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
import { JournalService } from "../services/journalService";
import { APP_CONSTANTS } from "../config/constants";
import { generateCellKey, getLastLesson } from "../utils/journalUtils";
import { formatDate } from "../utils/dateUtils";
import { useHelpDialog } from "../composables/useHelpDialog";
import { useStoredRef } from "../composables/useStoredRef";
import { useNotify } from "../composables/useNotify";
import {
  extractErrorMessage,
  extractLessonErrorMessage,
} from "../utils/errorUtils";

const journalStore = useJournalStore();
const dictionaryStore = useDictionaryStore();
const { notifySuccess } = useNotify();

const selectedGroup = useStoredRef(APP_CONSTANTS.STORAGE_KEYS.JOURNAL_GROUP);
const selectedSubject = useStoredRef(APP_CONSTANTS.STORAGE_KEYS.JOURNAL_SUBJECT);
const dateFilter = ref(null);
const nameFilter = ref("");
const quickFilter = ref(APP_CONSTANTS.JOURNAL_QUICK_FILTERS.ALL);

const showAddLessonModal = ref(false);
const editingLesson = ref(null);
const selectedCell = ref(null);
const isSavingCell = ref(false);
const isSavingLesson = ref(false);
const isDownloadingRoster = ref(false);

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
  if (!silent) {
    maybeShowHelp(journalStore.lessons.length > 0);
  }
};

const openCellModal = ({ person, lesson }) => {
  selectedCell.value = buildSelectedCell(person, lesson);
};

const buildSelectedCell = (person, lesson) => {
  const attendanceKey = generateCellKey(
    person.uniqueId,
    lesson.date,
    lesson.lesson_time,
  );
  const recordKey = `${person.uniqueId}_${lesson.id}`;

  return {
    person,
    lesson,
    records: journalStore.recordsMap[recordKey] || [],
    attendance: journalStore.attendancesMap[attendanceKey],
  };
};

const selectedCellIndex = computed(() => {
  if (!selectedCell.value) return -1;
  return journalStore.persons.findIndex(
    (p) => p.uniqueId === selectedCell.value.person.uniqueId,
  );
});

const selectedCellPosition = computed(() => {
  if (selectedCellIndex.value < 0) return "";
  const current = selectedCellIndex.value + 1;
  const total = journalStore.persons.length;
  return `${current} ${APP_CONSTANTS.UI.BREADCRUMB_SEPARATOR} ${total}`;
});

const isFirstCell = computed(() => selectedCellIndex.value <= 0);
const isLastCell = computed(
  () =>
    selectedCellIndex.value < 0 ||
    selectedCellIndex.value >= journalStore.persons.length - 1,
);

const lastLesson = computed(() => getLastLesson(journalStore.lessons));

const goToSiblingCell = (direction) => {
  const nextIndex = selectedCellIndex.value + direction;
  const nextPerson = journalStore.persons[nextIndex];
  if (!nextPerson || !selectedCell.value) return;
  selectedCell.value = buildSelectedCell(nextPerson, selectedCell.value.lesson);
};

const handleSaveCell = async ({ reason, marks }) => {
  if (isSavingCell.value) return;
  isSavingCell.value = true;
  try {
    const person = selectedCell.value.person;
    const lesson = selectedCell.value.lesson;
    await journalStore.saveCellData({
      reason,
      marks,
      person,
      lesson,
      attendance: selectedCell.value.attendance,
    });

    selectedCell.value = buildSelectedCell(person, lesson);
    notifySuccess(APP_CONSTANTS.UI.NOTIFY.SAVED);
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
    notifySuccess(APP_CONSTANTS.UI.NOTIFY.LESSON_ADDED);
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

const handleDownloadRoster = async () => {
  if (isDownloadingRoster.value) return;
  isDownloadingRoster.value = true;
  try {
    await JournalService.downloadRoster(
      selectedGroup.value,
      selectedSubject.value,
    );
    notifySuccess(APP_CONSTANTS.UI.NOTIFY.ROSTER_SAVED);
  } catch (error) {
    console.error("Failed to download roster:", error);
    showError(error, APP_CONSTANTS.UI.ERRORS.DOWNLOAD_ROSTER);
  } finally {
    isDownloadingRoster.value = false;
  }
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
    notifySuccess(APP_CONSTANTS.UI.NOTIFY.LESSON_DELETED);
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
    notifySuccess(APP_CONSTANTS.UI.NOTIFY.LESSON_UPDATED);
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
  quickFilter.value = APP_CONSTANTS.JOURNAL_QUICK_FILTERS.ALL;
  loadGridData(false);
});

onMounted(async () => {
  await dictionaryStore.fetchDictionaries();
  if (selectedGroup.value && selectedSubject.value) {
    await loadGridData(false);
  }
});
</script>
