const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { HTTP_STATUS } = require('../config/constants');

const prisma = new PrismaClient();
const TOKEN_EXPIRATION = '24h';

exports.login = async (req, res, next) => {
  try {
    const { login, password } = req.body;

    if (!login || !password) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: 'Login and password are required.' });
    }

    const user = await prisma.user.findUnique({
      where: { login }
    });

    if (!user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: 'Invalid credentials.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: 'Invalid credentials.' });
    }

    const payload = {
      id: user.id,
      role: user.role,
      teacher_id: user.teacher_id,
      student_id: user.student_id
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: TOKEN_EXPIRATION });

    res.status(HTTP_STATUS.OK).json({
      token,
      user: payload
    });
  } catch (error) {
    next(error);
  }
};