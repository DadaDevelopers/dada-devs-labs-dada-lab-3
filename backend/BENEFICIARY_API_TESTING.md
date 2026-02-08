# Beneficiary Backend — API Testing Guide

Use this doc to implement and test the endpoints the **beneficiary portal** frontend expects. Base URL: `http://localhost:<PORT>/api` (or your server URL + `/api`). All authenticated requests use: **Header `Authorization: Bearer <accessToken>`**.

---

## 1. Auth (no token required)

### 1.1 Register

- **Method:** `POST`
- **Path:** `/api/auth/register`
- **Body (JSON):**
  ```json
  {
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "jane@example.com",
    "password": "SecurePass123"
  }
  ```
- **Success (201):** `{ "accessToken": "<jwt>", "user": { "id", "email", "firstName", "role": "UNASSIGNED" } }`
- **Test:** After success, use `accessToken` in subsequent requests.

### 1.2 Login

- **Method:** `POST`
- **Path:** `/api/auth/login`
- **Body (JSON):**
  ```json
  { "email": "jane@example.com", "password": "SecurePass123" }
  ```
- **Success (200):** `{ "accessToken": "<jwt>", "user": { "id", "email", "firstName", "role", "isDeleted" } }`
- **Test:** Copy `accessToken`; send as `Authorization: Bearer <accessToken>` on all protected calls.

### 1.3 Select role (onboarding)

- **Method:** `POST`
- **Path:** `/api/auth/select-role`
- **Auth:** Required (Bearer token).
- **Body (JSON):**
  ```json
  {
    "role": "BENEFICIARY",
    "phoneNumber": "+254700000000",
    "country": "Kenya",
    "city": "Nairobi"
  }
  ```
  - For **PROVIDER** add `"organization": "Org Name"`.
- **Success (200):** `{ "message": "Role updated", "role": "BENEFICIARY", "user": { ... }, "accessToken": "<new_jwt>" }`
- **Test:** Use the **new** `accessToken` from the response for all later requests (role is in the new token).

---

## 2. User (profile & metrics)

### 2.1 Get current user (profile)

- **Method:** `GET`
- **Path:** `/api/users/me`
- **Auth:** Required (Bearer).
- **Success (200):** `{ "user": { "id", "email", "firstName", "lastName", "phoneNumber", "country", "city", "role", "beneficiaryProfile": { "displayName", "shortStory", "category", "preferredProvider", "consentContact", ... } } }`
- **Test:** Ensures profile page and beneficiary settings can load. Must include `beneficiaryProfile` for beneficiaries.

### 2.2 Update profile

- **Method:** `PUT`
- **Path:** `/api/users/me`
- **Auth:** Required (Bearer).
- **Body (JSON):** Partial user and/or `beneficiaryProfile` (e.g. `{ "firstName": "Jane", "beneficiaryProfile": { "displayName": "Jane D", "shortStory": "..." } }`).
- **Success (200):** `{ "user": { ...updated user } }` or same shape as GET /users/me.

### 2.3 Get beneficiary metrics (dashboard)

- **Method:** `GET`
- **Path:** `/api/users/me/metrics`
- **Auth:** Required (Bearer). **Role:** Must be `BENEFICIARY` (return 403 otherwise).
- **Success (200):**
  ```json
  {
    "metrics": {
      "totalAidReceived": 0,
      "totalDisbursements": 0,
      "campaignsSupportingYou": 0
    }
  }
  ```
- **Logic:** `totalAidReceived` = sum of `amountRaised` for campaigns where `beneficiaryId` = current user; `campaignsSupportingYou` = count of those campaigns with `status === "ACTIVE"`; `totalDisbursements` can be stubbed to `0` until disbursement flow exists.
- **Test:** Call after logging in as a beneficiary; expect numbers or zeros.

---

## 3. Campaigns (beneficiary)

### 3.1 List campaigns (public)

- **Method:** `GET`
- **Path:** `/api/campaigns`
- **Query (optional):** `beneficiaryId`, `confirmationStatus`, `status`, `page`, `limit`
- **Success (200):** `{ "page", "limit", "total", "campaigns": [ ... ] }`

### 3.2 My campaigns (beneficiary only)

- **Method:** `GET`
- **Path:** `/api/campaigns/me`
- **Auth:** Required (Bearer). **Role:** `BENEFICIARY`.
- **Query (optional):** `page`, `limit`, `status`, `confirmationStatus`
- **Success (200):** `{ "page", "limit", "total", "campaigns": [ ... ] }` — campaigns where `beneficiaryId` = current user. When ServiceReceipt is implemented, each campaign should include `beneficiaryReceipt: { confirmedAt, note }` or `null`.
- **Test:** Create a campaign as beneficiary, then GET /api/campaigns/me; expect that campaign in the list.

### 3.3 Get campaign by id

- **Method:** `GET`
- **Path:** `/api/campaigns/:id` or `/api/campaigns/:publicId?by=public`
- **Success (200):** `{ "campaign": { ... } }`

