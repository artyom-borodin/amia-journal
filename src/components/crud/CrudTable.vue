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

    <Dialog
      v-model:visible="isDialogVisible"
      :style="{ width: '450px' }"
      :header="
        isEditing ? APP_CONSTANTS.UI.LABELS.EDIT : APP_CONSTANTS.UI.LABELS.ADD
      "
      modal
    >
      <form @submit.prevent="saveItem" class="flex-col gap-3 mt-3">
        <div v-for="col in columns" :key="col.field" class="field">
          <label
            >{{ col.header }}
            <span v-if="col.required" class="text-red-500">*</span></label
          >

          <InputText
            v-if="col.type === APP_CONSTANTS.FIELD_TYPES.TEXT"
            v-model="formData[col.field]"
            :required="col.required"
          />

          <InputNumber
            v-else-if="col.type === APP_CONSTANTS.FIELD_TYPES.NUMBER"
            v-model="formData[col.field]"
            :required="col.required"
            :useGrouping="false"
          />

          <div
            v-else-if="col.type === APP_CONSTANTS.FIELD_TYPES.BOOLEAN"
            class="flex-row align-center gap-2 mt-2"
          >
            <Checkbox v-model="formData[col.field]" :binary="true" />
            <span>{{ col.header }}</span>
          </div>

          <DatePicker
            v-else-if="col.type === APP_CONSTANTS.FIELD_TYPES.TIME"
            v-model="formData[col.field]"
            timeOnly
            hourFormat="24"
            :required="col.required"
          />

          <DatePicker
            v-else-if="col.type === APP_CONSTANTS.FIELD_TYPES.DATE"
            v-model="formData[col.field]"
            :required="col.required"
          />

          <Select
            v-else-if="col.type === APP_CONSTANTS.FIELD_TYPES.SELECT"
            v-model="formData[col.field]"
            :options="col.options"
            :optionLabel="col.optionLabel"
            :optionValue="col.optionValue"
            :required="col.required"
            class="w-full"
          />
        </div>

        <div class="flex-row justify-end gap-2 mt-4">
          <Button
            :label="APP_CONSTANTS.UI.LABELS.CANCEL"
            icon="pi pi-times"
            text
            @click="hideDialog"
          />
          <Button
            type="submit"
            :label="APP_CONSTANTS.UI.LABELS.SAVE"
            icon="pi pi-check"
            :loading="isSaving"
          />
        </div>
      </form>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { APP_CONSTANTS } from "../../config/constants";
import { CrudService } from "../../services/crudService";
import { toApiDate, toApiTime } from "../../utils/dateUtils";
import Checkbox from "primevue/checkbox";
import InputNumber from "primevue/inputnumber";
import { sortMarkValues } from "../../utils/journalUtils"; // Добавь импорт

const props = defineProps({
  title: String,
  endpoint: String,
  columns: Array,
  baseFilters: { type: Object, default: () => ({}) },
  basePayload: { type: Object, default: () => ({}) },
});

const emit = defineEmits(["error", "saved", "deleted"]);

const items = ref([]);
const isLoading = ref(false);
const isSaving = ref(false);
const isDialogVisible = ref(false);
const isEditing = ref(false);
const formData = ref({});

const loadData = async () => {
  if (!props.endpoint) return;
  isLoading.value = true;
  try {
      //items.value = await CrudService.getAll(props.endpoint, props.baseFilters);
      let data = await CrudService.getAll(props.endpoint, props.baseFilters);
      
      if (props.endpoint.includes('mark-values')) {
        data = sortMarkValues(data);
      }
      
      items.value = data;
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
  if (typeof timeStr === "string" && timeStr.includes(":")) {
    const parts = timeStr.split(":");
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}`;
    }
  }
  return timeStr;
};

const openNew = () => {
  formData.value = { ...props.basePayload };
  isEditing.value = false;
  isDialogVisible.value = true;
};

const editItem = (item) => {
  formData.value = { ...item };
  props.columns.forEach((col) => {
    if (
      col.type === APP_CONSTANTS.FIELD_TYPES.TIME &&
      formData.value[col.field]
    ) {
      if (typeof formData.value[col.field] === "string") {
        const parts = formData.value[col.field].split(":");
        const d = new Date();
        d.setHours(parts[0] || 0, parts[1] || 0, parts[2] || 0);
        formData.value[col.field] = d;
      }
    } else if (
      col.type === APP_CONSTANTS.FIELD_TYPES.DATE &&
      formData.value[col.field]
    ) {
      formData.value[col.field] = new Date(formData.value[col.field]);
    }
  });
  isEditing.value = true;
  isDialogVisible.value = true;
};

const hideDialog = () => {
  isDialogVisible.value = false;
};

const formatPayload = () => {
  const payload = { ...formData.value, ...props.basePayload };
  props.columns.forEach((col) => {
    if (col.type === APP_CONSTANTS.FIELD_TYPES.DATE) {
      payload[col.field] = toApiDate(payload[col.field]);
    } else if (col.type === APP_CONSTANTS.FIELD_TYPES.TIME) {
      payload[col.field] = toApiTime(payload[col.field]);
    }
  });
  return payload;
};

const saveItem = async () => {
  isSaving.value = true;
  try {
    const payload = formatPayload();
    if (isEditing.value) {
      await CrudService.update(props.endpoint, payload.id, payload);
    } else {
      await CrudService.create(props.endpoint, payload);
    }
    hideDialog();
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
