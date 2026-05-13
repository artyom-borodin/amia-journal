export const generateCellKey = (personId, date, lessonTime) => {
  return `${personId}_${date}_${lessonTime}`;
};
