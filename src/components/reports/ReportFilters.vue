<template>
  <Card class="report-filters-card">
    <template #content>
      <form @submit.prevent="onSubmit" class="filters-grid">
        <div class="field">
          <label>{{ APP_CONSTANTS.UI.LABELS.SEMESTER }}</label>
          <Select
            v-model="selectedSemester"
            :options="semesters"
            optionLabel="semester"
            :placeholder="APP_CONSTANTS.UI.PLACEHOLDERS.SELECT_SEMESTER"
            showClear
            @change="onSemesterChange"
            class="w-full"
          >
            <template #option="slotProps">
              {{ slotProps.option.year }} - {{ slotProps.option.semester }}
            </template>
          </Select>
        </div>

        <div class="field">
          <label>{{ APP_CONSTANTS.UI.LABELS.DATE_RANGE }}</label>
          <DatePicker
            v-model="filters.dates"
            selectionMode="range"
            :manualInput="false"
            showIcon
            class="w-full"
          />
        </div>

        <div class="field">
          <label>{{ APP_CONSTANTS.UI.LABELS.GROUP }}</label>
          <Select
            v-model="filters.group"
            :options="dicts.groups"
            optionLabel="group_name"
            optionValue="id"
            filter
            showClear
            :placeholder="APP_CONSTANTS.UI.PLACEHOLDERS.SELECT_GROUP"
            class="w-full"
          />
        </div>

        <div class="field">
          <label>{{ APP_CONSTANTS.UI.LABELS.SUBJECT }}</label>
          <Select
            v-model="filters.subject"
            :options="dicts.subjects"
            optionLabel="subject_name"
            optionValue="id"
            filter
            showClear
            :placeholder="APP_CONSTANTS.UI.PLACEHOLDERS.SELECT_SUBJECT"
            class="w-full"
          />
        </div>

        <div class="field">
          <label>{{ APP_CONSTANTS.UI.LABELS.TEACHER }}</label>
          <Select
            v-model="filters.teacher"
            :options="dicts.teachers"
            optionLabel="username"
            optionValue="id"
            filter
            showClear
            :placeholder="APP_CONSTANTS.UI.PLACEHOLDERS.SELECT_TEACHER"
            class="w-full"
          >
            <template #option="slotProps">
              {{ getPersonFullName(slotProps.option) }}
            </template>
          </Select>
        </div>

        <div class="field">
          <label>{{ APP_CONSTANTS.UI.LABELS.MARK_VALUE }}</label>
          <Select
            v-model="filters.markValue"
            :options="dicts.markValues"
            optionLabel="value"
            optionValue="id"
            showClear
            :placeholder="APP_CONSTANTS.UI.PLACEHOLDERS.SELECT_MARK"
            class="w-full"
          />
        </div>

        <div class="field">
          <label>{{ APP_CONSTANTS.UI.LABELS.ATTENDANCE_REASONS }}</label>
          <Select
            v-model="filters.reason"
            :options="dicts.attendanceReasons"
            optionLabel="name"
            optionValue="id"
            showClear
            :placeholder="APP_CONSTANTS.UI.PLACEHOLDERS.SELECT_REASON"
            class="w-full"
          />
        </div>

        <div class="filter-actions">
          <Button
            type="submit"
            :label="APP_CONSTANTS.UI.LABELS.GENERATE_REPORT"
            icon="pi pi-chart-bar"
            :loading="isLoading"
            class="w-full"
          />
        </div>
      </form>
    </template>
  </Card>
</template>

<script setup>
import { ref, reactive } from "vue";
import { APP_CONSTANTS } from "../../config/constants";
import { getPersonFullName } from "../../utils/journalUtils";
import { toApiDate } from "../../utils/dateUtils";

const props = defineProps({
  dicts: Object,
  semesters: Array,
  isLoading: Boolean,
});

const emit = defineEmits(["generate"]);

const selectedSemester = ref(null);

const filters = reactive({
  dates: null,
  group: null,
  subject: null,
  teacher: null,
  student: null,
  markValue: null,
  reason: null,
});

const onSemesterChange = () => {
  if (selectedSemester.value) {
    filters.dates = [
      new Date(selectedSemester.value.start_date),
      new Date(selectedSemester.value.end_date),
    ];
  } else {
    filters.dates = null;
  }
};

const onSubmit = () => {
  const formattedFilters = { ...filters };
  if (filters.dates && filters.dates.length === 2) {
    formattedFilters.dates = [
      filters.dates[0] ? toApiDate(filters.dates[0]) : null,
      filters.dates[1] ? toApiDate(filters.dates[1]) : null,
    ];
  }
  emit("generate", formattedFilters);
};
</script>
