import apiClient, { fetchAllPages } from "./api";
import { APP_CONSTANTS } from "../config/constants";

export class JournalService {
  static async getJournalData(groupId, subjectId) {
    const [lessons, records, attendances] = await Promise.all([
      fetchAllPages(APP_CONSTANTS.API_ENDPOINTS.LESSONS, {
        group: groupId,
        subject: subjectId,
      }),
      fetchAllPages(APP_CONSTANTS.API_ENDPOINTS.JOURNAL_RECORDS, {
        lesson__group: groupId,
        lesson__subject: subjectId,
      }),
      fetchAllPages(APP_CONSTANTS.API_ENDPOINTS.ATTENDANCES, {
        group: groupId,
      }),
    ]);

    return {
      lessons,
      records,
      attendances,
    };
  }

  static async createLesson(payload) {
    const res = await apiClient.post(
      APP_CONSTANTS.API_ENDPOINTS.LESSONS,
      payload,
    );
    return res.data;
  }

  static async syncMarks(payload) {
    const res = await apiClient.post(
      `${APP_CONSTANTS.API_ENDPOINTS.JOURNAL_RECORDS}sync-marks/`,
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
        id: m.id && !m.id.toString().startsWith(APP_CONSTANTS.PREFIXES.TEMP) ? m.id : null,
        mark_value: m.mark_value,
      })),
    };
    return this.syncMarks(marksPayload);
  }

  static async saveCellData({ reason, marks, person, lesson, attendance }) {
    const { entityPayload, idPayload } = this._getPersonPayloads(person);

    const [savedAttendance, savedMarks] = await Promise.all([
      this._handleAttendance(reason, entityPayload, lesson, attendance),
      this._handleMarks(marks, idPayload, lesson),
    ]);

    return { savedAttendance, savedMarks };
  }
}