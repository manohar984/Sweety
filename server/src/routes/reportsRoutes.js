const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');

const {
  getDailyReport,
  getMonthToDateReport,
  getPreviousMonthReport,
} = require('../controllers/reportsController');

router.get('/daily', protect, getDailyReport);
router.get('/month-to-date', protect, getMonthToDateReport);
router.get('/previous-month', protect, getPreviousMonthReport);

module.exports = router;
