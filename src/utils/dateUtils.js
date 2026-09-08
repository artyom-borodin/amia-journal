import { APP_CONSTANTS } from "../config/constants";

export const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";

  return new Intl.DateTimeFormat(APP_CONSTANTS.LOCALES.RU, {
    day: APP_CONSTANTS.DATE_FORMAT.TWO_DIGIT,
    month: APP_CONSTANTS.DATE_FORMAT.TWO_DIGIT,
  }).format(d);
};

export const toApiDate = (date) => {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "";

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(
    APP_CONSTANTS.DATE_FORMAT.PAD_LENGTH,
    APP_CONSTANTS.DATE_FORMAT.PAD_CHAR,
  );
  const day = String(d.getDate()).padStart(
    APP_CONSTANTS.DATE_FORMAT.PAD_LENGTH,
    APP_CONSTANTS.DATE_FORMAT.PAD_CHAR,
  );

  return `${year}-${month}-${day}`;
};

export const toApiTime = (date) => {
  if (!date) return "";
  if (typeof date === "string") {
    return date.length === APP_CONSTANTS.RULES.TIME_STRING_LENGTH
      ? `${date}${APP_CONSTANTS.FORMATTING.TIME_SEPARATOR}00`
      : date;
  }
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  const hours = String(d.getHours()).padStart(
    APP_CONSTANTS.DATE_FORMAT.PAD_LENGTH,
    APP_CONSTANTS.DATE_FORMAT.PAD_CHAR,
  );
  const minutes = String(d.getMinutes()).padStart(
    APP_CONSTANTS.DATE_FORMAT.PAD_LENGTH,
    APP_CONSTANTS.DATE_FORMAT.PAD_CHAR,
  );
  const seconds = String(d.getSeconds()).padStart(
    APP_CONSTANTS.DATE_FORMAT.PAD_LENGTH,
    APP_CONSTANTS.DATE_FORMAT.PAD_CHAR,
  );
  return `${hours}${APP_CONSTANTS.FORMATTING.TIME_SEPARATOR}${minutes}${APP_CONSTANTS.FORMATTING.TIME_SEPARATOR}${seconds}`;
};

export const startOfWeek = (date = new Date()) => {
  const d = new Date(date);
  const day =
    (d.getDay() + APP_CONSTANTS.RULES.MONDAY_FIRST_DAY_OFFSET) %
    APP_CONSTANTS.RULES.DAYS_PER_WEEK;
  d.setDate(d.getDate() - day);
  d.setHours(
    APP_CONSTANTS.RULES.START_OF_DAY_HOURS,
    APP_CONSTANTS.RULES.START_OF_DAY_MINUTES,
    APP_CONSTANTS.RULES.START_OF_DAY_SECONDS,
    APP_CONSTANTS.RULES.START_OF_DAY_MS,
  );
  return d;
};

export const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

export const getWeekRange = (
  offsetWeeks = APP_CONSTANTS.RULES.WEEK_OFFSET_CURRENT,
) => {
  const start = addDays(
    startOfWeek(),
    offsetWeeks * APP_CONSTANTS.RULES.DAYS_PER_WEEK,
  );
  const end = addDays(start, APP_CONSTANTS.RULES.DAYS_PER_WEEK - 1);
  return [start, end];
};

export const isToday = (apiDateStr) => {
  if (!apiDateStr) return false;
  return toApiDate(new Date()) === apiDateStr;
};

export const normalizePeriod = (period) => {
  if (!Array.isArray(period) || !(period[0] instanceof Date)) return [];
  if (isNaN(period[0].getTime())) return [];
  const from = new Date(period[0]);
  const to =
    period[1] instanceof Date && !isNaN(period[1].getTime())
      ? new Date(period[1])
      : new Date(period[0]);
  return [from, to];
};
