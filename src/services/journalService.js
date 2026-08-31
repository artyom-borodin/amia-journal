import apiClient, { fetchAllPages } from "./api";
import { APP_CONSTANTS } from "../config/constants";
import { downloadBlob } from "../utils/fileUtils";
import { getPersonPayloads } from "../utils/journalUtils";

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
      `${APP_CONSTANTS.API_ENDPOINTS.JOURNAL_RECORDS}${APP_CONSTANTS.ENDPOINTS_SUFFIX.SYNC_MARKS}`,
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
    return getPersonPayloads(person);
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
        id:
          m.id && !m.id.toString().startsWith(APP_CONSTANTS.PREFIXES.TEMP)
            ? m.id
            : null,
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

  static async downloadVedomost(lessonId) {
    const response = await apiClient.get(
      `${APP_CONSTANTS.API_ENDPOINTS.LESSONS}${lessonId}${APP_CONSTANTS.ENDPOINTS_SUFFIX.DOWNLOAD_VEDOMOST}`,
      {
        responseType: APP_CONSTANTS.NETWORK.RESPONSE_TYPE_BLOB,
      },
    );

    let fileName = `${APP_CONSTANTS.FILES.VEDOMOST_PREFIX}${lessonId}${APP_CONSTANTS.FILES.VEDOMOST_EXT}`;
    const contentDisposition =
      response.headers[APP_CONSTANTS.NETWORK.HEADER_CONTENT_DISPOSITION];

    if (contentDisposition) {
      const utf8Match = contentDisposition.match(
        APP_CONSTANTS.FILES.REGEX_UTF8_FILENAME,
      );
      if (utf8Match && utf8Match[1]) {
        fileName = decodeURIComponent(utf8Match[1]);
      } else {
        const match = contentDisposition.match(
          APP_CONSTANTS.FILES.REGEX_FALLBACK_FILENAME,
        );
        if (match && match[1]) fileName = match[1];
      }
    }

    downloadBlob(response.data, fileName);
  }
}
