# Task 4: Task Manager API Skeleton

A complete Express.js MVC project skeleton for a fictional task manager application.
The folder structure, configuration, middleware, and all 8 API routes are fully functional 
routes return placeholder JSON instead of querying a real database, so a real database layer
(e.g. MongoDB/Mongoose or PostgreSQL/Sequelize) can be dropped in later without
restructuring the project.

## Structure
- `routes/` — Express routers for two resources: Tasks and Users
- `controllers/` — request handlers, one per resource
- `models/` — in-memory arrays documenting the data shape a real model would need to match
- `middleware/` — a logger that runs on every request, plus centralized `notFound`/`errorHandler`
- `config/config.js` — single source of truth for environment settings, with fallback defaults
- `server.js` — wires config, middleware, and routes together at the app's entry point
- `.env.example` — documents expected environment variables without exposing real values

## Routes (8 total)
**Tasks:** `GET /api/tasks`, `GET /api/tasks/:id`, `POST /api/tasks`, `DELETE /api/tasks/:id`
**Users:** `GET /api/users`, `GET /api/users/:id`, `POST /api/users`, `DELETE /api/users/:id`

Any undefined route (e.g. `/api/random`) returns a structured 404 JSON error via the
`notFound` middleware.

## Testing
All 8 routes were tested manually — GET routes in the browser, POST/DELETE routes in
Postman (since browsers can't send a JSON body or a DELETE request directly) — plus one
request to an undefined route to confirm the 404 handler. The logger middleware confirmed
every request appearing correctly in the server console.

## Status
Skeleton complete and fully wired.