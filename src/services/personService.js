import { fetchAllPages } from "./api";
import { APP_CONSTANTS } from "../config/constants";
import { sortPersonsByFullName } from "../utils/journalUtils";

export class PersonService {
  static async getPersons(filters = {}) {
    const params = {};
    if (filters.group) params.group = filters.group;
    if (filters.faculty) params.subdivision = filters.faculty;

    const [cadetsRes, studentsRes] = await Promise.all([
      fetchAllPages(APP_CONSTANTS.API_ENDPOINTS.CADETS, params).catch(() => []),
      fetchAllPages(APP_CONSTANTS.API_ENDPOINTS.STUDENTS, params).catch(
        () => [],
      ),
    ]);

    const cadets = cadetsRes.map((p) => ({
      ...p,
      personType: APP_CONSTANTS.STUDENT_TYPES.CADET,
    }));
    const students = studentsRes.map((p) => ({
      ...p,
      personType: APP_CONSTANTS.STUDENT_TYPES.STUDENT,
    }));

    return sortPersonsByFullName([...cadets, ...students]);
  }

  static async getPersonsByGroup(groupId) {
    return this.getPersons({ group: groupId });
  }
}
