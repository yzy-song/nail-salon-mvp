## Description

=====================
Nail Salon
=====================

Frontend: Vercel

Backend (API + Database): Railway

Local Development Database: Your locally installed PostgreSQL

Production Database: PostgreSQL created on Railway

## Directory Structure

apps/web/
└── app/
├── page.tsx # Home page for customers (/)
├── services/
│ └── page.tsx # Service list page for customers (/services)
├── layout.tsx # Root layout of the app (may include navigation bar and footer for customers)
│
└── admin/ # All admin management pages are here
├── page.tsx # Admin home or login page (/admin)
├── appointments/
│ └── page.tsx # Appointment management page (/admin/appointments)
├── employees/
│ └── page.tsx # Employee management page (/admin/employees)
│
└── layout.tsx # 🔥 Dedicated layout for admin management (includes sidebar menu, admin navigation bar, etc.)

![Architecture Diagram](../docs/images/架构图.png)

## Backend API Design

Auth Module (/auth) - Authentication
POST /auth/register - Customer registers a new account.

POST /auth/login - Customer or employee/owner login.

GET /auth/profile - Get the profile of the currently logged-in user (requires authentication).

Services Module (/services) - Nail Services
GET /services - (Public) Get a list of all available services.

GET /services/:id - (Public) Get details of a single service.

POST /services - (Admin) Create a new service.

PATCH /services/:id - (Admin) Update a service.

DELETE /services/:id - (Admin) Delete a service.

Employees Module (/employees) - Employees
GET /employees - (Public) Get a list of all employees (for customers to choose when booking).

POST /employees - (Admin) Add a new employee.

PATCH /employees/:id - (Admin) Update employee information.

DELETE /employees/:id - (Admin) Delete an employee.

Appointments Module (/appointments) - Appointments
POST /appointments - (Customer/Authenticated) Create a new appointment.

GET /users/me/appointments - (Customer/Authenticated) Get the current user's appointment history.

GET /appointments - (Admin) Get all appointments (can be filtered by date, employee, etc.).

PATCH /appointments/:id - (Admin) Update appointment status (e.g., confirm appointment, mark as completed).

Users Module (/users) - User Management (Admin)
GET /users - (Admin) Get a list of all registered users.

GET /users/:id - (Admin) Get details of a single user.

## Initialize Prisma and Define Data Models

```bash

npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

## In the VS Code terminal, navigate to the backend project directory:

```bash
cd apps/api
```

## Install Prisma dependencies:

```Bash
pnpm add prisma @prisma/client
pnpm add -D @types/node

```

prisma: Prisma CLO tool

@prisma/client: Client for interacting with the database in your code.

＃＃Initialize Prisma:

```Bash
pnpm prisma init --datasource-provider postgresql
```

This command will create a prisma folder and a schema.prisma file, and also create a template for the database connection string in the .env file.

Open the .env file under apps/api/ (should be created by pnpm prisma init). There will be a line like DATABASE_URL="...".

```bash
# apps/api/.env

DATABASE_URL="postgresql://user:password@localhost:5433/nail-salon?schema=public"
```

## Run the following command to initialize:

```bash
pnpm prisma migrate dev --name init
```

## Integrate Prisma with NestJS

Now, we need to create an "official channel" in the NestJS app so that all modules (such as user module, appointment module) can access the database through it.

Create Prisma Module and Service Make sure your terminal is in the apps/api directory. Run the following NestJS CLI commands:

```bash
# 1. Create a module named 'prisma'
nest g module prisma

# 2. Create a service named 'prisma' under the prisma module
nest g service prisma
```

Write PrismaService
Open the newly created src/prisma/prisma.service.ts file and replace its content with:

```ts
// src/prisma/prisma.service.ts

import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
```

Set PrismaModule as a Global Module
Open src/prisma/prisma.module.ts:

```ts
// src/prisma/prisma.module.ts

import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

Import PrismaModule in the Main Module
Open src/app.module.ts and import PrismaModule:

