<template>
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
        <Column
          :header="APP_CONSTANTS.UI.LABELS.FULL_NAME"
          :rowspan="2"
          frozen
          alignFrozen="left"
          class="fio-column"
        />
        <Column
          v-for="group in groupedLessons"
          :key="group.date"
          :colspan="group.count"
          class="date-group-header"
        >
          <template #header>
            <div class="date-header-content">{{ formatDate(group.date) }}</div>
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
          v-for="lesson in lessons"
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

    <Column v-for="lesson in lessons" :key="lesson.id" class="lesson-column">
      <template #body="{ data }">
        <div
          v-if="!data.isEmptyRow"
          class="cell-content"
          :class="{
            'is-absent':
              journalStore.gridMatrix[data.id]?.[lesson.id]?.isAbsent,
          }"
          @click="$emit('cell-click', { person: data, lesson })"
        >
          <div class="marks-container">
            <span
              v-for="record in journalStore.gridMatrix[data.id]?.[lesson.id]
                ?.records"
              :key="record.id"
              class="mark-badge"
            >
              {{ dictsMap.markValues[record.mark_value]?.value }}
            </span>
          </div>
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
</template>

<script setup>
import { computed } from "vue";
import { APP_CONSTANTS } from "../config/constants";
import { formatDate } from "../utils/dateUtils";
import { getPersonFullName } from "../utils/journalUtils";
import { useJournalStore } from "../store/journalStore";

const props = defineProps({
  persons: Array,
  lessons: Array,
  recordsMap: Object,
  attendancesMap: Object,
  dictsMap: Object,
});

defineEmits(["cell-click"]);

const journalStore = useJournalStore();

const groupedLessons = computed(() => {
  const groups = [];
  let currentGroup = null;

  props.lessons?.forEach((lesson) => {
    if (!currentGroup || currentGroup.date !== lesson.date) {
      if (currentGroup) groups.push(currentGroup);
      currentGroup = { date: lesson.date, count: 1 };
    } else {
      currentGroup.count++;
    }
  });
  if (currentGroup) groups.push(currentGroup);

  return groups;
});

const emptyColumnsCount = computed(() => {
  const currentLessons = props.lessons?.length || 0;
  return Math.max(0, APP_CONSTANTS.GRID.MIN_COLUMNS - currentLessons);
});

const paddedPersons = computed(() => {
  const realPersons = props.persons || [];
  const emptyRowsCount = Math.max(
    0,
    APP_CONSTANTS.GRID.MIN_ROWS - realPersons.length,
  );

  const emptyRows = Array.from({ length: emptyRowsCount }, (_, i) => ({
    id: `${APP_CONSTANTS.PREFIXES.EMPTY_ROW}${i}`,
    isEmptyRow: true,
  }));

  return [...realPersons, ...emptyRows];
});

const getLessonTime = (id) => {
  const time = props.dictsMap.lessonTimes[id];
  return time ? `${time.number} ${APP_CONSTANTS.UI.LESSON_SUFFIX}` : "";
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
</script>
