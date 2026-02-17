import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useBeneficiaryCampaigns } from "../../hooks/useBeneficiaryApi";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/card";
import { getCampaignDeadlineDisplay } from "../../lib/utils";
import {
  LayoutDashboard,
  DollarSign,
  FileText,
  PlusCircle,
  FolderKanban,
  MapPin,
  Clock,
  Eye,
  User,
  Bell,
  Lock,
} from "lucide-react";
import type { BeneficiaryCampaign } from "../../hooks/useBeneficiaryApi";

type FilterType = "all" | "pending" | "active";

export default function BeneficiaryCampaignsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { campaigns, loading, error } = useBeneficiaryCampaigns();
  const [filter, setFilter] = useState<FilterType>("all");

  const navItems = [
    { label: "Dashboard", href: "/beneficiary", icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: "Campaigns", href: "/beneficiary/campaigns", icon: <FolderKanban className="w-5 h-5" /> },
    { label: "Funds Received", href: "/beneficiary/funds", icon: <DollarSign className="w-5 h-5" /> },
    { label: "Reporting", href: "/beneficiary/reporting", icon: <FileText className="w-5 h-5" /> },
  ];

  const settingsNavItems = [
    { id: "profile", label: "Profile", href: "/beneficiary/settings/profile", icon: <User className="w-5 h-5" /> },
    { id: "address", label: "Address", href: "/beneficiary/settings/address", icon: <MapPin className="w-5 h-5" /> },
    { id: "notifications", label: "Notifications", href: "/beneficiary/settings/notifications", icon: <Bell className="w-5 h-5" /> },
    { id: "change-password", label: "Change Password", href: "/beneficiary/settings/change-password", icon: <Lock className="w-5 h-5" /> },
  ];

  const filteredCampaigns = campaigns.filter((c: BeneficiaryCampaign) => {
    if (filter === "all") return true;
    const adminStatus = (c as any).adminStatus;
    if (filter === "pending") return adminStatus === "pending";
    if (filter === "active") return adminStatus !== "pending";
    return true;
  });

  const displayStatus = (c: BeneficiaryCampaign) =>
    (c as any).adminStatus === "pending" ? "Pending" : (c as any).status ?? "Active";

  const userName = user?.firstName || user?.name || user?.email || "User";

  return (
    <DashboardLayout
      navItems={navItems}
      userName={userName}
      userRole="Aid Beneficiary"
      settingsNavItems={settingsNavItems}
      onLogout={async () => {
        await logout();
        navigate("/");
      }}
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight">My Campaigns</h1>
          <Button
            onClick={() => navigate("/campaigns/create")}
            className="gap-2"
          >
            <PlusCircle className="w-5 h-5" />
            Create campaign
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {(["all", "pending", "active"] as FilterType[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {f === "all" ? "All" : f === "pending" ? "Pending" : "Active"}
            </button>
          ))}
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-muted-foreground">Loading campaigns…</div>
        ) : filteredCampaigns.length === 0 ? (
          <Card className="p-12 text-center">
            <FolderKanban className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">
              {filter === "all" ? "You have no campaigns yet." : `No ${filter} campaigns.`}
            </p>
            <Button onClick={() => navigate("/campaigns/create")} className="gap-2">
              <PlusCircle className="w-5 h-5" />
              Create campaign
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCampaigns.map((campaign: BeneficiaryCampaign) => {
              const id = campaign.id ?? campaign._id ?? (campaign as any).publicId;
              const target = Number(campaign.targetAmount ?? 0);
              const raised = Number(campaign.amountRaised ?? 0);
              const percent = target > 0 ? Math.min(100, (raised / target) * 100) : 0;
              return (
                <Card key={id} className="p-5 flex flex-col">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <h3 className="font-semibold line-clamp-2">{campaign.title}</h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                        (campaign as any).adminStatus === "pending"
                          ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                          : "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {displayStatus(campaign)}
                    </span>
                  </div>
                  {(campaign as any).metadata?.location && (
                    <p className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                      <MapPin className="w-3 h-3" />
                      {(campaign as any).metadata.location}
                    </p>
                  )}
                  <p className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                    <Clock className="w-3 h-3" />
                    {getCampaignDeadlineDisplay(campaign)}
                  </p>
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Raised</span>
                      <span className="font-medium">
                        {raised.toLocaleString()} / {target.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-auto gap-2"
                    onClick={() => navigate(`/campaigns/${id}`)}
                  >
                    <Eye className="w-4 h-4" />
                    View details
                  </Button>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
