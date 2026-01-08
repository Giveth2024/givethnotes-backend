const express = require('express');
const cors = require('cors');
require('dotenv').config();
const database = require("./config/db");

const app = express();

// Middlewares
const { clerkMiddleware, clerkClient, requireAuth, getAuth } = require('@clerk/express');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/error');
const notFound = require('./middleware/notfound');

app.use(cors({
    origin: 'http://localhost:3000', // your Next.js frontend
    credentials: true,               // allow cookies
  }));
app.use(clerkMiddleware());
app.use(express.json());
app.set('trust proxy', true);
app.use(logger);

// routes
const careerPathsRoutes = require('./routes/routesCareerPaths');
const journalEntryRoutes = require('./routes/routesJournalEntry');
const entryBlocksRoutes = require('./routes/routesEntryBlocks');

// Health Check
app.get('/', (req, res) => {
  res.json({ message: 'GivethNotes API is running 🚀' });
});

// If user isn't authenticated, requireAuth() will redirect back to the homepage
app.get('/protected', requireAuth(), async (req, res) => {
  // Use `getAuth()` to get the user's `userId`
  const { userId } = getAuth(req)

  // Use Clerk's JS Backend SDK to get the user's User object
  const user = await clerkClient.users.getUser(userId)

  return res.json({ user })
})

// Career Routes Paths
app.use('/api', requireAuth(), careerPathsRoutes);

// Journal Entry Routes Paths
app.use('/api', requireAuth(), journalEntryRoutes);

// Entry Blocks Routes Paths
app.use('/api', requireAuth(), entryBlocksRoutes);

// 404 Middleware
app.use(notFound);

// Error Middleware (must be last)
app.use(errorHandler);

module.exports = app;
