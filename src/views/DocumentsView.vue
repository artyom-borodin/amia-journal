<template>
  <div class="layout-wrapper">
    <NavBar />
    <main class="reports-main">
      <h1 class="dashboard-title">{{ APP_CONSTANTS.UI.LABELS.DOCUMENTS }}</h1>

      <ExamSheetForm @error="showError" />
      <SummarySheetForm @error="showError" />
      <StudyCardExtractForm @error="showError" />
    </main>

    <Dialog
      v-model:visible="showErrorDialog"
      modal
      :header="APP_CONSTANTS.UI.ERROR_SUMMARY"
      class="error-modal"
      :closable="false"
    >
      <div class="error-dialog-content">
        <i class="pi pi-exclamation-triangle error-icon"></i>
        <span class="error-text">{{ errorMessage }}</span>
      </div>
      <template #footer>
        <Button label="OK" @click="showErrorDialog = false" autofocus />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import NavBar from "../components/NavBar.vue";
import ExamSheetForm from "../components/documents/ExamSheetForm.vue";
import SummarySheetForm from "../components/documents/SummarySheetForm.vue";
import StudyCardExtractForm from "../components/documents/StudyCardExtractForm.vue";
import { APP_CONSTANTS } from "../config/constants";
import { useDictionaryStore } from "../store/dictionaryStore";
import { useReportStore } from "../store/reportStore";
import { extractErrorMessage } from "../utils/errorUtils";

const dictionaryStore = useDictionaryStore();
const reportStore = useReportStore();

const showErrorDialog = ref(false);
const errorMessage = ref("");

onMounted(async () => {
  await dictionaryStore.fetchDictionaries();
  await reportStore.fetchDictionaries();
});

const showError = (error, defaultMsg) => {
  errorMessage.value = extractErrorMessage(error, defaultMsg);
  showErrorDialog.value = true;
};
</script>
