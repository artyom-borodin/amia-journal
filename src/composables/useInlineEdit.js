import { ref, nextTick } from "vue";
import { APP_CONSTANTS } from "../config/constants";
import { generateCellKey } from "../utils/journalUtils";

export function useInlineEdit(dictsMap, journalStore, emit) {
  const editingCell = ref(null);
  const inlineMarkValue = ref('');
  const filteredMarkValues = ref([]);
  const isSavingInline = ref(false);
  
  let clickTimer = null;
  let blurTimer = null; 

  const isEditing = (personId, lessonId) => {
    return editingCell.value?.personId === personId && editingCell.value?.lessonId === lessonId;
  };

  const handleSingleClick = (person, lesson) => {
    if (isEditing(person.id, lesson.id)) return;

    if (clickTimer) clearTimeout(clickTimer);
    if (blurTimer) clearTimeout(blurTimer);

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
    if (blurTimer) clearTimeout(blurTimer);
    editingCell.value = null;
    emit('cell-click', { person, lesson });
  };

  const searchMarkValues = (event) => {
    const query = event.query.toLowerCase();
    filteredMarkValues.value = Object.values(dictsMap.markValues)
      .filter(m => m.value.toLowerCase().includes(query));
  };

  const saveInlineMark = async (person, lesson, eventPayload = null) => {
    if (blurTimer) clearTimeout(blurTimer);
    
    if (isSavingInline.value) return;

    let markObj = inlineMarkValue.value;
    
    if (eventPayload) {
      markObj = eventPayload.value !== undefined ? eventPayload.value : eventPayload;
    }

    if (!markObj) {
      editingCell.value = null;
      return;
    }

    if (typeof markObj === 'string') {
      const query = markObj.toLowerCase().trim();
      const allMarks = Object.values(dictsMap.markValues);
      
      let found = allMarks.find(m => m.value.toLowerCase() === query);
      
      if (!found) {
        const matches = allMarks.filter(m => m.value.toLowerCase().startsWith(query));
        if (matches.length === 1) {
          found = matches[0];
        }
      }
      markObj = found;
    }

    if (markObj && markObj.id) {
      isSavingInline.value = true;
      inlineMarkValue.value = markObj;
      
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

  const handleInlineInput = (val, person, lesson) => {
    if (blurTimer) clearTimeout(blurTimer);

    if (!val || isSavingInline.value || typeof val !== 'string') return;
    
    const query = val.toLowerCase().trim();
    const allMarks = Object.values(dictsMap.markValues);
    
    const exactMatch = allMarks.find(m => m.value.toLowerCase() === query);
    
    if (exactMatch) {
      const isPrefixForOthers = allMarks.some(m => 
        m.id !== exactMatch.id && m.value.toLowerCase().startsWith(query)
      );
      
      if (!isPrefixForOthers) {
        saveInlineMark(person, lesson, exactMatch);
      }
    }
  };

  const handleEnter = (person, lesson) => {
    if (blurTimer) clearTimeout(blurTimer);
    setTimeout(() => {
      if (!isSavingInline.value) {
        saveInlineMark(person, lesson);
      }
    }, 50);
  };

  const closeInlineEdit = () => {
    if (blurTimer) clearTimeout(blurTimer);
    
    blurTimer = setTimeout(() => {
      if (!isSavingInline.value) {
        editingCell.value = null;
      }
    }, 300); 
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
    handleEnter
  };
}