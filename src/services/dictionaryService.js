import apiClient from "./api";
import { APP_CONSTANTS } from "../config/constants";
import { sortGroupsByName } from "../utils/journalUtils";

const extractData = (response) => response.data.results || response.data;

export class DictionaryService {
  static async getDictionaries() {
    const safeGet = (endpoint) =>
      apiClient.get(endpoint).catch(() => APP_CONSTANTS.API_FALLBACK_RESPONSE);

    const endpoints = [
      apiClient.get(APP_CONSTANTS.API_ENDPOINTS.GROUPS),
      apiClient.get(APP_CONSTANTS.API_ENDPOINTS.SUBJECTS),
      apiClient.get(APP_CONSTANTS.API_ENDPOINTS.MARK_KINDS),
      apiClient.get(APP_CONSTANTS.API_ENDPOINTS.MARK_VALUES),
      apiClient.get(APP_CONSTANTS.API_ENDPOINTS.LESSON_TIMES),
      apiClient.get(APP_CONSTANTS.API_ENDPOINTS.ATTENDANCE_REASONS),
      apiClient.get(APP_CONSTANTS.API_ENDPOINTS.LESSON_TYPES),
      apiClient.get(APP_CONSTANTS.API_ENDPOINTS.TEACHERS),
      safeGet(APP_CONSTANTS.API_ENDPOINTS.FACULTIES),
      safeGet(APP_CONSTANTS.API_ENDPOINTS.SPECIALTIES),
      safeGet(APP_CONSTANTS.API_ENDPOINTS.YEARS),
      safeGet(APP_CONSTANTS.API_ENDPOINTS.SEMESTERS),
    ];

    const responses = await Promise.all(endpoints);

    const [
      groups,
      subjects,
      markKinds,
      markValues,
      lessonTimes,
      attendanceReasons,
      lessonTypes,
      teachers,
      faculties,
      specialties,
      years,
      semesters,
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
      faculties,
      specialties,
      years,
      semesters,
    };
  }
}
