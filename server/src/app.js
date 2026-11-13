const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/authRoutes');
const readingsRoutes = require('./routes/readingsRoutes');
const reportsRoutes = require('./routes/reportsRoutes');

app.get('/', (req, res) => {
  res.json({ message: 'Sweety Glucose Tracker API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/readings', readingsRoutes);
app.use('/api/reports', reportsRoutes);

module.exports = app;
