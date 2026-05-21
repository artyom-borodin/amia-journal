import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { DictionaryService } from "../services/dictionaryService";
import { createDictMap } from "../utils/journalUtils";

export const useDictionaryStore = defineStore("dictionary", () => {
  const dicts = ref({
    groups: [],
    subjects: [],
    markKinds: [],
    markValues: [],
    lessonTimes: [],
    attendanceReasons: [],
    lessonTypes: [],
    teachers: [],
    faculties: [],
    specialties: [],
  });

  const dictsMap = computed(() => ({
    lessonTimes: createDictMap(dicts.value.lessonTimes),
    lessonTypes: createDictMap(dicts.value.lessonTypes),
    markValues: createDictMap(dicts.value.markValues),
    attendanceReasons: createDictMap(dicts.value.attendanceReasons),
    teachers: createDictMap(dicts.value.teachers),
  }));

  const isLoading = ref(false);

  const fetchDictionaries = async () => {
    if (dicts.value.groups.length > 0) return;

    isLoading.value = true;
    try {
      dicts.value = await DictionaryService.getDictionaries();
    } catch (error) {
      console.error("Failed to fetch dictionaries:", error);
    } finally {
      isLoading.value = false;
    }
  };

  return {
    dicts,
    dictsMap,
    isLoading,
    fetchDictionaries,
  };
});
