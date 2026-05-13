<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
      <h3 class="text-lg font-bold mb-4 border-b pb-2">
        {{ person.last_name_rus }} {{ person.first_name_rus }}
      </h3>
      
      <form @submit.prevent="handleSave" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Посещаемость</label>
          <select v-model="formData.reason" class="w-full border-gray-300 rounded-md shadow-sm p-2 border">
            <option :value="null">{{ APP_CONSTANTS.UI.DEFAULT_ATTENDANCE }}</option>
            <option v-for="r in dicts.attendanceReasons" :key="r.id" :value="r.id">{{ r.name }}</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Отметка</label>
          <select v-model="formData.mark_value" class="w-full border-gray-300 rounded-md shadow-sm p-2 border">
            <option :value="null">{{ APP_CONSTANTS.UI.DEFAULT_MARK }}</option>
            <option v-for="m in dicts.markValues" :key="m.id" :value="m.id">{{ m.value }}</option>
          </select>
        </div>

        <div class="flex justify-end space-x-3 mt-6">
          <button type="button" @click="$emit('close')" class="px-4 py-2 border rounded-md text-gray-700">Отмена</button>
          <button type="submit" :disabled="isSaving" class="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50">
            {{ isSaving ? 'Сохранение...' : 'Сохранить' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { APP_CONSTANTS } from '../config/constants';

const props = defineProps({
  person: Object,
  lesson: Object,
  record: Object,
  attendance: Object,
  dicts: Object,
  isSaving: Boolean
});

const emit = defineEmits(['close', 'save']);

const formData = ref({
  reason: props.attendance ? props.attendance.reason : null,
  mark_value: props.record ? props.record.mark_value : null
});

const handleSave = () => {
  emit('save', {
    reason: formData.value.reason,
    mark_value: formData.value.mark_value
  });
};
</script>