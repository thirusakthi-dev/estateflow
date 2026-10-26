# EstateFlow

A modern real estate management platform for managing projects, buildings, units, leads, bookings, and sales operations through a centralized dashboard.

## Overview

EstateFlow helps real estate teams organize property inventory, track potential customers, manage bookings, and monitor business activity in one place.

### Key Features

- **Dashboard** — Overview of real estate operations and key statistics.
- **Project Management** — Manage real estate projects and their details.
- **Building Management** — Organize buildings under individual projects.
- **Unit Management** — Track units, types, availability, and status.
- **Lead Management** — Manage potential customers and track their sales stages.
- **Booking Management** — Maintain booking records and booking statuses.
- **Authentication** — JWT-based authentication for protected API endpoints.
- **Database Seeding** — Populate the database with demonstration data.
- **Responsive UI** — Interface designed for desktop, tablet, and mobile screens.

## Technology Stack

### Frontend

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- TanStack Query
- Axios
- Lucide React
- Framer Motion
- Recharts

### Backend

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT authentication
- bcryptjs
- Helmet
- CORS
- Swagger / OpenAPI

### Database and Deployment

- **Database:** Neon PostgreSQL
- **Backend hosting:** Render
- **Frontend hosting:** Vercel
- **Version control:** Git and GitHub

## Project Structure

```text
EstateFlow/
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── package-lock.json
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   ├── package.json
│   └── package-lock.json
├── .gitignore
└── README.md
```

## Prerequisites

Install the following before running the project:

- Node.js and npm
- PostgreSQL database or a Neon PostgreSQL database
- Git

## Getting Started

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd EstateFlow
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/` and configure the environment variables required by the backend.

Example:

```env
NODE_ENV=development
DATABASE_URL="YOUR_POSTGRESQL_CONNECTION_STRING"
JWT_SECRET="YOUR_SECRET_KEY"
FRONTEND_URL="http://localhost:3000"
```

Add any additional variables required by your application, such as Cloudinary credentials.

### 3. Generate the Prisma client

```bash
npx prisma generate
```

### 4. Apply database migrations

```bash
npx prisma migrate dev
```

Run this command only when the required migration files are available. For an existing production database, use `npx prisma migrate deploy` instead.

### 5. Start the backend

```bash
npm run dev
```

The API runs on the port configured by your backend application.

### 6. Set up the frontend

Open a second terminal from the project root:

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:YOUR_BACKEND_PORT
```

Replace `YOUR_BACKEND_PORT` with the actual backend port. If the frontend appends `/api` to this URL, keep the base URL without `/api`.

Start the frontend:

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## Available Scripts

### Frontend

| Command            | Description                      |
| ------------------ | -------------------------------- |
| `npm run dev`      | Start the development server     |
| `npm run build`    | Build the production application |
| `npm run start`    | Start the production server      |
| `npm run lint`     | Run ESLint, if configured        |
| `npx tsc --noEmit` | Check TypeScript types           |

### Backend

| Command                     | Description                                   |
| --------------------------- | --------------------------------------------- |
| `npm run dev`               | Start the development server                  |
| `npm run build`             | Generate Prisma client and compile TypeScript |
| `npm start`                 | Start the compiled server                     |
| `npm run typecheck`         | Check TypeScript types                        |
| `npx prisma generate`       | Generate Prisma client                        |
| `npx prisma migrate deploy` | Apply pending production migrations           |

A seed command can be configured in the backend `package.json` to populate the database with demo data.

## API Documentation

The backend uses Swagger / OpenAPI for API documentation. Once the backend is running, open the Swagger endpoint configured in the backend application.

## Deployment

### Frontend — Vercel

1. Import the GitHub repository into Vercel.
2. Set the root directory to `frontend`.
3. Keep the default Next.js build settings.
4. Configure `NEXT_PUBLIC_API_URL` with the deployed backend URL.
5. Deploy the application.

### Backend — Render

1. Create a Web Service connected to the same GitHub repository.
2. Set the root directory to `backend`.
3. Configure the build command:

   ```bash
   npm install && npm run build
   ```

4. Configure the start command:

   ```bash
   npm start
   ```

5. Add the required production environment variables, including the Neon `DATABASE_URL` and a secure `JWT_SECRET`.
6. Apply database migrations using `npx prisma migrate deploy`.
7. Run the seed script separately if demonstration data is needed.

### Database — Neon

Create a PostgreSQL database in Neon and configure its connection string as `DATABASE_URL` in the Render environment settings. Keep database credentials private.

## Security

- Never commit `.env` files, API keys, database credentials, or JWT secrets.
- Use a strong, unique JWT secret in production.
- Configure CORS to allow only the required frontend origins.
- Change default demonstration credentials before exposing the application publicly.

## License

This project is currently provided for development and demonstration purposes. Add a license if you intend to distribute it publicly.
