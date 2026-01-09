# GivethNotes Backend

GivethNotes Backend is a RESTful API built with Node.js and Express that manages career paths, dated journal entries, and entry content blocks. It uses MySQL (via `mysql2`) and includes logging, error handling, and CORS support. Authentication is wired for Clerk but several routes currently use a temporary `user_id = 1` placeholder.

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

All API routes are mounted under `/api` in `app.js` and protected by Clerk `requireAuth()` middleware in most cases. Note: some route handlers still use `user_id = 1` as a temporary placeholder.

Health Check
- `GET /` — basic API status

Career Paths (`routes/routesCareerPaths.js`)
- `GET /api/career-paths` — list user's career paths
- `GET /api/career-paths/:id` — fetch specific career path
- `POST /api/career-paths` — create career path
- `PUT /api/career-paths/:id` — update career path
- `DELETE /api/career-paths/:id` — delete career path

Journal Entries (`routes/routesJournalEntry.js`)
- `GET /api/journal-entries?career_path_id=:id` — list entries for a career path
- `GET /api/journal-entries/:id` — fetch a journal entry
- `POST /api/journal-entries` — create an entry (duplicate dates handled)
- `PUT /api/journal-entries/:id` — update entry date
- `DELETE /api/journal-entries/:id` — delete an entry

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

- Authentication: `app.js` integrates Clerk middleware (`@clerk/express`) and some routes call `getAuth()`/`clerkClient`. Several route handlers still fall back to `user_id = 1` — these should be migrated to the full Clerk-based user lookup.
- Entry block delete bug: `routesEntryBlocks` currently calls `logEntryActivities(entry_id, created_at)` after deletion, but `created_at` is not defined in that scope. It should use a newly generated GMT+3 timestamp (matching other handlers) or an `updated_at` value.
- Content storage: `entry_blocks.content` is stored as a JSON string. Clients must `JSON.stringify()` when sending and parse responses as needed.

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
