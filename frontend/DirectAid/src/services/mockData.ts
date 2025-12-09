import type {
  User,
  Provider,
  Beneficiary,
  Campaign,
  Donation,
  Invoice,
  AidRequest,
  PayoutMethod,
  WalletBalance,
  ProviderMetrics,
  BeneficiaryMetrics,
  DonorMetrics,
  Notification,
  DonationReceipt,
  Payout,
} from "../types";

// ============================================================================
// MOCK USERS
// ============================================================================

export const mockProviderUser: Provider = {
  id: "provider_001",
  email: "sarah.chen@globalrelief.org",
  name: "Sarah Chen",
  role: "provider",
  organizationName: "Global Relief Foundation",
  organizationType: "ngo",
  registrationNumber: "NGO-2019-45678",
  kycStatus: "verified",
  verificationDate: "2023-06-15",
  profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
  payoutMethods: [
    {
      id: "payout_001",
      type: "bank",
      details: {
        bankName: "Standard Chartered Bank",
        accountNumber: "****5678",
        accountHolder: "Global Relief Foundation",
      },
      isDefault: true,
      lastUsed: "2024-11-25",
    },
    {
      id: "payout_002",
      type: "mobile_money",
      details: {
        provider: "M-Pesa",
        phoneNumber: "****7890",
      },
      isDefault: false,
    },
  ],
  walletBalance: {
    locked: 420000, // in cents: $4,200
    available: 81000, // in cents: $8,100
    total: 501000, // in cents: $5,010
  },
  totalCampaigns: 12,
  totalFundsRaised: 24550000, // in cents: $245,500
  totalBeneficiaries: 1247,
  createdAt: "2023-01-10",
};

export const mockBeneficiaryUser: Beneficiary = {
  id: "beneficiary_001",
  email: "maria.rodriguez@email.com",
  name: "Maria Rodriguez",
  role: "beneficiary",
  phoneNumber: "+1234567890",
  location: "Lagos, Nigeria",
  campaigns: [],
  totalAidReceived: 850000, // in cents: $8,500
  status: "active",
  profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
  createdAt: "2024-09-01",
};

export const mockDonorUser: User = {
  id: "donor_001",
  email: "james.wilson@email.com",
  name: "James Wilson",
  role: "donor",
  profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
  createdAt: "2024-05-20",
};

// ============================================================================
// MOCK INVOICES
// ============================================================================

export const mockInvoices: Invoice[] = [
  {
    id: "invoice_001",
    providerId: "provider_001",
    invoiceNumber: "INV-2024-001",
    amount: 4500000, // $45,000
    currency: "USD",
    invoiceDate: "2024-11-01",
    dueDate: "2024-12-01",
    description: "Emergency Medical Supplies and Equipment",
    fileUrl: "https://example.com/invoices/inv-001.pdf",
    fileHash: "0x1234abcd5678efgh9012ijkl3456mnop",
    status: "approved",
    verifiedBy: "admin_001",
    verifiedAt: "2024-11-05",
    createdAt: "2024-11-01",
    updatedAt: "2024-11-05",
  },
  {
    id: "invoice_002",
    providerId: "provider_001",
    invoiceNumber: "INV-2024-002",
    amount: 7800000, // $78,000
    currency: "USD",
    invoiceDate: "2024-11-10",
    dueDate: "2024-12-10",
    description: "Clean Water Infrastructure - Pipe Installation",
    fileUrl: "https://example.com/invoices/inv-002.pdf",
    fileHash: "0xabcd1234efgh5678ijkl9012mnop3456",
    status: "approved",
    verifiedBy: "admin_001",
    verifiedAt: "2024-11-12",
    createdAt: "2024-11-10",
    updatedAt: "2024-11-12",
  },
  {
    id: "invoice_003",
    providerId: "provider_001",
    invoiceNumber: "INV-2024-003",
    amount: 2300000, // $23,000
    currency: "USD",
    invoiceDate: "2024-11-15",
    dueDate: "2024-12-15",
    description: "School Supplies Distribution for Refugee Children",
    fileUrl: "https://example.com/invoices/inv-003.pdf",
    fileHash: "0xefgh5678ijkl9012mnop3456abcd1234",
    status: "approved",
    verifiedBy: "admin_001",
    verifiedAt: "2024-11-18",
    createdAt: "2024-11-15",
    updatedAt: "2024-11-18",
  },
];

