import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { JournalService } from "../services/journalService";
import {
  createDictMap,
  sortLessons,
  buildRecordsMap,
  buildAttendancesMap,
} from "../utils/journalUtils";

export const useJournalStore = defineStore("journal", () => {
  const dicts = ref({
    groups: [],
    subjects: [],
    markKinds: [],
    markValues: [],
    lessonTimes: [],
    attendanceReasons: [],
    lessonTypes: [],
    teachers: [],
  });

  const dictsMap = computed(() => ({
    lessonTimes: createDictMap(dicts.value.lessonTimes),
    lessonTypes: createDictMap(dicts.value.lessonTypes),
    markValues: createDictMap(dicts.value.markValues),
    attendanceReasons: createDictMap(dicts.value.attendanceReasons),
  }));

  const persons = ref([]);
  const lessons = ref([]);
  const recordsMap = ref({});
  const attendancesMap = ref({});
  const isLoading = ref(false);

  const fetchFilters = async () => {
    dicts.value = await JournalService.getDictionaries();
  };

  const fetchGridData = async (groupId, subjectId) => {
    if (!groupId || !subjectId) return;

    isLoading.value = true;
    try {
      const [personsData, journalData] = await Promise.all([
        JournalService.getPersons(groupId),
        JournalService.getJournalData(groupId, subjectId),
      ]);

      persons.value = personsData;
      lessons.value = sortLessons(
        journalData.lessons,
        dictsMap.value.lessonTimes,
      );
      recordsMap.value = buildRecordsMap(journalData.records, lessons.value);
      attendancesMap.value = buildAttendancesMap(journalData.attendances);
    } finally {
      isLoading.value = false;
    }
  };

  const saveCellData = async (cellData) => {
    await JournalService.saveCellData(cellData);
  };

  const addLesson = async (lessonData) => {
    await JournalService.createLesson(lessonData);
  };

  return {
    dicts,
    dictsMap,
    persons,
    lessons,
    recordsMap,
    attendancesMap,
    isLoading,
    fetchFilters,
    fetchGridData,
    saveCellData,
    addLesson,
  };
});
