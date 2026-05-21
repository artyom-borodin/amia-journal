import apiClient from "./api";
import { APP_CONSTANTS } from "../config/constants";
import { sortPersonsByFullName } from "../utils/journalUtils";

const extractData = (response) => response.data.results || response.data;

export class PersonService {
  static async getPersonsByGroup(groupId) {
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
}
