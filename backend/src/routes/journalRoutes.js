const express = require('express');
const journalController = require('../controllers/journalController');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');
const { ROLES } = require('../config/constants');

const router = express.Router();

router.use(verifyToken);

router.get('/dashboard', requireRole([ROLES.TEACHER, ROLES.STAROSTA]), journalController.getDashboard);
router.get('/grid', requireRole([ROLES.TEACHER, ROLES.STAROSTA]), journalController.getJournalData);
router.post('/update', requireRole([ROLES.TEACHER, ROLES.STAROSTA]), journalController.updateCell);

module.exports = router;