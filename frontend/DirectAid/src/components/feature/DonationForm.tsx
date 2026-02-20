import React, { useState } from "react";
import { Button } from "../ui/Button";
import { useAuth } from "../../contexts/AuthContext";
import { donationService } from "../../services/donationService";

export default function DonationForm() {
  const { user } = useAuth();
  const [amount, setAmount] = useState<number | "">("");
  const [email, setEmail] = useState("");
  const [method, setMethod] = useState("lightning");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!amount || Number(amount) <= 0) {
      setMessage("Please enter a valid donation amount");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        amountFiat: Number(amount),
        currency: "USD",
        paymentMethod: method === "lightning" ? "BTC_LIGHTNING" : "BTC_ONCHAIN",
        payer: {
          email: user ? user.email : email || undefined,
          name: user?.firstName || user?.name || user?.email || "Guest",
        },
      };

      const res = await donationService.createDonation(payload);

      // For this lightweight form we don't drive a full Lightning/BTC flow;
      // we just surface that the intent was created successfully.
      const receiptId = (res && (res.receiptId || res.donationId)) as string | undefined;
      setMessage(
        receiptId
          ? `Donation created — reference ${receiptId}. Complete payment using the main flow to finalize.`
          : "Donation created. Complete payment using the main donation flow."
      );
      setAmount("");
      setEmail("");
    } catch {
      setMessage("Donation failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleDonate}
    >
      <h3 className="text-lg font-semibold text-[var(--color-text-light)]">
        Donate
      </h3>

      {
        !user && (
          <p className="text-sm text-white/70">
            You can donate as a guest — enter an email for a receipt, or{" "}
            <a className="text-[var(--color-accent)] underline" href="/signup">
              create an account
            </a>{" "}
            to save payment methods.
          </p>
        )
      }

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-[var(--color-text-light)] mb-1">
            Amount (USD)
          </label>
          <input
            type="number"
            className="w-full px-3 py-2 rounded bg-[#0f1620] border border-white/10 text-white"
            value={amount}
            onChange={(e) =>
              setAmount(e.target.value === "" ? "" : Number(e.target.value))
            }
            min={1}
          />
        </div>

        <div>
          <label className="block text-sm text-[var(--color-text-light)] mb-1">
            Receipt Email (optional)
          </label>
          <input
            type="email"
            className="w-full px-3 py-2 rounded bg-[#0f1620] border border-white/10 text-white"
            value={user ? user.email : email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            disabled={!!user}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-[var(--color-text-light)] mb-1">
          Payment Method
        </label>
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="w-full px-3 py-2 rounded bg-[#0f1620] border border-white/10 text-white"
        >
          <option value="lightning">Lightning</option>
          <option value="onchain">Bitcoin (On-Chain)</option>
        </select>
      </div>

      {message && <div className="text-sm text-white/80">{message}</div>}

      <Button type="submit" className="mt-4 btn-cta">
        {isSubmitting ? "Processing..." : "Donate"}
      </Button>
    </form>
  );
}
