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

## ⚙️ Environment Variables Setup

Create a `.env` file in the root directory:

```env
NODE_ENV=production
PORT=5000
DATABASE_URL="postgresql://username:password@localhost:5432/powerconnect_db?schema=public"

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRES_IN=30d
BCRYPT_SALT_ROUNDS=12

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
ENDPOINT_SECRET=whsec_your_stripe_webhook_secret

# Application URL
APP_URL=http://localhost:3000
```