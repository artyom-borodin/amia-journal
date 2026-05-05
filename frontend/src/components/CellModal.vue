<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
      <h3 class="text-lg font-bold mb-4 border-b pb-2">
        Редактировать запись: {{ student.name }}
      </h3>
      
      <form @submit.prevent="handleSave" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Тип занятия</label>
          <select v-model="formData.lessonType" class="w-full border-gray-300 rounded-md shadow-sm p-2 border">
            <option :value="null">Не уточнено</option>
            <option v-for="type in APP_CONSTANTS.ENUMS.LESSON_TYPES" :key="type" :value="type">
              {{ type }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Присутствие</label>
          <select v-model="formData.absenceReason" class="w-full border-gray-300 rounded-md shadow-sm p-2 border">
            <option v-for="reason in APP_CONSTANTS.ENUMS.ABSENCE_REASONS" :key="reason" :value="reason">
              {{ reason }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Отметка</label>
          <select 
            v-model="formData.mark" 
            :disabled="isStarosta"
            class="w-full border-gray-300 rounded-md shadow-sm p-2 border disabled:bg-gray-100 disabled:text-gray-500"
          >
            <option value="">Нет отметки</option>
            <option v-for="mark in APP_CONSTANTS.ENUMS.MARKS" :key="mark" :value="mark">
              {{ mark }}
            </option>
          </select>
          <p v-if="isStarosta" class="text-xs text-red-500 mt-1">Староста не может редактировать отметки.</p>
        </div>

        <div class="flex justify-end space-x-3 mt-6">
          <button 
            type="button" 
            @click="$emit('close')"
            class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            type="submit"
            class="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
          >
            Сохранить
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { APP_CONSTANTS } from '../config/constants';

const props = defineProps({
  student: Object,
  lesson: Object,
  currentMark: String,
  currentAttendance: String,
  userRole: String
});

const emit = defineEmits(['close', 'save']);

const isStarosta = computed(() => props.userRole === APP_CONSTANTS.ROLES.STAROSTA);

const formData = ref({
  lessonType: props.lesson.lesson_type || null,
  absenceReason: props.currentAttendance || APP_CONSTANTS.DEFAULT_ATTENDANCE,
  mark: props.currentMark || ''
});

const handleSave = () => {
  emit('save', {
    lessonId: props.lesson.id,
    studentId: props.student.id,
    lessonType: formData.value.lessonType,
    absenceReason: formData.value.absenceReason,
    mark: isStarosta.value ? undefined : formData.value.mark
  });
};
</script>