<template>
  <div class="attendance-filters flex-row gap-4 align-end flex-shrink-0">
    <div class="field">
      <label>{{ APP_CONSTANTS.UI.LABELS.GROUP }}</label>
      <Select
        :modelValue="group"
        @update:modelValue="$emit('update:group', $event)"
        :options="groups"
        optionLabel="group_name"
        optionValue="id"
        filter
        showClear
        :placeholder="APP_CONSTANTS.UI.PLACEHOLDERS.SELECT_GROUP"
        class="w-full"
      />
    </div>
    <div class="field">
      <label>{{ APP_CONSTANTS.UI.LABELS.PERIOD }}</label>
      <DatePicker
        :modelValue="period"
        @update:modelValue="$emit('update:period', $event)"
        selectionMode="range"
        showIcon
        :dateFormat="APP_CONSTANTS.LOCALE_CONFIG.dateFormat"
        class="w-full"
      />
    </div>
    <div class="field">
      <label>{{ APP_CONSTANTS.UI.LABELS.SEARCH_BY_NAME }}</label>
      <InputText
        :modelValue="nameFilter"
        @update:modelValue="$emit('update:nameFilter', $event)"
        :placeholder="APP_CONSTANTS.UI.PLACEHOLDERS.SEARCH_BY_NAME"
        class="w-full"
      />
    </div>
  </div>
</template>

<script setup>
import Select from "primevue/select";
import DatePicker from "primevue/datepicker";
import InputText from "primevue/inputtext";
import { APP_CONSTANTS } from "../../config/constants";

defineProps({
  group: Number,
  period: Array,
  nameFilter: String,
  groups: Array,
});

defineEmits(["update:group", "update:period", "update:nameFilter"]);
</script>
