import swaggerUi from "swagger-ui-express";
import type { Express } from "express";
import type { OpenAPIV3 } from "openapi-types";

const swaggerDocument: OpenAPIV3.Document = {
  openapi: "3.0.3",

  info: {
    title: "EstateFlow API",
    version: "1.0.0",
    description: `
EstateFlow is a real estate CRM backend for managing employees, leads,
customer interactions, projects, buildings, property units, bookings,
and follow-ups.

### Roles

- **ADMIN** — Manages sales employees, all leads, assignments, projects,
  buildings, property units, bookings, and company-wide dashboard data.
- **SALES_EMPLOYEE** — Manages assigned leads, notes, follow-ups, and
  permitted bookings; can view property inventory and personal dashboard data.

### Authentication

1. Log in using POST /api/auth/login.
2. Copy the returned JWT token.
3. Click Authorize and enter the token.
4. Test protected endpoints.

Customers are stored as leads and do not need user accounts.

### General conventions

- JSON request and response bodies.
- Pagination uses page and limit query parameters where supported.
- Search and filters depend on the endpoint.
- Protected endpoints require a Bearer JWT.
`,
    contact: {
      name: "EstateFlow API",
    },
  },

  servers: [
    {
      url: "/api",
      description: "Current backend server",
    },
  ],

  tags: [
    { name: "Health", description: "API health checks" },
    { name: "Authentication", description: "Login and current user" },
    { name: "Users", description: "Sales employee management (Admin)" },
    { name: "Leads", description: "Customer lead management" },
    { name: "Notes", description: "Lead notes and activity history" },
    { name: "Follow-ups", description: "Schedule and manage follow-ups" },
    { name: "Projects", description: "Real estate project management" },
    { name: "Buildings", description: "Building management" },
    { name: "Units", description: "Property inventory and filters" },
    {
      name: "Bookings",
      description: "Property unit bookings and cancellations",
    },
    { name: "Dashboard", description: "Role-specific dashboard statistics" },
  ],

  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter the JWT token returned by the login endpoint.",
      },
    },

    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Resource not found." },
        },
      },

      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: {
            type: "string",
            format: "email",
            example: "admin@example.com",
          },
          password: {
            type: "string",
            format: "password",
            example: "YourPassword123!",
          },
        },
      },

      CreateEmployeeRequest: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", example: "Alex Kumar" },
          email: {
            type: "string",
            format: "email",
            example: "alex@example.com",
          },
          password: {
            type: "string",
            minLength: 8,
            example: "SecurePassword123!",
          },
        },
      },

      CreateLeadRequest: {
        type: "object",
        required: ["name", "phone"],
        properties: {
          name: { type: "string", example: "Rahul Sharma" },
          phone: { type: "string", example: "+919876543210" },
          email: {
            type: "string",
            format: "email",
            example: "rahul@example.com",
          },
          source: { type: "string", example: "Website" },
          assignedToId: { type: "string", example: "employee_id" },
        },
      },

      CreateNoteRequest: {
        type: "object",
        required: ["content"],
        properties: {
          content: {
            type: "string",
            maxLength: 2000,
            example: "Customer is interested in a 2 BHK apartment.",
          },
        },
      },

      CreateFollowUpRequest: {
        type: "object",
        required: ["leadId", "scheduledAt"],
        properties: {
          leadId: { type: "string", example: "lead_id" },
          assignedToId: { type: "string", example: "employee_id" },
          scheduledAt: {
            type: "string",
            format: "date-time",
            example: "2026-10-25T10:00:00.000Z",
          },
          notes: {
            type: "string",
            example: "Call customer to discuss pricing.",
          },
        },
      },

      CreateBookingRequest: {
        type: "object",
        required: ["leadId", "unitId"],
        properties: {
          leadId: { type: "string", example: "lead_id" },
          unitId: { type: "string", example: "unit_id" },
        },
      },
    },

    parameters: {
      IdParam: {
        in: "path",
        name: "id",
        required: true,
        schema: { type: "string" },
        description: "Resource ID",
      },

      PageParam: {
        in: "query",
        name: "page",
        schema: { type: "integer", minimum: 1, default: 1 },
      },

      LimitParam: {
        in: "query",
        name: "limit",
        schema: { type: "integer", minimum: 1, maximum: 100, default: 10 },
      },

      SearchParam: {
        in: "query",
        name: "search",
        schema: { type: "string", maxLength: 100 },
        description: "Search supported fields",
      },
    },
  },

  security: [{ bearerAuth: [] }],

  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Check API health",
        security: [],
        responses: {
          "200": { description: "API is healthy" },
        },
      },
    },

    "/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Log in",
        description: "Returns a JWT and user details.",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
            },
          },
        },
        responses: {
          "200": { description: "Login successful" },
          "400": { description: "Invalid request" },
          "401": { description: "Invalid credentials" },
        },
      },
    },

    "/auth/me": {
      get: {
        tags: ["Authentication"],
        summary: "Get current authenticated user",
        responses: {
          "200": { description: "Current user returned" },
          "401": { description: "Unauthorized" },
        },
      },
    },

    "/users": {
      get: {
        tags: ["Users"],
        summary: "List sales employees",
        parameters: [
          { $ref: "#/components/parameters/PageParam" },
          { $ref: "#/components/parameters/LimitParam" },
        ],
        responses: {
          "200": { description: "Employees returned" },
          "403": { description: "Admin access required" },
        },
      },
      post: {
        tags: ["Users"],
        summary: "Create a sales employee",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateEmployeeRequest" },
            },
          },
        },
        responses: {
          "201": { description: "Employee created" },
          "409": { description: "Email already exists" },
        },
      },
    },

    "/users/{id}": {
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      get: {
        tags: ["Users"],
        summary: "Get employee by ID",
        responses: {
          "200": { description: "Employee returned" },
          "404": { description: "Employee not found" },
        },
      },
      patch: {
        tags: ["Users"],
        summary: "Update employee details",
        responses: {
          "200": { description: "Employee updated" },
          "404": { description: "Employee not found" },
        },
      },
    },

    "/users/{id}/status": {
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      patch: {
        tags: ["Users"],
        summary: "Activate or deactivate an employee",
        responses: {
          "200": { description: "Employee status updated" },
        },
      },
    },

    "/leads": {
      get: {
        tags: ["Leads"],
        summary: "List and filter accessible leads",
        parameters: [
          { $ref: "#/components/parameters/SearchParam" },
          { $ref: "#/components/parameters/PageParam" },
          { $ref: "#/components/parameters/LimitParam" },
          {
            in: "query",
            name: "stage",
            schema: {
              type: "string",
              enum: [
                "NEW",
                "CONTACTED",
                "SITE_VISIT",
                "INTERESTED",
                "NEGOTIATION",
                "BOOKED",
                "LOST",
              ],
            },
          },
          {
            in: "query",
            name: "assignedToId",
            schema: { type: "string" },
            description: "Admin filter for assigned employee",
          },
        ],
        responses: {
          "200": { description: "Leads returned" },
        },
      },
      post: {
        tags: ["Leads"],
        summary: "Create a lead (Admin)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateLeadRequest" },
            },
          },
        },
        responses: {
          "201": { description: "Lead created" },
          "403": { description: "Admin access required" },
        },
      },
    },

    "/leads/{id}": {
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      get: {
        tags: ["Leads"],
        summary: "Get lead details",
        responses: {
          "200": { description: "Lead returned" },
          "404": { description: "Lead not found" },
        },
      },
      patch: {
        tags: ["Leads"],
        summary: "Update lead details or stage",
        responses: {
          "200": { description: "Lead updated" },
        },
      },
    },

    "/leads/{id}/assignment": {
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      patch: {
        tags: ["Leads"],
        summary: "Assign or unassign a lead (Admin)",
        responses: {
          "200": { description: "Assignment updated" },
        },
      },
    },

    "/leads/{id}/notes": {
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      get: {
        tags: ["Notes"],
        summary: "List notes for a lead",
        responses: {
          "200": { description: "Notes returned" },
        },
      },
      post: {
        tags: ["Notes"],
        summary: "Add a note to a lead",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateNoteRequest" },
            },
          },
        },
        responses: {
          "201": { description: "Note created" },
          "403": { description: "Lead access denied" },
        },
      },
    },

    "/follow-ups": {
      get: {
        tags: ["Follow-ups"],
        summary: "List and filter follow-ups",
        parameters: [
          { $ref: "#/components/parameters/PageParam" },
          { $ref: "#/components/parameters/LimitParam" },
          {
            in: "query",
            name: "status",
            schema: {
              type: "string",
              enum: ["PENDING", "COMPLETED", "CANCELLED"],
            },
          },
          { in: "query", name: "leadId", schema: { type: "string" } },
          {
            in: "query",
            name: "from",
            schema: { type: "string", format: "date-time" },
          },
          {
            in: "query",
            name: "to",
            schema: { type: "string", format: "date-time" },
          },
        ],
        responses: {
          "200": { description: "Follow-ups returned" },
        },
      },
      post: {
        tags: ["Follow-ups"],
        summary: "Schedule a follow-up",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateFollowUpRequest" },
            },
          },
        },
        responses: {
          "201": { description: "Follow-up created" },
          "400": { description: "Invalid follow-up data" },
        },
      },
    },

    "/follow-ups/{id}": {
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      patch: {
        tags: ["Follow-ups"],
        summary: "Reschedule, edit, or update follow-up status",
        responses: {
          "200": { description: "Follow-up updated" },
          "404": { description: "Follow-up not found" },
        },
      },
    },

    "/projects": {
      get: {
        tags: ["Projects"],
        summary: "List and filter projects",
        parameters: [
          { $ref: "#/components/parameters/SearchParam" },
          { $ref: "#/components/parameters/PageParam" },
          { $ref: "#/components/parameters/LimitParam" },
          { in: "query", name: "city", schema: { type: "string" } },
          {
            in: "query",
            name: "status",
            schema: { type: "string", enum: ["ACTIVE", "INACTIVE"] },
          },
        ],
        responses: {
          "200": { description: "Projects returned" },
        },
      },
      post: {
        tags: ["Projects"],
        summary: "Create project (Admin)",
        responses: {
          "201": { description: "Project created" },
        },
      },
    },

    "/projects/{id}": {
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      get: {
        tags: ["Projects"],
        summary: "Get project details",
        responses: {
          "200": { description: "Project returned" },
        },
      },
      patch: {
        tags: ["Projects"],
        summary: "Update project (Admin)",
        responses: {
          "200": { description: "Project updated" },
        },
      },
    },

    "/buildings": {
      get: {
        tags: ["Buildings"],
        summary: "List and filter buildings",
        parameters: [
          { $ref: "#/components/parameters/SearchParam" },
          { $ref: "#/components/parameters/PageParam" },
          { $ref: "#/components/parameters/LimitParam" },
          { in: "query", name: "projectId", schema: { type: "string" } },
        ],
        responses: {
          "200": { description: "Buildings returned" },
        },
      },
      post: {
        tags: ["Buildings"],
        summary: "Create building (Admin)",
        responses: {
          "201": { description: "Building created" },
        },
      },
    },

    "/buildings/{id}": {
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      get: {
        tags: ["Buildings"],
        summary: "Get building details",
        responses: {
          "200": { description: "Building returned" },
        },
      },
      patch: {
        tags: ["Buildings"],
        summary: "Update building (Admin)",
        responses: {
          "200": { description: "Building updated" },
        },
      },
    },

    "/units": {
      get: {
        tags: ["Units"],
        summary: "List and filter property units",
        parameters: [
          { $ref: "#/components/parameters/SearchParam" },
          { $ref: "#/components/parameters/PageParam" },
          { $ref: "#/components/parameters/LimitParam" },
          { in: "query", name: "buildingId", schema: { type: "string" } },
          { in: "query", name: "projectId", schema: { type: "string" } },
          {
            in: "query",
            name: "type",
            schema: {
              type: "string",
              enum: ["APARTMENT", "VILLA", "PLOT", "SHOP", "OFFICE"],
            },
          },
          {
            in: "query",
            name: "status",
            schema: {
              type: "string",
              enum: ["AVAILABLE", "BOOKED", "BLOCKED"],
            },
          },
          {
            in: "query",
            name: "minPrice",
            schema: { type: "number", minimum: 0 },
          },
          {
            in: "query",
            name: "maxPrice",
            schema: { type: "number", minimum: 0 },
          },
        ],
        responses: {
          "200": { description: "Units returned" },
        },
      },
      post: {
        tags: ["Units"],
        summary: "Create a property unit (Admin)",
        responses: {
          "201": { description: "Unit created" },
        },
      },
    },

    "/units/{id}": {
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      get: {
        tags: ["Units"],
        summary: "Get unit details",
        responses: {
          "200": { description: "Unit returned" },
        },
      },
      patch: {
        tags: ["Units"],
        summary: "Update property unit (Admin)",
        responses: {
          "200": { description: "Unit updated" },
        },
      },
    },

    "/bookings": {
      get: {
        tags: ["Bookings"],
        summary: "List and filter bookings",
        parameters: [
          { $ref: "#/components/parameters/SearchParam" },
          { $ref: "#/components/parameters/PageParam" },
          { $ref: "#/components/parameters/LimitParam" },
          {
            in: "query",
            name: "status",
            schema: { type: "string", enum: ["CONFIRMED", "CANCELLED"] },
          },
          { in: "query", name: "leadId", schema: { type: "string" } },
          { in: "query", name: "unitId", schema: { type: "string" } },
          {
            in: "query",
            name: "from",
            schema: { type: "string", format: "date-time" },
          },
          {
            in: "query",
            name: "to",
            schema: { type: "string", format: "date-time" },
          },
        ],
        responses: {
          "200": { description: "Bookings returned" },
        },
      },
      post: {
        tags: ["Bookings"],
        summary: "Book an available property unit",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateBookingRequest" },
            },
          },
        },
        responses: {
          "201": { description: "Booking created" },
          "400": { description: "Invalid booking request" },
          "409": { description: "Unit is no longer available" },
        },
      },
    },

    "/bookings/{id}": {
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      get: {
        tags: ["Bookings"],
        summary: "Get booking details",
        responses: {
          "200": { description: "Booking returned" },
        },
      },
    },

    "/bookings/{id}/cancel": {
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      patch: {
        tags: ["Bookings"],
        summary: "Cancel a booking",
        responses: {
          "200": { description: "Booking cancelled" },
          "404": { description: "Booking not found" },
        },
      },
    },

    "/dashboard": {
      get: {
        tags: ["Dashboard"],
        summary: "Get dashboard statistics for current role",
        responses: {
          "200": { description: "Dashboard statistics returned" },
          "401": { description: "Unauthorized" },
        },
      },
    },
  },
};

export function setupSwagger(app: Express) {
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {
      explorer: true,
      customSiteTitle: "EstateFlow API Documentation",
    }),
  );
}
