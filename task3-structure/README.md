# Task 3: Project Structure and Environment Setup

Set up an MVC-style folder structure (`controllers/`, `models/`, `routes/`, `config/`),
added environment variables via `dotenv`, and centralized config access through a
single `config/config.js` file with fallback defaults.

## Key points
- `.env` holds `PORT` and `APP_NAME`
- `config.js` reads `process.env` once and exports a clean object
- Fallback defaults (`|| 3000`, `|| 'Unnamed App'`) prevent crashes if `.env` is missing