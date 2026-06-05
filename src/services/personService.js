import apiClient from "./api";
import { APP_CONSTANTS } from "../config/constants";
import { sortPersonsByFullName } from "../utils/journalUtils";

export class PersonService {
  static async getPersons(filters = {}) {
    const params = {};
    if (filters.group) params.group = filters.group;
    if (filters.faculty) params.subdivision = filters.faculty;

    try {
      const [cadetsRes, studentsRes] = await Promise.all([
        apiClient
          .get(APP_CONSTANTS.API_ENDPOINTS.CADETS_SHORT, { params })
          .catch(() => ({ data: [] })),
        apiClient
          .get(APP_CONSTANTS.API_ENDPOINTS.STUDENTS_SHORT, { params })
          .catch(() => ({ data: [] })),
      ]);

      const cadets = (cadetsRes.data || []).map((p) => ({
        ...p,
        group: p.group_id,
        group_name: p.group__group_name,
        subdivision: p.subdivision_id,
        speciality: p.speciality_id,
        personType: APP_CONSTANTS.STUDENT_TYPES.CADET,
        uniqueId: `${APP_CONSTANTS.STUDENT_TYPES.CADET}_${p.id}`,
      }));
      const students = (studentsRes.data || []).map((p) => ({
        ...p,
        group: p.group_id,
        group_name: p.group__group_name,
        subdivision: p.subdivision_id,
        speciality: p.speciality_id,
        personType: APP_CONSTANTS.STUDENT_TYPES.STUDENT,
        uniqueId: `${APP_CONSTANTS.STUDENT_TYPES.STUDENT}_${p.id}`,
      }));

      const activePersons = [...cadets, ...students].filter(
        (p) => p.is_active !== false,
      );

      return sortPersonsByFullName(activePersons);
    } catch (error) {
      console.error("Failed to fetch persons:", error);
      return [];
    }
  }

  static async getPersonsByGroup(groupId) {
    return this.getPersons({ group: groupId });
  }
}
