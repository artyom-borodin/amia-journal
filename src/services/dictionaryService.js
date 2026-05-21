import apiClient from "./api";
import { APP_CONSTANTS } from "../config/constants";
import { sortGroupsByName } from "../utils/journalUtils";

const extractData = (response) => response.data.results || response.data;

export class DictionaryService {
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
}
