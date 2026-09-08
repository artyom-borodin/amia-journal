import { APP_CONSTANTS } from "../config/constants";

const cellOf = (gridMatrix, personId, lessonId) => gridMatrix?.[personId]?.[lessonId];

const getPersonCellList = (personId, lessons, gridMatrix) =>
  (lessons || []).map((lesson) => cellOf(gridMatrix, personId, lesson.id));

const personHasNoMarks = (personId, lessons, gridMatrix) =>
  getPersonCellList(personId, lessons, gridMatrix).every(
    (cell) => !cell || (cell.records || []).length === 0,
  );

const personHasAbsence = (personId, lessons, gridMatrix) =>
  getPersonCellList(personId, lessons, gridMatrix).some((cell) => cell?.isAbsent);

const personHasRetake = (personId, lessons, gridMatrix) =>
  getPersonCellList(personId, lessons, gridMatrix).some(
    (cell) => (cell?.records || []).length > 1,
  );

export const matchesQuickFilter = (personId, lessons, gridMatrix, filter) => {
  switch (filter) {
    case APP_CONSTANTS.JOURNAL_QUICK_FILTERS.NO_MARKS:
      return personHasNoMarks(personId, lessons, gridMatrix);
    case APP_CONSTANTS.JOURNAL_QUICK_FILTERS.WITH_ABSENCES:
      return personHasAbsence(personId, lessons, gridMatrix);
    case APP_CONSTANTS.JOURNAL_QUICK_FILTERS.WITH_RETAKES:
      return personHasRetake(personId, lessons, gridMatrix);
    case APP_CONSTANTS.JOURNAL_QUICK_FILTERS.ALL:
    default:
      return true;
  }
};
