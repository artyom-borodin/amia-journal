import { APP_CONSTANTS } from "./constants";

export const getDictionaryConfigs = (dictionaryStore) => [
  {
    id: "markKinds",
    label: APP_CONSTANTS.UI.LABELS.MARK_KIND,
    endpoint: APP_CONSTANTS.API_ENDPOINTS.MARK_KINDS,
    columns: [
      {
        field: "mark_kind",
        header: APP_CONSTANTS.UI.LABELS.MARK_KIND,
        type: APP_CONSTANTS.FIELD_TYPES.TEXT,
        required: true,
      },
    ],
  },
  {
    id: "markValues",
    label: APP_CONSTANTS.UI.LABELS.MARK_VALUE,
    endpoint: APP_CONSTANTS.API_ENDPOINTS.MARK_VALUES,
    columns: [
      {
        field: "value",
        header: APP_CONSTANTS.UI.LABELS.MARK_VALUE,
        type: APP_CONSTANTS.FIELD_TYPES.TEXT,
        required: true,
      },
    ],
  },
  {
    id: "lessonTimes",
    label: APP_CONSTANTS.UI.LABELS.LESSON_TIME,
    endpoint: APP_CONSTANTS.API_ENDPOINTS.LESSON_TIMES,
    columns: [
      {
        field: "number",
        header: APP_CONSTANTS.UI.LABELS.LESSON_TIME,
        type: APP_CONSTANTS.FIELD_TYPES.NUMBER,
        required: true,
      },
      {
        field: "start_time",
        header: APP_CONSTANTS.UI.LABELS.START_TIME,
        type: APP_CONSTANTS.FIELD_TYPES.TIME,
        required: true,
      },
      {
        field: "end_time",
        header: APP_CONSTANTS.UI.LABELS.END_TIME,
        type: APP_CONSTANTS.FIELD_TYPES.TIME,
        required: true,
      },
    ],
  },
  {
    id: "attendanceReasons",
    label: APP_CONSTANTS.UI.LABELS.ATTENDANCE_REASONS,
    endpoint: APP_CONSTANTS.API_ENDPOINTS.ATTENDANCE_REASONS,
    columns: [
      {
        field: "name",
        header: APP_CONSTANTS.UI.LABELS.ATTENDANCE_REASONS,
        type: APP_CONSTANTS.FIELD_TYPES.TEXT,
        required: true,
      },
      {
        field: "is_absent",
        header: APP_CONSTANTS.UI.LABELS.IS_ABSENT,
        type: APP_CONSTANTS.FIELD_TYPES.BOOLEAN,
        required: false,
      },
    ],
  },
  {
    id: "semesters",
    label: APP_CONSTANTS.UI.LABELS.SEMESTER,
    endpoint: APP_CONSTANTS.API_ENDPOINTS.SEMESTERS,
    columns: [
      {
        field: "year",
        header: APP_CONSTANTS.UI.LABELS.YEAR,
        type: APP_CONSTANTS.FIELD_TYPES.SELECT,
        options: dictionaryStore.dicts.years,
        optionLabel: "year_str",
        optionValue: "id",
        required: true,
      },
      {
        field: "semester",
        header: APP_CONSTANTS.UI.LABELS.SEMESTER,
        type: APP_CONSTANTS.FIELD_TYPES.TEXT,
        required: true,
      },
      {
        field: "start_date",
        header: APP_CONSTANTS.UI.LABELS.START_DATE,
        type: APP_CONSTANTS.FIELD_TYPES.DATE,
        required: true,
      },
      {
        field: "end_date",
        header: APP_CONSTANTS.UI.LABELS.END_DATE,
        type: APP_CONSTANTS.FIELD_TYPES.DATE,
        required: true,
      },
    ],
  },
  {
    id: "lessonTypes",
    label: APP_CONSTANTS.UI.LABELS.LESSON_TYPE,
    endpoint: APP_CONSTANTS.API_ENDPOINTS.LESSON_TYPES,
    columns: [
      {
        field: "name",
        header: APP_CONSTANTS.UI.LABELS.LESSON_TYPE,
        type: APP_CONSTANTS.FIELD_TYPES.TEXT,
        required: true,
      },
    ],
  },
  {
    id: "years",
    label: APP_CONSTANTS.UI.LABELS.YEAR,
    endpoint: APP_CONSTANTS.API_ENDPOINTS.YEARS,
    columns: [
      {
        field: "year",
        header: APP_CONSTANTS.UI.LABELS.YEAR,
        type: APP_CONSTANTS.FIELD_TYPES.NUMBER,
        required: true,
      },
      {
        field: "year_str",
        header: APP_CONSTANTS.UI.LABELS.YEAR_STR,
        type: APP_CONSTANTS.FIELD_TYPES.TEXT,
        required: true,
      },
    ],
  },
  {
    id: "subjects",
    label: APP_CONSTANTS.UI.LABELS.SUBJECT,
    endpoint: APP_CONSTANTS.API_ENDPOINTS.SUBJECTS,
    columns: [
      {
        field: "subject_name",
        header: APP_CONSTANTS.UI.LABELS.SUBJECT,
        type: APP_CONSTANTS.FIELD_TYPES.TEXT,
        required: true,
      },
    ],
  },
];
