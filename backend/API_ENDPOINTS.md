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
  Add a new payout method (auth: PROVIDER)
- **PUT /api/providers/me/payout-methods/:payoutMethodId**  
  Update a payout method (auth: PROVIDER)
- **DELETE /api/providers/me/payout-methods/:payoutMethodId**  
  Delete a payout method (auth: PROVIDER)
- **GET /api/providers/me/wallet**  
  Get provider wallet balance and recent transactions (auth: PROVIDER)
- **GET /api/providers/me/campaigns**  
  List all campaigns for the current provider (auth: PROVIDER)
- **POST /api/providers/me/submit-verification**  
  Submit provider verification (auth: PROVIDER)
- **POST /api/providers/me/lightning/setup**  
  Setup Lightning configuration (auth: PROVIDER)
- **GET /api/providers/me/transactions**  
  Get provider transactions (auth: PROVIDER)
- **POST /api/providers/me/withdraw**  
  Withdraw funds via Lightning (auth: PROVIDER)
- **GET /api/providers/profile/:publicId**  
  Get public provider profile (public fields only)
- **POST /api/providers/me/services**  
  Add a service to provider's catalog (auth: PROVIDER)
- **PUT /api/providers/me/services/:serviceCode**  
  Update a service in provider's catalog (auth: PROVIDER)
- **DELETE /api/providers/me/services/:serviceCode**  
  Delete a service from provider's catalog (auth: PROVIDER)
- **GET /api/providers/me/stats**  
  Get computed provider stats (auth: PROVIDER)
- **POST /api/providers/me/upload-docs**  
  Upload and attach docs to provider (auth: PROVIDER)
- **GET /api/providers/admin/providers**  
  Admin: list all providers
- **GET /api/providers/admin/providers/:id**  
  Admin: get full provider profile
- **POST /api/providers/admin/providers/:id/verify**  
  Admin: verify provider KYC
- **POST /api/providers/admin/providers/:id/suspend**  
  Admin: suspend provider

## Campaign Endpoints

### Core Campaign Management
- **POST /api/campaigns**  
  Create a new campaign (auth: PROVIDER, ADMIN)
- **GET /api/campaigns/:id**  
  Get campaign details (auth: required)
- **PUT /api/campaigns/:id**  
  Update campaign details (auth: required)
- **DELETE /api/campaigns/:id**  
  Delete a campaign (auth: required)
- **POST /api/campaigns/:id/link-provider**  
  Link a provider to a campaign (auth: required)
- **POST /api/campaigns/:id/provider-accept**  
  Provider accepts campaign (auth: required)
- **GET /api/campaigns/admin/campaigns**  
  Admin: list all campaigns
- **GET /api/campaigns/admin/campaigns/:id**  
  Admin: get full campaign with allocations and donations
- **PATCH /api/campaigns/admin/campaigns/:id/status**  
  Admin: update campaign status
- **POST /api/campaigns/admin/campaigns/:id/allocations**  
  Admin: add allocation to campaign
- **PUT /api/campaigns/admin/campaigns/:id/allocations/:allocationId**  
  Admin: update allocation
- **DELETE /api/campaigns/admin/campaigns/:id/allocations/:allocationId**  
  Admin: delete allocation
- **GET /api/campaigns/:id/stats**  
  Get computed campaign stats