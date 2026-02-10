// ============================================================================
// USER & AUTHENTICATION TYPES
// ============================================================================

export type UserRole =
  | "donor"
  | "provider"
  | "beneficiary"
  | "admin"

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  profileImage?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// ============================================================================
// PROVIDER TYPES
// ============================================================================

export type ProviderType = "hospital" | "school" | "pharmacy" | "other";
export type ProviderStatus = "pending" | "verified" | "rejected" | "suspended";
export type KYCStatus =
  | "pending"
  | "verified"
  | "rejected"
  | "pending_documents";

export interface Provider extends User {
  role: "provider";
  organizationName: string;
  organizationType: ProviderType;
  registrationNumber: string;
  kycStatus: KYCStatus;
  verificationDate?: string;
  payoutMethods: PayoutMethod[];
  walletBalance: WalletBalance;
  totalCampaigns: number;
  totalFundsRaised: number;
  totalBeneficiaries: number;
}

export interface PayoutMethod {
  id: string;
  type: "bank" | "mobile_money" | "crypto";
  details: Record<string, string>;
  isDefault: boolean;
  lastUsed?: string;
}

export interface WalletBalance {
  locked: number; // In cents or sats
  available: number;
  total: number;
}

// ============================================================================
// BENEFICIARY TYPES
// ============================================================================

export type BeneficiaryStatus = "active" | "completed" | "suspended";
export type RequestStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "rejected"
  | "active"
  | "completed";

export interface Beneficiary extends User {
  role: "beneficiary";
  phoneNumber: string;
  location: string;
  campaigns: Campaign[];
  totalAidReceived: number;
  status: BeneficiaryStatus;
}

export interface AidRequest {
  id: string;
  beneficiaryId: string;
  title: string;
  description: string;
  category: "medical" | "education" | "emergency" | "business" | "other";
  targetAmount: number;
  status: RequestStatus;
  documents: Document[];
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

// ============================================================================
// CAMPAIGN TYPES
// ============================================================================

// src/types/index.ts — FINAL CLEAN VERSION

export type CampaignStatus =
  | "draft"
  | "pending_approval"
  | "active"
  | "completed"
  | "cancelled"
  | "in_progress"
  | "paused";

export type ConfirmationStatus =
  | "pending"
  | "provider_confirmed"
  | "both_confirmed"
  | "disputed";

export interface BeneficiaryReceipt {
  confirmedAt: string | null;
  note: string;
}

export interface Campaign {
  id: string;
  providerId: string | any;
  provider: Partial<Provider>;
  beneficiaryId: string | any;
  beneficiary: Partial<Beneficiary>;
  invoiceId: string;
  invoice: Invoice;
  title: string;
  description: string;
  category: "medical" | "education" | "emergency" | "business" | "other";
  location: string;
  targetAmount: number;
  amountRaised: number;
  donorCount: number;
  status: CampaignStatus;

  // ADMIN APPROVAL FLOW — NEW
  adminStatus: "pending" | "approved" | "rejected" | "flagged";

  // CONFIRMATION FLOW (Provider + Beneficiary) — KEEP ONLY ONE
  confirmationStatus: ConfirmationStatus;
  providerConfirmedAt?: string;
  beneficiaryConfirmedAt?: string;
  beneficiaryReceipt?: BeneficiaryReceipt;

  // Proofs & Documents
  proofDocuments: Document[];

  // Timeline
  createdAt: string;
  updatedAt: string;
  launchedAt?: string;
  completedAt?: string;
  fundraisingDeadline: string;

  // Progress tracking
  progressPercentage: number;
  donationTimeline: DonationTimeline[];
}

export interface DonationTimeline {
  date: string;
  amount: number;
  donorCount: number;
  cumulativeAmount: number;
}

// ============================================================================
// INVOICE TYPES
// ============================================================================

export type InvoiceStatus =
  | "uploaded"
  | "awaiting_verification"
  | "approved"
  | "rejected"
  | "released";

export interface Invoice {
  id: string;
  providerId: string;
  campaignId?: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  invoiceDate: string;
  dueDate: string;
  description: string;
  fileUrl: string;
  fileHash: string;
  status: InvoiceStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// DONATION TYPES
// ============================================================================

export type DonationStatus =
  | "pending"
  | "locked"
  | "released"
  | "withdrawn"
  | "refunded"
  | "disputed"
  | "completed"
  | "COMPLETED"
  | "FAILED"
  | "PENDING";
export type PaymentMethod =
  | "lightning"
  | "card"
  | "mobile_money"
  | "bank_transfer"
  | "crypto";

export interface Donation {
  id: string;
  campaignId: string;
  campaign: Partial<Campaign>;
  donorId?: string;
  donor: Partial<User>;
  amount: number;
  amountUSD?: number;
  amountSats?: number;
  currency: "USD" | "BTC" | "NGN" | "KES" | "GHS" | "ZAR";
  paymentMethod: PaymentMethod;
  status: DonationStatus;

