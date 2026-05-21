<template>
  <Dialog
    :visible="visible"
    modal
    :header="APP_CONSTANTS.UI.ERROR_SUMMARY"
    class="error-modal"
    :closable="false"
    @update:visible="$emit('update:visible', $event)"
  >
    <div class="error-dialog-content">
      <i class="pi pi-exclamation-triangle error-icon"></i>
      <span class="error-text">{{ message }}</span>
    </div>
    <template #footer>
      <Button label="OK" @click="$emit('update:visible', false)" autofocus />
    </template>
  </Dialog>
</template>

<script setup>
import { APP_CONSTANTS } from "../config/constants";

defineProps({
  visible: Boolean,
  message: String,
});

defineEmits(["update:visible"]);
</script>
