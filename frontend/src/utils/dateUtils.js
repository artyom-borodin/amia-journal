import { APP_CONSTANTS } from '../config/constants';

export class DateUtils {
  static getStartOfWeek(date) {
    const result = new Date(date);
    const day = result.getDay();
    const diff = result.getDate() - day + (day === 0 ? -6 : 1);
    result.setDate(diff);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  static getEndOfWeek(date) {
    const result = this.getStartOfWeek(date);
    result.setDate(result.getDate() + (APP_CONSTANTS.DAYS_IN_WEEK - 1));
    result.setHours(23, 59, 59, 999);
    return result;
  }

  static addWeeks(date, weeks) {
    const result = new Date(date);
    result.setDate(result.getDate() + weeks * APP_CONSTANTS.DAYS_IN_WEEK);
    return result;
  }

  static formatToISO(date) {
    return date.toISOString();
  }

  static formatShortDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}.${month}`;
  }
}