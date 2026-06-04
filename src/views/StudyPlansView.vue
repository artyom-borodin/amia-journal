<template>
  <div class="layout-wrapper">
    <NavBar />
    <main class="reports-main">
      <h1 class="dashboard-title">{{ APP_CONSTANTS.UI.LABELS.STUDY_PLANS }}</h1>

      <div class="view-toggles mb-4">
        <div class="field max-w-30rem">
          <label>{{ APP_CONSTANTS.UI.LABELS.YEAR }}</label>
          <Select
            v-model="selectedYear"
            :options="dictionaryStore.dicts.years"
            optionLabel="year_str"
            optionValue="id"
            showClear
            :placeholder="APP_CONSTANTS.UI.PLACEHOLDERS.SELECT_YEAR"
            class="w-full"
          />
        </div>
      </div>

      <Card class="flex-1">
        <template #content>
          <CrudTable
            v-if="!dictionaryStore.isLoading"
            :title="APP_CONSTANTS.UI.LABELS.STUDY_PLANS"
            :endpoint="APP_CONSTANTS.API_ENDPOINTS.STUDY_PLANS"
            :columns="columns"
            :baseFilters="{ year: selectedYear }"
            @error="showError"
          >
            <template #actions="{ data }">
              <Button
                :label="APP_CONSTANTS.UI.LABELS.VIEW_LOADS"
                icon="pi pi-list"
                outlined
                size="small"
                @click="goToDetail(data.id)"
              />
            </template>
          </CrudTable>
        </template>
      </Card>
    </main>

    <ErrorDialog v-model:visible="showErrorDialog" :message="errorMessage" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import NavBar from "../components/NavBar.vue";
import CrudTable from "../components/crud/CrudTable.vue";
import ErrorDialog from "../components/ErrorDialog.vue";
import { APP_CONSTANTS } from "../config/constants";
import { useDictionaryStore } from "../store/dictionaryStore";
import { extractErrorMessage } from "../utils/errorUtils";

const router = useRouter();
const dictionaryStore = useDictionaryStore();

const showErrorDialog = ref(false);
const errorMessage = ref("");
const selectedYear = ref(null);

onMounted(async () => {
  await dictionaryStore.fetchDictionaries();
});

const columns = computed(() => [
  {
    field: "speciality",
    header: APP_CONSTANTS.UI.LABELS.SPECIALTY,
    type: APP_CONSTANTS.FIELD_TYPES.SELECT,
    options: dictionaryStore.dicts.specialties,
    optionLabel: "displayName",
    optionValue: "id",
    required: true,
  },
  {
    field: "year",
    header: APP_CONSTANTS.UI.LABELS.YEAR,
    type: APP_CONSTANTS.FIELD_TYPES.SELECT,
    options: dictionaryStore.dicts.years,
    optionLabel: "year_str",
    optionValue: "id",
    required: true,
  },
]);

const goToDetail = (id) => {
  router.push(APP_CONSTANTS.ROUTES.STUDY_PLAN_DETAIL.replace(":id", id));
};

const showError = (error, defaultMsg) => {
  errorMessage.value = extractErrorMessage(error, defaultMsg);
  showErrorDialog.value = true;
};
</script>
