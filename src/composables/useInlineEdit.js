import { ref, nextTick } from "vue";
import { APP_CONSTANTS } from "../config/constants";
import { generateCellKey, resolveMarkByText } from "../utils/journalUtils";

export function useInlineEdit(dictsMap, journalStore, emit) {
  const editingCell = ref(null);
  const inlineMarkValue = ref("");
  const filteredMarkValues = ref([]);
  const isSavingInline = ref(false);

  let clickTimer = null;
  let blurTimer = null;

  const isEditing = (personUniqueId, lessonId) => {
    return (
      editingCell.value?.personUniqueId === personUniqueId &&
      editingCell.value?.lessonId === lessonId
    );
  };

  const focusEditor = () => {
    setTimeout(() => {
      const inputElement = document.querySelector(
        APP_CONSTANTS.CSS_SELECTORS.INLINE_EDITOR_INPUT,
      );
      if (inputElement) {
        inputElement.focus();
      }
    }, APP_CONSTANTS.TIMERS.INLINE_EDIT_FOCUS);
  };

  const openEditor = async (personUniqueId, lessonId) => {
    editingCell.value = { personUniqueId, lessonId };
    inlineMarkValue.value = "";
    await nextTick();
    focusEditor();
  };

  const openEditorOnNext = async (persons, currentUniqueId, lesson) => {
    const list = (persons || []).filter((p) => !p.isEmptyRow);
    const index = list.findIndex((p) => p.uniqueId === currentUniqueId);
    const next = index >= 0 ? list[index + 1] : null;
    if (next) {
      await openEditor(next.uniqueId, lesson.id);
    }
  };

  const handleSingleClick = (person, lesson) => {
    if (isSavingInline.value) return;
    if (isEditing(person.uniqueId, lesson.id)) return;

    if (clickTimer) clearTimeout(clickTimer);
    if (blurTimer) clearTimeout(blurTimer);

    clickTimer = setTimeout(async () => {
      await openEditor(person.uniqueId, lesson.id);
    }, APP_CONSTANTS.TIMERS.INLINE_EDIT_DELAY);
  };

  const openCellModal = (person, lesson) => {
    if (isSavingInline.value) return;

    if (clickTimer) clearTimeout(clickTimer);
    if (blurTimer) clearTimeout(blurTimer);
    editingCell.value = null;
    emit("cell-click", { person, lesson });
  };

  const searchMarkValues = (event) => {
    const query = event.query.toLowerCase();
    filteredMarkValues.value = Object.values(dictsMap.markValues).filter((m) =>
      m.value.toLowerCase().includes(query),
    );
  };

  const persistInlineMark = async (person, lesson, markObj) => {
    isSavingInline.value = true;
    inlineMarkValue.value = markObj;

    const existingRecords =
      journalStore.gridMatrix[person.uniqueId]?.[lesson.id]?.records || [];
    const marks = [...existingRecords];

    if (marks.length > 0) {
      marks[0].mark_value = markObj.id;
    } else {
      marks.push({ mark_value: markObj.id });
    }

    try {
      await journalStore.saveCellData({
        person,
        lesson,
        marks,
        reason:
          journalStore.attendancesMap[
            generateCellKey(person.uniqueId, lesson.date, lesson.lesson_time)
          ]?.reason,
      });
      return true;
    } catch (err) {
      console.error(APP_CONSTANTS.UI.ERRORS.SAVE_CONSOLE, err);
      emit("error", err, APP_CONSTANTS.UI.ERRORS.SAVE_DATA);
      return false;
    } finally {
      isSavingInline.value = false;
    }
  };

  const normalizeMarkPayload = (payload) => {
    if (!payload) return null;
    const candidate =
      typeof payload === "object" && payload.value !== undefined && payload.id === undefined
        ? payload.value
        : payload;
    if (typeof candidate === "string") {
      return resolveMarkByText(dictsMap.markValues, candidate).mark;
    }
    return candidate && candidate.id ? candidate : null;
  };

  const saveInlineMark = async (person, lesson, eventPayload = null) => {
    if (blurTimer) clearTimeout(blurTimer);

    if (isSavingInline.value) return;

    const markObj = normalizeMarkPayload(eventPayload ?? inlineMarkValue.value);

    if (!markObj) {
      editingCell.value = null;
      return;
    }

    const saved = await persistInlineMark(person, lesson, markObj);
    editingCell.value = null;
    if (saved) {
      emit("saved");
    }
  };

  const handleInlineInput = (val, person, lesson) => {
    if (blurTimer) clearTimeout(blurTimer);

    if (!val || isSavingInline.value || typeof val !== "string") return;

    const { mark, isAmbiguous } = resolveMarkByText(dictsMap.markValues, val);
    if (mark && !isAmbiguous) {
      saveInlineMark(person, lesson, mark);
    }
  };

  const handleInlineKeydown = async (event, person, lesson, persons) => {
    if (
      event.key === APP_CONSTANTS.KEYBOARD.ENTER ||
      event.key === APP_CONSTANTS.KEYBOARD.ESCAPE
    ) {
      return;
    }
    if (typeof event.key !== "string" || event.key.length !== 1) return;
    if (isSavingInline.value) return;

    const { mark, isAmbiguous } = resolveMarkByText(dictsMap.markValues, event.key);
    if (!mark || isAmbiguous) return;

    event.preventDefault();
    if (blurTimer) clearTimeout(blurTimer);
    if (clickTimer) clearTimeout(clickTimer);

    const saved = await persistInlineMark(person, lesson, mark);
    editingCell.value = null;
    if (saved) {
      emit("saved");
      await openEditorOnNext(persons, person.uniqueId, lesson);
    }
  };

  const handleEnter = (person, lesson, persons = null) => {
    if (blurTimer) clearTimeout(blurTimer);
    setTimeout(async () => {
      if (!isSavingInline.value && isEditing(person.uniqueId, lesson.id)) {
        await saveInlineMark(person, lesson);
        if (persons) {
          await openEditorOnNext(persons, person.uniqueId, lesson);
        }
      }
    }, APP_CONSTANTS.TIMERS.INLINE_EDIT_SAVE);
  };

  const closeInlineEdit = () => {
    if (blurTimer) clearTimeout(blurTimer);

    blurTimer = setTimeout(() => {
      if (!isSavingInline.value) {
        editingCell.value = null;
      }
    }, APP_CONSTANTS.TIMERS.INLINE_EDIT_CLOSE);
  };

  return {
    editingCell,
    inlineMarkValue,
    filteredMarkValues,
    isSavingInline,
    isEditing,
    handleSingleClick,
    openCellModal,
    searchMarkValues,
    saveInlineMark,
    closeInlineEdit,
    handleInlineInput,
    handleInlineKeydown,
    handleEnter,
  };
}