// ============================================================================
// MOCK CAMPAIGNS
// ============================================================================

export const mockCampaigns: Campaign[] = [
  {
    id: "campaign_001",
    providerId: "provider_001",
    provider: mockProviderUser,
    beneficiaryId: "beneficiary_001",
    beneficiary: mockBeneficiaryUser,
    invoiceId: "invoice_001",
    invoice: mockInvoices[0],
    title: "Emergency Food Supply - East Africa",
    description:
      "Providing essential food packages to families affected by severe drought in Kenya and Somalia.",
    category: "emergency",
    location: "Kenya & Somalia",
    targetAmount: 10000000, // $100,000
    amountRaised: 4500000, // $45,000
    donorCount: 342,
    status: "active",
    confirmationStatus: "both_confirmed",
    providerConfirmedAt: "2024-11-20",
    beneficiaryConfirmedAt: "2024-11-21",
    proofDocuments: [
      {
        id: "doc_001",
        name: "Drought Assessment Report",
        type: "application/pdf",
        url: "https://example.com/docs/drought-report.pdf",
        uploadedAt: "2024-11-01",
        uploadedBy: "beneficiary_001",
      },
    ],
    createdAt: "2024-11-01",
    updatedAt: "2024-11-21",
    launchedAt: "2024-11-01",
    fundraisingDeadline: "2025-01-29",
    progressPercentage: 45,
    donationTimeline: [
      {
        date: "2024-11-01",
        amount: 500000,
        donorCount: 10,
        cumulativeAmount: 500000,
      },
      {
        date: "2024-11-05",
        amount: 800000,
        donorCount: 25,
        cumulativeAmount: 1300000,
      },
      {
        date: "2024-11-10",
        amount: 1200000,
        donorCount: 60,
        cumulativeAmount: 2500000,
      },
      {
        date: "2024-11-15",
        amount: 1000000,
        donorCount: 100,
        cumulativeAmount: 3500000,
      },
      {
        date: "2024-11-20",
        amount: 1000000,
        donorCount: 147,
        cumulativeAmount: 4500000,
      },
    ],
  },
  {
    id: "campaign_002",
    providerId: "provider_001",
    provider: mockProviderUser,
    beneficiaryId: "beneficiary_002",
    beneficiary: {
      ...mockBeneficiaryUser,
      id: "beneficiary_002",
      name: "Ahmed Hassan",
    },
    invoiceId: "invoice_002",
    invoice: mockInvoices[1],
    title: "Clean Water Infrastructure",
    description:
      "Building sustainable water wells in rural communities lacking access to clean drinking water.",
    category: "emergency",
    location: "Uganda",
    targetAmount: 12000000, // $120,000
    amountRaised: 7800000, // $78,000
    donorCount: 589,
    status: "active",
    confirmationStatus: "provider_confirmed",
    providerConfirmedAt: "2024-11-22",
    proofDocuments: [
      {
        id: "doc_002",
        name: "Water Quality Test Report",
        type: "application/pdf",
        url: "https://example.com/docs/water-test.pdf",
        uploadedAt: "2024-11-10",
        uploadedBy: "beneficiary_002",
      },
    ],
    createdAt: "2024-11-10",
    updatedAt: "2024-11-10",
    launchedAt: "2024-11-10",
    fundraisingDeadline: "2025-02-08",
    progressPercentage: 32,
    donationTimeline: [
      {
        date: "2024-11-10",
        amount: 1000000,
        donorCount: 50,
        cumulativeAmount: 1000000,
      },
      {
        date: "2024-11-12",
        amount: 1500000,
        donorCount: 100,
        cumulativeAmount: 2500000,
      },
      {
        date: "2024-11-15",
        amount: 2000000,
        donorCount: 150,
        cumulativeAmount: 4500000,
      },
      {
        date: "2024-11-18",
        amount: 1800000,
        donorCount: 189,
        cumulativeAmount: 6300000,
      },
      {
        date: "2024-11-22",
        amount: 1500000,
        donorCount: 150,
        cumulativeAmount: 7800000,
      },
    ],
  },
  {
    id: "campaign_003",
    providerId: "provider_001",
    provider: mockProviderUser,
    beneficiaryId: "beneficiary_003",
    beneficiary: {
      ...mockBeneficiaryUser,
      id: "beneficiary_003",
      name: "Grace Okonkwo",
    },
    invoiceId: "invoice_003",
    invoice: mockInvoices[2],
    title: "School Supplies for Refugees",
    description:
      "Distributing educational materials and supplies to refugee children in temporary settlements.",
    category: "education",
    location: "South Sudan",
    targetAmount: 5000000, // $50,000
    amountRaised: 2300000, // $23,000
    donorCount: 156,
    status: "active",
    confirmationStatus: "pending",
    proofDocuments: [
      {
        id: "doc_003",
        name: "School Registration Certificate",
        type: "application/pdf",
        url: "https://example.com/docs/school-cert.pdf",
        uploadedAt: "2024-11-15",
        uploadedBy: "beneficiary_003",
      },
    ],
    createdAt: "2024-11-15",
    updatedAt: "2024-11-15",
    launchedAt: "2024-11-15",
    fundraisingDeadline: "2025-02-13",
    progressPercentage: 28,
    donationTimeline: [
      {
        date: "2024-11-15",
        amount: 500000,
        donorCount: 30,
        cumulativeAmount: 500000,
      },
      {
        date: "2024-11-17",
        amount: 700000,
        donorCount: 50,
        cumulativeAmount: 1200000,
      },
      {
        date: "2024-11-20",
        amount: 600000,
        donorCount: 76,
        cumulativeAmount: 1800000,
      },
      {
        date: "2024-11-22",
        amount: 500000,
        donorCount: 156,
        cumulativeAmount: 2300000,
      },
    ],
  },
];

