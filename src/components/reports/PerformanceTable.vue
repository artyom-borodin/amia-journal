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
      field="group_name"
      :header="APP_CONSTANTS.UI.LABELS.GROUP"
      sortable
    ></Column>
    <Column
      field="subject_name"
      :header="APP_CONSTANTS.UI.LABELS.SUBJECT"
      sortable
    ></Column>
    <Column
      field="marks_list"
      :header="APP_CONSTANTS.UI.LABELS.ALL_MARKS"
    ></Column>
    <Column
      field="average_mark"
      :header="APP_CONSTANTS.UI.LABELS.AVERAGE_MARK"
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
