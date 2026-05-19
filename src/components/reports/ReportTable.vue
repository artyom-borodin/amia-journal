<template>
  <DataTable :value="data" showGridlines stripedRows paginator :rows="10">
    <Column field="full_name" :header="APP_CONSTANTS.UI.LABELS.FULL_NAME" sortable></Column>
    <Column field="group" :header="APP_CONSTANTS.UI.LABELS.GROUP" sortable></Column>
    <Column field="average_mark" :header="APP_CONSTANTS.UI.LABELS.AVERAGE_MARK" sortable></Column>
    <Column field="marks_count" :header="APP_CONSTANTS.UI.LABELS.TOTAL_MARKS" sortable></Column>
    <Column field="absences_count" :header="APP_CONSTANTS.UI.LABELS.TOTAL_ABSENCES" sortable></Column>
  </DataTable>
</template>

<script setup>
import { APP_CONSTANTS } from "../../config/constants";
defineProps({
  data: Array
});
</script>