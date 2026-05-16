# KranHub Server

**KranHub Server** is the backend API for the KranHub crane marketplace.

It provides a REST API for authentication, users, crane listings, inquiries, contact messages, admin workflows, and audit logging. The backend is structured with a clean layered architecture: routes, controllers, services, DTOs, validations, middleware, and Mongoose models are separated clearly.

---

## Table of Contents

- [Overview](#overview)
- [Core Features](#core-features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Request Flow](#request-flow)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Authentication and Authorization](#authentication-and-authorization)
- [API Endpoints](#api-endpoints)
- [Data Models](#data-models)
- [DTO Layer](#dto-layer)
- [Validation Layer](#validation-layer)
- [Error Handling](#error-handling)
- [Audit Logging](#audit-logging)
- [Seed Data](#seed-data)
- [Development Notes](#development-notes)
- [Known Limitations](#known-limitations)
- [Related Repositories](#related-repositories)
- [License](#license)

---

## Overview

KranHub is a managed marketplace for construction cranes.

The backend supports:

- user registration and login;
- JWT-based authentication;
- role-based authorization;
- public crane catalog access;
- protected crane management;
- admin inquiry management;
- admin message dashboard;
- contact, expert advice, and newsletter message handling;
- development seed data;
- centralized error handling;
- request validation;
- DTO-based response shaping;
- service-based business logic;
- audit logging for important actions.

The server is designed to work together with the KranHub frontend client.

---

## Core Features

### Authentication

- User signup.
- User login.
- JWT token verification.
- Password hashing with bcrypt.
- Protected routes with JWT middleware.

### Authorization

- Role-based access control.
- Admin-only routes.
- User-specific crane ownership checks.
- Centralized role middleware.

Supported roles:

```txt
user
admin
```

### Crane Management

- Public crane catalog.
- Crane details by ID.
- User-owned crane listings.
- Create crane.
- Update crane.
- Delete crane.
- Admin/user permission checks.
- Owner population and DTO output.

### Inquiry Management

- Public inquiry creation.
- Admin inquiry list.
- Admin inquiry details.
- Admin inquiry status update.
- Admin inquiry deletion.
- Inquiry status workflow.

Inquiry statuses:

```txt
new
in_progress
resolved
```

### Message Management

Supports messages from:

- contact form;
- expert advice form;
- newsletter form.

Admins can:

- view all messages;
- filter messages on the frontend;
- delete messages.

### Audit Logging

The backend contains an audit log model and service for recording important backend actions.

Typical audit use cases:

- user actions;
- admin actions;
- data changes;
- security-relevant events.

---

## Tech Stack

### Runtime and Server

- Node.js
- Express.js

### Database

- MongoDB
- Mongoose

### Authentication and Security

- JSON Web Tokens
- bcryptjs
- dotenv
- role-based middleware
- validation middleware

### Development

- nodemon
- seed script
- centralized utility classes
- modular route/controller/service architecture

---

## Architecture

The backend follows a layered architecture.

```txt
HTTP request
  -> route
  -> middleware
  -> validation
  -> controller
  -> service
  -> model/database
  -> DTO
  -> response
```

### Layer Responsibilities

| Layer | Responsibility |
|---|---|
| `routes/` | Defines HTTP endpoints and attaches middleware/controllers |
| `controllers/` | Handles `req` / `res`, calls services, returns responses |
| `services/` | Contains business logic and database operations |
| `models/` | Defines Mongoose schemas |
| `dtos/` | Shapes database documents into safe API responses |
| `validations/` | Validates request params and body |
| `middleware/` | Auth, roles, validation, errors, 404 handling |
| `constants/` | Shared constants such as roles and audit actions |
| `utils/` | Shared helpers such as `AppError` and permission checks |
| `scripts/` | Development scripts such as seed data |

---

## Project Structure

```txt
kranhub-server/
  config/
    index.js

  constants/
    auditActions.js
    roles.js

  controllers/
    auditLog.controller.js
    auth.controller.js
    crane.controller.js
    inquiry.controller.js
    message.controller.js
    user.controller.js

  db/
    index.js

  dtos/
    auditLog.dto.js
    crane.dto.js
    inquiry.dto.js
    message.dto.js
    user.dto.js

  middleware/
    errorHandler.middleware.js
    jwt.middleware.js
    notFound.middleware.js
    requireRole.middleware.js
    role.middleware.js
    validateRequest.middleware.js

  models/
    AuditLog.model.js
    Crane.model.js
    Inquiry.model.js
    Message.model.js
    User.model.js

  routes/
    admin.routes.js
    auth.routes.js
    crane.routes.js
    index.js
    inquiry.routes.js
    message.routes.js
    users.routes.js

  scripts/
    seed.js

  services/
    audit.service.js
    auth.service.js
    crane.service.js
    inquiry.service.js
    message.service.js
    user.service.js

  utils/
    AppError.js
    permissions.js

  validations/
    auth.validation.js
    crane.validation.js
    inquiry.validation.js
    message.validation.js
    user.validation.js

  .env
  .gitignore
  app.js
  package.json
  package-lock.json
  README.md
  server.js
```

---

## Request Flow

Example: updating an inquiry from the admin Kanban board.

```txt
PUT /inquiries/:inquiryId
  -> inquiry.routes.js
  -> isAuthenticated
  -> requireRole(ADMIN)
  -> validateRequest(inquiryIdParamSchema)
  -> validateRequest(updateInquirySchema)
  -> updateAdminInquiry controller
  -> updateInquiry service
  -> Inquiry.findByIdAndUpdate()
  -> inquiry DTO / populated document
  -> JSON response
```

Example: updating a crane image.

```txt
PUT /cranes/:craneId
  -> crane.routes.js
  -> isAuthenticated
  -> validate request
  -> update crane controller
  -> crane service
  -> ownership/admin permission check
  -> Crane.findByIdAndUpdate() or document.save()
  -> crane DTO
  -> JSON response
```

---

## Environment Variables

Create a `.env` file in the project root.

```env
PORT=5005
MONGODB_URI=mongodb://127.0.0.1:27017/kranhub-dev
TOKEN_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
ALLOW_REMOTE_SEED=false
```

Depending on your local configuration, the JWT secret may be named differently. Use the name that your `jwt.middleware.js` and auth service expect.

### Variable Reference

| Variable | Description |
|---|---|
| `PORT` | Server port |
| `MONGODB_URI` | MongoDB connection string |
| `TOKEN_SECRET` | Secret used to sign and verify JWT tokens |
| `FRONTEND_URL` | Allowed frontend origin for CORS |
| `ALLOW_REMOTE_SEED` | Allows seed script to run against non-local databases when set to `true` |

Example local database:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/kranhub-dev
```

Example MongoDB Atlas database:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kranhub
ALLOW_REMOTE_SEED=true
```

Do not use `ALLOW_REMOTE_SEED=true` for a real production database unless you know exactly what you are deleting.

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/danielaprimacov/kranhub-server.git
cd kranhub-server
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Create `.env`:

```env
PORT=5005
MONGODB_URI=mongodb://127.0.0.1:27017/kranhub-dev
TOKEN_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
```

### 4. Run Development Server

```bash
npm run dev
```

The server should run on:

```txt
http://localhost:5005
```

### 5. Run Production Server

```bash
npm start
```

---

## Available Scripts

```bash
npm run dev
```

Starts the development server with live reload.

```bash
npm start
```

Starts the server in production mode.

```bash
npm run seed
```

Clears development seed data and creates demo users, cranes, inquiries, and messages.

---

## Authentication and Authorization

Protected routes require a JWT token.

The frontend sends the token as:

```http
Authorization: Bearer <token>
```

### Auth Middleware

```txt
middleware/jwt.middleware.js
```

Responsible for:

- reading the token;
- verifying the token;
- attaching the decoded user payload to the request.

### Role Middleware

```txt
middleware/requireRole.middleware.js
```

Responsible for restricting routes to specific roles.

Example:

```js
requireRole(ROLES.ADMIN)
```

### Permissions Utility

```txt
utils/permissions.js
```

Used for ownership and role-based permission checks, for example:

- user can edit only their own crane;
- admin can access all inquiries;
- admin can access all messages.

---

## API Endpoints

### Auth

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/auth/signup` | Public | Register user |
| `POST` | `/auth/login` | Public | Login user |
| `GET` | `/auth/verify` | Authenticated | Verify JWT and return current user |

---

### Users

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/users/profile` | Authenticated | Get current user profile |
| `PATCH` | `/users/profile` | Authenticated | Update current user profile |

---

### Cranes

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/cranes` | Public | Get all cranes |
| `GET` | `/cranes/my` | Authenticated | Get current user's cranes |
| `GET` | `/cranes/:craneId` | Public | Get crane by ID |
| `POST` | `/cranes` | Authenticated | Create crane |
| `PUT` | `/cranes/:craneId` | Owner/Admin | Update crane |
| `DELETE` | `/cranes/:craneId` | Owner/Admin | Delete crane |

---

### Inquiries

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/inquiries` | Public | Create inquiry |
| `GET` | `/inquiries` | Admin | Get all inquiries |
| `GET` | `/inquiries/:inquiryId` | Admin | Get inquiry by ID |
| `PUT` | `/inquiries/:inquiryId` | Admin | Update inquiry |
| `DELETE` | `/inquiries/:inquiryId` | Admin | Delete inquiry |

---

### Messages

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/messages` | Public | Create contact/expert/newsletter message |
| `GET` | `/messages` | Admin | Get all messages |
| `DELETE` | `/messages/:messageId` | Admin | Delete message |

---

### Admin / Audit

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/admin/audit-logs` | Admin | Get audit logs, if enabled |
| `GET` | `/admin/audit-logs/:auditLogId` | Admin | Get audit log by ID, if enabled |

Adjust this table if your exact admin route names differ.

---

## Data Models

The exact schemas are defined in the `models/` directory.

### User

```js
{
  name: String,
  email: {
    type: String,
    unique: true,
    required: true
  },
  password: String,
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  }
}
```

Passwords are stored hashed.

---

### Crane

```js
{
  title: String,
  producer: String,
  seriesCode: String,
  capacityClassNumber: Number,
  capacity: Number,
  radius: Number,
  height: Number,
  variantRevision: String,

  images: [String],

  description: String,
  location: String,

  status: {
    type: String,
    enum: ["for sale", "for rent"]
  },

  salePrice: Number,

  rentPrice: {
    amount: Number,
    interval: String
  },

  availability: {
    from: Date,
    to: Date
  },

  owner: {
    type: ObjectId,
    ref: "User"
  }
}
```

---

### Inquiry

```js
{
  customerName: String,
  email: String,
  message: String,

  crane: {
    type: ObjectId,
    ref: "Crane"
  },

  period: {
    from: Date,
    to: Date
  },

  address: String,
  needsTransport: Boolean,
  needsInstallation: Boolean,

  status: {
    type: String,
    enum: ["new", "in_progress", "resolved"],
    default: "new"
  },

  isRead: Boolean
}
```

---

### Message

```js
{
  formType: {
    type: String,
    enum: ["contact", "expert", "newsletter"]
  },

  email: String,
  phone: String,

  // contact form
  salutation: String,
  firstName: String,
  lastName: String,
  country: String,
  message: String,

  // expert form
  name: String,
  company: String,
  projectDetails: String,

  // newsletter form
  topics: [String],
  agreeComm: Boolean,
  agreeNewsletter: Boolean,
  recaptchaVerified: Boolean,
  consentTimestamp: Date
}
```

---

### AuditLog

```js
{
  action: String,
  actor: {
    type: ObjectId,
    ref: "User"
  },
  targetType: String,
  targetId: ObjectId,
  metadata: Object,
  createdAt: Date
}
```

Adjust this example to match the exact fields in `AuditLog.model.js`.

---

## DTO Layer

DTO files are located in:

```txt
dtos/
```

They are responsible for shaping Mongoose documents into safe API responses.

Examples:

```txt
user.dto.js
crane.dto.js
inquiry.dto.js
message.dto.js
auditLog.dto.js
```

DTOs help avoid leaking internal database fields such as:

```txt
password
__v
raw internal fields
```

Example response shape:

```js
{
  id: "6a0859cbb15dca232afa72d8",
  title: "Seed Potain MDT 219",
  owner: {
    id: "6a0859cbb15dca232afa72d4",
    name: "Seed User"
  }
}
```

---

## Validation Layer

Validation schemas are located in:

```txt
validations/
```

They validate request data before controllers are executed.

Examples:

```txt
auth.validation.js
crane.validation.js
inquiry.validation.js
message.validation.js
user.validation.js
```

Validation is applied through:

```txt
middleware/validateRequest.middleware.js
```

Typical validation targets:

- `req.body`;
- `req.params`;
- request-specific enums;
- required fields;
- MongoDB ObjectId params;
- email format;
- password length;
- inquiry status;
- crane status.

---

## Error Handling

The backend uses a centralized error handling approach.

### AppError

```txt
utils/AppError.js
```

Used for operational errors:

```js
throw new AppError(404, "Crane not found", "CRANE_NOT_FOUND");
```

### Error Handler Middleware

```txt
middleware/errorHandler.middleware.js
```

Responsible for sending consistent JSON error responses.

Example:

```json
{
  "message": "Crane not found",
  "code": "CRANE_NOT_FOUND"
}
```

### Not Found Middleware

```txt
middleware/notFound.middleware.js
```

Handles unknown routes.

Example response:

```json
{
  "message": "Route not found",
  "code": "ROUTE_NOT_FOUND",
  "details": {
    "method": "PUT",
    "path": "/unknown-route"
  }
}
```

---

## Audit Logging

Audit-related files:

```txt
models/AuditLog.model.js
services/audit.service.js
controllers/auditLog.controller.js
constants/auditActions.js
```

Audit logs can be used to record important system actions, such as:

- crane creation;
- crane update;
- crane deletion;
- inquiry status update;
- message deletion;
- admin actions;
- authentication-related events.

Example audit action constants may include:

```txt
CRANE_CREATED
CRANE_UPDATED
CRANE_DELETED
INQUIRY_UPDATED
MESSAGE_DELETED
USER_LOGIN
```

Adjust this list to match `constants/auditActions.js`.

---

## Seed Data

The project includes a development seed script:

```txt
scripts/seed.js
```

Run:

```bash
npm run seed
```

The seed script creates:

- admin user;
- normal user;
- sample cranes;
- sample inquiries;
- sample messages.

Demo credentials:

```txt
Admin:
email: admin@kranhub.test
password: Test123456!

User:
email: user@kranhub.test
password: Test123456!
```

### Remote Database Protection

The seed script refuses to run against a non-local database unless explicitly allowed.

To seed a remote development database:

```env
ALLOW_REMOTE_SEED=true
```

Then run:

```bash
npm run seed
```

Do not enable this for production unless you fully understand what the seed script deletes.

---

## Development Notes

### Crane Ownership

Cranes should always be created with an authenticated owner.

The backend should assign the owner from the authenticated user payload:

```js
owner: req.payload._id
```

The frontend should not be trusted to send the owner manually.

### Ownerless Cranes

Ownerless or orphan cranes should not exist in normal application data.

During development, old seed data can produce orphan records if users are deleted before their cranes. The seed script should remove:

```txt
owner: null
owner missing
owner pointing to a deleted user
```

### Inquiry Routes

Admin inquiry routes must attach final controller handlers.

For example:

```js
router.put(
  "/:inquiryId",
  isAuthenticated,
  requireRole(ROLES.ADMIN),
  validateRequest(inquiryIdParamSchema),
  validateRequest(updateInquirySchema),
  updateAdminInquiry
);
```

If the controller is missing, Express will pass through the route and return `ROUTE_NOT_FOUND`.

### Crane Updates

Crane update logic should update an existing document.

It should not use:

```js
Crane.create(...)
```

or:

```js
upsert: true
```

for normal edit operations.

Correct update logic should use:

```js
findByIdAndUpdate(...)
```

or load the crane, check permissions, update allowed fields, and call:

```js
crane.save()
```

### Allowed Update Fields

Update services should whitelist editable fields.

Do not allow client updates to:

```txt
_id
id
owner
createdAt
updatedAt
__v
```

---

## Known Limitations

Before real production use, the backend still needs production hardening.

Recommended next steps:

- full backend route testing;
- integration tests;
- stricter rate limiting;
- production CORS configuration;
- stronger request validation;
- complete audit logging strategy;
- final GDPR/legal data retention policy;
- email sending integration;
- newsletter double opt-in;
- Cloudinary signed upload flow if needed;
- monitoring and logging;
- production-safe seed restrictions.

---

## Related Repositories

Frontend repository:

```txt
https://github.com/danielaprimacov/kranhub-client
```

Backend repository:

```txt
https://github.com/danielaprimacov/kranhub-server
```

---

## Contributing

1. Fork the repository.
2. Create a feature branch.

```bash
git checkout -b feat/your-feature
```

3. Commit your changes.

```bash
git commit -m "feat: add your feature"
```

4. Push the branch.

```bash
git push origin feat/your-feature
```

5. Open a pull request and describe your changes.

---

## License

This project is currently intended as a portfolio and learning project.

Add a license before public or commercial distribution.
