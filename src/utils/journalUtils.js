export const generateCellKey = (personId, date, lessonTime) => {
  return `${personId}_${date}_${lessonTime}`;
};

export const getPersonFullName = (person) => {
  if (!person) return "";
  const lastName = person.last_name_rus || person.last_name || "";
  const firstName = person.first_name_rus || person.first_name || "";
  const patronymic = person.patronymic_rus || person.patronymic || "";

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
    const timeA = lessonTimesMap[a.lesson_time]?.number || 0;
    const timeB = lessonTimesMap[b.lesson_time]?.number || 0;
    return timeA - timeB;
  });
};

export const buildRecordsMap = (records, lessons) => {
  const rMap = {};
  records.forEach((r) => {
    const personId = r.cadet || r.student;
    const lesson = lessons.find((l) => l.id === r.lesson);
    if (lesson) {
      const key = generateCellKey(personId, lesson.date, lesson.lesson_time);
      if (!rMap[key]) rMap[key] = [];
      rMap[key].push(r);
    }
  });
  return rMap;
};

export const buildAttendancesMap = (attendances) => {
  const aMap = {};
  attendances.forEach((a) => {
    const personId = a.cadet || a.student;
    aMap[generateCellKey(personId, a.date, a.lesson_time)] = a;
  });
  return aMap;
};
