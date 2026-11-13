require('dotenv').config();
const pool = require('./config/db');
const bcrypt = require('bcrypt');

const SEED_USER = {
  name:     'Seed Test User',
  email:    'seedtest@sweety.test',
  password: 'SeedPass1!',
};

const SEED_READINGS = [
  { glucose_value: 92,  reading_slot: 'Morning (fasting)', days_ago: 0 },
  { glucose_value: 145, reading_slot: 'After breakfast',   days_ago: 0 },
  { glucose_value: 138, reading_slot: 'After lunch',       days_ago: 0 },

  { glucose_value: 88,  reading_slot: 'Morning (fasting)', days_ago: 1 },
  { glucose_value: 152, reading_slot: 'After breakfast',   days_ago: 1 },
  { glucose_value: 143, reading_slot: 'After lunch',       days_ago: 1 },
  { glucose_value: 160, reading_slot: 'After dinner',      days_ago: 1 },

  { glucose_value: 95,  reading_slot: 'Morning (fasting)', days_ago: 3 },
  { glucose_value: 162, reading_slot: 'After lunch',       days_ago: 3 },

  { glucose_value: 100, reading_slot: 'Morning (fasting)', days_ago: 7 },
  { glucose_value: 155, reading_slot: 'After breakfast',   days_ago: 7 },
  { glucose_value: 148, reading_slot: 'After dinner',      days_ago: 7 },

  { glucose_value: 97,  reading_slot: 'Morning (fasting)', days_ago: 15 },
  { glucose_value: 140, reading_slot: 'After lunch',       days_ago: 15 },
];

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

async function seed() {
  console.log('============================================================');
  console.log('  Sweety — Seed Script (local development only)');
  console.log('============================================================\n');

  try {
    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [SEED_USER.email]
    );

    let userId;

    if (existing.rows.length > 0) {
      userId = existing.rows[0].id;
      console.log(`ℹ️  Seed user already exists: ${SEED_USER.email}`);
      console.log(`   User ID: ${userId}\n`);
    } else {
      const passwordHash = await bcrypt.hash(SEED_USER.password, 10);

      const result = await pool.query(
        `INSERT INTO users (name, email, password_hash)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [SEED_USER.name, SEED_USER.email, passwordHash]
      );

      userId = result.rows[0].id;
      console.log(`✅ Created seed user: ${SEED_USER.email}`);
      console.log(`   User ID: ${userId}\n`);
    }

    console.log('Inserting sample readings...\n');

    let inserted = 0;
    let skipped = 0;

    for (const reading of SEED_READINGS) {
      const readingDate = daysAgo(reading.days_ago);

      const result = await pool.query(
        `INSERT INTO glucose_readings (user_id, glucose_value, reading_date, reading_slot)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id, reading_date, reading_slot) DO NOTHING
         RETURNING id`,
        [userId, reading.glucose_value, readingDate, reading.reading_slot]
      );

      if (result.rowCount > 0) {
        console.log(`  ✅ ${readingDate} | ${reading.reading_slot.padEnd(20)} | ${reading.glucose_value} mg/dL`);
        inserted++;
      } else {
        console.log(`  ⏭️  ${readingDate} | ${reading.reading_slot.padEnd(20)} | already exists, skipped`);
        skipped++;
      }
    }

    console.log('\n============================================================');
    console.log(`  Seed complete: ${inserted} inserted, ${skipped} skipped`);
    console.log('============================================================');
    console.log('\nYou can now log in with:');
    console.log(`  Email:    ${SEED_USER.email}`);
    console.log(`  Password: ${SEED_USER.password}`);
  } catch (error) {
    console.error('\n❌ Seed failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
