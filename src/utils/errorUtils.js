import { APP_CONSTANTS } from "../config/constants";

export const extractErrorMessage = (error, fallback) => {
  if (!error?.response?.data) {
    return error?.message || fallback;
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

  if (
    rawMessage.includes(APP_CONSTANTS.API_ERRORS.UNIQUE_SET) &&
    rawMessage.includes(APP_CONSTANTS.API_ERRORS.LESSON_TIME)
  ) {
    return APP_CONSTANTS.UI.ERRORS.LESSON_EXISTS;
  }

  return rawMessage || fallback;
};
