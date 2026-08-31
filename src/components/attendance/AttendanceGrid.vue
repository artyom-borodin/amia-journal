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
        >
          {{ dateLabel.label }}
        </th>
      </tr>
      <tr>
        <th v-for="col in columns" :key="col.key" class="pair-header-cell">
          {{ col.lt.number }} {{ APP_CONSTANTS.UI.LABELS.LESSON_NUMBER_SUFFIX }}
          <small>{{ formatTimeShort(col.lt.start_time) }}–{{ formatTimeShort(col.lt.end_time) }}</small>
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
          :class="{ 'is-marked': !!getCellReason(person, col) }"
          :title="cellText(person, col)"
          @click="$emit('cell-click', { person, lessonTime: col.lt, date: col.date })"
        >
          {{ cellText(person, col) }}
        </td>
      </tr>
      <tr v-if="!filteredPersons.length">
        <td :colspan="columns.length + 1" class="empty-state">
          {{ APP_CONSTANTS.UI.MESSAGES.NO_DATA }}
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
import { toApiDate } from "../../utils/dateUtils";

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
        lt,
      });
    });
  });
  return cols;
});

const dateLabels = computed(() =>
  periodDates.value.map((date) => ({
    key: toApiDate(date),
    label: dateFormat.format(date),
  })),
);

const periodDates = computed(() => {
  if (!props.period || props.period.length < 2 || !props.period[0] || !props.period[1]) {
    return [];
  }
  const dates = [];
  for (let d = new Date(props.period[0]); d <= props.period[1]; d.setDate(d.getDate() + 1)) {
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
</script>
