# JWT Login System

A login system secured with JSON Web Tokens (JWT), built with Node.js, Express 5, MongoDB (Mongoose), bcryptjs and jsonwebtoken.

## Features
- Register and login endpoints
- Passwords hashed with bcrypt (salted, 10 rounds) and never returned in responses
- A signed JWT generated on successful login (payload: user id and role, expires in 1 hour)
- Authentication middleware (`protect`) that verifies the Bearer token, pins the HS256 algorithm and checks the user still exists
- Role-based authorization middleware (`authorize`) for admin-only routes
- Roles cannot be chosen at registration; admins are created with a terminal script
- Centralized error handling with correct status codes (400, 401, 403, 404, 409)

## Tech stack
Node.js, Express 5, MongoDB Atlas, Mongoose, bcryptjs, jsonwebtoken, dotenv, nodemon, Postman (for testing)

## Setup

1. Install dependencies:
```bash
   npm install
```
2. Create a `.env` file from the example and fill in the values:
```bash
   cp .env.example .env
```
   (On Windows PowerShell: `Copy-Item .env.example .env`)

   | Variable | Description |
   |---|---|
   | `PORT` | Server port (default 5002) |
   | `APP_NAME` | Application name |
   | `NODE_ENV` | `development` or `production` |
   | `MONGO_URI` | MongoDB Atlas connection string, ending with the database name `jwtloginsdb` |
   | `JWT_SECRET` | Long random secret used to sign tokens |
   | `JWT_EXPIRES_IN` | Token lifetime, for example `1h` |

   Generate a secret with:
```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
3. Start the server:
```bash
   npm run dev     # development (nodemon)
   npm start       # production
```
   You should see `MongoDB connected: jwtloginsdb` and `Server running on port 5002`.

## Endpoints

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/` | Public | Health check |
| GET | `/api/public` | Public | Unprotected example route |
| POST | `/api/auth/register` | Public | Create a user (role is always `user`) |
| POST | `/api/auth/login` | Public | Verify the password and return a JWT |
| GET | `/api/auth/me` | Protected | Current logged-in user (any valid token) |
| GET | `/api/users` | Admin only | List all users (no passwords) |

Send the token with every protected request:

```
Authorization: Bearer <token>
```

### Example requests

Register:
```json
POST /api/auth/register
{ "name": "Eman", "email": "user@test.com", "password": "Pass123!" }
```

Login:
```json
POST /api/auth/login
{ "email": "user@test.com", "password": "Pass123!" }
```
Response (shortened):
```json
{ "message": "Login successful", "token": "eyJhbGciOi...", "expiresIn": "1h",
  "user": { "id": "...", "name": "Eman", "email": "user@test.com", "role": "user" } }
```

## Making an admin
Registration always creates a normal `user`, because letting clients choose their own role would be a security hole. To promote a registered user to admin, run:

```bash
npm run make-admin -- admin@test.com
```

The admin must **log in again** afterwards to receive a token that contains the new role.

## Status codes

| Code | Meaning | Example |
|---|---|---|
| 200 | Success | Login, /me, /users as admin |
| 201 | Created | User registered |
| 400 | Bad request | Invalid email, short password, invalid JSON |
| 401 | Not authenticated | Missing, invalid or expired token; wrong password |
| 403 | Not authorized | A normal user calls an admin-only route |
| 404 | Not found | Unknown route |
| 409 | Conflict | Email already registered |

## How authentication works
1. The user registers. The password is hashed with bcrypt before it is saved.
2. The user logs in. bcrypt compares the typed password with the stored hash.
3. If it matches, the server signs a JWT with `JWT_SECRET` and returns it.
4. The client sends the token in the `Authorization: Bearer` header.
5. The `protect` middleware verifies the signature and expiry, loads the user and attaches it to `req.user`.
6. The `authorize('admin')` middleware checks `req.user.role` and returns 403 if the user is not an admin.

## Testing
All endpoints were tested in Postman: public route, registration (201, 400, 409), login (200, 401), protected route without token (401), with an invalid token (401) and with a valid token (200), admin-only route as a normal user (403) and as an admin (200). Screenshots are in the PDF report.

## Project structure
```
config/        config.js, db.js
controllers/   authController.js
middleware/    authMiddleware.js, errorHandler.js
models/        User.js
routes/        authRoutes.js, userRoutes.js
scripts/       makeAdmin.js
utils/         AppError.js, asyncHandler.js
server.js
```

## Security notes
- `.env` is excluded from Git and from the submission; only `.env.example` is included.
- Passwords are stored only as bcrypt hashes, and the password field is hidden from queries by default.
- The JWT payload contains no sensitive data, and tokens expire after one hour.
- Login failures return one generic message, so attackers cannot tell which emails exist.