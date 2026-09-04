<template>
  <Dialog
    :visible="visible"
    modal
    :header="headerTitle"
    class="attendance-modal"
    :closable="!isSaving"
    :closeOnEscape="!isSaving"
    :dismissableMask="!isSaving"
    @update:visible="$emit('update:visible', $event)"
  >
    <form @submit.prevent="handleSave" class="form-layout">
      <div class="field">
        <label>{{ APP_CONSTANTS.UI.LABELS.REASON }}</label>
        <Select
          v-model="formData.reason"
          :options="dicts.attendanceReasons"
          optionLabel="name"
          optionValue="id"
          :placeholder="APP_CONSTANTS.UI.PLACEHOLDERS.SELECT_REASON"
          showClear
          class="w-full"
          :disabled="isSaving"
        />
      </div>

      <div class="field">
        <label>{{ APP_CONSTANTS.UI.MESSAGES.ATTENDANCE_SCOPE }}</label>
        <div class="flex-col gap-2">
          <div class="flex-row align-center gap-2">
            <RadioButton
              v-model="formData.mode"
              inputId="mode-pair"
              value="pair"
              :disabled="isSaving"
            />
            <label for="mode-pair">
              {{ APP_CONSTANTS.UI.MESSAGES.SCOPE_PAIR }}
              ({{ formatTimeShort(lessonTime?.start_time) }})
            </label>
          </div>
          <div class="flex-row align-center gap-2">
            <RadioButton
              v-model="formData.mode"
              inputId="mode-pairs"
              value="pairs"
              :disabled="isSaving"
            />
            <label for="mode-pairs">{{ APP_CONSTANTS.UI.MESSAGES.SCOPE_PAIRS }}</label>
          </div>
          <div class="flex-row align-center gap-2">
            <RadioButton
              v-model="formData.mode"
              inputId="mode-days"
              value="days"
              :disabled="isSaving"
            />
            <label for="mode-days">{{ APP_CONSTANTS.UI.MESSAGES.SCOPE_DAYS }}</label>
          </div>
        </div>
      </div>

      <div v-if="formData.mode === 'pairs'" class="flex-row gap-3">
        <div class="field flex-1">
          <label>{{ APP_CONSTANTS.UI.MESSAGES.PAIR_FROM }}</label>
          <Select
            v-model="formData.pairFrom"
            :options="pairOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full"
            :disabled="isSaving"
          />
        </div>
        <div class="field flex-1">
          <label>{{ APP_CONSTANTS.UI.MESSAGES.PAIR_TO }}</label>
          <Select
            v-model="formData.pairTo"
            :options="pairOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full"
            :disabled="isSaving"
          />
        </div>
      </div>

      <div v-if="formData.mode === 'days'" class="flex-row gap-3">
        <div class="field flex-1">
          <label>{{ APP_CONSTANTS.UI.MESSAGES.DAY_FROM }}</label>
          <DatePicker
            v-model="formData.dayFrom"
            showIcon
            :dateFormat="APP_CONSTANTS.LOCALE_CONFIG.dateFormat"
            class="w-full"
            :disabled="isSaving"
          />
        </div>
        <div class="field flex-1">
          <label>{{ APP_CONSTANTS.UI.MESSAGES.DAY_TO }}</label>
          <DatePicker
            v-model="formData.dayTo"
            showIcon
            :dateFormat="APP_CONSTANTS.LOCALE_CONFIG.dateFormat"
            class="w-full"
            :disabled="isSaving"
          />
        </div>
      </div>

      <div class="attendance-preview">
        {{ APP_CONSTANTS.UI.MESSAGES.AFFECTED_COUNT }}
        <b>{{ affectedCount }}</b>
      </div>

      <div class="dialog-footer">
        <Button
          :label="APP_CONSTANTS.UI.LABELS.CANCEL"
          icon="pi pi-times"
          text
          severity="secondary"
          @click="$emit('update:visible', false)"
          :disabled="isSaving"
        />
        <Button
          v-if="hasExistingAttendance"
          :label="APP_CONSTANTS.UI.LABELS.DELETE"
          icon="pi pi-trash"
          severity="danger"
          type="button"
          @click="handleRemove"
          :disabled="isSaving"
        />
        <Button
          type="submit"
          :label="APP_CONSTANTS.UI.LABELS.SAVE"
          icon="pi pi-check"
          :disabled="!formData.reason || isSaving"
          :loading="isSaving"
        />
      </div>
    </form>
  </Dialog>
