import { ref, nextTick } from "vue";
import { APP_CONSTANTS } from "../config/constants";
import { generateCellKey } from "../utils/journalUtils";

export function useInlineEdit(dictsMap, journalStore, emit) {
  const editingCell = ref(null);
  const inlineMarkValue = ref('');
  const filteredMarkValues = ref([]);
  const isSavingInline = ref(false);
  let clickTimer = null;

  const isEditing = (personId, lessonId) => {
    return editingCell.value?.personId === personId && editingCell.value?.lessonId === lessonId;
  };

  const handleSingleClick = (person, lesson) => {
    if (isEditing(person.id, lesson.id)) return;

    if (clickTimer) clearTimeout(clickTimer);

    clickTimer = setTimeout(async () => {
      editingCell.value = { personId: person.id, lessonId: lesson.id };
      inlineMarkValue.value = '';

      await nextTick();
      const inputElement = document.querySelector(APP_CONSTANTS.CSS_SELECTORS.INLINE_EDITOR_INPUT);
      if (inputElement) {
        inputElement.focus();
      }
    }, APP_CONSTANTS.TIMERS.INLINE_EDIT_DELAY);
  };

  const openCellModal = (person, lesson) => {
    if (clickTimer) clearTimeout(clickTimer);
    editingCell.value = null;
    emit('cell-click', { person, lesson });
  };

  const searchMarkValues = (event) => {
    const query = event.query.toLowerCase();
    filteredMarkValues.value = Object.values(dictsMap.markValues)
      .filter(m => m.value.toLowerCase().includes(query));
  };

  const saveInlineMark = async (person, lesson) => {
    if (isSavingInline.value) return;

    let markObj = inlineMarkValue.value;
    if (!markObj) {
      editingCell.value = null;
      return;
    }

    if (typeof markObj === 'string') {
      const query = markObj.toLowerCase().trim();
      markObj = Object.values(dictsMap.markValues).find(m => m.value.toLowerCase() === query)
             || Object.values(dictsMap.markValues).find(m => m.value.toLowerCase().startsWith(query));
    }

    if (markObj && markObj.id) {
      isSavingInline.value = true;
      const existingRecords = journalStore.gridMatrix[person.id]?.[lesson.id]?.records || [];
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
          reason: journalStore.attendancesMap[generateCellKey(person.id, lesson.date, lesson.lesson_time)]?.reason
        });
      } catch (err) {
        console.error("Ошибка при сохранении:", err);
      } finally {
        isSavingInline.value = false;
        editingCell.value = null;
      }
    } else {
      editingCell.value = null;
    }
  };

  const closeInlineEdit = () => {
    setTimeout(() => {
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
    closeInlineEdit
  };
}