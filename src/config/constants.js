export const APP_CONSTANTS = {
  ROUTES: { LOGIN: '/login', DASHBOARD: '/', JOURNAL: '/journal' },
  API_ENDPOINTS: {
    TOKEN: '/api/token/',
    ME: '/api/users/me/',
    GROUPS: '/api/group/',
    SUBJECTS: '/api/subjects/',
    CADETS: '/api/cadet/',
    STUDENTS: '/api/student/',
    MARK_KINDS: '/api/mark-kind/',
    MARK_VALUES: '/api/mark-values/',
    LESSON_TIMES: '/api/lesson-times/',
    ATTENDANCE_REASONS: '/api/attendance-reasons/',
    LESSONS: '/api/lessons/',
    ATTENDANCES: '/api/attendances/',
    JOURNAL_RECORDS: '/api/journal-records/'
  },
  STORAGE_KEYS: { TOKEN: 'kis_access_token', USER: 'kis_user' },
  STUDENT_TYPES: { CADET: 'cadet', STUDENT: 'student' },
  HTTP_STATUS: {
    UNAUTHORIZED: 401
  },
  UI: {
    APP_TITLE: 'Журнал учета посещаемости и отметок обучающихся',
    ABSENT_MARK: 'Н',
    LESSON_SUFFIX: 'пара',
    DEFAULT_ATTENDANCE: 'Не указано (Присутствует)',
    DEFAULT_MARK: 'Нет отметки',
    ERRORS: {
      LOGIN: 'Ошибка авторизации. Попробуйте еще раз.',
      SAVE_DATA: 'Ошибка при сохранении данных',
      ADD_LESSON: 'Ошибка при добавлении занятия'
    }
  }
};