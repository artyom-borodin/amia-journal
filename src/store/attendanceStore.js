import { defineStore } from "pinia";
import { ref } from "vue";
import { AttendanceService } from "../services/attendanceService";
import { PersonService } from "../services/personService";
import { useDictionaryStore } from "./dictionaryStore";
import { APP_CONSTANTS } from "../config/constants";
import { buildAttendancesMap, generateCellKey, getPersonPayloads } from "../utils/journalUtils";
import { toApiDate } from "../utils/dateUtils";

export const useAttendanceStore = defineStore("attendance", () => {
  const dictionaryStore = useDictionaryStore();

  const persons = ref([]);
  const attendancesMap = ref({});
  const isLoading = ref(false);

  const fetchAttendanceData = async (groupId, dateFrom, dateTo) => {
    if (!groupId || !dateFrom || !dateTo) return;

    isLoading.value = true;
    try {
      const [personsData, attendances] = await Promise.all([
        PersonService.getPersonsByGroup(groupId),
        AttendanceService.getAttendances({ groupId, dateFrom, dateTo }),
      ]);

      persons.value = personsData;
      attendancesMap.value = buildAttendancesMap(attendances);
    } finally {
      isLoading.value = false;
    }
  };

  const buildBulkPayload = ({ person, dateFrom, dateTo, lessonTimeFrom, lessonTimeTo }) => {
    const { idPayload } = getPersonPayloads(person);
    return {
      ...idPayload,
      date_from: dateFrom,
      date_to: dateTo,
      lesson_time_from: lessonTimeFrom,
      lesson_time_to: lessonTimeTo,
    };
  };

  const applyBulkSave = async ({ person, dateFrom, dateTo, lessonTimeFrom, lessonTimeTo, reason }) => {
    const payload = {
      ...buildBulkPayload({ person, dateFrom, dateTo, lessonTimeFrom, lessonTimeTo }),
      reason,
    };

    const result = await AttendanceService.bulkSave(payload);

    // обновляем локальную карту из ответа сервера
    (result.created || []).forEach((a) => {
      const personType = a.cadet
        ? APP_CONSTANTS.STUDENT_TYPES.CADET
        : APP_CONSTANTS.STUDENT_TYPES.STUDENT;
      const uniqueId = `${personType}_${a.cadet || a.student}`;
      attendancesMap.value[generateCellKey(uniqueId, a.date, a.lesson_time)] = a;
    });

    return result;
  };

  const applyBulkDelete = async (range) => {
    const payload = buildBulkPayload(range);

    const result = await AttendanceService.bulkDelete(payload);

    // вычищаем удалённые ячейки из локальной карты
    const { person, dateFrom, dateTo, lessonTimeFrom, lessonTimeTo } = range;
    const start = new Date(dateFrom);
    const end = new Date(dateTo);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = toApiDate(d);
      dictionaryStore.dicts.lessonTimes.forEach((lt) => {
        if (lt.number >= lessonTimeFrom && lt.number <= lessonTimeTo) {
          const key = generateCellKey(person.uniqueId, dateStr, lt.id);
          delete attendancesMap.value[key];
        }
      });
    }

    return result;
  };

  return {
    persons,
    attendancesMap,
    isLoading,
    fetchAttendanceData,
    applyBulkSave,
    applyBulkDelete,
  };
});