<template>
  <table class="attendance-table">
    <thead>
      <tr>
        <th rowspan="2" class="name-col">{{ APP_CONSTANTS.UI.LABELS.FULL_NAME }}</th>
        <th
          v-for="dateLabel in dateLabels"
          :key="dateLabel.key"
          :colspan="lessonTimes.length"
          class="date-header-cell"
          :class="{ 'is-today': dateLabel.isToday }"
        >
          {{ dateLabel.label }}
        </th>
        <th rowspan="2" class="total-col">{{ APP_CONSTANTS.UI.LABELS.ABSENCES_SHORT }}</th>
      </tr>
      <tr>
        <th
          v-for="col in columns"
          :key="col.key"
          class="pair-header-cell"
          :class="{ 'is-today': col.isToday }"
        >
          {{ col.lt.number }} {{ APP_CONSTANTS.UI.LABELS.LESSON_NUMBER_SUFFIX }}
          <small>{{ formatTimeShort(col.lt.start_time) }}-{{ formatTimeShort(col.lt.end_time) }}</small>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="person in filteredPersons" :key="person.uniqueId">
        <td class="name-col">{{ getPersonFullName(person) }}</td>
        <td
          v-for="col in columns"
          :key="col.key"
          class="pair-cell"
          :class="{ 'is-marked': !!getCellReason(person, col), 'is-today': col.isToday }"
          :title="cellText(person, col)"
          @click="$emit('cell-click', { person, lessonTime: col.lt, date: col.date })"
        >
          {{ cellText(person, col) }}
        </td>
        <td class="total-col">{{ absenceTotal(person) }}</td>
      </tr>
      <tr v-if="!filteredPersons.length">
        <td :colspan="columns.length + 2" class="empty-cell">
          <div class="attendance-empty">
            {{ APP_CONSTANTS.UI.MESSAGES.NO_DATA }}
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
import { computed } from "vue";
import { APP_CONSTANTS } from "../../config/constants";
import {
  getPersonFullName,
  generateCellKey,
  formatTimeShort,
} from "../../utils/journalUtils";
import { normalizePeriod, toApiDate, isToday } from "../../utils/dateUtils";

const props = defineProps({
  persons: Array,
  lessonTimes: Array,
  period: Array,
  attendancesMap: Object,
  dictsMap: Object,
  nameFilter: String,
});

defineEmits(["cell-click"]);

const dateFormat = new Intl.DateTimeFormat(APP_CONSTANTS.LOCALES.RU, {
  day: APP_CONSTANTS.DATE_FORMAT.TWO_DIGIT,
  month: APP_CONSTANTS.DATE_FORMAT.TWO_DIGIT,
});

// колонки = дни периода × пары, как в журнале (дата занятия × пара)
const columns = computed(() => {
  const cols = [];
  periodDates.value.forEach((date) => {
    const dateStr = toApiDate(date);
    const dateLabel = dateFormat.format(date);

    props.lessonTimes.forEach((lt) => {
      cols.push({
        key: `${dateStr}_${lt.id}`,
        date: dateStr,
        isToday: isToday(dateStr),
        lt,
      });
    });
  });
  return cols;
});

const dateLabels = computed(() =>
  periodDates.value.map((date) => {
    const key = toApiDate(date);
    return {
      key,
      label: dateFormat.format(date),
      isToday: isToday(key),
    };
  }),
);

const periodDates = computed(() => {
  const [from, to] = normalizePeriod(props.period);
  if (!from || !to) return [];
  const dates = [];
  for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d));
  }
  return dates;
});

const filteredPersons = computed(() => {
  const q = (props.nameFilter || "").trim().toLowerCase();
  if (!q) return props.persons;
  return props.persons.filter((p) =>
    getPersonFullName(p).toLowerCase().includes(q),
  );
});

const getCellReason = (person, col) => {
  const key = generateCellKey(person.uniqueId, col.date, col.lt.id);
  const attendance = props.attendancesMap[key];
  return attendance
    ? props.dictsMap.attendanceReasons[attendance.reason]
    : null;
};

const cellText = (person, col) => {
  const reason = getCellReason(person, col);
  return reason?.name || "";
};

const absenceTotal = (person) =>
  columns.value.reduce((sum, col) => sum + (getCellReason(person, col) ? 1 : 0), 0);
</script>
