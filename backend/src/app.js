const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const journalRoutes = require('./routes/journalRoutes');
const { HTTP_STATUS } = require('./config/constants');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/journal', journalRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ 
    error: 'Internal Server Error',
    message: err.message 
  });
});

module.exports = app;