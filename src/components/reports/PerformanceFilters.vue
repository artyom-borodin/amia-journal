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
          <label>{{ APP_CONSTANTS.UI.LABELS.FACULTY }}</label>
          <Select
            v-model="filters.faculty"
            :options="dicts.faculties"
            optionLabel="subdivision_name"
            optionValue="id"
            filter
            showClear
            :placeholder="APP_CONSTANTS.UI.PLACEHOLDERS.SELECT_FACULTY"
            class="w-full"
          />
        </div>

        <div class="field">
          <label>{{ APP_CONSTANTS.UI.LABELS.SPECIALTY }}</label>
          <Select
            v-model="filters.specialty"
            :options="dicts.specialties"
            optionLabel="speciality_name"
            optionValue="id"
            filter
            showClear
            :placeholder="APP_CONSTANTS.UI.PLACEHOLDERS.SELECT_SPECIALTY"
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
          <label>{{ APP_CONSTANTS.UI.LABELS.STUDENT }}</label>
          <Select
            v-model="filters.student"
            :options="students"
            optionLabel="displayName"
            optionValue="id"
            filter
            showClear
            :loading="isStudentsLoading"
            :placeholder="APP_CONSTANTS.UI.PLACEHOLDERS.SELECT_STUDENT"
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
          <label>{{ APP_CONSTANTS.UI.LABELS.LESSON_TYPE }}</label>
          <Select
            v-model="filters.lessonType"
            :options="dicts.lessonTypes"
            optionLabel="name"
            optionValue="id"
            showClear
            :placeholder="APP_CONSTANTS.UI.PLACEHOLDERS.SELECT_LESSON_TYPE"
            class="w-full"
          />
        </div>

        <div class="field">
          <label>{{ APP_CONSTANTS.UI.LABELS.MARK_KIND }}</label>
          <Select
            v-model="filters.markKind"
            :options="dicts.markKinds"
            optionLabel="mark_kind"
            optionValue="id"
            showClear
            :placeholder="APP_CONSTANTS.UI.PLACEHOLDERS.SELECT_MARK_KIND"
            class="w-full"
          />
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

        <div class="filter-actions">
          <Button
            type="submit"
            :label="APP_CONSTANTS.UI.LABELS.GENERATE_REPORT"
            icon="pi pi-table"
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
import { toApiDate } from "../../utils/dateUtils";
import { useStudentFilter } from "../../composables/useStudentFilter";

defineProps({
  dicts: Object,
  semesters: Array,
  isLoading: Boolean,
});

const emit = defineEmits(["generate"]);

const selectedSemester = ref(null);

const filters = reactive({
  dates: null,
  semester: null,
  faculty: null,
  specialty: null,
  group: null,
  student: null,
  subject: null,
  lessonType: null,
  markKind: null,
  markValue: null,
});

const { students, isStudentsLoading } = useStudentFilter(filters);

const onSemesterChange = () => {
  if (selectedSemester.value) {
    filters.semester = selectedSemester.value.id;
    filters.dates = [
      new Date(selectedSemester.value.start_date),
      new Date(selectedSemester.value.end_date),
    ];
  } else {
    filters.semester = null;
    filters.dates = null;
  }
};

const onSubmit = () => {
  const formattedFilters = { ...filters };
  if (
    filters.dates &&
    filters.dates.length === APP_CONSTANTS.RULES.DATE_RANGE_LENGTH
  ) {
    formattedFilters.dates = [
      filters.dates[0] ? toApiDate(filters.dates[0]) : null,
      filters.dates[1] ? toApiDate(filters.dates[1]) : null,
    ];
  }
  emit("generate", formattedFilters);
};
</script>