```ts
// src/app.module.ts

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

Import PrismaModule in the Main Module
Import PrismaModule once in the main AppModule of the application so the whole app is aware of it.
Open src/app.module.ts:

```ts
// src/app.module.ts

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

# Nail Salon Booking System - Backend API

A robust, feature-rich backend API for a modern nail salon booking system. Built with NestJS, Prisma, and PostgreSQL, this project serves as the backbone for a full-stack application, featuring a complete admin panel, secure user authentication, a decoupled media library, and professional-grade tooling.

---

## ✨ Features

- **Full JWT Authentication**: Secure user registration, login, and profile management using JSON Web Tokens (JWT) and Passport.js.
- **Secure Password Handling**: Includes password hashing with `bcrypt` and a complete, secure password reset flow via email.
- **Role-Based Access Control (RBAC)**: Clear distinction between `ADMIN` and `USER` roles, with protected endpoints and role-based guards.
- **Services Management**: Full CRUD functionality for administrators to manage salon services.
- **Employees Management**: Full CRUD functionality for administrators to manage employees.
- **Advanced Appointments Management**:
  - CRUD operations for booking management.
  - **Appointment Conflict Checking**: Prevents double-booking an employee for the same time slot.
  - **Pagination**: Professional pagination for all list-based endpoints.
- **Decoupled Media Library**:
  - **Batch Image Uploads**: Allows administrators to upload multiple images at once to a central media library.
  - **Cloudinary Integration**: Securely hosts and serves images via Cloudinary's CDN.
  - **Many-to-Many Relationships**: A flexible, scalable database design allowing services to be associated with multiple images via an explicit join table.
- **Dashboard & Analytics**: A dedicated endpoint (`/dashboard/stats`) for the admin panel, providing key metrics like total users, revenue, and appointments.
- **Production-Ready Tooling**:
  - **Structured Logging**: Professional logging with `winston`, featuring daily log rotation and colorized console output.
  - **Global Error Handling**: A global exception filter ensures all API errors are returned in a consistent, predictable format.
  - **Response Wrapping**: A global interceptor automatically wraps all successful responses in a consistent `{ success, data, message }` structure.
  - **Data Validation**: Uses `class-validator` and DTOs for robust request validation.
  - **Security**: Includes `helmet` for securing HTTP headers and CORS configuration.
- **Automated Email Notifications**:
  - Integrated with **Resend** for professional, reliable email delivery.
  - Sends welcome emails, booking confirmations, status updates, and password reset instructions.
- **Scheduled Tasks (Cron Jobs)**: An automated daily task to send appointment reminders to users 24 hours in advance.
- **Interactive API Documentation**: A comprehensive and interactive API documentation powered by **Swagger (OpenAPI)**.

## 🛠️ Tech Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Monorepo Tool**: Turborepo, pnpm
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: Passport.js, JWT
- **File Uploads**: Cloudinary
- **Email**: Resend
- **Logging**: Winston
- **API Documentation**: Swagger
- **Validation**: class-validator, class-transformer

## 🚀 Getting Started

Instructions on how to set up and run the project locally.

### Prerequisites

- Node.js (v20 or later)
- pnpm
- PostgreSQL database server running locally or on the cloud

### Installation & Setup

1.  **Clone the repository:**

    ```bash
    git clone <your-repo-url>
    ```

2.  **Navigate to the project root and install dependencies:**

    ```bash
    cd nail-salon-mvp
    pnpm install
    ```

3.  **Navigate to the API directory:**

    ```bash
    cd apps/api
    ```

4.  **Set up environment variables:**
    - Copy the example environment file:
      ```bash
      cp .env.example .env
      ```
    - Open the `.env` file and fill in all the required variables:
      - `DATABASE_URL`
      - `PORT`
      - `JWT_SECRET` and `JWT_EXPIRATION_TIME`
      - `FRONTEND_URL`
      - `RESEND_API_KEY` and `EMAIL_FROM`
      - `CLOUDINARY_...` credentials

5.  **Run database migrations:**
    This command will sync your Prisma schema with your database, creating all necessary tables and relationships.

    ```bash
    pnpm prisma migrate dev
    ```

