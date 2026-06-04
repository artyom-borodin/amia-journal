<template>
  <Dialog
    :visible="visible"
    :style="{ width: APP_CONSTANTS.UI.CRUD_DIALOG_WIDTH }"
    :header="
      isEditing ? APP_CONSTANTS.UI.LABELS.EDIT : APP_CONSTANTS.UI.LABELS.ADD
    "
    modal
    @update:visible="$emit('update:visible', $event)"
  >
    <form @submit.prevent="handleSubmit" class="flex-col gap-3 mt-3">
      <div v-for="col in columns" :key="col.field" class="field">
        <label>
          {{ col.header }}
          <span v-if="col.required" class="text-red-500">*</span>
        </label>

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
          :hourFormat="APP_CONSTANTS.FORMATTING.HOUR_FORMAT_24"
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
          @click="$emit('update:visible', false)"
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
</template>

<script setup>
import { ref, watch } from "vue";
import { APP_CONSTANTS } from "../../config/constants";
import { toApiDate, toApiTime } from "../../utils/dateUtils";
import Checkbox from "primevue/checkbox";
import InputNumber from "primevue/inputnumber";

const props = defineProps({
  visible: Boolean,
  columns: Array,
  initialData: Object,
  basePayload: Object,
  isEditing: Boolean,
  isSaving: Boolean,
});

const emit = defineEmits(["update:visible", "save"]);

const formData = ref({});

watch(
  () => props.visible,
  (isVisible) => {
    if (isVisible) {
      formData.value = { ...props.basePayload, ...props.initialData };
      props.columns.forEach((col) => {
        if (
          col.type === APP_CONSTANTS.FIELD_TYPES.TIME &&
          formData.value[col.field]
        ) {
          if (typeof formData.value[col.field] === "string") {
            const parts = formData.value[col.field].split(
              APP_CONSTANTS.FORMATTING.TIME_SEPARATOR,
            );
            const d = new Date();
            d.setHours(
              parts[0] || APP_CONSTANTS.RULES.START_OF_DAY_HOURS,
              parts[1] || APP_CONSTANTS.RULES.START_OF_DAY_MINUTES,
              parts[2] || APP_CONSTANTS.RULES.START_OF_DAY_SECONDS,
            );
            formData.value[col.field] = d;
          }
        } else if (
          col.type === APP_CONSTANTS.FIELD_TYPES.DATE &&
          formData.value[col.field]
        ) {
          formData.value[col.field] = new Date(formData.value[col.field]);
        }
      });
    }
  },
);

const handleSubmit = () => {
  const payload = { ...formData.value };
  props.columns.forEach((col) => {
    if (col.type === APP_CONSTANTS.FIELD_TYPES.DATE) {
      payload[col.field] = toApiDate(payload[col.field]);
    } else if (col.type === APP_CONSTANTS.FIELD_TYPES.TIME) {
      payload[col.field] = toApiTime(payload[col.field]);
    }
  });
  emit("save", payload);
};
</script>
