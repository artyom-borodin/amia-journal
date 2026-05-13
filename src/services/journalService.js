import apiClient from "./api";
import { APP_CONSTANTS } from "../config/constants";

export class JournalService {
  static async getDictionaries(studentType) {
    const [
      groups,
      subjects,
      markKinds,
      markValues,
      lessonTimes,
      attendanceReasons,
    ] = await Promise.all([
      apiClient.get(APP_CONSTANTS.API_ENDPOINTS.GROUPS, {
        params: { student_type: studentType },
      }),
      apiClient.get(APP_CONSTANTS.API_ENDPOINTS.SUBJECTS),
      apiClient.get(APP_CONSTANTS.API_ENDPOINTS.MARK_KINDS),
      apiClient.get(APP_CONSTANTS.API_ENDPOINTS.MARK_VALUES),
      apiClient.get(APP_CONSTANTS.API_ENDPOINTS.LESSON_TIMES),
      apiClient.get(APP_CONSTANTS.API_ENDPOINTS.ATTENDANCE_REASONS),
    ]);
    return {
      groups: groups.data.results || groups.data,
      subjects: subjects.data.results || subjects.data,
      markKinds: markKinds.data.results || markKinds.data,
      markValues: markValues.data.results || markValues.data,
      lessonTimes: lessonTimes.data.results || lessonTimes.data,
      attendanceReasons:
        attendanceReasons.data.results || attendanceReasons.data,
    };
  }

  static async getPersons(type, groupId) {
    const endpoint =
      type === APP_CONSTANTS.STUDENT_TYPES.CADET
        ? APP_CONSTANTS.API_ENDPOINTS.CADETS
        : APP_CONSTANTS.API_ENDPOINTS.STUDENTS;
    const res = await apiClient.get(endpoint, { params: { group: groupId } });
    return res.data.results || res.data;
  }

  static async getJournalData(groupId, subjectId) {
    const [lessons, records, attendances] = await Promise.all([
      apiClient.get(APP_CONSTANTS.API_ENDPOINTS.LESSONS, {
        params: { group: groupId, subject: subjectId },
      }),
      apiClient.get(APP_CONSTANTS.API_ENDPOINTS.JOURNAL_RECORDS, {
        params: { subject: subjectId },
      }),
      apiClient.get(APP_CONSTANTS.API_ENDPOINTS.ATTENDANCES, {
        params: { subject: subjectId },
      }),
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

  static async saveRecord(payload) {
    if (payload.id)
      return (
        await apiClient.patch(
          `${APP_CONSTANTS.API_ENDPOINTS.JOURNAL_RECORDS}${payload.id}/`,
          payload,
        )
      ).data;
    return (
      await apiClient.post(APP_CONSTANTS.API_ENDPOINTS.JOURNAL_RECORDS, payload)
    ).data;
  }

  static async saveAttendance(payload) {
    if (payload.id)
      return (
        await apiClient.patch(
          `${APP_CONSTANTS.API_ENDPOINTS.ATTENDANCES}${payload.id}/`,
          payload,
        )
      ).data;
    return (
      await apiClient.post(APP_CONSTANTS.API_ENDPOINTS.ATTENDANCES, payload)
    ).data;
  }
}
