import { APP_CONSTANTS } from "../config/constants";

const toNumericValue = (markValue) => {
  if (markValue == null) return null;
  const normalized = String(markValue).replace(",", ".").trim();
  if (normalized === "") return null;
  const num = Number(normalized);
  return Number.isNaN(num) ? null : num;
};

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

export const calcPersonStats = (personId, lessons, gridMatrix, markValuesMap) => {
  const cells = getPersonCellList(personId, lessons, gridMatrix);
  let absences = 0;
  let sum = 0;
  let numericCount = 0;

  cells.forEach((cell) => {
    if (!cell) return;
    if (cell.isAbsent) absences += 1;
    const mainRecord = (cell.records || [])[0];
    if (!mainRecord) return;
    const num = toNumericValue(markValuesMap?.[mainRecord.mark_value]?.value);
    if (num != null) {
      sum += num;
      numericCount += 1;
    }
  });

  return {
    absences,
    avg:
      numericCount > 0
        ? Number((sum / numericCount).toFixed(APP_CONSTANTS.STATS.AVG_FRACTION_DIGITS))
        : null,
  };
};
