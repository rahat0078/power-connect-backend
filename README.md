# ⚡ PowerConnect — Multi-Vendor Power Utility & Service Management Platform

PowerConnect is a robust, scalable, and secure RESTful backend API designed for managing power utility services, load shedding schedules, outage reports, and emergency repairs. It seamlessly connects residents (customers) with certified power service providers while offering strict Role-Based Access Control (RBAC) for Residents, Providers, and Admins.

---

## 🚀 Live Demo & Documentation

- **Live API Endpoint:** `https://power-connect-backend.vercel.app/api/v1`
- **Postman Collection Link:** [View Postman Documentation](https://documenter.getpostman.com/view/your-postman-id)
- **API Walkthrough Video:** [Watch Demo Video](https://drive.google.com/file/d/your-video-id/view)

---

## 🔐 Demo Credentials for Evaluation

| Role | Email | Password |
| :--- | :--- | :--- |
| **ADMIN** | `admin@power.com` | `Admin@12` |
| **PROVIDER** | `provider@powerconnect.com` | `Provider@123456` |
| **RESIDENT** | `resident@powerconnect.com` | `Resident@123456` |

---

## 🛠 Tech Stack & Tools

- **Runtime & Framework:** Node.js, Express.js with TypeScript
- **Database & ORM:** PostgreSQL + Prisma ORM (Transactions, Indexing, Soft Deletes)
- **Input Validation:** Zod
- **Authentication:** JWT (JSON Web Token) with Cookie/Bearer support
- **Payment Processing:** Stripe API Integration (Checkout Sessions & Webhooks)
- **Code Quality:** Prettier, ESLint

---

## ✨ Key Business Logic & Architecture Highlights

1. **Role-Based Access Control (RBAC):**
   - **`RESIDENT`**: Request services, report power outages, pay for approved requests, and track service history.
   - **`PROVIDER`**: Apply for provider verification, list/manage power services, accept/reject service requests, and mark completion.
   - **`ADMIN`**: Manage users & roles, approve/reject provider profile applications, publish power schedule alerts, oversee outage reports, and monitor real-time audit logs and revenue stats.

2. **Power Service Request Lifecycle:**
   - Resident Requests Service (`PENDING`) $\rightarrow$ Provider Accepts Request (`ACCEPTED`) $\rightarrow$ Resident Initiates & Completes Payment (`IN_PROGRESS`) $\rightarrow$ Provider Marks Complete or System Auto-completes via 48-hour Cron Job (`COMPLETED`).

3. **Soft Delete & Audit Logging:**
   - Critical resources support soft deletion (`deletedAt`).
   - Audit logging tracks key administrative and financial actions (`PAYMENT_SUCCESS`, `ROLE_CHANGE`, `SERVICE_COMPLETED`).

---
```
1. Clone the repository
git clone https://github.com/rahat0078/rent-nest.git
cd power-connect-backend

2. Install dependencies
npm install

3. Setup Database with Prisma
npx prisma migrate dev
npx prisma generate

4. Run Development Server
npm run dev
```

## 📌 Complete API Endpoint Documentation

All API responses follow a standardized JSON response structure:

* **Success Response:** `{ "success": true, "message": "...", "data": {} }`
* **Error Response:** `{ "success": false, "message": "...", "errors": [] }`

### 🔑 1. Authentication (`/api/v1/auth`)

| **Method** | **Endpoint**                 | **Access Role** | **Description**                            |
| ---------- | ---------------------------- | --------------- | ------------------------------------------ |
| `POST`     | `/api/v1/auth/register`      | Public          | Register new user account                  |
| `POST`     | `/api/v1/auth/login`         | Public          | Authenticate user & receive JWT            |
| `POST`     | `/api/v1/auth/verify-email`  | Public          | Verify user email address                  |
| `GET`      | `/api/v1/auth/me`            | Authenticated   | Get currently logged-in user profile       |
| `POST`     | `/api/v1/auth/refresh-token` | Public          | Issue new access token using refresh token |

### 📅 2. Power Outage Schedules (`/api/v1/schedule`)

| **Method** | **Endpoint**           | **Access Role** | **Description**                                                                                                             |
| ---------- | ---------------------- | --------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `POST`     | `/api/v1/schedule`     | Admin           | Create a new load shedding / maintenance schedule                                                                           |
| `PATCH`    | `/api/v1/schedule/:id` | Admin           | Update an existing power schedule                                                                                           |
| `GET`      | `/api/v1/schedule`     | Public          | List power schedules *(Supports filtering by `area`, `status`, `searchTerm`, `startDate`, `endDate`, pagination & sorting)* |
| `GET`      | `/api/v1/schedule/:id` | Public          | Get details of a single power schedule                                                                                      |
| `DELETE`   | `/api/v1/schedule/:id` | Admin           | Delete a power schedule                                                                                                     |

### 🚨 3. Outage Reports (`/api/v1/outage-reports`)

| **Method** | **Endpoint**                        | **Access Role** | **Description**                                                                           |
| ---------- | ----------------------------------- | --------------- | ----------------------------------------------------------------------------------------- |
| `POST`     | `/api/v1/outage-reports`            | Resident        | Submit a localized power outage report                                                    |
| `GET`      | `/api/v1/outage-reports/my-reports` | Resident        | Get resident's own outage reports *(Supports `searchTerm`, `area`, `status`, pagination)* |
| `GET`      | `/api/v1/outage-reports`            | Admin           | Get all submitted outage reports across the platform                                      |
| `PATCH`    | `/api/v1/outage-reports/:id/status` | Admin           | Update outage report status (e.g., `INVESTIGATING`, `RESOLVED`)                           |

### 👷 4. Provider Profile Management (`/api/v1/providers`)

| **Method** | **Endpoint**                    | **Access Role** | **Description**                                   |
| ---------- | ------------------------------- | --------------- | ------------------------------------------------- |
| `POST`     | `/api/v1/providers/apply`       | Resident        | Apply to become a verified Power Service Provider |
| `GET`      | `/api/v1/providers/pending`     | Admin           | View all pending provider applications            |
| `PATCH`    | `/api/v1/providers/approve/:id` | Admin           | Approve or reject a provider profile application  |
| `GET`      | `/api/v1/providers/me`          | Provider        | Get current provider's profile information        |
| `PATCH`    | `/api/v1/providers/me`          | Provider        | Update provider profile details                   |

### ⚡ 5. Power Services (`/api/v1/services`)

| **Method** | **Endpoint**                   | **Access Role**  | **Description**                                                  |
| ---------- | ------------------------------ | ---------------- | ---------------------------------------------------------------- |
| `POST`     | `/api/v1/services`             | Provider / Admin | Create a new service offering                                    |
| `GET`      | `/api/v1/services`             | Public           | List all active services *(Supports search, filter, pagination)* |
| `GET`      | `/api/v1/services/my-services` | Provider         | Get all services created by the logged-in provider               |
| `GET`      | `/api/v1/services/single/:id`  | Public           | Fetch single service details                                     |
| `PATCH`    | `/api/v1/services/:id`         | Provider / Admin | Update service details                                           |
| `PATCH`    | `/api/v1/services/status/:id`  | Provider / Admin | Toggle service active status                                     |
| `DELETE`   | `/api/v1/services/:id`         | Provider / Admin | Soft delete a power service                                      |

### 📋 6. Service Requests (`/api/v1/service-requests`)

| **Method** | **Endpoint**                                   | **Access Role** | **Description**                                    |
| ---------- | ---------------------------------------------- | --------------- | -------------------------------------------------- |
| `POST`     | `/api/v1/service-requests`                     | Resident        | Request a power service                            |
| `GET`      | `/api/v1/service-requests/my-requests`         | Resident        | View all service requests made by the resident     |
| `GET`      | `/api/v1/service-requests/provider-requests`   | Provider        | View service requests assigned to the provider     |
| `PATCH`    | `/api/v1/service-requests/status/:id`          | Provider        | Accept or Reject a pending service request         |
| `PATCH`    | `/api/v1/service-requests/complete/:id`        | Provider        | Mark an in-progress service request as `COMPLETED` |
| `PATCH`    | `/api/v1/service-requests/cancel-resident/:id` | Resident        | Cancel a service request prior to payment          |
| `GET`      | `/api/v1/service-requests/common/:id`          | Authenticated   | View shared details of a service request           |

### 💳 7. Payments (`/api/v1/payments`)

| **Method** | **Endpoint**                       | **Access Role** | **Description**                                                             |
| ---------- | ---------------------------------- | --------------- | --------------------------------------------------------------------------- |
| `POST`     | `/api/v1/payments/create-checkout` | Resident        | Initiate Stripe checkout session for accepted requests                      |
| `GET`      | `/api/v1/payments/my-history`      | Resident        | Fetch resident's payment transaction history                                |
| `GET`      | `/api/v1/payments/my-history/:id`  | Resident        | View specific payment transaction details                                   |
| `POST`     | `/api/v1/payments/webhook`         | Stripe Webhook  | Webhook callback to confirm payment and transition request to `IN_PROGRESS` |

### 🛡️ 8. Admin Operations (`/api/v1/admin`)

| **Method** | **Endpoint**                    | **Access Role** | **Description**                                                |
| ---------- | ------------------------------- | --------------- | -------------------------------------------------------------- |
| `GET`      | `/api/v1/admin/users`           | Admin           | Fetch all registered users with pagination & search            |
| `PATCH`    | `/api/v1/admin/users/role/:id`  | Admin           | Promote/Demote user role (`RESIDENT`, `PROVIDER`, `ADMIN`)     |
| `GET`      | `/api/v1/admin/dashboard-stats` | Admin           | Platform overview (Total users, total requests, revenue stats) |
| `GET`      | `/api/v1/admin/audit-logs`      | Admin           | Review system audit trail logs with pagination                 |

## 👨‍💻 Author

Developed by **Ruhul Amin Rahat**

*Full-Stack Web Developer*