// ============================================================================
// MOCK DONATIONS
// ============================================================================

export const mockDonations: Donation[] = [
  {
    id: "donation_001",
    campaignId: "campaign_001",
    campaign: mockCampaigns[0],
    donorId: "donor_001",
    donor: mockDonorUser,
    amount: 50000, // $500
    amountUSD: 50000,
    amountSats: 1189000,
    currency: "USD",
    paymentMethod: "lightning",
    status: "released",
    paymentRef: "LN-INV-2024-001",
    transactionHash:
      "0xabcd1234efgh5678ijkl9012mnop3456abcd1234efgh5678ijkl9012mnop3456",
    isAnonymous: false,
    coversPlatformFees: false,
    receiptUrl: "https://example.com/receipts/receipt_001.pdf",
    receiptGeneratedAt: "2024-11-25T14:30:00Z",
    createdAt: "2024-11-25T14:20:00Z",
    processedAt: "2024-11-25T14:25:00Z",
    releasedAt: "2024-11-25T14:30:00Z",
  },
  {
    id: "donation_002",
    campaignId: "campaign_001",
    campaign: mockCampaigns[0],
    donorId: "donor_002",
    donor: { ...mockDonorUser, id: "donor_002", name: "Sarah Ahmed" },
    amount: 25000, // $250
    amountUSD: 25000,
    amountSats: 594500,
    currency: "USD",
    paymentMethod: "card",
    status: "released",
    paymentRef: "CARD-2024-001",
    transactionHash:
      "0xefgh5678ijkl9012mnop3456abcd1234efgh5678ijkl9012mnop3456abcd1234",
    isAnonymous: false,
    coversPlatformFees: true,
    receiptUrl: "https://example.com/receipts/receipt_002.pdf",
    receiptGeneratedAt: "2024-11-18T10:15:00Z",
    createdAt: "2024-11-18T10:00:00Z",
    processedAt: "2024-11-18T10:05:00Z",
    releasedAt: "2024-11-18T10:15:00Z",
  },
  {
    id: "donation_003",
    campaignId: "campaign_001",
    campaign: mockCampaigns[0],
    donorId: "donor_003",
    donor: { ...mockDonorUser, id: "donor_003", name: "Anonymous" },
    amount: 15000, // $150
    amountUSD: 15000,
    amountSats: 356700,
    currency: "USD",
    paymentMethod: "lightning",
    status: "released",
    paymentRef: "LN-INV-2024-003",
    isAnonymous: true,
    coversPlatformFees: false,
    receiptUrl: "https://example.com/receipts/receipt_003.pdf",
    receiptGeneratedAt: "2024-11-10T08:45:00Z",
    createdAt: "2024-11-10T08:30:00Z",
    processedAt: "2024-11-10T08:35:00Z",
    releasedAt: "2024-11-10T08:45:00Z",
  },
  {
    id: "donation_004",
    campaignId: "campaign_002",
    campaign: mockCampaigns[1],
    donorId: "donor_001",
    donor: mockDonorUser,
    amount: 30000, // $300
    amountUSD: 30000,
    amountSats: 713400,
    currency: "USD",
    paymentMethod: "mobile_money",
    status: "released",
    paymentRef: "MM-2024-001",
    isAnonymous: false,
    coversPlatformFees: false,
    receiptUrl: "https://example.com/receipts/receipt_004.pdf",
    receiptGeneratedAt: "2024-11-05T16:20:00Z",
    createdAt: "2024-11-05T16:00:00Z",
    processedAt: "2024-11-05T16:10:00Z",
    releasedAt: "2024-11-05T16:20:00Z",
  },
];

