<template>
  <div class="flex-col gap-3">
    <div class="flex-row gap-4 align-center px-2 mt-3 mb-2">
      <span class="font-semibold">{{ APP_CONSTANTS.UI.LABELS.LEGEND }}</span>
      <div class="flex-row gap-2 align-center">
        <span class="mark-badge is-final">&nbsp;&nbsp;</span>
        <span>- {{ APP_CONSTANTS.UI.LABELS.CURRENT_MARK }}</span>
      </div>
      <div class="flex-row gap-2 align-center">
        <span class="mark-badge is-retake">&nbsp;&nbsp;</span>
        <span>- {{ APP_CONSTANTS.UI.LABELS.RETAKEN_MARK }}</span>
      </div>
    </div>

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
        field="subject_name"
        :header="APP_CONSTANTS.UI.LABELS.SUBJECT"
        sortable
      ></Column>
      <Column
        field="lesson_type"
        :header="APP_CONSTANTS.UI.LABELS.LESSON_TYPE"
        sortable
      ></Column>
      <Column
        field="date"
        :header="APP_CONSTANTS.UI.LABELS.DATE"
        sortable
      ></Column>
      <Column
        field="mark_value"
        :header="APP_CONSTANTS.UI.LABELS.MARK_VALUE"
        sortable
      >
        <template #body="{ data }">
          <span
            class="mark-badge"
            :class="data.is_final ? 'is-final' : 'is-retake'"
          >
            {{ data.mark_value }}
          </span>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>
import { APP_CONSTANTS } from "../../config/constants";
defineProps({
  data: Array,
});
</script>
