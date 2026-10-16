# Task 10: Implementing JWT Authentication

An Express demo application showing how an API can identify its users and control what
they are allowed to do, using JSON Web Tokens (JWT). Users are stored in memory, since the
focus is on the authentication flow rather than the database.

## Features
- Password hashing with **bcrypt** (passwords are never stored as plain text)
- Access token generation and verification with **jsonwebtoken**
- `protect` middleware: verifies the Bearer token and returns 401 if it is missing, altered or expired
- `authorize` middleware: role-based access control, returns 403 if the role is not allowed
- Short-lived access tokens with long-lived **refresh tokens**
- Refresh token **rotation** (the old refresh token stops working after use)
- Logout with refresh token **revocation**
- Algorithm pinned to HS256 when verifying tokens

## Endpoints
| Method | Path | Access | Purpose |
|--------|------|--------|---------|
| POST | `/register` | Public | Create a user (password hashed with bcrypt) |
| POST | `/login` | Public | Verify password, return access and refresh tokens |
| GET | `/profile` | Logged in | Protected route (`protect`) |
| GET | `/admin` | Admin only | `protect` + `authorize("admin")` |
| POST | `/refresh` | Public | Exchange a refresh token for new tokens (rotation) |
| POST | `/logout` | Logged in | Delete the stored refresh token |

## Setup
```
npm install
```

Create a `.env` file in this folder (it is not committed):
```
JWT_SECRET=<long random string>
JWT_REFRESH_SECRET=<a different long random string>
```

Random secrets can be generated with:
```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run the server:
```
node server.js
```
It runs on `http://localhost:4000`.

## Testing
Tested in Postman and the jwt.io debugger:
- Register and login return tokens, and the response never contains the password
- `/profile` without a token returns 401; with a valid token returns 200
- A normal user calling `/admin` gets 403; an admin gets 200
- The access token lifetime was set to 30 seconds for the demo, so an expired token returning 401 could be shown quickly
- Reusing an old refresh token returns 403, which confirms rotation works
- After `/logout`, `/refresh` returns 403 because the refresh token was deleted
- Changing a single character of a token makes jwt.io report "Invalid Signature"

## Key lessons
- Authentication ("who are you?") and authorization ("what can you do?") are separate questions with separate status codes (401 vs 403)
- A JWT payload is encoded, not encrypted, so it must never hold secrets
- Expiry plus refresh tokens limit the damage if a token is stolen
- The server must accept only the expected algorithm to defend against the `alg: none` trick