  // Payment tracking
  paymentRef: string;
  transactionHash?: string;

  // Donor preferences
  isAnonymous: boolean;
  coversPlatformFees: boolean;
  isRecurring?: boolean;

  // Receipt
  receiptUrl?: string;
  receiptGeneratedAt?: string;

  // Timestamps
  createdAt: string;
  processedAt?: string;
  releasedAt?: string;
  withdrawnAt?: string;
}

export interface DonationReceipt {
  id: string;
  donationId: string;
  donorName?: string;
  amount: number;
  currency: string;
  campaignTitle: string;
  providerName: string;
  invoiceId: string;
  transactionId: string;
  verificationBadge: boolean;
  timestamp: string;
  fundStatus: "locked" | "released" | "withdrawn";
}

// ============================================================================
// DOCUMENT TYPES
// ============================================================================

export interface Document {
  id: string;
  name: string;
  type: string; // mime type
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

// ============================================================================
// PAYOUT TYPES
// ============================================================================

export type PayoutStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled";

export interface Payout {
  id: string;
  providerId: string;
  amount: number;
  currency: string;
  payoutMethod: PayoutMethod;
  status: PayoutStatus;
  transactionRef: string;
  estimatedArrival?: string;
  completedAt?: string;
  failureReason?: string;
  campaignId: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// AUDIT & ACTIVITY TYPES
// ============================================================================

export type AuditAction =
  | "campaign_created"
  | "campaign_approved"
  | "campaign_rejected"
  | "donation_received"
  | "donation_locked"
  | "donation_released"
  | "provider_confirmed"
  | "beneficiary_confirmed"
  | "payout_initiated"
  | "payout_completed"
  | "invoice_uploaded"
  | "invoice_verified"
  | "invoice_rejected"
  | "dispute_opened"
  | "dispute_resolved"
  | "refund_issued";

export interface AuditLog {
  id: string;
  userId: string;
  action: AuditAction;
  resourceType: "campaign" | "donation" | "invoice" | "payout" | "provider";
  resourceId: string;
  changes: Record<string, unknown>;
  reason?: string;
  timestamp: string;
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface CampaignFormData {
  title: string;
  description: string;
  category: "medical" | "education" | "emergency" | "business" | "other";
  targetAmount: number;
  invoiceFile?: File;
  proofDocuments?: File[];
}

export interface DonationFormData {
  campaignId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  isAnonymous?: boolean;
  coversPlatformFees?: boolean;
  isRecurring?: boolean;
  donorName?: string;
  donorEmail?: string;
}

export interface InvoiceUploadData {
  invoiceNumber: string;
  amount: number;
  description: string;
  invoiceFile: File;
  dueDate: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================================================
// DASHBOARD METRICS TYPES
// ============================================================================

export interface ProviderMetrics {
  totalCampaigns: number;
  activeCampaigns: number;
  totalFundsRaised: number;
  pendingApprovals: number;
  activeDonors: number;
  walletBalance: WalletBalance;
}

export interface BeneficiaryMetrics {
  totalAidReceived: number;
  totalDisbursements: number;
  campaignsSupportingYou: number;
  familiesHelped: number;
  childrenEducated: number;
  medicalTreatments: number;
}

export interface DonorMetrics {
  totalDonated: number;
  activeRecurrings: number;
  campaignsSupportedd: number;
  livesImpacted: number;
  countriesHelped: number;
}

// ============================================================================
// ADMIN DASHBOARD TYPES (metrics + queues from backend contract)
// ============================================================================

export type PlatformHealthStatus = "OPERATIONAL" | "DEGRADED" | "OUTAGE";

export interface AdminPlatformHealth {
  status: PlatformHealthStatus;
  uptimePercent30d: number;
  lastIncident: {
    occurredAt: string;
    resolvedAt: string;
    summary: string;
  };
}

export interface AdminUsersMetrics {
  totalUsers: number;
  donors: number;
  beneficiaries: number;
  providers: number;
  admins: number;
  newUsersToday: number;
  verifiedUsersPercent: number;
  flaggedUsers: number;
  suspendedUsers: number;
}

export interface AdminCampaignsMetrics {
  totalCampaigns: number;
  activeCampaigns: number;
  completedCampaigns: number;
  pausedCampaigns: number;
  rejectedCampaigns: number;
  campaignsCreatedToday: number;
  verificationQueueCount: number;
  highRiskCampaigns: number;
}

export interface AdminDonationsLightning {
  totalSatsReceived: number;
  totalDonations: number;
  avgDonationSats: number;
  successRatePercent: number;
  failedInvoices24h: number;
}

export interface AdminDonationsMpesa {
  totalKesReceived: number;
  totalDonations: number;
  avgDonationKes: number;
  pendingPayments: number;
  reversedPayments: number;
}

export interface AdminDonationsToday {
  count: number;
  sats: number;
  kes: number;
}

export interface AdminDonationsMetrics {
  totalDonationsCount: number;
  lightning: AdminDonationsLightning;
  mpesa: AdminDonationsMpesa;
  donationsToday: AdminDonationsToday;
}

export interface AdminAllocationsMetrics {
  allocatedToBeneficiariesSats: number;
  allocatedToProvidersSats: number;
  platformFeesSats: number;
  pendingAllocations: number;
  disputedAllocations: number;
}

export interface AdminComplianceMetrics {
  kycPending: number;
  kycRejected: number;
  amlAlerts: number;
  fraudInvestigationsOpen: number;
  suspiciousDonationsLast30d: number;
}

export interface AdminRefunds {
  totalRefunds: number;
  satsRefunded: number;
  kesRefunded: number;
}

export interface AdminFinancialsMetrics {
  platformRevenueSats: number;
  avgFeePercent: number;
  refunds: AdminRefunds;
}

export interface AdminSystemQueuesMetrics {
  donationWebhooksBacklog: number;
  lightningSettlementLagSecondsAvg: number;
  mpesaReconciliationLagMinutesAvg: number;
}

export interface AdminMetrics {
  generatedAt: string;
  platformHealth: AdminPlatformHealth;
  users: AdminUsersMetrics;
  campaigns: AdminCampaignsMetrics;
  donations: AdminDonationsMetrics;
  allocations: AdminAllocationsMetrics;
  compliance: AdminComplianceMetrics;
  financials: AdminFinancialsMetrics;
  systemQueues: AdminSystemQueuesMetrics;
}

// Queue item types for admin queues
export interface AdminCampaignVerificationItem {
  campaignId: string;
  title: string;
  beneficiaryName: string;
  country: string;
  requestedAmountSats: number;
  createdAt: string;
  riskScore: number;
  status: string;
  flags: string[];
}

export interface AdminUserVerificationItem {
  userId: string;
  role: string;
  fullName?: string;
  organizationName?: string;
  country: string;
  submittedAt: string;
  documents: string[];
  status: string;
  flags?: string[];
}

export interface AdminPaymentIssueItem {
  paymentId: string;
  method: string;
  amountSats?: number;
  amountKes?: number;
  campaignId: string;
  issue: string;
  detectedAt: string;
  status: string;
}

export interface AdminRefundRequestItem {
  refundId: string;
  donorId: string;
  donationId: string;
  amountSats: number;
  reason: string;
  requestedAt: string;
  status: string;
}

export interface AdminFraudCaseItem {
  caseId: string;
  entityType: string;
  entityId: string;
  reason: string;
  riskScore: number;
  detectedAt: string;
  status: string;
}

export interface AdminProviderPayoutItem {
  payoutId: string;
  providerName: string;
  country: string;
  amountSats: number;
  linkedCampaigns: string[];
  scheduledAt: string;
  status: string;
}

export interface AdminContentModerationItem {
  contentId: string;
  type: string;
  campaignId: string;
  reportedBy: string;
  reason: string;
  createdAt: string;
  status: string;
}

export interface AdminSystemAlertItem {
  alertId: string;
  severity: string;
  component: string;
  message: string;
  triggeredAt: string;
  acknowledged: boolean;
}

export interface AdminQueues {
  generatedAt: string;
  campaignVerificationQueue: AdminCampaignVerificationItem[];
  userVerificationQueue: AdminUserVerificationItem[];
  paymentIssuesQueue: AdminPaymentIssueItem[];
  refundRequestsQueue: AdminRefundRequestItem[];
  fraudAndAbuseQueue: AdminFraudCaseItem[];
  providerPayoutQueue: AdminProviderPayoutItem[];
  contentModerationQueue: AdminContentModerationItem[];
  systemAlertsQueue: AdminSystemAlertItem[];
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export type NotificationType =
  | "donation_received"
  | "donation_confirmed"
  | "approval_required"
  | "campaign_approved"
  | "campaign_rejected"
  | "service_confirmed"
  | "funds_released"
  | "payout_completed"
  | "message"
  | "alert";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  resourceId?: string;
  read: boolean;
  createdAt: string;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export class AppError extends Error {
  code: string;
  statusCode: number;

  constructor(code: string, message: string, statusCode: number = 400) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}
