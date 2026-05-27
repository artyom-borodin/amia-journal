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

    <Column v-for="lesson in filteredLessons" :key="lesson.id" class="lesson-column">
      <template #body="{ data }">
        <div
          v-if="!data.isEmptyRow"
          class="cell-content"
          :class="{
            'is-absent': journalStore.gridMatrix[data.id]?.[lesson.id]?.isAbsent,
          }"
          @click="handleSingleClick(data, lesson)"
          @dblclick="openCellModal(data, lesson)"
        >
          <template v-if="isEditing(data.id, lesson.id)">
            <AutoComplete
              v-model="inlineMarkValue"
              :suggestions="filteredMarkValues"
              :disabled="isSavingInline"
              @complete="searchMarkValues"
              @item-select="saveInlineMark(data, lesson)"
              @blur="closeInlineEdit"
              @keyup.enter="saveInlineMark(data, lesson)"
              @click.stop
              optionLabel="value"
              class="inline-editor"
            />
          </template>
          <template v-else>
            <div class="marks-container">
              <span
                v-for="(record, idx) in journalStore.gridMatrix[data.id]?.[lesson.id]?.records"
                :key="record.id"
                class="mark-badge"
                :class="{'is-retake': idx > 0}"
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
</template>

<script setup>
import { ref, computed, nextTick } from "vue";
import { APP_CONSTANTS } from "../config/constants";
import { formatDate } from "../utils/dateUtils";
import { getPersonFullName, generateCellKey } from "../utils/journalUtils";
import { useJournalStore } from "../store/journalStore";

const props = defineProps({
  persons: Array,
  lessons: Array,
  recordsMap: Object,
  attendancesMap: Object,
  dictsMap: Object,
  dateFilter: Array,
  nameFilter: String,
});

const emit = defineEmits(["cell-click"]);

const journalStore = useJournalStore();

const filteredLessons = computed(() => {
  let list = props.lessons || [];
  if (props.dateFilter && props.dateFilter[0]) {
    const start = new Date(props.dateFilter[0]);
    start.setHours(0, 0, 0, 0);
    const end = props.dateFilter[1] ? new Date(props.dateFilter[1]) : new Date(start);
    end.setHours(23, 59, 59, 999);
    
    list = list.filter(l => {
      const d = new Date(l.date);
      return d >= start && d <= end;
    });
  }
  return list;
});

const filteredPersons = computed(() => {
  let list = props.persons || [];
  if (props.nameFilter) {
    const q = props.nameFilter.toLowerCase();
    list = list.filter(p => getPersonFullName(p).toLowerCase().includes(q));
  }
  return list;
});

const groupedLessons = computed(() => {
  const groups = [];
  let currentGroup = null;

  filteredLessons.value.forEach((lesson) => {
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
  const currentLessons = filteredLessons.value.length || 0;
  return Math.max(0, APP_CONSTANTS.GRID.MIN_COLUMNS - currentLessons);
});

const paddedPersons = computed(() => {
  const realPersons = filteredPersons.value || [];
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

const editingCell = ref(null);
const inlineMarkValue = ref('');
const filteredMarkValues = ref([]);
const isSavingInline = ref(false);
let clickTimer = null;

const isEditing = (personId, lessonId) => {
  return editingCell.value?.personId === personId && editingCell.value?.lessonId === lessonId;
};

const handleSingleClick = (person, lesson) => {
  if (isEditing(person.id, lesson.id)) return;

  if (clickTimer) clearTimeout(clickTimer);
  
  clickTimer = setTimeout(async () => {
    editingCell.value = { personId: person.id, lessonId: lesson.id };
    inlineMarkValue.value = '';
    
    await nextTick();
    const inputElement = document.querySelector('.inline-editor input');
    if (inputElement) {
      inputElement.focus();
    }
  }, 250);
};

const openCellModal = (person, lesson) => {
  if (clickTimer) clearTimeout(clickTimer);
  editingCell.value = null;
  emit('cell-click', { person, lesson });
};

const searchMarkValues = (event) => {
  const query = event.query.toLowerCase();
  filteredMarkValues.value = Object.values(props.dictsMap.markValues)
    .filter(m => m.value.toLowerCase().includes(query));
};

const saveInlineMark = async (person, lesson) => {
  if (isSavingInline.value) return;

  let markObj = inlineMarkValue.value;
  if (!markObj) {
    editingCell.value = null;
    return;
  }

  if (typeof markObj === 'string') {
    const query = markObj.toLowerCase().trim();
    markObj = Object.values(props.dictsMap.markValues).find(m => m.value.toLowerCase() === query)
           || Object.values(props.dictsMap.markValues).find(m => m.value.toLowerCase().startsWith(query));
  }
  
  if (markObj && markObj.id) {
    isSavingInline.value = true;
    const existingRecords = journalStore.gridMatrix[person.id]?.[lesson.id]?.records || [];
    const marks = [...existingRecords];
    
    if (marks.length > 0) {
      marks[0].mark_value = markObj.id;
    } else {
      marks.push({ mark_value: markObj.id });
    }
    
    try {
      await journalStore.saveCellData({
        person, 
        lesson, 
        marks,
        reason: journalStore.attendancesMap[generateCellKey(person.id, lesson.date, lesson.lesson_time)]?.reason
      });
    } catch (err) {
      console.error("Ошибка при сохранении:", err);
    } finally {
      isSavingInline.value = false;
      editingCell.value = null;
    }
  } else {
    editingCell.value = null;
  }
};

const closeInlineEdit = () => {
  setTimeout(() => {
    if (!isSavingInline.value) {
      editingCell.value = null;
    }
  }, 150);
};
</script>