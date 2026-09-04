<template>
  <Dialog
    :visible="visible"
    modal
    :header="
      isEditMode
        ? APP_CONSTANTS.UI.LABELS.EDIT_LESSON
        : APP_CONSTANTS.UI.LABELS.ADD_LESSON
    "
    class="add-lesson-modal"
    :closable="!isSaving"
    :closeOnEscape="!isSaving"
    :dismissableMask="!isSaving"
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
            :disabled="isSaving"
          />
        </div>
        <div class="field">
          <label>{{ APP_CONSTANTS.UI.LABELS.HOURS }}</label>
          <Select
            v-model="newLesson.hours"
            :options="APP_CONSTANTS.LESSON_HOURS_OPTIONS"
            class="w-full"
            showClear
            :disabled="isSaving"
            :placeholder="APP_CONSTANTS.UI.PLACEHOLDERS.SELECT_HOURS"
          />
        </div>
      </div>

      <div class="field">
        <label>{{ APP_CONSTANTS.UI.LABELS.LESSON_TIME }}</label>
        <Select
          v-model="newLesson.lesson_time"
          :options="dicts.lessonTimes"
          optionValue="id"
          class="w-full"
          showClear
          :disabled="isSaving"
          :placeholder="APP_CONSTANTS.UI.PLACEHOLDERS.SELECT_LESSON_TIME"
        >
          <template #value="slotProps">
            <span v-if="slotProps.value">
              {{ formatTimeDisplay(dictsMap.lessonTimes[slotProps.value]) }}
            </span>
            <span v-else>
              {{ APP_CONSTANTS.UI.PLACEHOLDERS.SELECT_LESSON_TIME }}
            </span>
          </template>
          <template #option="slotProps">
            {{ formatTimeDisplay(slotProps.option) }}
          </template>
        </Select>
      </div>

      <div class="field">
        <label>{{ APP_CONSTANTS.UI.LABELS.LESSON_TYPE }}</label>
        <Select
          v-model="newLesson.lesson_type"
          :options="dicts.lessonTypes"
          optionLabel="name"
          optionValue="id"
          class="w-full"
          required
          :disabled="isSaving"
        />
      </div>

      <div class="field">
        <label>{{ APP_CONSTANTS.UI.LABELS.TEACHERS }}</label>
        <MultiSelect
          v-model="newLesson.teachers"
          :options="dicts.teachers"
          optionLabel="username"
          display="chip"
          optionValue="id"
          filter
          :placeholder="APP_CONSTANTS.UI.PLACEHOLDERS.SELECT_TEACHERS"
          class="w-full"
          :disabled="isSaving"
        >
          <template #option="slotProps">
            {{ getPersonFullName(slotProps.option) }}
          </template>

          <template #chip="slotProps">
            <div>
              {{ getPersonFullName(dictsMap.teachers[slotProps.value]) }}
            </div>
          </template>
        </MultiSelect>
      </div>

      <div class="field">
        <label>{{ APP_CONSTANTS.UI.LABELS.TOPIC }}</label>
        <Textarea
          v-model="newLesson.topic"
          rows="3"
          class="w-full"
          :disabled="isSaving"
        />
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
          :label="
            isEditMode
              ? APP_CONSTANTS.UI.LABELS.SAVE
              : APP_CONSTANTS.UI.LABELS.ADD
          "
          icon="pi pi-check"
          :loading="isSaving"
          :disabled="isSaving"
        />
      </div>
    </form>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import DatePicker from "primevue/datepicker";
import { APP_CONSTANTS } from "../config/constants";
import { toApiDate } from "../utils/dateUtils";
import { getPersonFullName, formatLessonTimeDisplay } from "../utils/journalUtils";
import { useAuthStore } from "../store/authStore";

const props = defineProps({
  visible: Boolean,
  dicts: Object,
  dictsMap: Object,
  isSaving: Boolean,
  lesson: Object,
});

const emit = defineEmits(["update:visible", "add", "save"]);
const authStore = useAuthStore();

const isEditMode = computed(() => !!props.lesson);

const newLesson = ref({
  date: null,
  hours: null,
  lesson_time: null,
  lesson_type: null,
  topic: null,
  teachers: [],
});

const formatTimeDisplay = (timeObj) => formatLessonTimeDisplay(timeObj);

watch(
  () => props.visible,
  (newVal) => {
    if (!newVal) return;

    if (props.lesson) {
      newLesson.value = {
        date: props.lesson.date ? new Date(props.lesson.date) : null,
        hours: props.lesson.hours || null,
        lesson_time: props.lesson.lesson_time,
        lesson_type: props.lesson.lesson_type,
        topic: props.lesson.topic,
        teachers: props.lesson.teachers
          ? props.lesson.teachers.map((t) => t.id ?? t)
          : [],
      };
    } else {
      const meId = authStore.user?.id;
      const selfTeacher = (props.dicts.teachers || []).find(
        (t) => meId != null && String(t.id) === String(meId),
      );
      newLesson.value = {
        date: new Date(),
        hours: null,
        lesson_time: null,
        lesson_type: null,
        topic: null,
        teachers: selfTeacher ? [selfTeacher.id] : [],
      };
    }
  },
);

const handleSubmit = () => {
  if (props.isSaving) return;

  const payload = {
    ...newLesson.value,
    hours: newLesson.value.hours || 0,
    date: toApiDate(newLesson.value.date),
  };

  if (isEditMode.value) {
    emit("save", payload);
  } else {
    emit("add", payload);
  }
};
</script>