6.  **Run the development server:** - Navigate back to the project root:
    `bash
cd ../..
    ` - Start both the frontend and backend applications:
    `bash
      pnpm run dev
      ` - The NestJS API will be running on the port specified in your `.env` file (e.g., `http://localhost:3000`).

## 📚 API Documentation

Once the server is running, the interactive Swagger API documentation is available at:

`http://localhost:3000/api-docs` (replace `3000` with your port if different).

You can use the Swagger UI to test all endpoints, including authorizing protected routes with a Bearer Token.

---

## 📜 Project Evolution: A Step-by-Step Journey

This section outlines the development process and the order in which features were implemented, demonstrating a logical progression from a basic foundation to a feature-rich application.

1.  **Phase 1: Foundation & Architecture**
    - Initialized a Turborepo monorepo with pnpm workspaces.
    - Set up the NestJS application (`api`) and Next.js application (`web`).
    - Designed the initial database schema with Prisma, defining core models like `User`, `Service`, `Employee`, and `Appointment`.
    - Established the database connection and ran initial migrations.

2.  **Phase 2: Core Authentication & Security**
    - Implemented the `AuthModule` with user registration and login endpoints.
    - Integrated `bcrypt` for secure password hashing.
    - Set up JWT-based authentication using `@nestjs/jwt` and `passport-jwt`.
    - Created a `JwtStrategy` to validate tokens and a `JwtAuthGuard` to protect endpoints.
    - Built a secure, token-based password reset flow.

3.  **Phase 3: Professional Tooling & DX**
    - Configured a professional logging system using `winston` and `winston-daily-rotate-file`, replacing the default logger.
    - Implemented a global exception filter (`AllExceptionsFilter`) to ensure consistent error responses.
    - Implemented a global interceptor (`TransformInterceptor`) to standardize all success responses.
    - Set up and configured ESLint and Prettier for code quality and consistency.
    - Enabled CORS and installed `helmet` for security.

4.  **Phase 4: Building Core Business Modules (CRUD)**
    - Developed full CRUD functionality for `Services`, `Employees`, and `Users` modules.
    - Implemented Role-Based Access Control (RBAC) using a custom `@Roles` decorator and `RolesGuard` to restrict sensitive operations to administrators.
    - Implemented soft deletes for critical data to prevent accidental data loss.

5.  **Phase 5: Advanced Business Logic**
    - Enhanced the `Appointments` module with **conflict-checking** logic to prevent double-bookings.
    - Implemented **pagination** across all list endpoints (`/users`, `/appointments`, etc.) for efficient data retrieval.
    - Added a `Dashboard` module with a statistics endpoint to perform data aggregation.

6.  **Phase 6: External Services & Media Management**
    - Architected a decoupled **Media Library**.
    - Created a dedicated `MediaModule` for uploading images.
    - Integrated the **Cloudinary** SDK for robust, cloud-based image storage and delivery.
    - Implemented **batch image uploads** using `FilesInterceptor`.
    - Refactored the Prisma schema to use an explicit many-to-many relationship, allowing services to be linked with multiple images while keeping the `Image` model pure and scalable.
    - Integrated the **Resend** SDK and created a reusable `EmailService` for sending transactional emails.

7.  **Phase 7: Finalization**
    - Added **Swagger (OpenAPI)** documentation to all DTOs and controllers, creating a fully interactive API reference.
    - Completed the final email notifications for booking status changes and reminders using `@nestjs/schedule` for cron jobs.
    - Conducted a final code review and cleanup.

## 🔮 Future Roadmap (V2.0)

- **Advanced Analytics**: Create more endpoints for the dashboard to show trends and charts.
- **Employee Scheduling**: Implement a system to manage employee working hours and vacations, and validate appointments against their schedules.
- **User-Side Cancellations**: Allow users to cancel or reschedule their own appointments within a certain time window.
- **Caching**: Implement a caching layer (e.g., with Redis) for frequently accessed data like the services list to improve performance.
