<template>
  <DataTable 
    :value="persons" 
    scrollable 
    scrollHeight="flex" 
    class="journal-table"
    showGridlines
    size="small"
  >
    <Column field="fullName" header="ФИО" frozen alignFrozen="left" class="fio-column">
      <template #body="{ data }">
        {{ data.last_name_rus }} {{ data.first_name_rus }} {{ data.patronymic_rus }}
      </template>
    </Column>
    
    <Column v-for="lesson in lessons" :key="lesson.id" class="lesson-column">
      <template #header>
        <div class="lesson-header">
          <span class="lesson-date">{{ formatDate(lesson.date) }}</span>
          <span class="lesson-time">{{ getLessonTime(lesson.lesson_time) }}</span>
          <span class="lesson-topic" :title="lesson.topic">{{ lesson.topic || APP_CONSTANTS.UI.NO_TOPIC }}</span>
          <span class="lesson-kind" :title="getMarkKind(lesson.mark_kind)">{{ getMarkKind(lesson.mark_kind) }}</span>
        </div>
      </template>
      <template #body="{ data }">
        <div 
          class="cell-content" 
          :class="{ 'is-absent': isAbsent(data.id, lesson) }" 
          @click="$emit('cell-click', { person: data, lesson })"
        >
          <span class="mark-value">{{ getMarkValue(data.id, lesson) }}</span>
          <span v-if="isAbsent(data.id, lesson)" class="absent-mark" title="Отсутствует">
            {{ APP_CONSTANTS.UI.ABSENT_MARK }}
          </span>
        </div>
      </template>
    </Column>
  </DataTable>
</template>

<script setup>
import { APP_CONSTANTS } from '../config/constants';
import { formatDate } from '../utils/dateUtils';
import { generateCellKey } from '../utils/journalUtils';

const props = defineProps({
  persons: Array,
  lessons: Array,
  recordsMap: Object,
  attendancesMap: Object,
  dicts: Object
});

defineEmits(['cell-click']);

const getLessonTime = (id) => {
  const time = props.dicts.lessonTimes.find(t => t.id === id);
  return time ? `${time.number} ${APP_CONSTANTS.UI.LESSON_SUFFIX}` : '';
};

const getMarkKind = (id) => props.dicts.markKinds.find(m => m.id === id)?.mark_kind || '';

const getRecord = (personId, lesson) => props.recordsMap[generateCellKey(personId, lesson.date, lesson.lesson_time)];
const getAttendance = (personId, lesson) => props.attendancesMap[generateCellKey(personId, lesson.date, lesson.lesson_time)];

const getMarkValue = (personId, lesson) => {
  const record = getRecord(personId, lesson);
  if (!record || !record.mark_value) return '';
  return props.dicts.markValues.find(m => m.id === record.mark_value)?.value || '';
};

const isAbsent = (personId, lesson) => {
  const att = getAttendance(personId, lesson);
  if (!att) return false;
  const reason = props.dicts.attendanceReasons.find(r => r.id === att.reason);
  return reason ? reason.is_absent : false;
};
</script>