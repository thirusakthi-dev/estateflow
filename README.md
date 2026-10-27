# EstateFlow — Real Estate CRM

**EstateFlow** is a full-stack real estate CRM built to streamline lead management, sales follow-ups, bookings, projects, and buildings through a secure, role-based workspace.

**Live Demo:** https://estateflow-poc.vercel.app/

## About the Project

EstateFlow is designed with a focus on security, reusable code, maintainability, and organized application architecture. It combines a modern Next.js frontend with a modular Express.js REST API and PostgreSQL database.

The project uses a reusable backend scaffold with shared middleware, centralized error handling, validation patterns, and consistent API conventions. Its modular structure makes the codebase easier to maintain and extend without unnecessary duplication.

## Key Features

- **Dashboard:** View CRM activity and key business metrics.
- **Lead Management:** Manage leads, track pipeline stages, and assign leads to sales employees.
- **Follow-up Management:** Track scheduled follow-ups, outcomes, and pending actions.
- **Booking Management:** Manage real-estate booking records.
- **Project Management:** Organize real-estate projects and related information.
- **Building Management:** Maintain building records associated with projects.
- **Employee Management:** Allow administrators to manage sales employees.
- **Role-Based Access Control:** Separate permissions for administrators and sales employees.
- **Secure Authentication:** Protect CRM routes and API endpoints.
- **Image Management:** Use Cloudinary for hosted image storage and delivery.
- **API Documentation:** Document and explore REST API endpoints with Swagger.
- **SEO Optimization:** Apply appropriate metadata and page-level SEO practices using Next.js.
- **Responsive UI:** Deliver a consistent interface across desktop and mobile devices.
- **Dark and Light Themes:** Support different viewing preferences.

## Technology Stack

### Frontend
- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- TanStack Query
- Motion for React
- Lucide React

### Backend
- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT authentication
- REST APIs
- Swagger / OpenAPI

### Security
- **Helmet** for security-related HTTP headers
- **CORS** for cross-origin access configuration
- Authentication and role-based authorization middleware
- Request validation
- Centralized error handling
- Rate limiting where configured

### Media and Deployment
- **Cloudinary** — Cloud-hosted image storage and delivery
- **Vercel** — Frontend deployment
- **Render** — Backend API deployment
- **Neon** — Serverless PostgreSQL database

## Architecture and Engineering Practices

EstateFlow follows a modular architecture with clear separation between frontend presentation, API routing, business logic, and database access.

- **Reusable components:** Shared UI elements and backend utilities reduce duplicated code.
- **Organized structure:** Feature-based modules and clear responsibilities improve maintainability.
- **Reusable backend scaffold:** Common middleware, validation, error handling, and HTTP conventions establish consistent patterns.
- **Type safety:** TypeScript helps catch errors during development.
- **Database management:** Prisma provides a structured interface to PostgreSQL.
- **API documentation:** Swagger provides an interactive interface for exploring documented API endpoints.
- **SEO-friendly rendering:** Next.js supports page metadata and rendering strategies suited to search-engine discoverability.
- **Cloud image handling:** Cloudinary separates image hosting from application-server storage.

## User Roles

| Capability | Admin | Sales Employee |
|---|---|---|
| Access dashboard | Yes | Yes |
| Manage leads | Yes | Within assigned permissions |
| Assign or reassign leads | Yes | No |
| Manage follow-ups | Yes | Within assigned permissions |
| Manage bookings | Yes | Within assigned permissions |
| View projects and buildings | Yes | Yes |
| Manage employees | Yes | No |

Customers are represented as CRM lead records rather than public user accounts. EstateFlow is an internal CRM, not a public property marketplace or customer portal.

## Deployment

The application uses a cloud-based deployment architecture:

| Service | Purpose |
|---|---|
| Vercel | Next.js frontend hosting |
| Render | Express.js backend hosting |
| Neon | PostgreSQL database hosting |
| Cloudinary | Image storage and delivery |

The frontend communicates with the deployed backend through its configured API URL. The backend connects to Neon using the configured database connection string and uses Cloudinary for image operations.

## Local Development

### Prerequisites
- Node.js
- npm
- PostgreSQL or a configured Neon database

### 1. Clone the repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd EstateFlow
```

### 2. Install dependencies

Install dependencies in the frontend and backend directories according to the repository structure.

```bash
cd backend
npm install
```

Install the frontend dependencies in the directory containing the Next.js application.

### 3. Configure environment variables

Example backend configuration:

```env
PORT=5000
DATABASE_URL="your-postgresql-connection-string"
JWT_SECRET="your-secure-secret"
FRONTEND_URL="http://localhost:3000"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

Example frontend configuration:

```env
NEXT_PUBLIC_API_URL="http://localhost:5000"
```

Use the exact environment variable names expected by the codebase. Store credentials securely and never commit secrets to Git.

### 4. Generate the Prisma client and migrate

Run the Prisma commands supported by the project's configuration:

```bash
npx prisma generate
npx prisma migrate dev
```

### 5. Run the applications

Use the development scripts defined in the respective `package.json` files to start the frontend and backend.

## Security Considerations

- Protect private API endpoints with authentication.
- Enforce role permissions on the backend.
- Configure Helmet and CORS for the deployment environment.
- Validate incoming requests.
- Use rate limiting where appropriate.
- Store secrets in environment variables.
- Restrict access to database credentials and Cloudinary secrets.

## Future Improvements

Potential enhancements include automated testing, audit logging, structured application logs, CI/CD checks, and expanded API documentation.

## License

Private project. All rights reserved unless a separate license is provided.