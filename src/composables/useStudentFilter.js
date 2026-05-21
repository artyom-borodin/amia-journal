import { ref, watch } from "vue";
import { PersonService } from "../services/personService";
import { getPersonFullName } from "../utils/journalUtils";

export function useStudentFilter(filters, onError = null) {
  const students = ref([]);
  const isStudentsLoading = ref(false);

  const loadStudents = async () => {
    isStudentsLoading.value = true;
    try {
      const persons = await PersonService.getPersons({
        faculty: filters.faculty,
        specialty: filters.specialty,
        group: filters.group,
      });
      students.value = persons.map((p) => {
        const groupInfo = p.group_name ? ` (${p.group_name})` : "";
        return {
          ...p,
          displayName: `${getPersonFullName(p)}${groupInfo}`,
          fullName: getPersonFullName(p),
        };
      });
    } catch (error) {
      console.error("Failed to load students", error);
      if (onError) onError(error);
    } finally {
      isStudentsLoading.value = false;
    }
  };

  watch(
    () => [filters.faculty, filters.specialty, filters.group],
    () => {
      filters.student = null;
      loadStudents();
    },
    { immediate: true },
  );

  return {
    students,
    isStudentsLoading,
  };
}
