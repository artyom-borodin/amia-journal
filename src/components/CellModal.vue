<template>
  <Dialog
    :visible="visible"
    modal
    :header="headerTitle"
    class="cell-modal"
    @update:visible="$emit('update:visible', $event)"
  >
    <form @submit.prevent="handleSave" class="form-layout">
      <div class="field">
        <label>{{ APP_CONSTANTS.UI.LABELS.ATTENDANCE }}</label>
        <Select
          v-model="formData.reason"
          :options="dicts.attendanceReasons"
          optionLabel="name"
          optionValue="id"
          :placeholder="APP_CONSTANTS.UI.DEFAULT_ATTENDANCE"
          class="w-full"
          showClear
          :disabled="isSaving"
        />
      </div>

      <div class="field">
        <div class="marks-header">
          <label>{{ APP_CONSTANTS.UI.LABELS.MARK }}</label>
          <Button
            icon="pi pi-plus"
            size="small"
            text
            @click="addMark"
            :disabled="isSaving"
          />
        </div>

        <div
          v-for="(mark, index) in formData.marks"
          :key="index"
          class="mark-row"
        >
          <Select
            v-model="mark.mark_value"
            :options="dicts.markValues"
            optionLabel="value"
            optionValue="id"
            :placeholder="APP_CONSTANTS.UI.LABELS.MARK_VALUE"
            class="mark-select"
            required
            :disabled="isSaving"
          />
          <Select
            v-model="mark.mark_kind"
            :options="dicts.markKinds"
            optionLabel="mark_kind"
            optionValue="id"
            :placeholder="APP_CONSTANTS.UI.LABELS.MARK_KIND_TYPE"
            class="kind-select"
            required
            :disabled="isSaving"
          />
          <Button
            icon="pi pi-trash"
            severity="danger"
            text
            @click="removeMark(index)"
            :disabled="isSaving"
          />
        </div>
        <div v-if="formData.marks.length === 0" class="no-marks-text">
          {{ APP_CONSTANTS.UI.MESSAGES.NO_MARKS }}
        </div>
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
import { ref, computed, watch } from "vue";
import { APP_CONSTANTS } from "../config/constants";
import { getPersonFullName } from "../utils/journalUtils";

const props = defineProps({
  visible: Boolean,
  person: Object,
  lesson: Object,
  records: Array,
  attendance: Object,
  dicts: Object,
  isSaving: Boolean,
});

const emit = defineEmits(["update:visible", "save"]);

const headerTitle = computed(() => getPersonFullName(props.person));

const formData = ref({
  reason: null,
  marks: [],
});

watch(
  () => [props.records, props.attendance, props.visible],
  ([newRecords, newAttendance, isVisible]) => {
    if (isVisible) {
      formData.value.reason = newAttendance?.reason ?? null;
      formData.value.marks = newRecords
        ? newRecords.map((r) => ({
            mark_value: r.mark_value,
            mark_kind: r.mark_kind,
          }))
        : [];
    }
  },
  { immediate: true },
);

const addMark = () => {
  formData.value.marks.push({ mark_value: null, mark_kind: null });
};

const removeMark = (index) => {
  formData.value.marks.splice(index, 1);
};

const handleSave = () => {
  emit("save", {
    reason: formData.value.reason,
    marks: formData.value.marks,
  });
};
</script>
