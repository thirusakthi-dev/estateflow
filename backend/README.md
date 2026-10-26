# EstateFlow Backend API

REST API for the EstateFlow real estate CRM, built with Node.js, Express, TypeScript, Prisma, and PostgreSQL.

## Base URL

```text
http://localhost:5000
```

## Authentication

Protected endpoints require a valid JWT access token.

```http
Authorization: Bearer <your_token>
```

### Roles

- **Public** — No authentication required.
- **Authenticated** — Valid JWT required.
- **Admin** — Valid JWT and Admin role required.

## API Endpoints

### 1. Root and Health

| Method | Endpoint      | Access | Description  |
| ------ | ------------- | ------ | ------------ |
| GET    | `/`           | Public | API status   |
| GET    | `/api/health` | Public | Health check |

### 2. Authentication

| Method | Endpoint          | Access        | Description      |
| ------ | ----------------- | ------------- | ---------------- |
| POST   | `/api/auth/login` | Public        | Log in           |
| GET    | `/api/auth/me`    | Authenticated | Get current user |

### 3. Users / Employees

| Method | Endpoint                | Access | Description            |
| ------ | ----------------------- | ------ | ---------------------- |
| POST   | `/api/users`            | Admin  | Create employee        |
| GET    | `/api/users`            | Admin  | List employees         |
| GET    | `/api/users/:id`        | Admin  | Get employee           |
| PATCH  | `/api/users/:id`        | Admin  | Update employee        |
| PATCH  | `/api/users/:id/status` | Admin  | Update employee status |

### 4. Projects

| Method | Endpoint            | Access        | Description    |
| ------ | ------------------- | ------------- | -------------- |
| GET    | `/api/projects`     | Authenticated | List projects  |
| GET    | `/api/projects/:id` | Authenticated | Get project    |
| POST   | `/api/projects`     | Admin         | Create project |
| PATCH  | `/api/projects/:id` | Admin         | Update project |

### 5. Buildings

| Method | Endpoint             | Access        | Description     |
| ------ | -------------------- | ------------- | --------------- |
| GET    | `/api/buildings`     | Authenticated | List buildings  |
| GET    | `/api/buildings/:id` | Authenticated | Get building    |
| POST   | `/api/buildings`     | Admin         | Create building |
| PATCH  | `/api/buildings/:id` | Admin         | Update building |

### 6. Units

| Method | Endpoint         | Access        | Description |
| ------ | ---------------- | ------------- | ----------- |
| GET    | `/api/units`     | Authenticated | List units  |
| GET    | `/api/units/:id` | Authenticated | Get unit    |
| POST   | `/api/units`     | Admin         | Create unit |
| PATCH  | `/api/units/:id` | Admin         | Update unit |

### 7. Leads

| Method | Endpoint                    | Access        | Description |
| ------ | --------------------------- | ------------- | ----------- |
| POST   | `/api/leads`                | Admin         | Create lead |
| GET    | `/api/leads`                | Authenticated | List leads  |
| GET    | `/api/leads/:id`            | Authenticated | Get lead    |
| PATCH  | `/api/leads/:id`            | Authenticated | Update lead |
| PATCH  | `/api/leads/:id/assignment` | Admin         | Assign lead |

**Important:** These endpoints are defined in `lead.routes.ts`, but the router must be mounted in `app.ts` for them to work.

### 8. Lead Notes

| Method | Endpoint               | Access        | Description          |
| ------ | ---------------------- | ------------- | -------------------- |
| POST   | `/api/leads/:id/notes` | Authenticated | Add a note to a lead |
| GET    | `/api/leads/:id/notes` | Authenticated | List lead notes      |

### 9. Bookings

| Method | Endpoint                   | Access        | Description    |
| ------ | -------------------------- | ------------- | -------------- |
| POST   | `/api/bookings`            | Authenticated | Create booking |
| GET    | `/api/bookings`            | Authenticated | List bookings  |
| GET    | `/api/bookings/:id`        | Authenticated | Get booking    |
| PATCH  | `/api/bookings/:id/cancel` | Authenticated | Cancel booking |

### 10. Follow-ups

| Method | Endpoint              | Access        | Description      |
| ------ | --------------------- | ------------- | ---------------- |
| POST   | `/api/follow-ups`     | Authenticated | Create follow-up |
| GET    | `/api/follow-ups`     | Authenticated | List follow-ups  |
| PATCH  | `/api/follow-ups/:id` | Authenticated | Update follow-up |

### 11. Dashboard

| Method | Endpoint         | Access        | Description        |
| ------ | ---------------- | ------------- | ------------------ |
| GET    | `/api/dashboard` | Authenticated | Get dashboard data |

### 12. Project Images

| Method | Endpoint                                  | Access        | Description             |
| ------ | ----------------------------------------- | ------------- | ----------------------- |
| GET    | `/api/projects/:id/images`                | Authenticated | List project images     |
| POST   | `/api/projects/:id/images`                | Admin         | Upload project images   |
| PATCH  | `/api/projects/:id/images/:imageId/cover` | Admin         | Set project cover image |
| DELETE | `/api/projects/:id/images/:imageId`       | Admin         | Delete project image    |

### 13. Unit Images

| Method | Endpoint                               | Access        | Description          |
| ------ | -------------------------------------- | ------------- | -------------------- |
| GET    | `/api/units/:id/images`                | Authenticated | List unit images     |
| POST   | `/api/units/:id/images`                | Admin         | Upload unit images   |
| PATCH  | `/api/units/:id/images/:imageId/cover` | Admin         | Set unit cover image |
| DELETE | `/api/units/:id/images/:imageId`       | Admin         | Delete unit image    |

## Example Requests

### Login

```http
POST /api/auth/login
Content-Type: application/json
```

The exact request body depends on the login controller's validation schema.

### Get Current User

```http
GET /api/auth/me
Authorization: Bearer <your_token>
```

### List Projects

```http
GET /api/projects
Authorization: Bearer <your_token>
```

### Create a Project

```http
POST /api/projects
Authorization: Bearer <admin_token>
Content-Type: application/json
```

The exact request body depends on the project controller's validation schema.

### Health Check

```http
GET /api/health
```

Example response:

```json
{
  "success": true,
  "message": "API is healthy",
  "timestamp": "2026-10-24T00:00:00.000Z"
}
```

## Error Handling

The API uses centralized error-handling middleware. Responses depend on the specific error and controller implementation.

Common HTTP status codes may include:

- `400 Bad Request` — Invalid request data.
- `401 Unauthorized` — Missing or invalid authentication.
- `403 Forbidden` — Insufficient permissions.
- `404 Not Found` — Resource or route not found.
- `500 Internal Server Error` — Unexpected server error.

## API Documentation

If Swagger is configured and enabled, use the documentation URL defined in `src/config/swagger.ts`.

## Notes

- Endpoints marked Admin are protected by role-based authorization.
- Image upload endpoints use the configured image-upload middleware.
- `:id` and `:imageId` represent resource identifiers.
- Request schemas, query parameters, pagination, and response formats should be verified against the relevant controllers and validation schemas.
- Ensure `leadRouter` is mounted at `/api/leads` in `src/app.ts` alongside `noteRouter` so both lead-management and lead-note endpoints work.