</template>

<script setup>
import { computed, reactive, watch } from "vue";
import Select from "primevue/select";
import DatePicker from "primevue/datepicker";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import RadioButton from "primevue/radiobutton";
import { APP_CONSTANTS } from "../config/constants";
import {
  getPersonFullName,
  formatTimeShort,
  formatLessonTimeDisplay,
} from "../utils/journalUtils";
import { toApiDate } from "../utils/dateUtils";

const props = defineProps({
  visible: Boolean,
  person: Object,
  lessonTime: Object,
  selectedDate: [Date, null],
  lessonTimes: Array,
  dicts: Object,
  isSaving: Boolean,
  hasExistingAttendance: Boolean,
  initialReason: [Number, null],
});

const emit = defineEmits(["update:visible", "save", "remove"]);

const headerTitle = computed(() => getPersonFullName(props.person));

const formData = reactive({
  reason: null,
  mode: "pair",
  pairFrom: 1,
  pairTo: 1,
  dayFrom: null,
  dayTo: null,
});

watch(
  () => props.visible,
  (isVisible) => {
    if (!isVisible) return;
    formData.reason = props.initialReason ?? null;
    formData.mode = "pair";
    formData.pairFrom = props.lessonTime?.number || 1;
    formData.pairTo = props.lessonTime?.number || 1;
    formData.dayFrom = props.selectedDate ? new Date(props.selectedDate) : null;
    formData.dayTo = props.selectedDate ? new Date(props.selectedDate) : null;
  },
  { immediate: true },
);

const pairOptions = computed(() =>
  (props.lessonTimes || []).map((lt) => ({
    value: lt.number,
    label: formatLessonTimeDisplay(lt),
  })),
);

const effectiveRange = computed(() => {
  const selectedIso = toApiDate(props.selectedDate);
  if (formData.mode === "days" && formData.dayFrom && formData.dayTo) {
    const numbers = (props.lessonTimes || []).map((lt) => lt.number);
    return {
      dateFrom: toApiDate(formData.dayFrom),
      dateTo: toApiDate(formData.dayTo),
      lessonTimeFrom: Math.min(...numbers),
      lessonTimeTo: Math.max(...numbers),
    };
  }
  if (formData.mode === "pairs") {
    return {
      dateFrom: selectedIso,
      dateTo: selectedIso,
      lessonTimeFrom: Math.min(formData.pairFrom, formData.pairTo),
      lessonTimeTo: Math.max(formData.pairFrom, formData.pairTo),
    };
  }
  return {
    dateFrom: selectedIso,
    dateTo: selectedIso,
    lessonTimeFrom: props.lessonTime?.number,
    lessonTimeTo: props.lessonTime?.number,
  };
});

const affectedCount = computed(() => {
  const r = effectiveRange.value;
  if (!r?.dateFrom || !r?.dateTo || !r.lessonTimeFrom || !r.lessonTimeTo)
    return 0;
  const days =
    Math.floor(
      (new Date(r.dateTo) - new Date(r.dateFrom)) /
        APP_CONSTANTS.RULES.MS_PER_DAY,
    ) + 1;
  const pairs = r.lessonTimeTo - r.lessonTimeFrom + 1;
  return Math.max(0, days) * pairs;
});

const handleSave = () => {
  if (props.isSaving) return;
  emit("save", {
    reason: formData.reason,
    ...effectiveRange.value,
  });
};

const handleRemove = () => {
  if (props.isSaving) return;
  emit("remove", effectiveRange.value);
};
</script>
