<template>
  <div class="layout-wrapper">
    <NavBar />
    <main class="reports-main">
      <h1 class="dashboard-title">{{ APP_CONSTANTS.UI.LABELS.DOCUMENTS }}</h1>

      <ExamSheetForm @error="showError" />
      <SummarySheetForm @error="showError" />
      <StudyCardExtractForm @error="showError" />
    </main>

    <ErrorDialog v-model:visible="showErrorDialog" :message="errorMessage" />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import NavBar from "../components/NavBar.vue";
import ExamSheetForm from "../components/documents/ExamSheetForm.vue";
import SummarySheetForm from "../components/documents/SummarySheetForm.vue";
import StudyCardExtractForm from "../components/documents/StudyCardExtractForm.vue";
import ErrorDialog from "../components/ErrorDialog.vue";
import { APP_CONSTANTS } from "../config/constants";
import { useReportStore } from "../store/reportStore";
import { extractErrorMessage } from "../utils/errorUtils";

const reportStore = useReportStore();

const showErrorDialog = ref(false);
const errorMessage = ref("");

onMounted(async () => {
  await reportStore.fetchDictionaries();
});

const showError = (error, defaultMsg) => {
  errorMessage.value = extractErrorMessage(error, defaultMsg);
  showErrorDialog.value = true;
};
</script>
