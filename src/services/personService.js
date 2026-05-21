import apiClient from "./api";
import { APP_CONSTANTS } from "../config/constants";
import { sortPersonsByFullName } from "../utils/journalUtils";

const extractData = (response) => response.data.results || response.data;

export class PersonService {
  static async getPersons(filters = {}) {
    const params = {};
    if (filters.group) params.group = filters.group;
    if (filters.faculty) params.subdivision = filters.faculty;
   
    const [cadetsRes, studentsRes] = await Promise.all([
      apiClient.get(APP_CONSTANTS.API_ENDPOINTS.CADETS, { params }).catch(() => ({ data: [] })),
      apiClient.get(APP_CONSTANTS.API_ENDPOINTS.STUDENTS, { params }).catch(() => ({ data: [] })),
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

  static async getPersonsByGroup(groupId) {
    return this.getPersons({ group: groupId });
  }
}