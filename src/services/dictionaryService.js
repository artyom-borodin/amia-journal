import { fetchAllPages } from "./api";
import { APP_CONSTANTS } from "../config/constants";
import { sortGroupsByName, sortMarkValues } from "../utils/journalUtils";

export class DictionaryService {
  static async getDictionaries() {
    const safeGet = (endpoint) => fetchAllPages(endpoint).catch(() => []);

    const endpoints = [
      fetchAllPages(APP_CONSTANTS.API_ENDPOINTS.GROUPS),
      fetchAllPages(APP_CONSTANTS.API_ENDPOINTS.SUBJECTS),
      fetchAllPages(APP_CONSTANTS.API_ENDPOINTS.MARK_VALUES),
      fetchAllPages(APP_CONSTANTS.API_ENDPOINTS.LESSON_TIMES),
      fetchAllPages(APP_CONSTANTS.API_ENDPOINTS.ATTENDANCE_REASONS),
      fetchAllPages(APP_CONSTANTS.API_ENDPOINTS.LESSON_TYPES),
      fetchAllPages(APP_CONSTANTS.API_ENDPOINTS.TEACHERS),
      safeGet(APP_CONSTANTS.API_ENDPOINTS.FACULTIES),
      safeGet(APP_CONSTANTS.API_ENDPOINTS.SPECIALTIES),
      safeGet(APP_CONSTANTS.API_ENDPOINTS.YEARS),
      safeGet(APP_CONSTANTS.API_ENDPOINTS.SEMESTERS),
    ];

    const responses = await Promise.all(endpoints);

    const [
      groups,
      subjects,
      markValues,
      lessonTimes,
      attendanceReasons,
      lessonTypes,
      teachers,
      faculties,
      specialties,
      years,
      semesters,
    ] = responses;

    const formattedSpecialties = specialties.map((s) => ({
      ...s,
      displayName: s.speciality_code
        ? `${s.speciality_code} ${s.speciality_name}`
        : s.speciality_name,
    }));

    return {
      groups: sortGroupsByName(groups),
      subjects,
      markValues: sortMarkValues(markValues),
      lessonTimes,
      attendanceReasons,
      lessonTypes,
      teachers,
      faculties,
      specialties: formattedSpecialties,
      years,
      semesters,
    };
  }
}