// ============================================================================
// MOCK PAYOUTS
// ============================================================================

export const mockPayouts: Payout[] = [
  {
    id: "payout_001",
    providerId: "provider_001",
    amount: 15000000, // $150,000
    currency: "USD",
    payoutMethod: {
      id: "payout_001",
      type: "bank",
      details: {
        bankName: "Standard Chartered Bank",
        accountNumber: "****5678",
        accountHolder: "Global Relief Foundation",
      },
      isDefault: true,
    },
    status: "completed",
    transactionRef: "PAYOUT-2024-001",
    completedAt: "2024-11-25T18:00:00Z",
    campaignId: "campaign_001",
    createdAt: "2024-11-25T10:00:00Z",
    updatedAt: "2024-11-25T18:00:00Z",
  },
  {
    id: "payout_002",
    providerId: "provider_001",
    amount: 8500000, // $85,000
    currency: "USD",
    payoutMethod: {
      id: "payout_002",
      type: "mobile_money",
      details: {
        provider: "M-Pesa",
        phoneNumber: "****7890",
      },
      isDefault: false,
    },
    status: "processing",
    transactionRef: "PAYOUT-2024-002",
    estimatedArrival: "2024-11-27T10:00:00Z",
    campaignId: "campaign_002",
    createdAt: "2024-11-20T14:30:00Z",
    updatedAt: "2024-11-22T08:00:00Z",
  },
  {
    id: "payout_003",
    providerId: "provider_001",
    amount: 12000000, // $120,000
    currency: "USD",
    payoutMethod: {
      id: "payout_001",
      type: "bank",
      details: {
        bankName: "Standard Chartered Bank",
        accountNumber: "****5678",
        accountHolder: "Global Relief Foundation",
      },
      isDefault: true,
    },
    status: "pending",
    transactionRef: "PAYOUT-2024-003",
    estimatedArrival: "2024-12-01T12:00:00Z",
    campaignId: "campaign_003",
    createdAt: "2024-11-18T09:00:00Z",
    updatedAt: "2024-11-18T09:00:00Z",
  },
];

