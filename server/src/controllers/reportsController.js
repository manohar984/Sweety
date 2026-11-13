const pool = require('../config/db');

function toLocalDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function toReadableDate(dateStr) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

async function fetchStats(userId, startDate, endDate) {
  const result = await pool.query(
    `SELECT
       COUNT(*)                           AS count,
       MIN(glucose_value)                 AS min,
       MAX(glucose_value)                 AS max,
       ROUND(AVG(glucose_value)::numeric, 1) AS average
     FROM glucose_readings
     WHERE user_id    = $1
       AND reading_date >= $2
       AND reading_date <= $3`,
    [userId, startDate, endDate]
  );

  const row = result.rows[0];
  return {
    count:   parseInt(row.count, 10),
    min:     row.min     !== null ? parseInt(row.min, 10)         : null,
    max:     row.max     !== null ? parseInt(row.max, 10)         : null,
    average: row.average !== null ? parseFloat(row.average)       : null,
  };
}

const getDailyReport = async (req, res) => {
  try {
    const userId = req.user.id;

    let date = req.query.date;

    if (date) {
      const parsed = new Date(date);
      if (isNaN(parsed.getTime())) {
        return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD.' });
      }

      const today = toLocalDateStr(new Date());
      if (date > today) {
        return res.status(400).json({ error: 'Date cannot be in the future.' });
      }
    } else {
      date = toLocalDateStr(new Date());
    }

    const stats = await fetchStats(userId, date, date);

    return res.status(200).json({
      report: {
        type:   'daily',
        period: `${toReadableDate(date)}`,
        date,
        ...stats,
      },
    });
  } catch (error) {
    console.error('Daily report error:', error.message);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
};

const getMonthToDateReport = async (req, res) => {
  try {
    const userId = req.user.id;

    const now = new Date();
    const today = toLocalDateStr(now);

    const monthStart = toLocalDateStr(
      new Date(now.getFullYear(), now.getMonth(), 1)
    );

    const stats = await fetchStats(userId, monthStart, today);

    const period = `${toReadableDate(monthStart)} — ${toReadableDate(today)}`;

    return res.status(200).json({
      report: {
        type:   'month-to-date',
        period,
        startDate: monthStart,
        endDate:   today,
        ...stats,
      },
    });
  } catch (error) {
    console.error('Month-to-date report error:', error.message);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
};

const getPreviousMonthReport = async (req, res) => {
  try {
    const userId = req.user.id;

    const now = new Date();

    const prevMonthStart = toLocalDateStr(
      new Date(now.getFullYear(), now.getMonth() - 1, 1)
    );

    const prevMonthEnd = toLocalDateStr(
      new Date(now.getFullYear(), now.getMonth(), 0)
    );

    const stats = await fetchStats(userId, prevMonthStart, prevMonthEnd);

    const monthLabel = new Date(prevMonthStart + 'T12:00:00').toLocaleDateString('en-GB', {
      month: 'long', year: 'numeric',
    });

    return res.status(200).json({
      report: {
        type:   'previous-month',
        period: monthLabel,
        startDate: prevMonthStart,
        endDate:   prevMonthEnd,
        ...stats,
      },
    });
  } catch (error) {
    console.error('Previous month report error:', error.message);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
};

module.exports = { getDailyReport, getMonthToDateReport, getPreviousMonthReport };
