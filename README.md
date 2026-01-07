# GivethNotes Backend

GivethNotes Backend is a RESTful API built with Node.js and Express, designed to manage career paths, journal entries, and entry blocks for the GivethNotes platform. It uses MySQL for data storage and includes features such as logging, error handling, and CORS support.

## Features

- **Career Path Management**: Create, read, update, and delete career paths.
- **Journal Entries**: Manage dated journal entries associated with specific career paths.
- **Entry Blocks**: Rich content blocks within journal entries, supporting various types like headings, notes, points, and more.
- **Reordering Logic**: Automatic position shifting when entry blocks are deleted.
- **Middleware**: Built-in logging, error handling, and 404 (Not Found) handling.
- **Database**: Integrated with MySQL using `mysql2` with connection pooling.
- **Environment Driven**: Configuration managed via environment variables.

## Tech Stack

- **Node.js**
- **Express.js** (v5.x)
- **MySQL** (via `mysql2`)
- **Cors**
- **Dotenv**
- **Nodemon** (for development)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) installed
- [MySQL](https://www.mysql.com/) server running

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd givethnotes-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the root directory and add the following:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=your_mysql_user
   DB_PASSWORD=your_mysql_password
   DB_NAME=your_database_name
   DB_PORT=3306
   ```

### Running the Application

- **Development Mode** (with Nodemon):
  ```bash
  npm run dev
  ```
- **Production Mode**:
  ```bash
  npm start
  ```

The server will be running on `http://localhost:5000` (or your configured `PORT`).

## API Endpoints

### Health Check
- `GET /`: Returns API status.

### Career Paths
- `GET /api/career-paths`: Fetch all career paths for the current user.
- `GET /api/career-paths/:id`: Fetch a specific career path by ID.
- `POST /api/career-paths`: Create a new career path.
- `PUT /api/career-paths/:id`: Update an existing career path.
- `DELETE /api/career-paths/:id`: Delete a career path.

### Journal Entries
- `GET /api/journal-entries?career_path_id=:id`: Fetch all journal entries for a specific career path.
- `GET /api/journal-entries/:id`: Fetch a specific journal entry by ID.
- `POST /api/journal-entries`: Create a new journal entry.
- `PUT /api/journal-entries/:id`: Update a journal entry's date.
- `DELETE /api/journal-entries/:id`: Delete a journal entry.

### Entry Blocks
- `GET /api/entry-blocks?entry_id=:id`: Fetch all blocks for a specific journal entry, ordered by position.
- `POST /api/entry-blocks`: Create a new content block.
- `PUT /api/entry-blocks`: Update content of a block (requires `entry_id` and `position`).
- `DELETE /api/entry-blocks`: Delete a block (requires `entry_id` and `position`). Automatically shifts subsequent blocks.

**Supported Block Types**: `heading`, `notes`, `points`, `attachment`, `reference`.

## Project Structure

```text
givethnotes-backend/
├── config/             # Database configuration
├── middleware/         # Custom Express middlewares
├── routes/             # API route definitions
├── app.js              # Express application configuration
├── server.js           # Entry point for the server
├── package.json        # Dependencies and scripts
└── .env                # Environment variables (not committed)
```

## Additional Notes 🔧

### Note on Authentication
Currently, the API uses a hardcoded `user_id = 1` for all endpoints; full authentication and authorization are planned for future updates.

### Database schema (expected tables)
This project expects the following tables: `career_paths`, `journal_entries`, `entry_blocks`, and `logs`. The `logger` middleware writes request logs into the `logs` table and entry lifecycle operations update `journal_entries.updated_at`.

### Logging & activity sync
All requests are logged to console and to the `logs` DB table. When entry blocks are created, updated or deleted, the project synchronizes the parent journal entry's `updated_at` using `functions/LogActivity.js`.

### Known issues / notes
- There's a minor bug in `routes/entryBlocks` DELETE handler where an undefined variable (`created_at`) is referenced when logging activity; this should be updated to use a fresh GMT+3 timestamp or the appropriate updated timestamp.  
- Block `content` values are stored as JSON strings in the DB; clients should serialize/deserialize this field when sending/receiving content.

## License
[ISC](https://opensource.org/licenses/ISC)
