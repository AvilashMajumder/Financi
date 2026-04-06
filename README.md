# Financi

Financi is a finance tracking backend API built with Node.js, Express, and MongoDB. It supports user authentication, role-based access control, transaction management, and dashboard analytics.

## Features Implemented

- User registration, login, logout, token refresh, profile, and password change
- Cookie and bearer-token based authentication
- Role guards for `admin` and `analyst`
- Transaction CRUD endpoints with soft delete behavior
- Dashboard endpoints for summary, category totals, recent activity, and insights

## Tech Stack

- Node.js (ESM)
- Express
- MongoDB + Mongoose
- jsonwebtoken
- bcryptjs
- cookie-parser

## Project Structure

- [app.js](app.js): Express middleware and route mounting
- [server.js](server.js): Environment setup, DB connect, server start
- [controllers/](controllers): Business logic
- [routes/](routes): API route mapping
- [models/](models): Mongoose schemas
- [middlewares/auth.js](middlewares/auth.js): JWT and role guards

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example` and fill in secrets.

3. Start server:

```bash
npm start
```

Live base URL: `https://financi.onrender.com`

Github: `https://github.com/AvilashMajumder/Financi`

API Docs: `https://documenter.getpostman.com/view/46980225/2sBXiqF9Ww`

## API Testing (Postman)

Use the published Postman documentation to test all endpoints quickly:

### [Open Postman Docs](https://documenter.getpostman.com/view/46980225/2sBXiqF9Ww)

## Environment Variables

- `PORT`
- `NODE_ENV`
- `MONGO_CONNECT_URL`
- `ACCESS_TOKEN_SECRET`
- `REFRESH_TOKEN_SECRET`
- `ACCESS_TOKEN_EXPIRY`
- `REFRESH_TOKEN_EXPIRY`

## Access Rules

- Public: register, login, refresh-token
- Authenticated: logout, me, change-password, dashboard insights
- Admin only: users list/read/update/delete, transaction create/update/delete
- Analyst or Admin: transaction read routes, dashboard routes

## API Endpoints

### User Routes

- `POST /api/users/register`
- `POST /api/users/login`
- `POST /api/users/logout`
- `GET /api/users/refresh-token`
- `GET /api/users/me`
- `PUT /api/users/change-password`
- `GET /api/users`
- `GET /api/users/:id`
- `PATCH /api/users/:id/role`
- `PATCH /api/users/:id/status`
- `DELETE /api/users/:id`

### Transaction Routes

- `POST /api/transactions`
- `GET /api/transactions`
- `GET /api/transactions/:id`
- `PATCH /api/transactions/:id`
- `DELETE /api/transactions/:id`

### Dashboard Routes

- `GET /api/dashboard/summary`
- `GET /api/dashboard/category-totals`
- `GET /api/dashboard/recent-activity`
- `GET /api/dashboard/insights`

## API Request/Response Reference

To keep this README concise, full API request examples and testing flow are maintained in [requests.http](requests.http).

- Use [requests.http](requests.http) for ready-to-run endpoint requests.
- The same file can be used to capture actual responses during assessment/demo.
- Postman Docs (public): [https://documenter.getpostman.com/view/46980225/2sBXiqF9Ww](https://documenter.getpostman.com/view/46980225/2sBXiqF9Ww)
- This README focuses on architecture, setup, access rules, and endpoint inventory.

## Important Implementation Notes

- Transaction type in DB is stored as `Income` or `Expense`.
- `GET /api/transactions` currently returns all transactions sorted by date, without pagination.
- `GET /api/dashboard/recent-activity` supports `?limit=<number>`.


## Data Models

### User

- `username`: String, required, unique, lowercase, trimmed
- `email`: String, required, unique, lowercase, validated format
- `password`: String, required, minimum 6 characters, hashed before save
- `role`: Enum String (`User`, `Analyst`, `Admin`)
- `isActive`: Boolean, default `true`
- `refreshToken`: String
- `createdAt`, `updatedAt`: auto-managed timestamps

### Transaction

- `amount`: Number, required, minimum `0.01`
- `type`: Enum String (`Income`, `Expense`)
- `category`: String, required, trimmed
- `date`: Date, default current date/time
- `notes`: String, default empty
- `createdBy`: ObjectId ref to `User`, required
- `isDeleted`: Boolean, default `false`
- `createdAt`, `updatedAt`: auto-managed timestamps

Soft-delete behavior is implemented with `isDeleted`, and find queries exclude deleted records via a pre-find middleware in the model.

## Design Decisions

- JWT-based authentication with both cookie and bearer token support for flexible clients.
- Refresh token stored in user record to support logout invalidation and token rotation checks.
- Role-based middleware guards are applied at route level, keeping controllers focused on business logic.
- Transaction deletion uses soft delete (`isDeleted`) to preserve auditability.
- Usernames and emails are normalized to lowercase to prevent duplicate-identity issues caused by casing.
- Transaction types are normalized in controllers to match schema enum values (`Income`, `Expense`).

## Error Responses Documented

Common status codes used across endpoints:

- `200`: Successful read/update/delete operations
- `201`: Successful resource creation
- `400`: Validation or bad input errors
- `401`: Authentication failure or invalid credentials/tokens
- `403`: Authenticated but not authorized (role or inactive account)
- `404`: Requested resource not found
- `409`: Conflict (for example duplicate username/email on registration)
- `500`: Internal server error

Common error payload format:

```json
{
	"message": "Human-readable error message"
}
```




