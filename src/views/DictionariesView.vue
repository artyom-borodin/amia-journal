<template>
  <div class="layout-wrapper">
    <NavBar />
    <main class="reports-main">
      <h1 class="dashboard-title">
        {{ APP_CONSTANTS.UI.LABELS.DICTIONARIES }}
      </h1>

      <Card class="mb-4">
        <template #content>
          <div class="field max-w-30rem">
            <label>{{ APP_CONSTANTS.UI.PLACEHOLDERS.SELECT_DICTIONARY }}</label>
            <Select
              v-model="selectedConfigId"
              :options="configs"
              optionLabel="label"
              optionValue="id"
              class="w-full"
            />
          </div>
        </template>
      </Card>

      <Card v-if="currentConfig" class="flex-1">
        <template #content>
          <CrudTable
            :title="currentConfig.label"
            :endpoint="currentConfig.endpoint"
            :columns="currentConfig.columns"
            :transform-data="currentConfig.transformData"
            @error="showError"
            @saved="refreshDictionaries"
            @deleted="refreshDictionaries"
          />
        </template>
      </Card>
    </main>

    <ErrorDialog v-model:visible="showErrorDialog" :message="errorMessage" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import NavBar from "../components/NavBar.vue";
import CrudTable from "../components/crud/CrudTable.vue";
import ErrorDialog from "../components/ErrorDialog.vue";
import { APP_CONSTANTS } from "../config/constants";
import { useDictionaryStore } from "../store/dictionaryStore";
import { getDictionaryConfigs } from "../config/dictionaryConfigs";
import { extractErrorMessage } from "../utils/errorUtils";

const dictionaryStore = useDictionaryStore();
const configs = ref([]);
const selectedConfigId = ref(null);

const showErrorDialog = ref(false);
const errorMessage = ref("");

onMounted(async () => {
  await dictionaryStore.fetchDictionaries();
  configs.value = getDictionaryConfigs(dictionaryStore);
  if (configs.value.length > 0) {
    selectedConfigId.value = configs.value[0].id;
  }
});

const currentConfig = computed(() => {
  return configs.value.find((c) => c.id === selectedConfigId.value);
});

const refreshDictionaries = async () => {
  await dictionaryStore.fetchDictionaries(true);
  configs.value = getDictionaryConfigs(dictionaryStore);
};

const showError = (error, defaultMsg) => {
  errorMessage.value = extractErrorMessage(error, defaultMsg);
  showErrorDialog.value = true;
};
</script>