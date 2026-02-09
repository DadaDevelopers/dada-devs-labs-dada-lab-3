import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import {
  LayoutDashboard,
  DollarSign,
  FileText,
  ArrowLeft,
  TrendingUp,
  User,
  MapPin,
  Bell,
  Lock,
  Pencil,
  X,
  Check,
} from "lucide-react";

interface CampaignData {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  targetAmount: number | string;
  currency?: string;
  category?: string;
  status?: string;
  amountRaised?: number;
  confirmationStatus?: string;
}

const BeneficiaryCampaignDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [campaign, setCampaign] = useState<CampaignData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<{ title: string; description: string; targetAmount: string; category: string }>({
    title: "",
    description: "",
    targetAmount: "",
    category: "",
  });

  const beneficiaryName = user?.firstName || user?.name || user?.email || "User";

  const navItems = [
    { label: "Dashboard", href: "/beneficiary", icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: "Campaigns", href: "/beneficiary/campaigns", icon: <TrendingUp className="w-5 h-5" /> },
    { label: "Funds Received", href: "/beneficiary/funds", icon: <DollarSign className="w-5 h-5" /> },
    { label: "Reporting", href: "/beneficiary/reporting", icon: <FileText className="w-5 h-5" /> },
  ];

  const settingsNavItems = [
    { id: "profile", label: "Profile", href: "/beneficiary/settings/profile", icon: <User className="w-5 h-5" /> },
    { id: "address", label: "Address", href: "/beneficiary/settings/address", icon: <MapPin className="w-5 h-5" /> },
    { id: "notifications", label: "Notifications", href: "/beneficiary/settings/notifications", icon: <Bell className="w-5 h-5" /> },
    { id: "change-password", label: "Change Password", href: "/beneficiary/settings/change-password", icon: <Lock className="w-5 h-5" /> },
  ];

  useEffect(() => {
    const cleanId = id?.trim();
    if (!cleanId) return;
    setLoading(true);
    setError(null);
    const setCampaignFromResponse = (res: any) => {
      const data = res?.data ?? res;
      const c = (data?.campaign ?? data) as CampaignData | undefined;
      if (!c) {
        setError("Campaign not found");
        setCampaign(null);
        return;
      }
      setCampaign(c);
      const target = c.targetAmount != null ? (typeof c.targetAmount === "number" ? c.targetAmount : parseFloat(String(c.targetAmount))) : 0;
      setForm({
        title: c.title ?? "",
        description: c.description ?? "",
        targetAmount: target ? String(target) : "",
        category: c.category ?? "",
      });
    };
    api
      .get(`/campaigns/${encodeURIComponent(cleanId)}`)
      .then(setCampaignFromResponse)
      .catch((err: any) => {
        if (err?.response?.status === 404 && cleanId) {
          return api
            .get(`/campaigns/${encodeURIComponent(cleanId)}?by=public`)
            .then(setCampaignFromResponse)
            .catch((e2: any) => {
              setError(e2?.response?.data?.message ?? "Campaign not found");
              setCampaign(null);
            });
        }
        setError(err?.response?.data?.message ?? "Failed to load campaign");
        setCampaign(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = () => {
    if (!id || !campaign) return;
    setSaving(true);
    const targetNum = form.targetAmount ? parseFloat(form.targetAmount) : undefined;
    api
      .put(`/campaigns/${id}`, {
        title: form.title,
        description: form.description,
        targetAmount: targetNum,
        category: form.category || undefined,
      })
      .then((res) => {
        const c = (res.data as { campaign?: CampaignData }).campaign;
        if (c) {
          setCampaign(c);
          const target = c.targetAmount != null ? (typeof c.targetAmount === "number" ? c.targetAmount : parseFloat(String(c.targetAmount))) : 0;
          setForm({
            title: c.title ?? "",
            description: c.description ?? "",
            targetAmount: target ? String(target) : "",
            category: c.category ?? "",
          });
        }
        setEditing(false);
      })
      .catch((err: any) => {
        setError(err?.response?.data?.message ?? "Failed to update campaign");
      })
      .finally(() => setSaving(false));
  };

  const displayTarget = campaign?.targetAmount != null
    ? (typeof campaign.targetAmount === "number" ? campaign.targetAmount : parseFloat(String(campaign.targetAmount)))
    : 0;
  const displayRaised = campaign?.amountRaised ?? 0;
  const progress = displayTarget > 0 ? Math.min(100, (displayRaised / displayTarget) * 100) : 0;

  return (
    <DashboardLayout
      navItems={navItems}
      userName={beneficiaryName}
      userRole="Aid Beneficiary"
      settingsNavItems={settingsNavItems}
      onLogout={async () => {
        await logout();
        navigate("/");
      }}
    >
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={() => navigate("/beneficiary/campaigns")}
            className="gap-2 rounded-lg w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Campaigns
          </Button>
        </div>

        {error && (
          <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/5" role="alert">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {loading ? (
          <Card className="p-8 sm:p-10 text-center rounded-xl border border-border">
            <p className="text-muted-foreground">Loading campaign…</p>
          </Card>
        ) : !campaign ? (
          <Card className="p-8 sm:p-10 text-center rounded-xl border border-border">
            <p className="text-muted-foreground mb-4">Campaign not found.</p>
            <Button onClick={() => navigate("/beneficiary/campaigns")} className="rounded-lg">
              Back to Campaigns
            </Button>
          </Card>
        ) : editing ? (
          <Card className="p-6 sm:p-8 rounded-xl border border-border shadow-sm">
            <h2 className="text-xl font-bold mb-6">Edit campaign</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Title</label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="rounded-lg px-4 py-2.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full min-h-[120px] px-4 py-3 border border-border rounded-lg bg-background text-foreground"
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Target amount</label>
                <Input
                  type="number"
                  min={0}
                  value={form.targetAmount}
                  onChange={(e) => setForm((f) => ({ ...f, targetAmount: e.target.value }))}
                  className="rounded-lg px-4 py-2.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Category</label>
                <Input
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  placeholder="e.g. Medical, Education"
                  className="rounded-lg px-4 py-2.5"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button onClick={handleSave} disabled={saving} className="gap-2 rounded-lg px-5 py-2.5">
                  <Check className="w-4 h-4" />
                  {saving ? "Saving…" : "Save"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditing(false)}
                  disabled={saving}
                  className="gap-2 rounded-lg px-5 py-2.5"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <>
            <Card className="p-6 sm:p-8 rounded-xl border border-border shadow-sm overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold mb-3 text-foreground leading-tight">
                    {campaign.title}
                  </h1>
                  {campaign.category && (
                    <span className="inline-block px-3 py-1.5 text-sm font-medium rounded-full bg-primary/10 text-primary border border-primary/20">
                      {campaign.category}
                    </span>
                  )}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setEditing(true)}
                  className="gap-2 rounded-lg shrink-0"
                >
                  <Pencil className="w-4 h-4" />
                  Edit
                </Button>
              </div>
              {campaign.description && (
                <p className="text-muted-foreground mt-5 text-base leading-relaxed whitespace-pre-wrap">
                  {campaign.description}
                </p>
              )}
            </Card>

            <Card className="p-6 sm:p-8 rounded-xl border border-border shadow-sm">
              <h2 className="text-lg font-semibold mb-5 text-foreground">Progress</h2>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Raised</span>
                  <span className="font-semibold text-foreground">
                    ${Number(displayRaised).toFixed(0)} / ${Number(displayTarget).toFixed(0)}
                  </span>
                </div>
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <div className="mt-5 pt-5 border-t border-border space-y-1">
                {campaign.status && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Status:</span> {campaign.status}
                  </p>
                )}
                {campaign.confirmationStatus && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Confirmation:</span> {campaign.confirmationStatus.replace(/_/g, " ")}
                  </p>
                )}
              </div>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BeneficiaryCampaignDetail;
