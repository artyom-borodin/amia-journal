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
              {{
                dictionaryStore.dictsMap.years[slotProps.option.year]?.year_str
              }}
              - {{ slotProps.option.semester }}
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
          <MultiSelect
            v-model="filters.faculty"
            :options="filteredFaculties"
            optionLabel="subdivision_name"
            optionValue="id"
            filter
            display="chip"
            :placeholder="APP_CONSTANTS.UI.PLACEHOLDERS.SELECT_FACULTY"
            class="w-full"
          />
        </div>

        <div class="field">
          <label>{{ APP_CONSTANTS.UI.LABELS.SPECIALTY }}</label>
          <MultiSelect
            v-model="filters.specialty"
            :options="filteredSpecialties"
            optionLabel="displayName"
            optionValue="id"
            filter
            display="chip"
            :placeholder="APP_CONSTANTS.UI.PLACEHOLDERS.SELECT_SPECIALTY"
            class="w-full"
          />
        </div>

        <div class="field">
          <label>{{ APP_CONSTANTS.UI.LABELS.GROUP }}</label>
          <MultiSelect
            v-model="filters.group"
            :options="dicts.groups"
            optionLabel="group_name"
            optionValue="id"
            filter
            display="chip"
            :placeholder="APP_CONSTANTS.UI.PLACEHOLDERS.SELECT_GROUP"
            class="w-full"
          />
        </div>

        <div class="field">
          <label>{{ APP_CONSTANTS.UI.LABELS.STUDENT }}</label>
          <MultiSelect
            v-model="filters.student"
            :options="students"
            optionLabel="displayName"
            optionValue="uniqueId"
            filter
            display="chip"
            :loading="isStudentsLoading"
            :placeholder="APP_CONSTANTS.UI.PLACEHOLDERS.SELECT_STUDENT"
            :virtualScrollerOptions="{ itemSize: 40 }"
            class="w-full"
          />
        </div>

        <div class="field">
          <label>{{ APP_CONSTANTS.UI.LABELS.ATTENDANCE_REASONS }}</label>
          <MultiSelect
            v-model="filters.reason"
            :options="dicts.attendanceReasons"
            optionLabel="name"
            optionValue="id"
            display="chip"
            :placeholder="APP_CONSTANTS.UI.PLACEHOLDERS.SELECT_REASON"
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
import { ref, reactive, computed } from "vue";
import { APP_CONSTANTS } from "../../config/constants";
import { toApiDate } from "../../utils/dateUtils";
import { useStudentFilter } from "../../composables/useStudentFilter";
import { useDictionaryStore } from "../../store/dictionaryStore";

const props = defineProps({
  dicts: Object,
  semesters: Array,
  isLoading: Boolean,
});

const emit = defineEmits(["generate"]);
const dictionaryStore = useDictionaryStore();

const selectedSemester = ref(null);

const filters = reactive({
  dates: null,
  semester: null,
  faculty: [],
  specialty: [],
  group: [],
  student: [],
  reason: [],
});

const filteredFaculties = computed(() => {
  return props.dicts.faculties.filter((f) =>
    APP_CONSTANTS.REPORT_FILTERS.ALLOWED_FACULTIES.includes(f.id),
  );
});

const filteredSpecialties = computed(() => {
  return props.dicts.specialties.filter((s) =>
    APP_CONSTANTS.REPORT_FILTERS.ALLOWED_SPECIALTIES.includes(s.id),
  );
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

  ["faculty", "specialty", "group", "student", "reason"].forEach((key) => {
    if (
      Array.isArray(formattedFilters[key]) &&
      formattedFilters[key].length > 0
    ) {
      formattedFilters[key] = formattedFilters[key].join(",");
    } else {
      formattedFilters[key] = null;
    }
  });

  emit("generate", formattedFilters);
};
</script>
