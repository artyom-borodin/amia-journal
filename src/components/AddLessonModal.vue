<template>
  <Dialog
    :visible="visible"
    modal
    :header="APP_CONSTANTS.UI.LABELS.ADD_LESSON"
    class="add-lesson-modal"
    @update:visible="$emit('update:visible', $event)"
  >
    <form @submit.prevent="handleSubmit" class="form-layout">
      <div class="form-grid">
        <div class="field">
          <label>{{ APP_CONSTANTS.UI.LABELS.DATE }}</label>
          <DatePicker
            v-model="newLesson.date"
            required
            :placeholder="APP_CONSTANTS.UI.PLACEHOLDERS.SELECT_DATE"
            showIcon
            iconDisplay="input"
          />
        </div>
        <div class="field">
          <label>{{ APP_CONSTANTS.UI.LABELS.LESSON_TIME }}</label>
          <Select
            v-model="newLesson.lesson_time"
            :options="dicts.lessonTimes"
            optionLabel="number"
            optionValue="id"
            class="w-full"
            required
          >
            <template #value="slotProps">
              <span v-if="slotProps.value">{{
                getLessonTimeLabel(slotProps.value)
              }}</span>
              <span v-else>{{
                APP_CONSTANTS.UI.PLACEHOLDERS.SELECT_LESSON_TIME
              }}</span>
            </template>
            <template #option="slotProps">
              {{ slotProps.option.number }} {{ APP_CONSTANTS.UI.LESSON_SUFFIX }}
            </template>
          </Select>
        </div>
      </div>

      <div class="field">
        <label>{{ APP_CONSTANTS.UI.LABELS.MARK_KIND }}</label>
        <Select
          v-model="newLesson.mark_kind"
          :options="dicts.markKinds"
          optionLabel="mark_kind"
          optionValue="id"
          class="w-full"
          required
        />
      </div>

      <div class="field">
        <label>{{ APP_CONSTANTS.UI.LABELS.TOPIC }}</label>
        <Textarea v-model="newLesson.topic" rows="3" class="w-full" />
      </div>

      <div class="dialog-footer">
        <Button
          :label="APP_CONSTANTS.UI.LABELS.CANCEL"
          icon="pi pi-times"
          text
          severity="secondary"
          @click="$emit('update:visible', false)"
        />
        <Button
          type="submit"
          :label="APP_CONSTANTS.UI.LABELS.ADD"
          icon="pi pi-check"
        />
      </div>
    </form>
  </Dialog>
</template>

<script setup>
import { ref, watch } from "vue";
import DatePicker from "primevue/datepicker";
import { APP_CONSTANTS } from "../config/constants";
import { toApiDate } from "../utils/dateUtils";

const props = defineProps({
  visible: Boolean,
  dicts: Object,
});

const emit = defineEmits(["update:visible", "add"]);

const newLesson = ref({
  date: null,
  lesson_time: "",
  mark_kind: "",
  topic: "",
});

watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      newLesson.value = {
        date: null,
        lesson_time: "",
        mark_kind: "",
        topic: "",
      };
    }
  },
);

const getLessonTimeLabel = (id) => {
  const time = props.dicts.lessonTimes.find((t) => t.id === id);
  return time ? `${time.number} ${APP_CONSTANTS.UI.LESSON_SUFFIX}` : "";
};

const handleSubmit = () => {
  emit("add", {
    ...newLesson.value,
    date: toApiDate(newLesson.value.date),
  });
};
</script>
