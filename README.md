# GivethNotes Backend

GivethNotes Backend is a RESTful API built with Node.js and Express, designed to manage career paths for the GivethNotes platform. It uses MySQL for data storage and includes features such as logging, error handling, and CORS support.

## Features

- **Career Path Management**: CRUD operations for career paths.
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

## Note on Authentication
Currently, the API uses a hardcoded `user_id = 1` for all requests. Full authentication and authorization features are expected in future updates.

## License
[ISC](https://opensource.org/licenses/ISC)
