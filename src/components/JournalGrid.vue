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
                <Button
                  icon="pi pi-file-word"
                  text
                  rounded
                  size="small"
                  class="mt-1 p-0 w-2rem h-2rem text-primary"
                  title="Скачать ведомость"
                  @click.stop="downloadVedomost(lesson.id)"
                />
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
            {{ getPersonFullName(data) }}
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
            }"
            title="Быстро нажмите два раза чтобы увидеть расширенную информацию"
            @click="handleCellClick(data, lesson)"
            @dblclick="openCellModal(data, lesson)"
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
                @keyup.enter="handleEnter(data, lesson)"
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
              >
                отсутств.
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
import { APP_CONSTANTS } from "../config/constants";
import { formatDate } from "../utils/dateUtils";
import { getPersonFullName } from "../utils/journalUtils";
import { useJournalStore } from "../store/journalStore";
import { useInlineEdit } from "../composables/useInlineEdit";
import { useJournalGrid } from "../composables/useJournalGrid";
import { JournalService } from "../services/journalService";

const props = defineProps({
  persons: Array,
  lessons: Array,
  recordsMap: Object,
  attendancesMap: Object,
  dictsMap: Object,
  dateFilter: Array,
  nameFilter: String,
});

const emit = defineEmits(["cell-click", "update:nameFilter", "error"]);

const journalStore = useJournalStore();

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
  handleEnter,
} = useInlineEdit(props.dictsMap, journalStore, emit);

const { filteredLessons, groupedLessons, emptyColumnsCount, paddedPersons } =
  useJournalGrid(props);

const handleCellClick = (data, lesson) => {
  const isAbsent =
    journalStore.gridMatrix[data.uniqueId]?.[lesson.id]?.isAbsent;
  if (isAbsent) return;
  handleSingleClick(data, lesson);
};

const getLessonTime = (id) => {
  if (!id) return "";

  const time = props.dictsMap.lessonTimes[id];
  if (!time) return "";

  const start = time.start_time ? time.start_time.substring(0, 5) : "";
  const end = time.end_time ? time.end_time.substring(0, 5) : "";

  return `${start} - ${end}`;
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
  try {
    await JournalService.downloadVedomost(lessonId);
  } catch (error) {
    console.error("Ошибка при скачивании ведомости", error);
    emit("error", error, APP_CONSTANTS.UI.ERRORS.DOWNLOAD_VEDOMOST);
  }
};
</script>
