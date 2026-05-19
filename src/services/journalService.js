import apiClient from "./api";
import { APP_CONSTANTS } from "../config/constants";
import { sortGroupsByName, sortPersonsByFullName } from "../utils/journalUtils";

const extractData = (response) => response.data.results || response.data;

export class JournalService {
  static async getDictionaries() {
    const endpoints = [
      APP_CONSTANTS.API_ENDPOINTS.GROUPS,
      APP_CONSTANTS.API_ENDPOINTS.SUBJECTS,
      APP_CONSTANTS.API_ENDPOINTS.MARK_KINDS,
      APP_CONSTANTS.API_ENDPOINTS.MARK_VALUES,
      APP_CONSTANTS.API_ENDPOINTS.LESSON_TIMES,
      APP_CONSTANTS.API_ENDPOINTS.ATTENDANCE_REASONS,
      APP_CONSTANTS.API_ENDPOINTS.LESSON_TYPES,
      APP_CONSTANTS.API_ENDPOINTS.TEACHERS,
    ];

    const responses = await Promise.all(
      endpoints.map((ep) => apiClient.get(ep)),
    );
    const [
      groups,
      subjects,
      markKinds,
      markValues,
      lessonTimes,
      attendanceReasons,
      lessonTypes,
      teachers,
    ] = responses.map(extractData);

    return {
      groups: sortGroupsByName(groups),
      subjects,
      markKinds,
      markValues,
      lessonTimes,
      attendanceReasons,
      lessonTypes,
      teachers,
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

    const cadets = extractData(cadetsRes).map((p) => ({
      ...p,
      personType: APP_CONSTANTS.STUDENT_TYPES.CADET,
    }));
    const students = extractData(studentsRes).map((p) => ({
      ...p,
      personType: APP_CONSTANTS.STUDENT_TYPES.STUDENT,
    }));

    return sortPersonsByFullName([...cadets, ...students]);
  }

  static async getJournalData(groupId, subjectId) {
    const [lessonsRes, recordsRes, attendancesRes] = await Promise.all([
      apiClient.get(APP_CONSTANTS.API_ENDPOINTS.LESSONS, {
        params: { group: groupId, subject: subjectId },
      }),
      apiClient.get(APP_CONSTANTS.API_ENDPOINTS.JOURNAL_RECORDS, {
        params: { lesson__group: groupId, lesson__subject: subjectId },
      }),
      apiClient.get(APP_CONSTANTS.API_ENDPOINTS.ATTENDANCES, {
        params: { group: groupId },
      }),
    ]);

    return {
      lessons: extractData(lessonsRes),
      records: extractData(recordsRes),
      attendances: extractData(attendancesRes),
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

    const [savedAttendance] = await Promise.all([
      this._handleAttendance(reason, entityPayload, lesson, attendance),
      this._handleMarks(marks, idPayload, lesson),
    ]);

    return savedAttendance;
  }
}
