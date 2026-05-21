<template>
  <Card class="report-filters-card">
    <template #title>{{ APP_CONSTANTS.UI.LABELS.SUMMARY_SHEET }}</template>
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
              {{ slotProps.option.year }} - {{ slotProps.option.semester }}
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

const emit = defineEmits(["error"]);
const dictionaryStore = useDictionaryStore();
const reportStore = useReportStore();

const isGenerating = ref(false);
const filters = reactive({
  semester: null,
  group: null,
});

const handleGenerate = async () => {
  isGenerating.value = true;
  try {
    await DocumentService.downloadSummarySheet(filters);
  } catch (error) {
    emit("error", error, APP_CONSTANTS.UI.ERRORS.GENERATE_DOC);
  } finally {
    isGenerating.value = false;
  }
};
</script>
