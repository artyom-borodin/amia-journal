<template>
  <Dialog
    :visible="visible"
    modal
    class="delete-lesson-dialog"
    :closable="!isDeleting"
    :closeOnEscape="!isDeleting"
    :dismissableMask="!isDeleting"
    @update:visible="$emit('update:visible', $event)"
  >
    <template #header>
      <div class="delete-header">
        <i class="pi pi-exclamation-triangle delete-header-icon"></i>
        <span>{{ APP_CONSTANTS.UI.DELETE_LESSON.TITLE }}</span>
      </div>
    </template>

    <div class="delete-summary">
      <div class="delete-summary-title">
        {{ APP_CONSTANTS.UI.DELETE_LESSON.DELETED_WHAT }}
      </div>
      <ul>
        <li>{{ lessonLine }}</li>
        <li>{{ marksLine }}</li>
      </ul>
    </div>

    <div class="delete-note">
      {{ APP_CONSTANTS.UI.DELETE_LESSON.ATTENDANCE_NOTE }}
    </div>

    <div class="delete-danger">
      <div>{{ APP_CONSTANTS.UI.DELETE_LESSON.IRREVERSIBLE }}</div>
      <div class="delete-risk">
        {{ APP_CONSTANTS.UI.DELETE_LESSON.RISK }}
      </div>
    </div>

    <div class="field mt-3">
      <label>
        {{ APP_CONSTANTS.UI.DELETE_LESSON.CONFIRM_HINT }}
        <b>{{ APP_CONSTANTS.UI.DELETE_LESSON.CONFIRM_WORD }}</b>
      </label>
      <InputText
        v-model="confirmWord"
        class="w-full"
        :disabled="isDeleting"
        autocomplete="off"
      />
    </div>

    <template #footer>
      <div class="dialog-footer">
        <Button
          :label="APP_CONSTANTS.UI.LABELS.CANCEL"
          icon="pi pi-times"
          text
          severity="secondary"
          :disabled="isDeleting"
          @click="$emit('update:visible', false)"
        />
        <Button
          :label="APP_CONSTANTS.UI.LABELS.DELETE_LESSON"
          icon="pi pi-trash"
          severity="danger"
          :loading="isDeleting"
          :disabled="!isConfirmed || isDeleting"
          @click="$emit('confirm')"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { APP_CONSTANTS } from "../config/constants";

const props = defineProps({
  visible: Boolean,
  lessonLine: String,
  marksCount: Number,
  isDeleting: Boolean,
});

defineEmits(["update:visible", "confirm"]);

const confirmWord = ref("");

watch(
  () => props.visible,
  (isVisible) => {
    if (isVisible) {
      confirmWord.value = "";
    }
  },
);

const isConfirmed = computed(
  () =>
    confirmWord.value.trim() === APP_CONSTANTS.UI.DELETE_LESSON.CONFIRM_WORD,
);

const plural = (n, forms) => {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14))
    return forms[1];
  return forms[2];
};

const marksLine = computed(() => {
  const n = props.marksCount || 0;
  const forms = APP_CONSTANTS.UI.DELETE_LESSON.MARK_FORMS;
  return `${n} ${plural(n, forms)} ${APP_CONSTANTS.UI.DELETE_LESSON.MARK_SUFFIX}`;
});
</script>
