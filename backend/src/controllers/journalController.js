const { PrismaClient } = require('@prisma/client');
const { HTTP_STATUS, ROLES, ENUMS, DEFAULT_ATTENDANCE_STATUS } = require('../config/constants');

const prisma = new PrismaClient();

exports.getDashboard = async (req, res, next) => {
  try {
    const { role, teacher_id, student_id } = req.user;
    let dashboardData = [];

    if (role === ROLES.TEACHER) {
      const lessons = await prisma.lesson.findMany({
        where: { teacher_id },
        include: {
          group: true,
          subject: true
        },
        distinct: ['group_id', 'subject_id']
      });

      dashboardData = lessons.map(l => ({
        groupId: l.group.id,
        groupName: l.group.name,
        subjectId: l.subject.id,
        subjectName: l.subject.name
      }));
    } else if (role === ROLES.STAROSTA) {
      const student = await prisma.student.findUnique({
        where: { id: student_id },
        include: { group: true }
      });

      if (!student) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'Student record not found.' });
      }

      const lessons = await prisma.lesson.findMany({
        where: { group_id: student.group_id },
        include: { subject: true },
        distinct: ['subject_id']
      });

      dashboardData = lessons.map(l => ({
        groupId: student.group.id,
        groupName: student.group.name,
        subjectId: l.subject.id,
        subjectName: l.subject.name
      }));
    }

    res.status(HTTP_STATUS.OK).json(dashboardData);
  } catch (error) {
    next(error);
  }
};

exports.getJournalData = async (req, res, next) => {
  try {
    const { groupId, subjectId, startDate, endDate } = req.query;

    if (!groupId || !subjectId || !startDate || !endDate) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: 'Missing required query parameters.' });
    }

    const students = await prisma.student.findMany({
      where: { group_id: groupId },
      orderBy: { name: 'asc' }
    });

    const lessons = await prisma.lesson.findMany({
      where: {
        group_id: groupId,
        subject_id: subjectId,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      },
      orderBy: [
        { date: 'asc' },
        { lesson_number: 'asc' }
      ]
    });

    const lessonIds = lessons.map(l => l.id);
    const studentIds = students.map(s => s.id);

    const marks = await prisma.mark.findMany({
      where: {
        lesson_id: { in: lessonIds },
        student_id: { in: studentIds }
      }
    });

    const attendance = await prisma.attendance.findMany({
      where: {
        lesson_id: { in: lessonIds },
        student_id: { in: studentIds }
      }
    });

    res.status(HTTP_STATUS.OK).json({ students, lessons, marks, attendance });
  } catch (error) {
    next(error);
  }
};

exports.updateCell = async (req, res, next) => {
  try {
    const { lessonId, studentId, mark, absenceReason, lessonType } = req.body;
    const { role } = req.user;

    if (!lessonId || !studentId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: 'lessonId and studentId are required.' });
    }

    if (role === ROLES.STAROSTA && mark !== undefined) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({ error: 'Starosta cannot update marks.' });
    }

    await prisma.$transaction(async (tx) => {
      if (lessonType && ENUMS.LESSON_TYPES.includes(lessonType)) {
        await tx.lesson.update({
          where: { id: lessonId },
          data: { lesson_type: lessonType }
        });
      }

      if (absenceReason && ENUMS.ABSENCE_REASONS.includes(absenceReason)) {
        if (absenceReason === DEFAULT_ATTENDANCE_STATUS) {
          await tx.attendance.deleteMany({
            where: { student_id: studentId, lesson_id: lessonId }
          });
        } else {
          await tx.attendance.upsert({
            where: {
              student_id_lesson_id: { student_id: studentId, lesson_id: lessonId }
            },
            update: { absence_reason: absenceReason },
            create: { student_id: studentId, lesson_id: lessonId, absence_reason: absenceReason }
          });
        }
      }

      if (role === ROLES.TEACHER && mark !== undefined) {
        if (mark === null || mark === '') {
          await tx.mark.deleteMany({
            where: { student_id: studentId, lesson_id: lessonId }
          });
        } else {
          await tx.mark.upsert({
            where: {
              student_id_lesson_id: { student_id: studentId, lesson_id: lessonId }
            },
            update: { mark: String(mark) },
            create: { student_id: studentId, lesson_id: lessonId, mark: String(mark) }
          });
        }
      }
    });

    res.status(HTTP_STATUS.OK).json({ success: true });
  } catch (error) {
    next(error);
  }
};