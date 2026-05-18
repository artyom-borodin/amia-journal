import apiClient from "./api";
import { APP_CONSTANTS } from "../config/constants";
import { getPersonFullName } from "../utils/journalUtils";

export class JournalService {
  static async getDictionaries() {
    const [
      groups,
      subjects,
      markKinds,
      markValues,
      lessonTimes,
      attendanceReasons,
      lessonTypes,
      teachers,
    ] = await Promise.all([
      apiClient.get(APP_CONSTANTS.API_ENDPOINTS.GROUPS),
      apiClient.get(APP_CONSTANTS.API_ENDPOINTS.SUBJECTS),
      apiClient.get(APP_CONSTANTS.API_ENDPOINTS.MARK_KINDS),
      apiClient.get(APP_CONSTANTS.API_ENDPOINTS.MARK_VALUES),
      apiClient.get(APP_CONSTANTS.API_ENDPOINTS.LESSON_TIMES),
      apiClient.get(APP_CONSTANTS.API_ENDPOINTS.ATTENDANCE_REASONS),
      apiClient.get(APP_CONSTANTS.API_ENDPOINTS.LESSON_TYPES),
      apiClient.get(APP_CONSTANTS.API_ENDPOINTS.TEACHERS),
    ]);

    const sortedGroups = (groups.data.results || groups.data).sort((a, b) =>
      a.group_name.localeCompare(b.group_name, undefined, { numeric: true }),
    );

    return {
      groups: sortedGroups,
      subjects: subjects.data.results || subjects.data,
      markKinds: markKinds.data.results || markKinds.data,
      markValues: markValues.data.results || markValues.data,
      lessonTimes: lessonTimes.data.results || lessonTimes.data,
      attendanceReasons:
        attendanceReasons.data.results || attendanceReasons.data,
      lessonTypes: lessonTypes.data.results || lessonTypes.data,
      teachers: teachers.data.results || teachers.data,
    };
  }

  static async getPersons(groupId) {
    const [cadetsRes, studentsRes] = await Promise.all([
      apiClient.get(APP_CONSTANTS.API_ENDPOINTS.CADETS, {
        params: { group: groupId },
      }),
      apiClient.get(APP_CONSTANTS.API_ENDPOINTS.STUDENTS, {
        params: { group: groupId },
      }),
    ]);

    const cadets = (cadetsRes.data.results || cadetsRes.data || []).map(
      (p) => ({ ...p, personType: APP_CONSTANTS.STUDENT_TYPES.CADET }),
    );
    const students = (studentsRes.data.results || studentsRes.data || []).map(
      (p) => ({ ...p, personType: APP_CONSTANTS.STUDENT_TYPES.STUDENT }),
    );

    return [...cadets, ...students].sort((a, b) => {
      return getPersonFullName(a).localeCompare(getPersonFullName(b));
    });
  }

  static async getJournalData(groupId, subjectId) {
    const [lessons, records, attendances] = await Promise.all([
      apiClient.get(APP_CONSTANTS.API_ENDPOINTS.LESSONS, {
        params: { group: groupId, subject: subjectId },
      }),
      apiClient.get(APP_CONSTANTS.API_ENDPOINTS.JOURNAL_RECORDS, {
        params: { lesson__subject: subjectId },
      }),
      apiClient.get(APP_CONSTANTS.API_ENDPOINTS.ATTENDANCES, {}),
    ]);
    return {
      lessons: lessons.data.results || lessons.data,
      records: records.data.results || records.data,
      attendances: attendances.data.results || attendances.data,
    };
  }

  static async createLesson(payload) {
    const res = await apiClient.post(
      APP_CONSTANTS.API_ENDPOINTS.LESSONS,
      payload,
    );
    return res.data;
  }

  static async bulkUpdateMarks(payload) {
    const res = await apiClient.post(
      `${APP_CONSTANTS.API_ENDPOINTS.JOURNAL_RECORDS}bulk-update/`,
      payload,
    );
    return res.data;
  }

  static async saveAttendance(payload) {
    if (payload.id) {
      return (
        await apiClient.patch(
          `${APP_CONSTANTS.API_ENDPOINTS.ATTENDANCES}${payload.id}/`,
          payload,
        )
      ).data;
    }
    return (
      await apiClient.post(APP_CONSTANTS.API_ENDPOINTS.ATTENDANCES, payload)
    ).data;
  }

  static async deleteAttendance(id) {
    return (
      await apiClient.delete(`${APP_CONSTANTS.API_ENDPOINTS.ATTENDANCES}${id}/`)
    ).data;
  }

  static _getPersonPayloads(person) {
    const isCadet = person.personType === APP_CONSTANTS.STUDENT_TYPES.CADET;
    return {
      entityPayload: {
        cadet: isCadet ? person.id : null,
        student: !isCadet ? person.id : null,
      },
      idPayload: {
        cadet_id: isCadet ? person.id : null,
        student_id: !isCadet ? person.id : null,
      },
    };
  }

  static async _handleAttendance(reason, personPayload, lesson, attendance) {
    if (reason != null) {
      return this.saveAttendance({
        id: attendance?.id,
        date: lesson.date,
        lesson_time: lesson.lesson_time,
        ...personPayload,
        reason,
      });
    }
    if (attendance?.id) {
      return this.deleteAttendance(attendance.id);
    }
    return Promise.resolve();
  }

  static async _handleMarks(marks, personIdPayload, lesson) {
    const marksPayload = {
      lesson_id: lesson.id,
      ...personIdPayload,
      marks: marks.map((m) => ({
        mark_value_id: m.mark_value,
        mark_kind_id: m.mark_kind,
      })),
    };
    return this.bulkUpdateMarks(marksPayload);
  }

  static async saveCellData({ reason, marks, person, lesson, attendance }) {
    const { entityPayload, idPayload } = this._getPersonPayloads(person);

    return Promise.all([
      this._handleAttendance(reason, entityPayload, lesson, attendance),
      this._handleMarks(marks, idPayload, lesson),
    ]);
  }
}