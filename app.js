const express = require('express');
const cors = require('cors');
require('dotenv').config();
const database = require("./config/db");

const app = express();

// Middlewares
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/error');
const notFound = require('./middleware/notfound');
app.use(cors());
app.use(express.json());
app.set('trust proxy', true);
app.use(logger);

// routes
const careerPathsRoutes = require('./routes/routesCareerPaths');
const journalEntryRoutes = require('./routes/routesJournalEntry');

// Health Check
app.get('/', (req, res) => {
  res.json({ message: 'GivethNotes API is running 🚀' });
});

// Career Routes Paths
app.use('/api', careerPathsRoutes);
// Journal Entry Routes Paths
app.use('/api', journalEntryRoutes);

// 404 Middleware
app.use(notFound);

// Error Middleware (must be last)
app.use(errorHandler);

module.exports = app;
