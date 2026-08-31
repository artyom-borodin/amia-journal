import { APP_CONSTANTS } from "../config/constants";

export const generateCellKey = (personId, date, lessonTime) => {
  return `${personId}_${date}_${lessonTime}`;
};

const capitalizeWord = (word) => {
  if (!word) return "";
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
};

export const getPersonFullName = (person) => {
  if (!person) return "";
  const lastName = capitalizeWord(
    person.last_name_rus || person.last_name || "",
  );
  const firstName = capitalizeWord(
    person.first_name_rus || person.first_name || "",
  );
  const patronymic = capitalizeWord(
    person.patronymic_rus || person.patronymic || "",
  );

  const fullName = `${lastName} ${firstName} ${patronymic}`.trim();
  return fullName || person.username || "";
};

export const createDictMap = (array, key = "id") => {
  if (!Array.isArray(array)) return {};
  return array.reduce((acc, item) => {
    acc[item[key]] = item;
    return acc;
  }, {});
};

export const sortLessons = (lessons, lessonTimesMap) => {
  return [...lessons].sort((a, b) => {
    if (a.date !== b.date) return new Date(a.date) - new Date(b.date);

    const timeA =
      lessonTimesMap[a.lesson_time]?.number ||
      APP_CONSTANTS.RULES.DEFAULT_LESSON_NUMBER;
    const timeB =
      lessonTimesMap[b.lesson_time]?.number ||
      APP_CONSTANTS.RULES.DEFAULT_LESSON_NUMBER;

    if (timeA !== timeB) return timeA - timeB;

    return a.id - b.id;
  });
};

export const buildRecordsMap = (records, lessons) => {
  const rMap = {};
  const sortedRecords = [...records].sort((a, b) => a.id - b.id);
  sortedRecords.forEach((r) => {
    const personType = r.cadet
      ? APP_CONSTANTS.STUDENT_TYPES.CADET
      : APP_CONSTANTS.STUDENT_TYPES.STUDENT;
    const personId = r.cadet || r.student;
    const uniqueId = `${personType}_${personId}`;

    const key = `${uniqueId}_${r.lesson}`;
    if (!rMap[key]) rMap[key] = [];
    rMap[key].push(r);
  });
  return rMap;
};

export const buildAttendancesMap = (attendances) => {
  const aMap = {};
  attendances.forEach((a) => {
    const personType = a.cadet
      ? APP_CONSTANTS.STUDENT_TYPES.CADET
      : APP_CONSTANTS.STUDENT_TYPES.STUDENT;
    const personId = a.cadet || a.student;
    const uniqueId = `${personType}_${personId}`;

    aMap[generateCellKey(uniqueId, a.date, a.lesson_time)] = a;
  });
  return aMap;
};

export const formatTimeShort = (timeStr) =>
  (timeStr || "").slice(0, APP_CONSTANTS.RULES.TIME_SUBSTRING_END);

export const formatLessonTimeDisplay = (timeObj) => {
  if (!timeObj) return "";
  const start = formatTimeShort(timeObj.start_time);
  const end = formatTimeShort(timeObj.end_time);
  return `${timeObj.number} ${APP_CONSTANTS.UI.LABELS.LESSON_NUMBER_SUFFIX} (${start} - ${end})`;
};

export const getPersonPayloads = (person) => {
  const isCadet = person.personType === APP_CONSTANTS.STUDENT_TYPES.CADET;
  return {
    entityPayload: {
      cadet: isCadet ? person.id : null,
      student: !isCadet ? person.id : null,
    },
    idPayload: {
      cadet_id: isCadet ? person.id : null,
      student_id: !isCadet ? person.id : null,
    },
  };
};

export const sortGroupsByName = (groups) => {
  return [...groups].sort((a, b) =>
    a.group_name.localeCompare(b.group_name, undefined, { numeric: true }),
  );
};

export const sortPersonsByFullName = (persons) => {
  return [...persons].sort((a, b) =>
    getPersonFullName(a).localeCompare(getPersonFullName(b)),
  );
};

export const sortMarkValues = (marks) => {
  return [...marks].sort((a, b) => {
    const valA = String(a.value || "").trim();
    const valB = String(b.value || "").trim();
    const numA = Number(valA);
    const numB = Number(valB);

    const isNumA = valA !== "" && !isNaN(numA);
    const isNumB = valB !== "" && !isNaN(numB);

    if (isNumA && isNumB) {
      return numA - numB;
    }
    if (isNumA && !isNumB) return -1;
    if (!isNumA && isNumB) return 1;

    return valA.localeCompare(valB, undefined, { numeric: true });
  });
};
