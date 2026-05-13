<template>
  <Dialog 
    :visible="visible" 
    modal 
    :header="headerTitle" 
    class="cell-modal"
    @update:visible="$emit('update:visible', $event)"
  >
    <form @submit.prevent="handleSave" class="form-layout">
      <div class="field">
        <label>{{ APP_CONSTANTS.UI.LABELS.ATTENDANCE }}</label>
        <Select 
          v-model="formData.reason" 
          :options="dicts.attendanceReasons" 
          optionLabel="name" 
          optionValue="id" 
          :placeholder="APP_CONSTANTS.UI.DEFAULT_ATTENDANCE" 
          class="w-full" 
          showClear 
        />
      </div>

      <div class="field">
        <label>{{ APP_CONSTANTS.UI.LABELS.MARK }}</label>
        <Select 
          v-model="formData.mark_value" 
          :options="dicts.markValues" 
          optionLabel="value" 
          optionValue="id" 
          :placeholder="APP_CONSTANTS.UI.DEFAULT_MARK" 
          class="w-full" 
          showClear 
        />
      </div>

      <div class="dialog-footer">
        <Button :label="APP_CONSTANTS.UI.LABELS.CANCEL" icon="pi pi-times" text severity="secondary" @click="$emit('update:visible', false)" />
        <Button type="submit" :label="APP_CONSTANTS.UI.LABELS.SAVE" icon="pi pi-check" :loading="isSaving" />
      </div>
    </form>
  </Dialog>
</template>

<script setup>
import { ref, computed } from 'vue';
import { APP_CONSTANTS } from '../config/constants';

const props = defineProps({
  visible: Boolean,
  person: Object,
  lesson: Object,
  record: Object,
  attendance: Object,
  dicts: Object,
  isSaving: Boolean
});

const emit = defineEmits(['update:visible', 'save']);

const headerTitle = computed(() => {
  if (!props.person) return '';
  return `${props.person.last_name_rus} ${props.person.first_name_rus}`;
});

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