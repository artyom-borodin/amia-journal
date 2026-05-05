const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;
const DEFAULT_PASSWORD = '123';

const SURNAMES = ['Иванов', 'Петров', 'Сидоров', 'Смирнов', 'Кузнецов', 'Попов', 'Васильев', 'Соколов', 'Михайлов', 'Новиков', 'Федоров', 'Морозов', 'Волков', 'Алексеев', 'Лебедев', 'Семенов', 'Егоров', 'Павлов', 'Козлов', 'Степанов'];
const NAMES = ['Иван', 'Петр', 'Сергей', 'Алексей', 'Дмитрий', 'Андрей', 'Михаил', 'Николай', 'Павел', 'Антон', 'Владимир', 'Александр', 'Евгений', 'Олег', 'Игорь'];
const PATRONYMICS = ['Иванович', 'Петрович', 'Сергеевич', 'Алексеевич', 'Дмитриевич', 'Андреевич', 'Михайлович', 'Николаевич', 'Павлович', 'Антонович', 'Владимирович', 'Александрович'];

const SUBJECT_NAMES = ['Гражданское право', 'Уголовное право', 'Криминалистика', 'Философия', 'История государства и права зарубежных стран'];
const LESSON_TYPES = ['Лекция', 'Практическое', 'Семинар'];
const ABSENCE_REASONS = ['Болен', 'Сборы', 'Отсутствует по неуважительной причине'];
const MARKS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateFullName() {
  return `${getRandom(SURNAMES)} ${getRandom(NAMES)} ${getRandom(PATRONYMICS)}`;
}

async function main() {
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);

  const teachers = [];
  for (let i = 0; i < 10; i++) {
    const teacher = await prisma.teacher.create({
      data: { name: generateFullName() }
    });
    teachers.push(teacher);
    await prisma.user.create({
      data: {
        login: `teacher${i + 1}`,
        password: hashedPassword,
        role: 'TEACHER',
        teacher_id: teacher.id
      }
    });
  }

  const groups = [];
  for (let i = 0; i < 10; i++) {
    const group = await prisma.group.create({
      data: { name: `Группа ${3501 + i}` }
    });
    groups.push(group);
  }

  const subjects = [];
  for (const name of SUBJECT_NAMES) {
    const subject = await prisma.subject.create({ data: { name } });
    subjects.push(subject);
  }

  const allStudents = [];
  for (const group of groups) {
    for (let i = 0; i < 15; i++) {
      const student = await prisma.student.create({
        data: {
          name: generateFullName(),
          group_id: group.id
        }
      });
      allStudents.push(student);

      if (i === 0) {
        await prisma.user.create({
          data: {
            login: `starosta${group.name.split(' ')[1]}`,
            password: hashedPassword,
            role: 'STAROSTA',
            student_id: student.id
          }
        });
      }
    }
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 14);

  for (let day = 0; day < 35; day++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + day);
    currentDate.setHours(0, 0, 0, 0);

    if (currentDate.getDay() === 0 || currentDate.getDay() === 6) continue;

    for (const group of groups) {
      const dailySubjects = [subjects[0], subjects[1]];
      
      for (let lessonNum = 1; lessonNum <= 2; lessonNum++) {
        const subject = dailySubjects[lessonNum - 1];
        const teacher = teachers[subjects.indexOf(subject) % teachers.length];

        const lesson = await prisma.lesson.create({
          data: {
            teacher_id: teacher.id,
            group_id: group.id,
            subject_id: subject.id,
            date: currentDate,
            lesson_number: lessonNum,
            lesson_type: getRandom(LESSON_TYPES)
          }
        });

        const groupStudents = allStudents.filter(s => s.group_id === group.id);
        for (const student of groupStudents) {
          const dice = Math.random();
          if (dice < 0.15) {
            await prisma.attendance.create({
              data: {
                student_id: student.id,
                lesson_id: lesson.id,
                absence_reason: getRandom(ABSENCE_REASONS)
              }
            });
          } else if (dice < 0.4) {
            await prisma.mark.create({
              data: {
                student_id: student.id,
                lesson_id: lesson.id,
                mark: getRandom(MARKS)
              }
            });
          }
        }
      }
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });