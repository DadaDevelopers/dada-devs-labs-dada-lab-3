import React from "react";
import DonationForm from "../components/feature/DonationForm";

export default function CampaignPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl text-[var(--color-text-light)] font-bold mb-4">
        Campaign
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[var(--color-secondary-bg)] p-6 rounded-lg">
          {/* Campaign details placeholder */}
          <p className="text-white/70">Campaign details will be shown here.</p>
        </div>
        <div>
          <DonationForm />
        </div>
      </div>
    </div>
  );
}
