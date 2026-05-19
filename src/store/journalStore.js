import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { JournalService } from "../services/journalService";
import { APP_CONSTANTS } from "../config/constants";
import {
  createDictMap,
  sortLessons,
  buildRecordsMap,
  buildAttendancesMap,
  generateCellKey,
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
    teachers: createDictMap(dicts.value.teachers),
  }));

  const persons = ref([]);
  const lessons = ref([]);
  const recordsMap = ref({});
  const attendancesMap = ref({});
  const gridMatrix = ref({});
  const isLoading = ref(false);

  const fetchFilters = async () => {
    dicts.value = await JournalService.getDictionaries();
  };

  const fetchGridData = async (groupId, subjectId, silent = false) => {
    if (!groupId || !subjectId) return;

    if (!silent) {
      isLoading.value = true;
    }

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

      const matrix = {};
      personsData.forEach((person) => {
        matrix[person.id] = {};
        lessons.value.forEach((lesson) => {
          const key = generateCellKey(
            person.id,
            lesson.date,
            lesson.lesson_time,
          );
          const attendance = attendancesMap.value[key];
          const reason = attendance
            ? dictsMap.value.attendanceReasons[attendance.reason]
            : null;

          matrix[person.id][lesson.id] = {
            records: recordsMap.value[key] || [],
            isAbsent: reason ? reason.is_absent : false,
          };
        });
      });
      gridMatrix.value = matrix;
    } finally {
      if (!silent) {
        isLoading.value = false;
      }
    }
  };

  const saveCellData = async (cellData) => {
    const savedAttendance = await JournalService.saveCellData(cellData);

    const { person, lesson, reason, marks } = cellData;
    const key = generateCellKey(person.id, lesson.date, lesson.lesson_time);

    if (reason != null) {
      attendancesMap.value[key] = savedAttendance || {
        ...cellData.attendance,
        reason,
      };
    } else {
      delete attendancesMap.value[key];
    }

    recordsMap.value[key] = marks.map((m, i) => ({
      id: `${APP_CONSTANTS.PREFIXES.TEMP}${Date.now()}-${i}`,
      mark_value: m.mark_value,
      mark_kind: m.mark_kind,
    }));

    const reasonObj = reason ? dictsMap.value.attendanceReasons[reason] : null;
    if (gridMatrix.value[person.id] && gridMatrix.value[person.id][lesson.id]) {
      gridMatrix.value[person.id][lesson.id].records = recordsMap.value[key];
      gridMatrix.value[person.id][lesson.id].isAbsent = reasonObj
        ? reasonObj.is_absent
        : false;
    }
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
    gridMatrix,
    isLoading,
    fetchFilters,
    fetchGridData,
    saveCellData,
    addLesson,
  };
});
