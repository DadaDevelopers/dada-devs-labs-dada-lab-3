// ============================================================================
// USER & AUTHENTICATION TYPES
// ============================================================================

export type UserRole =
  | "donor"
  | "provider"
  | "beneficiary"
  | "admin"
  | "verifier"
  | "ngo";

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

export type ProviderType = "hospital" | "school" | "pharmacy" | "ngo" | "other";
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

export type CampaignStatus =
  | "draft"
  | "pending_approval"
  | "active"
  | "completed"
  | "cancelled"
  | "paused";
export type ConfirmationStatus =
  | "pending"
  | "provider_confirmed"
  | "both_confirmed"
  | "disputed";

export interface Campaign {
  id: string;
  providerId: string;
  provider: Partial<Provider>;
  beneficiaryId: string;
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

  // Confirmation Model
  confirmationStatus: ConfirmationStatus;
  providerConfirmedAt?: string;
  beneficiaryConfirmedAt?: string;

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
  | "disputed";
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
