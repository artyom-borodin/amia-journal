const jwt = require('jsonwebtoken');
const { HTTP_STATUS, ROLES } = require('../config/constants');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: 'Invalid token.' });
  }
};

const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({ error: 'Access forbidden. Insufficient permissions.' });
    }
    next();
  };
};

module.exports = {
  verifyToken,
  requireRole
};