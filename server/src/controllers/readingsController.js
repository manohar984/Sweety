const pool = require('../config/db');

const ALLOWED_SLOTS = [
  'Morning (fasting)',
  'After breakfast',
  'After lunch',
  'After dinner',
];

const SLOT_ORDER_SQL = `
  CASE reading_slot
    WHEN 'Morning (fasting)' THEN 1
    WHEN 'After breakfast'   THEN 2
    WHEN 'After lunch'       THEN 3
    WHEN 'After dinner'      THEN 4
    ELSE 5
  END
`;

function validateReadingInput({ glucose_value, reading_date, reading_slot }) {
  if (glucose_value === undefined || glucose_value === null || glucose_value === '') {
    return 'glucose_value is required.';
  }

  const glucose = Number(glucose_value);
  if (!Number.isInteger(glucose)) {
    return 'glucose_value must be a whole number (integer).';
  }
  if (glucose < 40 || glucose > 600) {
    return 'glucose_value must be between 40 and 600 mg/dL.';
  }

  if (!reading_date) {
    return 'reading_date is required.';
  }

  const submitted = new Date(reading_date);
  if (isNaN(submitted.getTime())) {
    return 'reading_date is not a valid date.';
  }

  const today = new Date();
  const todayUTC = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  );
  if (submitted > todayUTC) {
    return 'reading_date cannot be a future date.';
  }

  if (!reading_slot) {
    return 'reading_slot is required.';
  }
  if (!ALLOWED_SLOTS.includes(reading_slot)) {
    return `reading_slot must be one of: ${ALLOWED_SLOTS.join(', ')}.`;
  }

  return null;
}

const createReading = async (req, res) => {
  try {
    const userId = req.user.id;

    const { glucose_value, reading_date, reading_slot } = req.body;

    const validationError = validateReadingInput({ glucose_value, reading_date, reading_slot });
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const result = await pool.query(
      `INSERT INTO glucose_readings (user_id, glucose_value, reading_date, reading_slot)
       VALUES ($1, $2, $3, $4)
       RETURNING id, glucose_value, reading_date, reading_slot, created_at`,
      [userId, Number(glucose_value), reading_date, reading_slot]
    );

    return res.status(201).json({
      message: 'Reading added successfully.',
      reading: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        error: `You already have a '${req.body.reading_slot}' reading for this date.`,
      });
    }

    console.error('Create reading error:', error.message);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
};

const getReadings = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT id, glucose_value, reading_date, reading_slot, created_at
       FROM glucose_readings
       WHERE user_id = $1
       ORDER BY reading_date DESC, ${SLOT_ORDER_SQL}`,
      [userId]
    );

    return res.status(200).json({
      count: result.rows.length,
      readings: result.rows,
    });
  } catch (error) {
    console.error('Get readings error:', error.message);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
};

const updateReading = async (req, res) => {
  try {
    const userId = req.user.id;

    const readingId = req.params.id;

    const { glucose_value, reading_date, reading_slot } = req.body;

    const validationError = validateReadingInput({ glucose_value, reading_date, reading_slot });
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const result = await pool.query(
      `UPDATE glucose_readings
       SET glucose_value = $1,
           reading_date  = $2,
           reading_slot  = $3
       WHERE id = $4 AND user_id = $5
       RETURNING id, glucose_value, reading_date, reading_slot, created_at`,
      [Number(glucose_value), reading_date, reading_slot, readingId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reading not found.' });
    }

    return res.status(200).json({
      message: 'Reading updated successfully.',
      reading: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        error: `You already have a '${req.body.reading_slot}' reading for this date.`,
      });
    }

    console.error('Update reading error:', error.message);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
};

const deleteReading = async (req, res) => {
  try {
    const userId = req.user.id;
    const readingId = req.params.id;

    const result = await pool.query(
      `DELETE FROM glucose_readings
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [readingId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reading not found.' });
    }

    return res.status(200).json({ message: 'Reading deleted successfully.' });
  } catch (error) {
    console.error('Delete reading error:', error.message);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
};

module.exports = { createReading, getReadings, updateReading, deleteReading };
