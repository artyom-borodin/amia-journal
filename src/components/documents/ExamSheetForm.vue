<template>
  <Card class="report-filters-card">
    <template #title>{{ APP_CONSTANTS.UI.LABELS.EXAMINATION_SHEET }}</template>
    <template #content>
      <form @submit.prevent="handleGenerate" class="filters-grid mt-4">
        <div class="field">
          <label>{{ APP_CONSTANTS.UI.LABELS.SEMESTER }} *</label>
          <Select
            v-model="filters.semester"
            :options="reportStore.semesters"
            optionLabel="semester"
            optionValue="id"
            :placeholder="APP_CONSTANTS.UI.PLACEHOLDERS.SELECT_SEMESTER"
            required
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
          <label>{{ APP_CONSTANTS.UI.LABELS.GROUP }} *</label>
          <Select
            v-model="filters.group"
            :options="dictionaryStore.dicts.groups"
            optionLabel="group_name"
            optionValue="id"
            filter
            :placeholder="APP_CONSTANTS.UI.PLACEHOLDERS.SELECT_GROUP"
            required
            class="w-full"
          />
        </div>

        <div class="field">
          <label>{{ APP_CONSTANTS.UI.LABELS.SUBJECT }} *</label>
          <Select
            v-model="filters.subject"
            :options="dictionaryStore.dicts.subjects"
            optionLabel="subject_name"
            optionValue="id"
            filter
            :placeholder="APP_CONSTANTS.UI.PLACEHOLDERS.SELECT_SUBJECT"
            required
            class="w-full"
          />
        </div>

        <div class="field">
          <label>{{ APP_CONSTANTS.UI.LABELS.LESSON_TYPE }} *</label>
          <Select
            v-model="filters.lesson_type"
            :options="dictionaryStore.dicts.lessonTypes"
            optionLabel="name"
            optionValue="id"
            :placeholder="APP_CONSTANTS.UI.PLACEHOLDERS.SELECT_LESSON_TYPE"
            required
            class="w-full"
          />
        </div>

        <div class="field">
          <label>{{ APP_CONSTANTS.UI.LABELS.TEACHER }}</label>
          <Select
            v-model="filters.teacher"
            :options="dictionaryStore.dicts.teachers"
            optionLabel="username"
            optionValue="id"
            filter
            :placeholder="APP_CONSTANTS.UI.PLACEHOLDERS.SELECT_TEACHER"
            class="w-full"
          >
            <template #option="slotProps">
              {{ getPersonFullName(slotProps.option) }}
            </template>
          </Select>
        </div>

        <div class="filter-actions">
          <Button
            type="submit"
            :label="APP_CONSTANTS.UI.LABELS.DOWNLOAD_DOC"
            icon="pi pi-download"
            :loading="isGenerating"
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
import { DocumentService } from "../../services/documentService";
import { useDictionaryStore } from "../../store/dictionaryStore";
import { useReportStore } from "../../store/reportStore";
import { getPersonFullName } from "../../utils/journalUtils";

const emit = defineEmits(["error"]);
const dictionaryStore = useDictionaryStore();
const reportStore = useReportStore();

const isGenerating = ref(false);
const filters = reactive({
  semester: null,
  group: null,
  subject: null,
  lesson_type: null,
  teacher: null,
});

const handleGenerate = async () => {
  isGenerating.value = true;
  try {
    await DocumentService.downloadExaminationSheet(filters);
  } catch (error) {
    emit("error", error, APP_CONSTANTS.UI.ERRORS.GENERATE_DOC);
  } finally {
    isGenerating.value = false;
  }
};
</script>