### 3.4 Create campaign (beneficiary only)

- **Method:** `POST`
- **Path:** `/api/campaigns`
- **Auth:** Required (Bearer). **Role:** `BENEFICIARY`.
- **Body (JSON):**
  ```json
  {
    "title": "Emergency medical fund",
    "description": "Help with surgery costs",
    "targetAmount": 5000,
    "currency": "USD",
    "category": "medical",
    "providerId": null
  }
  ```
- **Success (201):** `{ "campaign": { "id", "publicId", "title", "targetAmount", "amountRaised", "currency", "status", "confirmationStatus", "beneficiaryId", "providerId", ... } }`
- **Test:** POST as beneficiary; then GET /api/campaigns/me and GET /api/campaigns/:id to confirm.

### 3.5 Confirm beneficiary receipt (to implement)

- **Method:** `PATCH`
- **Path:** `/api/campaigns/:id/confirm-beneficiary`
- **Auth:** Required (Bearer). **Role:** `BENEFICIARY`. Caller must be the campaign’s `beneficiaryId`; campaign must be `confirmationStatus: "provider_confirmed"`.
- **Body (JSON):** `{ "confirmationNote": "Optional note" }`
- **Success (200):** `{ "campaign": { ... }, "receipt": { "id", "confirmedAt", "note" }, "message": "Service receipt confirmed successfully" }`
- **Backend:** Create a **ServiceReceipt** record (campaignId, beneficiaryId, confirmedAt, note); do not change campaign.confirmationStatus. See handoff doc for full spec.

---

## 4. Optional / future

- **GET /api/beneficiaries/me/disbursements** (or **GET /api/users/me/disbursements**) — paginated list of disbursements for the current beneficiary (query: `page`, `limit`, `status`, `campaignId`). Response: `{ "page", "limit", "total", "disbursements": [ { "id", "campaignId", "amount", "currency", "status", "disbursedAt", "description", "transactionRef" } ] }`.
- **POST /api/campaigns/:id/reports** — beneficiary submits a progress report (body: `description`, `uploadIds`, `reportType`).
- **GET /api/campaigns/:id/reports** — list reports for a campaign (auth: beneficiary, provider, or admin).
- **PATCH /api/campaigns/:id/confirm-provider** — provider sets `confirmationStatus` to `provider_confirmed` and `providerConfirmedAt`.

---

## 5. Quick test flow (curl or Postman)

1. **POST /api/auth/register** → get `accessToken`.
2. **GET /api/users/me** with `Authorization: Bearer <accessToken>` → expect `user` with `role: "UNASSIGNED"`.
3. **POST /api/auth/select-role** with body `{ "role": "BENEFICIARY", "phoneNumber", "country", "city" }` → get new `accessToken`.
4. **GET /api/users/me** with new token → expect `user.role === "BENEFICIARY"`.
5. **GET /api/users/me/metrics** → expect `{ metrics: { totalAidReceived, totalDisbursements, campaignsSupportingYou } }`.
6. **POST /api/campaigns** with body `{ title, description, targetAmount, currency }` → expect 201 and campaign.
7. **GET /api/campaigns/me** → expect list including the campaign from step 6.
8. **PUT /api/users/me** with profile updates → expect 200 and updated user.

---

## 6. Error responses

- Use **401** when token is missing or invalid (e.g. `{ "message": "Invalid token" }` or `"Unauthorized"`).
- Use **403** when role is wrong (e.g. `{ "message": "Only beneficiaries can access metrics" }`).
- Use **400** for validation (e.g. `{ "message": "title, targetAmount and currency are required" }`).
- Use **404** for missing resource (e.g. `{ "message": "Campaign not found" }`).
- Frontend reads `response.data.message` and shows it to the user.

---

## 7. Summary table

| Purpose              | Method | Path                              | Auth        | Role        |
|----------------------|--------|-----------------------------------|-------------|-------------|
| Register             | POST   | /api/auth/register                | No          | —           |
| Login                | POST   | /api/auth/login                   | No          | —           |
| Select role          | POST   | /api/auth/select-role             | Bearer      | UNASSIGNED  |
| Get profile          | GET    | /api/users/me                     | Bearer      | Any         |
| Update profile       | PUT    | /api/users/me                     | Bearer      | Any         |
| Beneficiary metrics  | GET    | /api/users/me/metrics             | Bearer      | BENEFICIARY |
| List campaigns       | GET    | /api/campaigns                    | No          | —           |
| My campaigns         | GET    | /api/campaigns/me                 | Bearer      | BENEFICIARY |
| Get campaign         | GET    | /api/campaigns/:id                | No          | —           |
| Create campaign      | POST   | /api/campaigns                    | Bearer      | BENEFICIARY |
| Confirm receipt      | PATCH  | /api/campaigns/:id/confirm-beneficiary | Bearer | BENEFICIARY |

Use this doc to add or adjust routes and to run manual/automated tests against the beneficiary flow.
