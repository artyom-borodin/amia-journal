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
    return date.length === 5 ? `${date}:00` : date;
  }
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};
