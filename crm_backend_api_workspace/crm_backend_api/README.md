# CRM Backend API

This is the backend API server for the CRM project, built with Express.js, Sequelize, and PostgreSQL.

## Database Setup

1. **Ensure you have PostgreSQL running.**
2. **Create the application database and user via psql or a database tool, or use the defaults below.**

3. **Create a `.env` file in this directory with the following content:**
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=crmuser
   DB_PASSWORD=changeme
   DB_NAME=crm

   # JWT configuration for auth
   JWT_SECRET=supersecret_dev_jwt_token
   JWT_EXPIRY=2d
   ```

4. **Install dependencies:**
   ```
   npm install
   ```

5. **Initialize tables according to the models:**
   ```
   node src/models/sync.js
   ```

This will connect to PostgreSQL, create tables for User, Customer, Interaction, and Task, and set up their relationships.

## Environment Variables

- `DB_HOST`: Database server host (default: localhost)
- `DB_PORT`: Database server port (default: 5432)
- `DB_USER`: PostgreSQL username (default: crmuser)
- `DB_PASSWORD`: PostgreSQL password (default: changeme)
- `DB_NAME`: PostgreSQL database name (default: crm)

## Running the App

- Start the API server:
  ```
  npm start
  ```

- During development:
  ```
  npm run dev
  ```

## Project Structure

- `src/models/`  — Sequelize models (`user`, `customer`, `interaction`, `task`), and initialization scripts.
- `src/controllers/` — Route handlers.
- `src/services/` — Business logic.
- `src/routes/` — All API endpoints.
- `src/app.js` — Express app instance.
- `src/server.js` — Entrypoint to start the server.

## Further Notes

- Do **not** commit your `.env` file or private credentials to version control.
- This backend uses Sequelize [sync](https://sequelize.org/docs/v6/core-concepts/model-basics/#synchronizing-all-models-at-once) for automigrating tables in development. For advanced production usage, adopt proper migrations.

## API Documentation

Interactive API documentation is available at `/docs` when the server is running.

