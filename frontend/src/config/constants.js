export const APP_CONSTANTS = {
  ROLES: {
    TEACHER: 'TEACHER',
    STAROSTA: 'STAROSTA'
  },
  ROUTES: {
    LOGIN: '/login',
    DASHBOARD: '/',
    JOURNAL: '/journal'
  },
  API_ENDPOINTS: {
    LOGIN: '/api/auth/login',
    DASHBOARD: '/api/journal/dashboard',
    GRID: '/api/journal/grid',
    UPDATE_CELL: '/api/journal/update'
  },
  ENUMS: {
    LESSON_TYPES: ['Зачет', 'Экзамен', 'Семинар', 'Практическое', 'Лекция'],
    ABSENCE_REASONS: ['Присутствует', 'Болен', 'Сборы', 'Отсутствует по неуважительной причине'],
    MARKS: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Зачтено', 'Незачтено']
  },
  DEFAULT_ATTENDANCE: 'Присутствует',
  STORAGE_KEYS: {
    TOKEN: 'journal_token',
    USER: 'journal_user'
  },
  DAYS_IN_WEEK: 7
};