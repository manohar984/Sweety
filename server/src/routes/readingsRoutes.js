const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');

const {
  createReading,
  getReadings,
  updateReading,
  deleteReading,
} = require('../controllers/readingsController');

router.post('/', protect, createReading);
router.get('/', protect, getReadings);
router.put('/:id', protect, updateReading);
router.delete('/:id', protect, deleteReading);

module.exports = router;
