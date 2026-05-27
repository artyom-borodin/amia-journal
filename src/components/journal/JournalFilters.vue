<template>
  <Card class="filters-card">
    <template #content>
      <div class="filters-row">
        <div class="filter-item">
          <label>{{ APP_CONSTANTS.UI.LABELS.GROUP }}</label>
          <Select
            :modelValue="group"
            @update:modelValue="$emit('update:group', $event)"
            :options="groups"
            optionLabel="group_name"
            optionValue="id"
            filter
            :placeholder="APP_CONSTANTS.UI.PLACEHOLDERS.SELECT_GROUP"
            class="w-full"
          />
        </div>
        <div class="filter-item">
          <label>{{ APP_CONSTANTS.UI.LABELS.SUBJECT }}</label>
          <Select
            :modelValue="subject"
            @update:modelValue="$emit('update:subject', $event)"
            :options="subjects"
            optionLabel="subject_name"
            optionValue="id"
            filter
            :placeholder="APP_CONSTANTS.UI.PLACEHOLDERS.SELECT_SUBJECT"
            class="w-full"
          />
        </div>
        <div class="filter-action">
          <Button
            v-if="group && subject"
            :label="APP_CONSTANTS.UI.LABELS.ADD_LESSON"
            icon="pi pi-plus"
            severity="success"
            class="w-full"
            @click="$emit('add-lesson')"
          />
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup>
import { APP_CONSTANTS } from "../../config/constants";

defineProps({
  group: Number,
  subject: Number,
  groups: Array,
  subjects: Array
});

defineEmits([
  'update:group', 
  'update:subject', 
  'add-lesson'
]);
</script>