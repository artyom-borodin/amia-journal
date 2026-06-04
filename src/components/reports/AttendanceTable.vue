<template>
  <DataTable
    :value="data"
    showGridlines
    stripedRows
    paginator
    :rows="APP_CONSTANTS.GRID.DEFAULT_PAGINATION_ROWS"
  >
    <Column
      field="full_name"
      :header="APP_CONSTANTS.UI.LABELS.FULL_NAME"
      sortable
    ></Column>
    <Column
      field="faculty_name"
      :header="APP_CONSTANTS.UI.LABELS.FACULTY"
      sortable
    ></Column>
    <Column
      field="specialty_name"
      :header="APP_CONSTANTS.UI.LABELS.SPECIALTY"
      sortable
    ></Column>
    <Column
      field="group_name"
      :header="APP_CONSTANTS.UI.LABELS.GROUP"
      sortable
    ></Column>
    <Column
      field="date"
      :header="APP_CONSTANTS.UI.LABELS.DATE"
      sortable
    ></Column>
    <Column
      field="reason"
      :header="APP_CONSTANTS.UI.LABELS.REASON"
      sortable
    ></Column>
  </DataTable>
</template>

<script setup>
import { APP_CONSTANTS } from "../../config/constants";
defineProps({
  data: Array,
});
</script>
