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
