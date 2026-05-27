import { APP_CONSTANTS } from "../config/constants";

const translateError = (msg) => {
  let translated = msg;
  for (const [en, ru] of Object.entries(APP_CONSTANTS.ERROR_TRANSLATIONS)) {
    if (translated.includes(en)) {
      translated = translated.replace(new RegExp(en, 'g'), ru);
    }
  }
  return translated;
};

export const extractErrorMessage = (error, fallback) => {
  if (!error?.response?.data) {
    return translateError(error?.message || fallback);
  }

  const data = error.response.data;
  let rawMessage = "";

  if (typeof data === "string") {
    rawMessage = data;
  } else if (data[APP_CONSTANTS.API_ERROR_KEYS.DETAIL]) {
    rawMessage = data[APP_CONSTANTS.API_ERROR_KEYS.DETAIL];
  } else if (data[APP_CONSTANTS.API_ERROR_KEYS.ERROR]) {
    rawMessage = data[APP_CONSTANTS.API_ERROR_KEYS.ERROR];
  } else if (data[APP_CONSTANTS.API_ERROR_KEYS.NON_FIELD_ERRORS]) {
    rawMessage = data[APP_CONSTANTS.API_ERROR_KEYS.NON_FIELD_ERRORS].join(
      APP_CONSTANTS.FORMATTING.SEPARATOR,
    );
  } else {
    const messages = [];
    for (const key in data) {
      if (Array.isArray(data[key])) {
        messages.push(data[key].join(APP_CONSTANTS.FORMATTING.SEPARATOR));
      } else if (typeof data[key] === "string") {
        messages.push(data[key]);
      }
    }
    if (messages.length > 0) {
      rawMessage = messages.join(APP_CONSTANTS.FORMATTING.NEWLINE);
    }
  }

  return translateError(rawMessage || fallback);
};

export const extractLessonErrorMessage = (error, fallback) => {
  const rawMessage = error?.response?.data
    ? JSON.stringify(error.response.data)
    : "";
  if (
    rawMessage.includes(APP_CONSTANTS.API_ERRORS.UNIQUE_SET) &&
    rawMessage.includes(APP_CONSTANTS.API_ERRORS.LESSON_TIME)
  ) {
    return APP_CONSTANTS.UI.ERRORS.LESSON_EXISTS;
  }
  return extractErrorMessage(error, fallback);
};