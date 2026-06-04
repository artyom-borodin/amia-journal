import { computed } from "vue";
import { APP_CONSTANTS } from "../config/constants";
import { getPersonFullName } from "../utils/journalUtils";

export function useJournalGrid(props) {
  const filteredLessons = computed(() => {
    let list = props.lessons || [];
    if (props.dateFilter && props.dateFilter[0]) {
      const start = new Date(props.dateFilter[0]);
      start.setHours(
        APP_CONSTANTS.RULES.START_OF_DAY_HOURS,
        APP_CONSTANTS.RULES.START_OF_DAY_MINUTES,
        APP_CONSTANTS.RULES.START_OF_DAY_SECONDS,
        APP_CONSTANTS.RULES.START_OF_DAY_MS,
      );
      const end = props.dateFilter[1]
        ? new Date(props.dateFilter[1])
        : new Date(start);
      end.setHours(
        APP_CONSTANTS.RULES.END_OF_DAY_HOURS,
        APP_CONSTANTS.RULES.END_OF_DAY_MINUTES,
        APP_CONSTANTS.RULES.END_OF_DAY_SECONDS,
        APP_CONSTANTS.RULES.END_OF_DAY_MS,
      );

      list = list.filter((l) => {
        const d = new Date(l.date);
        return d >= start && d <= end;
      });
    }
    return list;
  });

  const filteredPersons = computed(() => {
    let list = props.persons || [];
    if (props.nameFilter) {
      const q = props.nameFilter.toLowerCase();
      list = list.filter((p) => getPersonFullName(p).toLowerCase().includes(q));
    }
    return list;
  });

  const groupedLessons = computed(() => {
    const groups = [];
    let currentGroup = null;

    filteredLessons.value.forEach((lesson) => {
      if (!currentGroup || currentGroup.date !== lesson.date) {
        if (currentGroup) groups.push(currentGroup);
        currentGroup = { date: lesson.date, count: 1 };
      } else {
        currentGroup.count++;
      }
    });
    if (currentGroup) groups.push(currentGroup);

    return groups;
  });

  const emptyColumnsCount = computed(() => {
    const currentLessons = filteredLessons.value.length || 0;
    return Math.max(0, APP_CONSTANTS.GRID.MIN_COLUMNS - currentLessons);
  });

  const paddedPersons = computed(() => {
    const realPersons = filteredPersons.value || [];
    const emptyRowsCount = Math.max(
      0,
      APP_CONSTANTS.GRID.MIN_ROWS - realPersons.length,
    );

    const emptyRows = Array.from({ length: emptyRowsCount }, (_, i) => ({
      id: `${APP_CONSTANTS.PREFIXES.EMPTY_ROW}${i}`,
      isEmptyRow: true,
    }));

    return [...realPersons, ...emptyRows];
  });

  return {
    filteredLessons,
    filteredPersons,
    groupedLessons,
    emptyColumnsCount,
    paddedPersons,
  };
}
