/* CORE LEDGER (Single Source of Truth)
LedgerEntry (Double-Entry Accounting/rows (debit/credit)) */
const LedgerEntrySchema = new mongoose.Schema({
  transactionId: { type: mongoose.Schema.Types.ObjectId, index: true },

  account: {
    type: String,
    enum: [
      "USER_WALLET",
      "CAMPAIGN_ESCROW",
      "PROVIDER_BALANCE",
      "PLATFORM_REVENUE",
      "TAX_PAYABLE_VAT",
      "TAX_PAYABLE_WHT",
      "REFUND_LIABILITY",
      "PAYMENT_GATEWAY_CLEARING"
    ],
    index: true
  },

  debit: { type: mongoose.Schema.Types.Decimal128, default: 0 },
  credit:{ type: mongoose.Schema.Types.Decimal128, default: 0 },

  currency: { type: String, default: "KES" },
  metadata: Object
}, { timestamps: true });

/*Every transaction produces ≥2 ledger rows
System is provably balanced */