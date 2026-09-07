<template>
  <Dialog
    :visible="visible"
    modal
    :header="title"
    class="help-dialog"
    @update:visible="$emit('update:visible', $event)"
  >
    <ul class="help-list">
      <li v-for="(line, index) in lines" :key="index">
        {{ line }}
      </li>
    </ul>
    <div class="flex-row align-center gap-2 mt-3">
      <Checkbox v-model="dontShow" :binary="true" inputId="help-dialog-hide" />
      <label for="help-dialog-hide">{{
        APP_CONSTANTS.UI.HELP.DONT_SHOW
      }}</label>
    </div>
    <template #footer>
      <Button
        :label="APP_CONSTANTS.UI.HELP.OK"
        icon="pi pi-check"
        autofocus
        @click="confirm"
      />
    </template>
  </Dialog>
</template>

<script setup>
import { ref, watch } from "vue";
import Checkbox from "primevue/checkbox";
import { APP_CONSTANTS } from "../config/constants";

const props = defineProps({
  visible: Boolean,
  title: String,
  lines: Array,
});

const emit = defineEmits(["update:visible", "confirm"]);

const dontShow = ref(false);

watch(
  () => props.visible,
  (isVisible) => {
    if (isVisible) {
      dontShow.value = false;
    }
  },
);

const confirm = () => {
  emit("confirm", dontShow.value);
};
</script>
