<template>
  <div class="layout-wrapper">
    <NavBar />
    <main class="reports-main">
      <h1 class="dashboard-title">
        {{ APP_CONSTANTS.UI.PAGE_TITLES.StudyPlanDetail }}
      </h1>

      <Card class="flex-1">
        <template #content>
          <CrudTable
            v-if="!dictionaryStore.isLoading"
            :title="APP_CONSTANTS.UI.LABELS.VIEW_LOADS"
            :endpoint="APP_CONSTANTS.API_ENDPOINTS.STUDY_PLAN_LOADS"
            :columns="columns"
            :baseFilters="{ study_plan: planId }"
            :basePayload="{ study_plan: planId }"
            @error="showError"
          />
        </template>
      </Card>
    </main>

    <ErrorDialog v-model:visible="showErrorDialog" :message="errorMessage" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import NavBar from "../components/NavBar.vue";
import CrudTable from "../components/crud/CrudTable.vue";
import ErrorDialog from "../components/ErrorDialog.vue";
import { APP_CONSTANTS } from "../config/constants";
import { useDictionaryStore } from "../store/dictionaryStore";
import { extractErrorMessage } from "../utils/errorUtils";

const route = useRoute();
const dictionaryStore = useDictionaryStore();

const planId = Number(route.params.id);
const showErrorDialog = ref(false);
const errorMessage = ref("");

onMounted(async () => {
  await dictionaryStore.fetchDictionaries();
});

const columns = computed(() => [
  {
    field: "subject",
    header: APP_CONSTANTS.UI.LABELS.SUBJECT,
    type: APP_CONSTANTS.FIELD_TYPES.SELECT,
    options: dictionaryStore.dicts.subjects,
    optionLabel: "subject_name",
    optionValue: "id",
    required: true,
  },
  {
    field: "semester",
    header: APP_CONSTANTS.UI.LABELS.SEMESTER,
    type: APP_CONSTANTS.FIELD_TYPES.SELECT,
    options: dictionaryStore.dicts.semesters.map((s) => ({
      ...s,
      displayName: `${dictionaryStore.dictsMap.years[s.year]?.year_str || ""} - ${s.semester}`,
    })),
    optionLabel: "displayName",
    optionValue: "id",
    required: true,
  },
  {
    field: "hours",
    header: APP_CONSTANTS.UI.LABELS.HOURS,
    type: APP_CONSTANTS.FIELD_TYPES.NUMBER,
    required: false,
  },
  {
    field: "lesson_type",
    header: APP_CONSTANTS.UI.LABELS.LESSON_TYPE,
    type: APP_CONSTANTS.FIELD_TYPES.SELECT,
    options: dictionaryStore.dicts.lessonTypes,
    optionLabel: "name",
    optionValue: "id",
    required: false,
  },
]);

const showError = (error, defaultMsg) => {
  errorMessage.value = extractErrorMessage(error, defaultMsg);
  showErrorDialog.value = true;
};
</script>