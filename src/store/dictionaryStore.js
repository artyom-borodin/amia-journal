import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { DictionaryService } from "../services/dictionaryService";
import { createDictMap } from "../utils/journalUtils";

export const useDictionaryStore = defineStore("dictionary", () => {
  const dicts = ref({
    groups: [],
    subjects: [],
    markValues: [],
    lessonTimes: [],
    attendanceReasons: [],
    lessonTypes: [],
    teachers: [],
    faculties: [],
    specialties: [],
    years: [],
    semesters: [],
  });

  const dictsMap = computed(() => ({
    lessonTimes: createDictMap(dicts.value.lessonTimes),
    lessonTypes: createDictMap(dicts.value.lessonTypes),
    markValues: createDictMap(dicts.value.markValues),
    attendanceReasons: createDictMap(dicts.value.attendanceReasons),
    teachers: createDictMap(dicts.value.teachers),
    years: createDictMap(dicts.value.years),
    semesters: createDictMap(dicts.value.semesters),
    specialties: createDictMap(dicts.value.specialties),
    subjects: createDictMap(dicts.value.subjects),
  }));

  const isLoading = ref(false);
  let inflight = null;

  const fetchDictionaries = async (force = false) => {
    if (!force && dicts.value.groups.length > 0) return;
    if (inflight) return inflight;

    isLoading.value = true;
    inflight = DictionaryService.getDictionaries()
      .then((data) => {
        dicts.value = data;
      })
      .catch((error) => {
        console.error("Failed to fetch dictionaries:", error);
      })
      .finally(() => {
        isLoading.value = false;
        inflight = null;
      });
    return inflight;
  };

  return {
    dicts,
    dictsMap,
    isLoading,
    fetchDictionaries,
  };
});
