const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};

const ROLES = {
  TEACHER: 'TEACHER',
  STAROSTA: 'STAROSTA'
};

const ENUMS = {
  LESSON_TYPES: ['Зачет', 'Экзамен', 'Семинар', 'Практическое', 'Лекция'],
  ABSENCE_REASONS: ['Присутствует', 'Болен', 'Сборы', 'Отсутствует по неуважительной причине']
};

const DEFAULT_ATTENDANCE_STATUS = 'Присутствует';

module.exports = {
  HTTP_STATUS,
  ROLES,
  ENUMS,
  DEFAULT_ATTENDANCE_STATUS
};