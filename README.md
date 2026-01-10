# GivethNotes Backend

GivethNotes Backend is a RESTful API built with Node.js and Express that manages career paths, dated journal entries, and entry content blocks. It uses MySQL (via `mysql2`) and includes logging, error handling, and CORS support. Authentication is implemented with Clerk and most routes are mounted behind `requireAuth()`; the Career Paths endpoints have been migrated to use `getUserIdFromRequest(req)` to resolve the local `user_id`. Some other handlers (notably several Journal Entries routes) still use a temporary `user_id = 1` placeholder and need migration.

## Key Features

- Career path CRUD operations
- Journal entry creation, listing, updating, and deletion
- Entry blocks (typed content pieces) with automatic re-ordering on deletion
- Request logging to a `logs` table and console
- Environment-driven configuration using `.env`

## Tech Stack

- Node.js
- Express (v5)
- MySQL (`mysql2`)
- Cors, Dotenv
- Nodemon (dev)

## Quickstart

Prerequisites:
- Node.js
- MySQL server

1. Clone the repo and install dependencies:

```bash
git clone <repository-url>
cd givethnotes-backend
npm install
```

2. Create a `.env` file in the project root. Required environment variables used by this project include:

```
PORT=5000
DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=your_database_name
DB_PORT=3306
CORS_ORIGIN=http://localhost:3000
# Clerk (example) variables if you use Clerk auth
# CLERK_API_KEY=...
# CLERK_FRONTEND_API=...
```

3. Run the app:

```bash
npm run dev   # development with nodemon
npm start     # production
```

The app listens on the port defined by `PORT` (defaults to 5000).

## API Overview

All API routes are mounted under `/api` in `app.js` and most are protected by Clerk's `requireAuth()` middleware. The Career Paths endpoints have been migrated to resolve the authenticated user via `getUserIdFromRequest(req)`; other areas (notably some Journal Entries handlers) still use temporary `user_id` placeholders and should be migrated to the same approach.

Health Check
- `GET /` — basic API status

Career Paths (`routes/routesCareerPaths.js`)
- `GET /api/career-paths` — list authenticated user's career paths (uses `getUserIdFromRequest`)
- `GET /api/career-paths/:id` — fetch a career path belonging to the authenticated user
- `POST /api/career-paths` — create a career path for the authenticated user
- `PUT /api/career-paths/:id` — update an authenticated user's career path
- `DELETE /api/career-paths/:id` — delete an authenticated user's career path

Journal Entries (`routes/routesJournalEntry.js`)
- `GET /api/journal-entries?career_path_id=:id` — list journal entries for a career path (uses `getUserIdFromRequest`)
- `GET /api/journal-entries/:id` — fetch a journal entry (currently uses temporary `user_id = 1` — needs migration)
- `POST /api/journal-entries` — create an entry (duplicate dates handled; currently uses temporary `user_id = 1`)
- `PUT /api/journal-entries/:id` — update entry date (currently uses temporary `user_id = 1`)
- `DELETE /api/journal-entries/:id` — delete an entry (currently uses temporary `user_id = 1`)

Entry Blocks (`routes/routesEntryBlocks.js`)
- `GET /api/entry-blocks?entry_id=:id` — list blocks for an entry ordered by `position`
- `POST /api/entry-blocks` — create a block (content stored as JSON string)
- `PUT /api/entry-blocks` — update a block by `entry_id` + `position`
- `DELETE /api/entry-blocks` — delete a block by `entry_id` + `position` and shift subsequent blocks

Supported block types: `heading`, `notes`, `points`, `attachment`, `reference`.

## Project Structure

```
givethnotes-backend/
├── config/             # DB pool and connection test
├── functions/          # helper functions (user lookup, activity log)
├── middleware/         # request logger, error handler, 404 handler
├── routes/             # Express route handlers
├── app.js              # Express application wiring
├── server.js           # server bootstrapping
├── package.json        # scripts & deps
└── .env                # local environment (not committed)
```

## Notes & Known Issues

- Authentication: `app.js` integrates Clerk middleware (`@clerk/express`), and all route groups are mounted behind `requireAuth()`. **Update:** Career Paths handlers have been migrated to use `getUserIdFromRequest(req)` and now operate on the authenticated user's data. Remaining work: several Journal Entries handlers (POST, GET single, PUT, DELETE) still use a temporary `user_id = 1` placeholder and should be migrated to resolve the user via `getUserIdFromRequest(req)`.
- Entry Blocks behavior: `routesEntryBlocks` is mounted behind `requireAuth()` at the app level, but individual handlers do not enforce a local `user_id` check and rely on `entry_id` to scope operations. There's an existing bug in the DELETE handler where it calls `logEntryActivities(entry_id, created_at)` but `created_at` is not defined — it should use a generated GMT+3 timestamp (or `updated_at`) to log correctly.
- Content storage: `entry_blocks.content` is stored as a JSON string. Clients must `JSON.stringify()` when sending and parse responses as needed.

Suggested next steps / TODOs:
1. Migrate Journal Entries handlers to use `getUserIdFromRequest(req)` and ensure consistent ownership checks.
2. Fix the `created_at`/timestamp usage in `routesEntryBlocks.js` DELETE handler and add tests for reordering behavior.
3. Consider adding integration tests that run against a test database and assert ownership rules for protected resources.

## Database (expected tables)

- `users` — stores local user records with `clerk_user_id` and `email`
- `career_paths` — career path records
- `journal_entries` — dated journal entries (unique per career path + date)
- `entry_blocks` — content blocks for entries with `position` ordering
- `logs` — HTTP request logs produced by the `logger` middleware

## Contributing / Next Steps

- Replace temporary `user_id` placeholders with Clerk-based user resolution (`functions/userFunction.js` helps find or create users).
- Fix the `created_at` variable usage in `routes/routesEntryBlocks.js` DELETE handler.

## License
ISC
