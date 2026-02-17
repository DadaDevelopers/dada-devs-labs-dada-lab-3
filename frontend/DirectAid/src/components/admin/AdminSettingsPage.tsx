import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui/Button";

export default function AdminSettingsPage() {
  const { user, updateProfile } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setFirstName((user as { firstName?: string }).firstName ?? user.name ?? "");
      setLastName((user as { lastName?: string }).lastName ?? "");
      setEmail(user.email ?? "");
      setPhoneNumber((user as { phoneNumber?: string }).phoneNumber ?? "");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSaving(true);
    const { ok, error } = await updateProfile({
      firstName: firstName.trim() || undefined,
      lastName: lastName.trim() || undefined,
      email: email.trim() || undefined,
      phoneNumber: phoneNumber.trim() || undefined,
    });
    setSaving(false);
    if (ok) setMessage({ type: "success", text: "Profile updated. Your name will appear in the top bar." });
    else setMessage({ type: "error", text: error ?? "Update failed." });
  };

  return (
    <div className="max-w-xl space-y-6">
      <h2 className="text-2xl font-bold tracking-tight text-white">Profile settings</h2>
      <p className="text-slate-400 text-sm">Update your name and contact details. Your name appears in the top right of the admin dashboard.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">First name</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-slate-500 focus:border-amber-400/50 focus:outline-none"
            placeholder="First name"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Last name</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-slate-500 focus:border-amber-400/50 focus:outline-none"
            placeholder="Last name"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-slate-500 focus:border-amber-400/50 focus:outline-none"
            placeholder="Email"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Phone</label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-slate-500 focus:border-amber-400/50 focus:outline-none"
            placeholder="Phone number"
          />
        </div>
        {message && (
          <p className={`text-sm ${message.type === "success" ? "text-emerald-400" : "text-rose-400"}`}>
            {message.text}
          </p>
        )}
        <Button type="submit" disabled={saving} className="bg-amber-500 text-black hover:bg-amber-400">
          {saving ? "Saving…" : "Save profile"}
        </Button>
      </form>
    </div>
  );
}
