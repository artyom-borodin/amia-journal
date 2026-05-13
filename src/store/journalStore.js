import { defineStore } from "pinia";
import { ref } from "vue";
import { JournalService } from "../services/journalService";
import { APP_CONSTANTS } from "../config/constants";
import { generateCellKey } from "../utils/journalUtils";

export const useJournalStore = defineStore("journal", () => {
  const dicts = ref({
    groups: [],
    subjects: [],
    markKinds: [],
    markValues: [],
    lessonTimes: [],
    attendanceReasons: [],
  });
  const persons = ref([]);
  const lessons = ref([]);
  const recordsMap = ref({});
  const attendancesMap = ref({});
  const isLoading = ref(false);

  const fetchFilters = async (studentType) => {
    dicts.value = await JournalService.getDictionaries(studentType);
  };

  const fetchGridData = async (studentType, groupId, subjectId) => {
    if (!groupId || !subjectId) return;

    isLoading.value = true;
    try {
      const [personsData, journalData] = await Promise.all([
        JournalService.getPersons(studentType, groupId),
        JournalService.getJournalData(groupId, subjectId),
      ]);

      persons.value = personsData;

      const lessonTimesMap = dicts.value.lessonTimes.reduce((acc, t) => {
        acc[t.id] = t.number;
        return acc;
      }, {});

      lessons.value = journalData.lessons.sort((a, b) => {
        if (a.date !== b.date) return new Date(a.date) - new Date(b.date);
        const timeA = lessonTimesMap[a.lesson_time] || 0;
        const timeB = lessonTimesMap[b.lesson_time] || 0;
        return timeA - timeB;
      });

      const rMap = {};
      journalData.records.forEach((r) => {
        const personId =
          studentType === APP_CONSTANTS.STUDENT_TYPES.CADET
            ? r.cadet
            : r.student;
        rMap[generateCellKey(personId, r.mark_date, r.lesson_time)] = r;
      });
      recordsMap.value = rMap;

      const aMap = {};
      journalData.attendances.forEach((a) => {
        const personId =
          studentType === APP_CONSTANTS.STUDENT_TYPES.CADET
            ? a.cadet
            : a.student;
        aMap[generateCellKey(personId, a.date, a.lesson_time)] = a;
      });
      attendancesMap.value = aMap;
    } finally {
      isLoading.value = false;
    }
  };

  const saveCellData = async ({
    reason,
    mark_value,
    person,
    lesson,
    record,
    attendance,
    studentType,
    userId,
  }) => {
    const isCadet = studentType === APP_CONSTANTS.STUDENT_TYPES.CADET;
    const basePayload = {
      date: lesson.date,
      lesson_time: lesson.lesson_time,
      subject: lesson.subject,
      cadet: isCadet ? person.id : null,
      student: !isCadet ? person.id : null,
    };

    const promises = [];

    if (reason !== null || attendance?.id) {
      promises.push(
        JournalService.saveAttendance({
          ...basePayload,
          id: attendance?.id,
          reason: reason,
        }),
      );
    }

    if (mark_value !== null || record?.id) {
      promises.push(
        JournalService.saveRecord({
          ...basePayload,
          id: record?.id,
          mark_date: lesson.date,
          mark_kind: lesson.mark_kind,
          mark_value: mark_value,
          who_rated: userId,
          is_active: true,
        }),
      );
    }

    return Promise.all(promises);
  };

  const addLesson = async (lessonData) => {
    await JournalService.createLesson(lessonData);
  };

  return {
    dicts,
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