# DirectAid Backend API: Provider & Campaign Endpoints (Jan 19, 2026)

## Provider Endpoints

### Core Provider Management
- **POST /api/providers**  
  Create a new provider profile (auth: PROVIDER, ADMIN)
- **GET /api/providers/me**  
  Get the current provider’s profile (auth: PROVIDER)
- **PUT /api/providers/me**  
  Update the current provider’s profile (auth: PROVIDER)
- **POST /api/providers/me/payout-methods**  
  Add a payout method for the provider (auth: PROVIDER)
- **POST /api/providers/me/request-payout**  
  Request a payout (auth: PROVIDER)
- **GET /api/providers**  
  List all providers (auth: ADMIN)
- **GET /api/providers/:id**  
  Get a provider by ID (auth: ADMIN)

### Advanced Provider Features
- **GET /api/providers/public**  
  Publicly list all verified/active providers (no auth required, minimal info)
- **POST /api/providers/invite**  
  Invite an external provider to verify a campaign (auth: BENEFICIARY or ADMIN)
- **GET /api/providers/invite/accept?token=...**  
  Accept a provider invitation and begin onboarding (public)
- **POST /api/providers/verifications**  
  Provider (or admin) verifies campaign documents and records verification (auth: PROVIDER or ADMIN)

---

## Campaign Endpoints

### Core Campaign Management
- **POST /api/campaigns**  
  Create a new campaign (auth: BENEFICIARY)
- **GET /api/campaigns**  
  List all campaigns (public)
- **GET /api/campaigns/:id**  
  Get a campaign by ID (public)
- **PUT /api/campaigns/:id**  
  Update a campaign (auth required; owner or ADMIN)
- **DELETE /api/campaigns/:id**  
  Delete a campaign (auth required; owner or ADMIN)
- **PATCH /api/campaigns/:id/status**  
  Admin updates campaign status (auth: ADMIN)

### Advanced Campaign Features
- **POST /api/campaigns/:id/submit**  
  Submit a campaign for review (auth: BENEFICIARY/owner; enforces required fields and status transitions)

---

**All endpoints tested for basic functionality.**

For details, request/response examples, or further integration/testing, please reach out.
