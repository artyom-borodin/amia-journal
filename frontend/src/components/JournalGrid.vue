<template>
  <div class="bg-white shadow rounded-lg overflow-hidden">
    <div class="overflow-x-auto">
      <table class="min-w-full border-collapse">
        <thead class="bg-gray-50">
          <tr>
            <th class="border-b border-r border-gray-200 p-3 text-left text-sm font-semibold text-gray-900 sticky left-0 bg-gray-50 z-10 min-w-[200px]">
              Имя обучающегося
            </th>
            <th 
              v-for="lesson in lessons" 
              :key="lesson.id"
              class="border-b border-r border-gray-200 p-2 text-center min-w-[100px]"
            >
              <div class="text-sm font-medium text-gray-900">{{ formatHeaderDate(lesson.date) }}</div>
              <div class="text-xs text-gray-500">№ з. {{ lesson.lesson_number }}</div>
              <div class="text-xs text-blue-600 truncate" :title="lesson.lesson_type">
                {{ lesson.lesson_type || '-' }}
              </div>
            </th>
          </tr>
        </thead>
        <tbody class="bg-white">
          <tr v-for="student in students" :key="student.id" class="hover:bg-gray-50">
            <td class="border-b border-r border-gray-200 p-3 text-sm text-gray-900 sticky left-0 bg-white z-10 font-medium">
              {{ student.name }}
            </td>
            <td 
              v-for="lesson in lessons" 
              :key="lesson.id"
              class="border-b border-r border-gray-200 p-2 text-center cursor-pointer transition-colors relative"
              :class="getCellClass(student.id, lesson.id)"
              @click="handleCellClick(student, lesson)"
            >
              <span class="font-semibold">{{ getMark(student.id, lesson.id) }}</span>
              <span 
                v-if="isAbsent(student.id, lesson.id)" 
                class="absolute bottom-0 right-1 text-[10px] text-red-600 font-bold"
                title="Absent"
              >
                О
              </span>
            </td>
          </tr>
          <tr v-if="students.length === 0">
            <td :colspan="lessons.length + 1" class="p-4 text-center text-gray-500">
              Нет данных за этот период.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <CellModal 
      v-if="selectedCell"
      :student="selectedCell.student"
      :lesson="selectedCell.lesson"
      :current-mark="getMark(selectedCell.student.id, selectedCell.lesson.id)"
      :current-attendance="getAttendance(selectedCell.student.id, selectedCell.lesson.id)"
      :user-role="userRole"
      @close="selectedCell = null"
      @save="onSaveCell"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import CellModal from './CellModal.vue';
import { DateUtils } from '../utils/dateUtils';
import { APP_CONSTANTS } from '../config/constants';

const props = defineProps({
  students: { type: Array, required: true },
  lessons: { type: Array, required: true },
  marks: { type: Array, required: true },
  attendance: { type: Array, required: true },
  userRole: { type: String, required: true }
});

const emit = defineEmits(['update-cell']);

const selectedCell = ref(null);

const formatHeaderDate = (dateStr) => DateUtils.formatShortDate(dateStr);

const getMarkRecord = (studentId, lessonId) => {
  return props.marks.find(m => m.student_id === studentId && m.lesson_id === lessonId);
};

const getAttendanceRecord = (studentId, lessonId) => {
  return props.attendance.find(a => a.student_id === studentId && a.lesson_id === lessonId);
};

const getMark = (studentId, lessonId) => {
  const record = getMarkRecord(studentId, lessonId);
  return record ? record.mark : '';
};

const getAttendance = (studentId, lessonId) => {
  const record = getAttendanceRecord(studentId, lessonId);
  return record ? record.absence_reason : APP_CONSTANTS.DEFAULT_ATTENDANCE;
};

const isAbsent = (studentId, lessonId) => {
  const reason = getAttendance(studentId, lessonId);
  return reason !== APP_CONSTANTS.DEFAULT_ATTENDANCE;
};

const getCellClass = (studentId, lessonId) => {
  if (isAbsent(studentId, lessonId)) {
    return 'bg-red-50 hover:bg-red-100';
  }
  return 'hover:bg-blue-50';
};

const handleCellClick = (student, lesson) => {
  selectedCell.value = { student, lesson };
};

const onSaveCell = (payload) => {
  emit('update-cell', payload);
  selectedCell.value = null;
};
</script>