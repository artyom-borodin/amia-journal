<template>
  <div class="crud-table-container">
    <div class="flex-row justify-between align-center mb-4">
      <h2 class="m-0">{{ title }}</h2>
      <Button
        :label="APP_CONSTANTS.UI.LABELS.ADD"
        icon="pi pi-plus"
        @click="openNew"
      />
    </div>

    <DataTable
      :value="items"
      :loading="isLoading"
      showGridlines
      stripedRows
      paginator
      :rows="APP_CONSTANTS.GRID.DEFAULT_PAGINATION_ROWS"
    >
      <template #empty>
        <div class="text-center p-4">
          {{ APP_CONSTANTS.UI.MESSAGES.NO_DATA }}
        </div>
      </template>

      <Column
        v-for="col in columns"
        :key="col.field"
        :field="col.field"
        :header="col.header"
      >
        <template #body="{ data }">
          <template v-if="col.type === APP_CONSTANTS.FIELD_TYPES.BOOLEAN">
            <i
              class="pi"
              :class="
                data[col.field]
                  ? 'pi-check-circle text-green-500'
                  : 'pi-times-circle text-red-500'
              "
            ></i>
          </template>
          <template v-else-if="col.type === APP_CONSTANTS.FIELD_TYPES.SELECT">
            {{ getOptionLabel(col, data[col.field]) }}
          </template>
          <template v-else-if="col.type === APP_CONSTANTS.FIELD_TYPES.TIME">
            {{ formatTimeDisplay(data[col.field]) }}
          </template>
          <template v-else>
            {{ data[col.field] }}
          </template>
        </template>
      </Column>

      <Column
        :header="APP_CONSTANTS.UI.LABELS.ACTIONS"
        :exportable="false"
        style="min-width: 8rem"
      >
        <template #body="slotProps">
          <div class="flex-row gap-2">
            <Button
              icon="pi pi-pencil"
              outlined
              rounded
              severity="success"
              @click="editItem(slotProps.data)"
            />
            <Button
              icon="pi pi-trash"
              outlined
              rounded
              severity="danger"
              @click="confirmDelete(slotProps.data)"
            />
            <slot name="actions" :data="slotProps.data"></slot>
          </div>
        </template>
      </Column>
    </DataTable>

    <CrudForm
      v-model:visible="isDialogVisible"
      :columns="columns"
      :initial-data="selectedItem"
      :base-payload="basePayload"
      :is-editing="isEditing"
      :is-saving="isSaving"
      @save="saveItem"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { APP_CONSTANTS } from "../../config/constants";
import { CrudService } from "../../services/crudService";
import CrudForm from "./CrudForm.vue";

const props = defineProps({
  title: String,
  endpoint: String,
  columns: Array,
  baseFilters: { type: Object, default: () => ({}) },
  basePayload: { type: Object, default: () => ({}) },
  transformData: { type: Function, default: (data) => data },
});

const emit = defineEmits(["error", "saved", "deleted"]);

const items = ref([]);
const isLoading = ref(false);
const isSaving = ref(false);
const isDialogVisible = ref(false);
const isEditing = ref(false);
const selectedItem = ref({});

const loadData = async () => {
  if (!props.endpoint) return;
  isLoading.value = true;
  try {
    let data = await CrudService.getAll(props.endpoint, props.baseFilters);
    items.value = props.transformData(data);
  } catch (error) {
    emit("error", error, APP_CONSTANTS.UI.ERRORS.CRUD_FETCH);
  } finally {
    isLoading.value = false;
  }
};

watch(() => props.endpoint, loadData);
onMounted(loadData);

const getOptionLabel = (col, value) => {
  if (!col.options) return value;
  const option = col.options.find((opt) => opt[col.optionValue] === value);
  return option ? option[col.optionLabel] : value;
};

const formatTimeDisplay = (timeStr) => {
  if (!timeStr) return "";
  if (
    typeof timeStr === "string" &&
    timeStr.includes(APP_CONSTANTS.FORMATTING.TIME_SEPARATOR)
  ) {
    const parts = timeStr.split(APP_CONSTANTS.FORMATTING.TIME_SEPARATOR);
    if (parts.length >= 2) {
      return `${parts[0]}${APP_CONSTANTS.FORMATTING.TIME_SEPARATOR}${parts[1]}`;
    }
  }
  return timeStr;
};

const openNew = () => {
  selectedItem.value = {};
  isEditing.value = false;
  isDialogVisible.value = true;
};

const editItem = (item) => {
  selectedItem.value = { ...item };
  isEditing.value = true;
  isDialogVisible.value = true;
};

const saveItem = async (payload) => {
  isSaving.value = true;
  try {
    if (isEditing.value) {
      await CrudService.update(props.endpoint, payload.id, payload);
    } else {
      await CrudService.create(props.endpoint, payload);
    }
    isDialogVisible.value = false;
    await loadData();
    emit("saved");
  } catch (error) {
    emit(
      "error",
      error,
      isEditing.value
        ? APP_CONSTANTS.UI.ERRORS.CRUD_UPDATE
        : APP_CONSTANTS.UI.ERRORS.CRUD_CREATE,
    );
  } finally {
    isSaving.value = false;
  }
};

const confirmDelete = async (item) => {
  if (confirm(APP_CONSTANTS.UI.MESSAGES.CONFIRM_DELETE)) {
    try {
      await CrudService.delete(props.endpoint, item.id);
      await loadData();
      emit("deleted");
    } catch (error) {
      emit("error", error, APP_CONSTANTS.UI.ERRORS.CRUD_DELETE);
    }
  }
};
</script>
