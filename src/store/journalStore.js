import { defineStore } from "pinia";
import { ref } from "vue";
import { JournalService } from "../services/journalService";
import { PersonService } from "../services/personService";
import { useDictionaryStore } from "./dictionaryStore";
import { APP_CONSTANTS } from "../config/constants";
import {
  sortLessons,
  buildRecordsMap,
  buildAttendancesMap,
  generateCellKey,
} from "../utils/journalUtils";

export const useJournalStore = defineStore("journal", () => {
  const dictionaryStore = useDictionaryStore();

  const persons = ref([]);
  const lessons = ref([]);
  const recordsMap = ref({});
  const attendancesMap = ref({});
  const gridMatrix = ref({});
  const isLoading = ref(false);

  const fetchGridData = async (groupId, subjectId, silent = false) => {
    if (!groupId || !subjectId) return;

    if (!silent) {
      isLoading.value = true;
    }

    try {
      const [personsData, journalData] = await Promise.all([
        PersonService.getPersonsByGroup(groupId),
        JournalService.getJournalData(groupId, subjectId),
      ]);

      persons.value = personsData;
      lessons.value = sortLessons(
        journalData.lessons,
        dictionaryStore.dictsMap.lessonTimes,
      );

      recordsMap.value = buildRecordsMap(journalData.records, lessons.value);
      attendancesMap.value = buildAttendancesMap(journalData.attendances);

      const matrix = {};
      personsData.forEach((person) => {
        matrix[person.uniqueId] = {};
        lessons.value.forEach((lesson) => {
          const attendanceKey = generateCellKey(
            person.uniqueId,
            lesson.date,
            lesson.lesson_time,
          );
          const recordKey = `${person.uniqueId}_${lesson.id}`;

          const attendance = attendancesMap.value[attendanceKey];
          const reason = attendance
            ? dictionaryStore.dictsMap.attendanceReasons[attendance.reason]
            : null;

          matrix[person.uniqueId][lesson.id] = {
            records: recordsMap.value[recordKey] || [],
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
    const { savedAttendance, savedMarks } =
      await JournalService.saveCellData(cellData);

    const { person, lesson, reason, marks } = cellData;
    const attendanceKey = generateCellKey(
      person.uniqueId,
      lesson.date,
      lesson.lesson_time,
    );
    const recordKey = `${person.uniqueId}_${lesson.id}`;

    if (reason != null) {
      attendancesMap.value[attendanceKey] = savedAttendance || {
        ...cellData.attendance,
        reason,
      };
    } else {
      delete attendancesMap.value[attendanceKey];
    }

    if (savedMarks && Array.isArray(savedMarks)) {
      recordsMap.value[recordKey] = savedMarks;
    } else {
      recordsMap.value[recordKey] = marks.map((m, i) => ({
        id: m.id || `${APP_CONSTANTS.PREFIXES.TEMP}${Date.now()}-${i}`,
        mark_value: m.mark_value,
      }));
    }

    const reasonObj = reason
      ? dictionaryStore.dictsMap.attendanceReasons[reason]
      : null;

    if (
      gridMatrix.value[person.uniqueId] &&
      gridMatrix.value[person.uniqueId][lesson.id]
    ) {
      gridMatrix.value[person.uniqueId][lesson.id].records =
        recordsMap.value[recordKey];
      gridMatrix.value[person.uniqueId][lesson.id].isAbsent = reasonObj
        ? reasonObj.is_absent
        : false;
    }
  };

  const addLesson = async (lessonData) => {
    await JournalService.createLesson(lessonData);
  };

  return {
    persons,
    lessons,
    recordsMap,
    attendancesMap,
    gridMatrix,
    isLoading,
    fetchGridData,
    saveCellData,
    addLesson,
  };
});
