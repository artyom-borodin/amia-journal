import { ref, watch, computed } from "vue";
import { PersonService } from "../services/personService";
import { getPersonFullName } from "../utils/journalUtils";

export function useStudentFilter(filters, onError = null) {
  const allStudents = ref([]);
  const isStudentsLoading = ref(false);

  const loadAllStudents = async () => {
    isStudentsLoading.value = true;
    try {
      const persons = await PersonService.getPersons({});
      allStudents.value = persons.map((p) => {
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

  loadAllStudents();

  const checkMatch = (filterVal, studentVal) => {
    if (!filterVal) return true;
    if (Array.isArray(filterVal)) {
      if (filterVal.length === 0) return true;
      return filterVal.includes(studentVal);
    }
    return filterVal === studentVal;
  };

  const students = computed(() => {
    return allStudents.value.filter((student) => {
      return (
        checkMatch(filters.faculty, student.subdivision) &&
        checkMatch(filters.specialty, student.speciality) &&
        checkMatch(filters.group, student.group)
      );
    });
  });

  watch(
    () => [filters.faculty, filters.specialty, filters.group],
    () => {
      filters.student = null;
    },
  );

  return {
    students,
    isStudentsLoading,
  };
}
