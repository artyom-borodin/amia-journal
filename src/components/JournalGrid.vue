<template>
  <div id="journal-scroll-container" class="overflow-auto flex-1 relative">
    <table class="w-max border-collapse table-fixed">
      <thead class="bg-gray-100 sticky top-0 z-20 shadow-sm">
        <tr>
          <th class="border border-gray-300 p-3 text-left text-sm font-bold text-gray-900 sticky left-0 bg-gray-100 z-30 w-72">
            ФИО
          </th>
          <th 
            v-for="lesson in lessons" 
            :key="lesson.id"
            :data-date="lesson.date"
            class="border border-gray-300 p-2 text-center w-32 bg-gray-50"
          >
            <div class="text-sm font-bold text-gray-900">{{ formatDate(lesson.date) }}</div>
            <div class="text-xs font-semibold text-gray-700">{{ getLessonTime(lesson.lesson_time) }}</div>
            <div class="text-xs text-blue-600 mt-1 truncate" :title="lesson.topic">{{ lesson.topic || 'Без темы' }}</div>
            <div class="text-xs text-gray-500 mt-1 truncate" :title="getMarkKind(lesson.mark_kind)">{{ getMarkKind(lesson.mark_kind) }}</div>
          </th>
        </tr>
      </thead>
      <tbody class="bg-white">
        <tr v-for="person in persons" :key="person.id" class="hover:bg-blue-50 transition-colors">
          <td 
            class="border border-gray-200 p-3 text-sm text-gray-900 sticky left-0 bg-white z-10 font-medium shadow-[1px_0_0_0_#e5e7eb] truncate"
            :title="`${person.last_name_rus} ${person.first_name_rus} ${person.patronymic_rus}`"
          >
            {{ person.last_name_rus }} {{ person.first_name_rus }} {{ person.patronymic_rus }}
          </td>
          <td 
            v-for="lesson in lessons" 
            :key="lesson.id"
            class="border border-gray-200 p-2 text-center cursor-pointer relative"
            :class="getCellBgClass(person.id, lesson)"
            @click="$emit('cell-click', { person, lesson })"
          >
            <span class="font-bold text-gray-900">{{ getMarkValue(person.id, lesson) }}</span>
            <span v-if="isAbsent(person.id, lesson)" class="absolute bottom-0 right-1 text-xs text-red-600 font-bold" title="Отсутствует">{{ APP_CONSTANTS.UI.ABSENT_MARK }}</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { APP_CONSTANTS } from '../config/constants';

const props = defineProps({
  persons: Array,
  lessons: Array,
  recordsMap: Object,
  attendancesMap: Object,
  dicts: Object
});

defineEmits(['cell-click']);

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const getLessonTime = (id) => {
  const time = props.dicts.lessonTimes.find(t => t.id === id);
  return time ? `${time.number} ${APP_CONSTANTS.UI.LESSON_SUFFIX}` : '';
};

const getMarkKind = (id) => props.dicts.markKinds.find(m => m.id === id)?.mark_kind || '';

const getRecord = (personId, lesson) => props.recordsMap[`${personId}_${lesson.date}_${lesson.lesson_time}`];
const getAttendance = (personId, lesson) => props.attendancesMap[`${personId}_${lesson.date}_${lesson.lesson_time}`];

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

const getCellBgClass = (personId, lesson) => {
  return isAbsent(personId, lesson) ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-blue-100';
};
</script>