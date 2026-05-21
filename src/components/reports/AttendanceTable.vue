<!-- src/components/reports/AttendanceTable.vue -->
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
      field="absences_count"
      :header="APP_CONSTANTS.UI.LABELS.TOTAL_ABSENCES"
      sortable
    ></Column>
    <Column
      field="absence_dates"
      :header="APP_CONSTANTS.UI.LABELS.ABSENCE_DATES"
    ></Column>
    <Column
      field="reasons_list"
      :header="APP_CONSTANTS.UI.LABELS.ATTENDANCE_REASONS"
    ></Column>
  </DataTable>
</template>

<script setup>
import { APP_CONSTANTS } from "../../config/constants";
defineProps({
  data: Array,
});
</script>
