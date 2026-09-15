# Task 2: Basic Node.js HTTP Server (practice project)

A small Users API built with Node's core `http` module only, no Express to
understand what a framework normally handles automatically.

## Routes
- `GET /` — welcome message
- `GET /users` — list all users
- `GET /users/:id` — fetch a single user by id (manual route-param parsing via `req.url.split('/')`)
- `POST /users` — add a new user (manual body parsing via `req.on('data'/'end')`)
- Any other route returns a structured 404 JSON error