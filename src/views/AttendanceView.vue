<template>
  <div class="layout-wrapper">
    <NavBar />

    <main class="attendance-main">
      <AttendanceFilters
        v-model:group="selectedGroup"
        v-model:period="period"
        v-model:nameFilter="nameFilter"
        :groups="dictionaryStore.dicts.groups"
      />

      <div v-if="!selectedGroup || !periodDates.length" class="empty-state">
        <i class="pi pi-search empty-state-icon"></i>
        <span>{{ APP_CONSTANTS.UI.MESSAGES.SELECT_ATTENDANCE_FILTERS }}</span>
      </div>
      <div v-else-if="isRangeTooLong" class="empty-state">
        <i class="pi pi-calendar empty-state-icon"></i>
        <span>{{ APP_CONSTANTS.UI.MESSAGES.RANGE_TOO_LONG }}</span>
      </div>
      <div v-else-if="attendanceStore.isLoading" class="empty-state">
        <i class="pi pi-spin pi-spinner empty-state-icon"></i>
        <span>{{ APP_CONSTANTS.UI.MESSAGES.LOADING }}</span>
      </div>

      <div v-else class="grid-container">
        <AttendanceGrid
          :persons="attendanceStore.persons"
          :lesson-times="sortedLessonTimes"
          :period="period"
          :attendances-map="attendanceStore.attendancesMap"
          :dicts-map="dictionaryStore.dictsMap"
          :name-filter="nameFilter"
          @cell-click="openDialog"
        />
      </div>
    </main>

    <AttendanceDialog
      v-model:visible="dialogVisible"
      :person="dialogPerson"
      :lesson-time="dialogLessonTime"
      :selected-date="dialogDate"
      :lesson-times="sortedLessonTimes"
      :dicts="dictionaryStore.dicts"
      :is-saving="isSaving"
      :has-existing-attendance="clickedCellHasAttendance"
      :initial-reason="clickedReason"
      @save="handleSave"
      @remove="handleRemove"
    />

    <ErrorDialog v-model:visible="showErrorDialog" :message="errorMessage" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import NavBar from "../components/NavBar.vue";
import ErrorDialog from "../components/ErrorDialog.vue";
import AttendanceFilters from "../components/attendance/AttendanceFilters.vue";
import AttendanceGrid from "../components/attendance/AttendanceGrid.vue";
import AttendanceDialog from "../components/AttendanceDialog.vue";
import { useDictionaryStore } from "../store/dictionaryStore";
import { useAttendanceStore } from "../store/attendanceStore";
import { APP_CONSTANTS } from "../config/constants";
import { generateCellKey } from "../utils/journalUtils";
import { toApiDate } from "../utils/dateUtils";

const dictionaryStore = useDictionaryStore();
const attendanceStore = useAttendanceStore();

const selectedGroup = ref(null);
const nameFilter = ref("");
const showErrorDialog = ref(false);
const errorMessage = ref("");

const dialogVisible = ref(false);
const dialogPerson = ref(null);
const dialogLessonTime = ref(null);
const dialogDate = ref(null);
const clickedCellHasAttendance = ref(false);
const clickedReason = ref(null);
const isSaving = ref(false);

// дефолт — текущая неделя (с понедельника по воскресенье)
const startOfWeek = () => {
  const d = new Date();
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  return d;
};
const period = ref([
  startOfWeek(),
  (() => {
    const d = startOfWeek();
    d.setDate(d.getDate() + 6);
    return d;
  })(),
]);

onMounted(() => {
  dictionaryStore.fetchDictionaries();
});

const periodDates = computed(() => {
  if (!period.value || period.value.length < 2 || !period.value[0] || !period.value[1]) {
    return [];
  }
  return [toApiDate(period.value[0]), toApiDate(period.value[1])];
});

const isRangeTooLong = computed(() => {
  if (!periodDates.value.length) return false;
  const days =
    Math.floor(
      (new Date(periodDates.value[1]) - new Date(periodDates.value[0])) /
        APP_CONSTANTS.RULES.MS_PER_DAY,
    ) + 1;
  return days > APP_CONSTANTS.GRID.MAX_ATTENDANCE_DAYS;
});

watch([selectedGroup, periodDates], () => {
  loadData();
});

const loadData = () => {
  if (!selectedGroup.value || !periodDates.value.length || isRangeTooLong.value) return;
  attendanceStore
    .fetchAttendanceData(selectedGroup.value, periodDates.value[0], periodDates.value[1])
    .catch(() => showError(APP_CONSTANTS.UI.ERRORS.SAVE_DATA));
};

const sortedLessonTimes = computed(() =>
  [...dictionaryStore.dicts.lessonTimes].sort((a, b) => a.number - b.number),
);

const openDialog = ({ person, lessonTime, date }) => {
  dialogPerson.value = person;
  dialogLessonTime.value = lessonTime;
  dialogDate.value = new Date(date);
  const key = generateCellKey(person.uniqueId, date, lessonTime.id);
  const attendance = attendanceStore.attendancesMap[key];
  clickedCellHasAttendance.value = !!attendance;
  clickedReason.value = attendance?.reason ?? null;
  dialogVisible.value = true;
};

const applyAttendanceAction = (action, payload) => {
  isSaving.value = true;
  attendanceStore[action]({
    person: dialogPerson.value,
    ...payload,
  })
    .then(() => {
      dialogVisible.value = false;
    })
    .catch((e) =>
      showError(e?.response?.data?.error || APP_CONSTANTS.UI.ERRORS.SAVE_DATA),
    )
    .finally(() => {
      isSaving.value = false;
    });
};

const handleSave = (payload) => applyAttendanceAction("applyBulkSave", payload);

const handleRemove = (payload) =>
  applyAttendanceAction("applyBulkDelete", payload);

const showError = (message) => {
  errorMessage.value = message;
  showErrorDialog.value = true;
};
</script>