// ============================================================================
// MOCK NOTIFICATIONS
// ============================================================================

export const mockNotifications: Notification[] = [
  {
    id: "notif_001",
    userId: "provider_001",
    type: "donation_received",
    title: "New Donation",
    message: "New donation of $500 to Emergency Food Supply",
    resourceId: "donation_001",
    read: false,
    createdAt: "2024-11-25T14:20:00Z",
  },
  {
    id: "notif_002",
    userId: "provider_001",
    type: "approval_required",
    title: "Service Confirmation",
    message: "Maria Rodriguez confirmed service access",
    resourceId: "campaign_001",
    read: false,
    createdAt: "2024-11-21T10:30:00Z",
  },
  {
    id: "notif_003",
    userId: "provider_001",
    type: "donation_received",
    message: "New donation of $250 to Clean Water Infrastructure",
    title: "Donation Alert",
    resourceId: "donation_004",
    read: true,
    createdAt: "2024-11-05T16:00:00Z",
  },
];

// ============================================================================
// MOCK METRICS
// ============================================================================

export const mockProviderMetrics: ProviderMetrics = {
  totalCampaigns: 12,
  activeCampaigns: 3,
  totalFundsRaised: 24550000, // $245,500
  pendingApprovals: 2,
  activeDonors: 1247,
  walletBalance: mockProviderUser.walletBalance,
};

export const mockBeneficiaryMetrics: BeneficiaryMetrics = {
  totalAidReceived: 850000, // $8,500
  totalDisbursements: 250000, // $2,500
  campaignsSupportingYou: 1,
  familiesHelped: 45,
  childrenEducated: 67,
  medicalTreatments: 89,
};

export const mockDonorMetrics: DonorMetrics = {
  totalDonated: 425000, // $4,250
  activeRecurrings: 3,
  campaignsSupportedd: 12,
  livesImpacted: 347,
  countriesHelped: 8,
};

// ============================================================================
// EXPORT ALL DATA AS A SERVICE
// ============================================================================

export const mockDataService = {
  // Users
  getProviderUser: () => mockProviderUser,
  getBeneficiaryUser: () => mockBeneficiaryUser,
  getDonorUser: () => mockDonorUser,

  // Data getters
  getCampaigns: () => mockCampaigns,
  getCampaignById: (id: string) => mockCampaigns.find((c) => c.id === id),
  getDonations: () => mockDonations,
  getDonationsByCampaign: (campaignId: string) =>
    mockDonations.filter((d) => d.campaignId === campaignId),
  getInvoices: () => mockInvoices,
  getPayouts: () => mockPayouts,
  getNotifications: () => mockNotifications,

  // Get users by ID
  getProviderById: (id: string) => {
    if (id === mockProviderUser.id) return mockProviderUser;
    return null;
  },
  getBeneficiaryById: (id: string) => {
    if (id === mockBeneficiaryUser.id) return mockBeneficiaryUser;
    return null;
  },
  getDonorById: (id: string) => {
    if (id === mockDonorUser.id) return mockDonorUser;
    return null;
  },

  // Metrics
  getProviderMetrics: () => mockProviderMetrics,
  getBeneficiaryMetrics: () => mockBeneficiaryMetrics,
  getDonorMetrics: () => mockDonorMetrics,

  // Derived data
  getPendingApprovals: () =>
    mockCampaigns.filter((c) => c.confirmationStatus === "pending"),
  getActiveNotifications: () => mockNotifications.filter((n) => !n.read),
  getCompletedCampaigns: () =>
    mockCampaigns.filter((c) => c.status === "completed"),
};
