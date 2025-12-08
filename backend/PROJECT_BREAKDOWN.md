# Project Breakdown: Backend APIs

**Teammates:**
- Elgar (initial setup, authentication)
- Aisha (main API development, debugging, testing)

## Overview
This backend powers a transparent donation platform. It provides secure authentication and CRUD APIs for campaigns, donations, providers, and invoices. The documentation below explains each part so frontend developers can easily integrate and understand the backend.

---

## 1. Authentication (by Elgar)
- User registration and login endpoints
- JWT access and refresh token system
- Password hashing and user creation
- Email verification logic (SMTP disabled for local testing)
- Auth middleware for protected routes

## 2. Main APIs (by Aisha)
- **Campaigns**
  - Create, list, update campaigns
  - Required fields: `title`, `description`, `targetAmount`, `currency`
- **Donations**
  - Create donations linked to campaigns and users
  - Required fields: `amount`, `currency`, `paymentMethod`, `campaign` (nested), `donor` (nested)
- **Providers**
  - Create providers as users with role `PROVIDER`
  - Required fields: `name`, `description`, `firstName`, `email`, `password`
  - Password is hashed before saving
- **Invoices**
  - Create invoices linked to providers
  - Required fields: `provider` (nested), `amount`, `currency`, `description`

## 3. Error Handling & Validation
- All endpoints validate required fields and return clear error messages
- Prisma schema errors fixed during development

## 4. How to Use (for Frontend)
- Register/login to get an accessToken
- Use accessToken as Bearer token for all protected endpoints
- For nested relations (donations, invoices), use `{ connect: { id: ... } }` for linking
- All endpoints expect JSON bodies

## 5. Next Steps
- Frontend can now integrate all main APIs
- Further features (reporting, admin, etc.) can be added as needed

---

**Contact:**
- For backend questions: Aisha
- For authentication details: Elgar
