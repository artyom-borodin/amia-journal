<template>
  <div class="journal-grid-wrapper">
    <DataTable
      :value="paddedPersons"
      scrollable
      scrollHeight="flex"
      class="journal-table"
      showGridlines
      size="small"
    >
      <ColumnGroup type="header">
        <Row>
          <Column :rowspan="2" frozen alignFrozen="left" class="fio-column">
            <template #header>
              <div class="flex-col w-full gap-2 p-2">
                <span class="font-semibold">{{
                  APP_CONSTANTS.UI.LABELS.FULL_NAME
                }}</span>
                <InputText
                  :modelValue="nameFilter"
                  @update:modelValue="$emit('update:nameFilter', $event)"
                  :placeholder="APP_CONSTANTS.UI.PLACEHOLDERS.SEARCH_BY_NAME"
                  class="w-full p-inputtext-sm"
                />
                <div class="quick-filters">
                  <Button
                    v-for="filter in quickFilters"
                    :key="filter.key"
                    :label="filter.label"
                    size="small"
                    rounded
                    :severity="
                      filter.key === quickFilter ? 'primary' : 'secondary'
                    "
                    @click.stop="$emit('update:quickFilter', filter.key)"
                  />
                </div>
                <span class="counter-text"
                  >{{ APP_CONSTANTS.UI.LABELS.SHOWN_COUNT }}
                  <b>{{ personsCounter }}</b></span
                >
              </div>
            </template>
          </Column>
          <Column
            v-for="group in groupedLessons"
            :key="group.date"
            :colspan="group.count"
            class="date-group-header"
          >
            <template #header>
              <div class="date-header-content">
                {{ formatDate(group.date) }}
              </div>
            </template>
          </Column>
          <Column :rowspan="2" class="summary-column">
            <template #header>
              <div class="summary-header">
                {{ APP_CONSTANTS.UI.LABELS.SUMMARY }}
              </div>
            </template>
          </Column>
          <Column
            v-for="i in emptyColumnsCount"
            :key="APP_CONSTANTS.PREFIXES.EMPTY_DATE + i"
            class="date-group-header empty-header"
          >
            <template #header>
              <div class="date-header-content">&nbsp;</div>
            </template>
          </Column>
        </Row>
        <Row>
          <Column
            v-for="lesson in filteredLessons"
            :key="APP_CONSTANTS.PREFIXES.HEADER + lesson.id"
            class="lesson-column"
          >
            <template #header>
              <div class="lesson-header-sub">
                <span class="lesson-time">{{
                  getLessonTime(lesson.lesson_time)
                }}</span>
                <span class="lesson-topic" :title="lesson.topic">{{
                  lesson.topic || APP_CONSTANTS.UI.NO_TOPIC
                }}</span>
                <span
                  class="lesson-kind"
                  :title="getLessonType(lesson.lesson_type)"
                  >{{ getLessonType(lesson.lesson_type) }}</span
                >
                <span
                  class="lesson-teachers"
                  :title="getLessonTeachers(lesson.teachers)"
                  >{{ getLessonTeachers(lesson.teachers) }}</span
                >
                <div class="lesson-header-actions">
                  <Button
                    icon="pi pi-file-word"
                    text
                    rounded
                    size="small"
                    class="mt-1 p-0 w-2rem h-2rem text-primary"
                    :title="APP_CONSTANTS.UI.LABELS.DOWNLOAD_VEDOMOST_TITLE"
                    :loading="downloadingVedomostIds.has(lesson.id)"
                    @click.stop="downloadVedomost(lesson.id)"
                  />
                  <Button
                    icon="pi pi-pencil"
                    text
                    rounded
                    size="small"
                    class="mt-1 p-0 w-2rem h-2rem text-primary"
                    :title="APP_CONSTANTS.UI.LABELS.EDIT_LESSON_TITLE"
                    @click.stop="$emit('edit-lesson', lesson)"
                  />
                </div>
              </div>
            </template>
          </Column>
          <Column
            v-for="i in emptyColumnsCount"
            :key="APP_CONSTANTS.PREFIXES.EMPTY_SUB + i"
            class="lesson-column"
          >
            <template #header>
              <div class="lesson-header-sub empty-header">
                <span class="lesson-time">&nbsp;</span>
                <span class="lesson-topic">&nbsp;</span>
                <span class="lesson-kind">&nbsp;</span>
                <span class="lesson-teachers">&nbsp;</span>
              </div>
            </template>
          </Column>
        </Row>
      </ColumnGroup>

      <Column field="fullName" frozen alignFrozen="left" class="fio-column">
        <template #body="{ data }">
          <template v-if="!data.isEmptyRow">
            <div class="flex-row align-center justify-between gap-2">
              <span class="flex-1 white-space-nowrap overflow-hidden text-overflow-ellipsis">{{ getPersonFullName(data) }}</span>
              <Button
                icon="pi pi-id-card"
                text
                rounded
                size="small"
                class="p-0 w-2rem h-2rem text-primary flex-shrink-0"
                :title="APP_CONSTANTS.UI.LABELS.DOWNLOAD_STUDENT_CARD_TITLE"
                disabled
              />
            </div>
          </template>
          <template v-else> &nbsp; </template>
        </template>
      </Column>

      <Column
        v-for="lesson in filteredLessons"
        :key="lesson.id"
        class="lesson-column"
      >
        <template #body="{ data }">
          <div
            v-if="!data.isEmptyRow"
            class="cell-content"
            :class="{
              'is-absent':
                journalStore.gridMatrix[data.uniqueId]?.[lesson.id]?.isAbsent,
              'is-empty': isEmptyCell(data.uniqueId, lesson.id),
            }"
            :title="APP_CONSTANTS.UI.MESSAGES.DBL_CLICK_HINT"
            @click="handleCellClick(data, lesson)"
            @dblclick="openCellModal(data, lesson)"
            @keydown="onCellKeydown($event, data, lesson)"
          >
            <template v-if="isEditing(data.uniqueId, lesson.id)">
              <AutoComplete
                v-model="inlineMarkValue"
                :suggestions="filteredMarkValues"
                :disabled="isSavingInline"
                @update:modelValue="handleInlineInput($event, data, lesson)"
                @complete="searchMarkValues"
                @item-select="saveInlineMark(data, lesson, $event)"
                @blur="closeInlineEdit"
                @keyup.enter="handleEnter(data, lesson, filteredPersons)"
                @click.stop
                optionLabel="value"
                class="inline-editor"
              />
            </template>
            <template v-else>
              <span
                v-if="
                  journalStore.gridMatrix[data.uniqueId]?.[lesson.id]?.isAbsent
                "
                class="absent-label"
                :title="getAbsentReason(data, lesson)"
              >
                {{
                  getAbsentReason(data, lesson) ||
                  APP_CONSTANTS.UI.LABELS.ABSENT_SHORT
                }}
              </span>
              <div
                v-if="
                  journalStore.gridMatrix[data.uniqueId]?.[lesson.id]?.records
                    ?.length
                "
                class="marks-container"
                :class="{
                  'has-absent':
                    journalStore.gridMatrix[data.uniqueId]?.[lesson.id]
                      ?.isAbsent,
                }"
              >
                <span
                  v-for="(record, idx) in journalStore.gridMatrix[
                    data.uniqueId
                  ]?.[lesson.id]?.records"
                  :key="record.id"
                  class="mark-badge"
                  :class="{ 'is-retake': idx > 0 }"
                >
                  {{ dictsMap.markValues[record.mark_value]?.value }}
                </span>
              </div>
            </template>
          </div>
          <div v-else class="cell-content disabled-cell"></div>
        </template>
      </Column>

      <Column class="summary-column">
        <template #body="{ data }">
          <div v-if="!data.isEmptyRow" class="summary-cell">
            <span v-if="personStats(data.uniqueId).avg != null" class="avg-value"
              >{{ APP_CONSTANTS.UI.LABELS.AVG_SHORT }}
              {{ personStats(data.uniqueId).avg }}</span
            >
            <span v-if="personStats(data.uniqueId).absences > 0" class="absent-label"
              >{{ APP_CONSTANTS.UI.LABELS.ABSENCES_SHORT }}:
              {{ personStats(data.uniqueId).absences }}</span
            >
          </div>
          <div v-else class="cell-content disabled-cell"></div>
        </template>
      </Column>

      <Column
        v-for="i in emptyColumnsCount"
        :key="APP_CONSTANTS.PREFIXES.EMPTY_COL + i"
        class="lesson-column"
      >
        <template #body>
          <div class="cell-content disabled-cell"></div>
        </template>
      </Column>
    </DataTable>

    <div v-if="isSavingInline" class="grid-loading-overlay">
      <div class="spinner-container">
        <i class="pi pi-spin pi-spinner"></i>
        <span>{{ APP_CONSTANTS.UI.MESSAGES.SAVING }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { APP_CONSTANTS } from "../config/constants";
import { formatDate } from "../utils/dateUtils";
import { getPersonFullName, formatTimeShort } from "../utils/journalUtils";
import { calcPersonStats } from "../utils/journalStats";
import { useJournalStore } from "../store/journalStore";
import { useInlineEdit } from "../composables/useInlineEdit";
import { useJournalGrid } from "../composables/useJournalGrid";
import { useNotify } from "../composables/useNotify";
import { JournalService } from "../services/journalService";

const props = defineProps({
  persons: Array,
  lessons: Array,
  recordsMap: Object,
  attendancesMap: Object,
  dictsMap: Object,
  gridMatrix: Object,
  dateFilter: Array,
  nameFilter: String,
  quickFilter: String,
});

const emit = defineEmits([
  "cell-click",
  "update:nameFilter",
  "update:quickFilter",
  "error",
  "edit-lesson",
  "saved",
]);

const journalStore = useJournalStore();
const { notifySuccess } = useNotify();

const {
  inlineMarkValue,
  filteredMarkValues,
  isSavingInline,
  isEditing,
  handleSingleClick,
  openCellModal,
  searchMarkValues,
  saveInlineMark,
  closeInlineEdit,
  handleInlineInput,
  handleInlineKeydown,
  handleEnter,
} = useInlineEdit(props.dictsMap, journalStore, emit);

const { filteredLessons, filteredPersons, groupedLessons, emptyColumnsCount, paddedPersons } =
  useJournalGrid(props);

const quickFilters = computed(() => [
  { key: APP_CONSTANTS.JOURNAL_QUICK_FILTERS.ALL, label: APP_CONSTANTS.UI.LABELS.FILTER_ALL },
  {
    key: APP_CONSTANTS.JOURNAL_QUICK_FILTERS.NO_MARKS,
    label: APP_CONSTANTS.UI.LABELS.FILTER_NO_MARKS,
  },
  {
    key: APP_CONSTANTS.JOURNAL_QUICK_FILTERS.WITH_ABSENCES,
    label: APP_CONSTANTS.UI.LABELS.FILTER_ABSENCES,
  },
  {
    key: APP_CONSTANTS.JOURNAL_QUICK_FILTERS.WITH_RETAKES,
    label: APP_CONSTANTS.UI.LABELS.FILTER_RETAKES,
  },
]);

const personsCounter = computed(() => {
  const shown = (filteredPersons.value || []).length;
  const total = (props.persons || []).length;
  return `${shown} ${APP_CONSTANTS.UI.BREADCRUMB_SEPARATOR} ${total}`;
});

const personStatsCache = computed(() => {
  const cache = {};
  (props.persons || []).forEach((person) => {
    cache[person.uniqueId] = calcPersonStats(
      person.uniqueId,
      filteredLessons.value,
      props.gridMatrix,
      props.dictsMap?.markValues,
    );
  });
  return cache;
});

const personStats = (personUniqueId) =>
  personStatsCache.value[personUniqueId] || { avg: null, absences: 0 };

const isEmptyCell = (personUniqueId, lessonId) => {
  const cell = props.gridMatrix?.[personUniqueId]?.[lessonId];
  return !!cell && !cell.isAbsent && (cell.records || []).length === 0;
};

const onCellKeydown = (event, person, lesson) => {
  if (!isEditing(person.uniqueId, lesson.id)) return;
  handleInlineKeydown(event, person, lesson, filteredPersons.value);
};

const handleCellClick = (data, lesson) => {
  const isAbsent =
    journalStore.gridMatrix[data.uniqueId]?.[lesson.id]?.isAbsent;
  if (isAbsent) {
    openCellModal(data, lesson);
    return;
  }
  handleSingleClick(data, lesson);
};

const getAbsentReason = (data, lesson) =>
  journalStore.gridMatrix[data.uniqueId]?.[lesson.id]?.absentReason || "";

const getLessonTime = (id) => {
  if (!id) return "";

  const time = props.dictsMap.lessonTimes[id];
  if (!time) return "";

  return `${formatTimeShort(time.start_time)} - ${formatTimeShort(time.end_time)}`;
};

const getLessonType = (id) => props.dictsMap.lessonTypes[id]?.name || "";

const getLessonTeachers = (teacherIds) => {
  if (!teacherIds || !teacherIds.length) return "";
  return teacherIds
    .map((id) => {
      const teacher = props.dictsMap.teachers[id];
      return teacher ? getPersonFullName(teacher) : "";
    })
    .filter(Boolean)
    .join(APP_CONSTANTS.FORMATTING.SEPARATOR);
};

const downloadVedomost = async (lessonId) => {
  if (downloadingVedomostIds.value.has(lessonId)) return;
  downloadingVedomostIds.value.add(lessonId);
  try {
    await JournalService.downloadVedomost(lessonId);
    notifySuccess(APP_CONSTANTS.UI.NOTIFY.VEDOMOST_SAVED);
  } catch (error) {
    console.error(APP_CONSTANTS.UI.ERRORS.DOWNLOAD_VEDOMOST, error);
    emit("error", error, APP_CONSTANTS.UI.ERRORS.DOWNLOAD_VEDOMOST);
  } finally {
    downloadingVedomostIds.value.delete(lessonId);
  }
};

const downloadStudentCard = async (lessonId) => {
  try {
    await JournalService.downloadStudentCard(lessonId);
  } catch (error) {
    console.error(APP_CONSTANTS.UI.ERRORS.DOWNLOAD_STUDENT_CARD, error);
    emit("error", error, APP_CONSTANTS.UI.ERRORS.DOWNLOAD_STUDENT_CARD);
  }
};

const downloadingVedomostIds = ref(new Set());
</script>
