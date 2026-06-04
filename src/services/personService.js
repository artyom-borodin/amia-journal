import { fetchAllPages } from "./api";
import { APP_CONSTANTS } from "../config/constants";
import { sortPersonsByFullName } from "../utils/journalUtils";

export class PersonService {
  static async getPersons(filters = {}) {
    const groups = filters.group ? filters.group.toString().split(',') : [null];
    const faculties = filters.faculty ? filters.faculty.toString().split(',') : [null];

    const promises = [];

    groups.forEach(g => {
      faculties.forEach(f => {
        const params = {};
        if (g) params.group = g;
        if (f) params.subdivision = f;

        promises.push(fetchAllPages(APP_CONSTANTS.API_ENDPOINTS.CADETS, params).catch(() => []));
        promises.push(fetchAllPages(APP_CONSTANTS.API_ENDPOINTS.STUDENTS, params).catch(() => []));
      });
    });

    const results = await Promise.all(promises);
    const allPersons = results.flat();

    const uniquePersonsMap = new Map();
    
    allPersons.forEach(p => {
      if (p.is_active !== false) {
        const personType = p.military_rank ? APP_CONSTANTS.STUDENT_TYPES.CADET : APP_CONSTANTS.STUDENT_TYPES.STUDENT;
        const key = `${p.id}-${personType}`;
        
        if (!uniquePersonsMap.has(key)) {
          uniquePersonsMap.set(key, { ...p, personType });
        }
      }
    });

    return sortPersonsByFullName(Array.from(uniquePersonsMap.values()));
  }

  static async getPersonsByGroup(groupId) {
    return this.getPersons({ group: groupId });
  }
}