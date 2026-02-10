import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useBeneficiaryCampaigns, useBeneficiaryMetrics } from "../../hooks/useBeneficiaryApi";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import {
  LayoutDashboard,
  DollarSign,
  FileText,
  FolderKanban,
  ArrowLeft,
  Search,
  Calendar,
  TrendingUp,
  Download,
  Eye,
  CheckCircle,
  Clock,
  User,
  MapPin,
  Bell,
  Lock,
} from "lucide-react";

const BeneficiaryFunds = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { campaigns: userCampaigns, loading: campaignsLoading, error: campaignsError } = useBeneficiaryCampaigns();
  const { metrics, loading: metricsLoading, error: metricsError } = useBeneficiaryMetrics();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const beneficiaryName = user?.firstName || user?.name || user?.email || "User";

  // Disbursements: backend endpoint not yet implemented — show empty until GET /api/beneficiaries/me/disbursements exists
  const disbursements: Array<{
    id: string;
    campaignId?: string;
    amount: number;
    status: string;
    disbursedAt: string;
    description: string;
    transactionRef: string;
  }> = [];

  const filteredDisbursements = disbursements.filter((d) => {
    const campaign = userCampaigns.find((c) => c.id === d.campaignId);
    const matchesSearch = campaign?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || d.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">
              Funds Received
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Track all fund disbursements and their status
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate("/beneficiary")}
            className="gap-2 rounded-full w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </div>

        {(campaignsError || metricsError) && (
          <p className="text-sm text-destructive" role="alert">
            {campaignsError || metricsError}
          </p>
        )}
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card className="p-4 sm:p-6 card-elevated">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-green-100">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Received</p>
                <p className="text-2xl font-bold">
                  {metricsLoading ? "…" : `$${Number(metrics?.totalAidReceived ?? 0).toFixed(0)}`}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-6 card-elevated">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-blue-100">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Disbursements</p>
                <p className="text-2xl font-bold">
                  {metricsLoading ? "…" : `$${Number(metrics?.totalDisbursements ?? 0).toFixed(0)}`}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-6 card-elevated">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-purple-100">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Campaigns</p>
                <p className="text-2xl font-bold">{campaignsLoading ? "…" : userCampaigns.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg bg-background"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
            </select>
          </div>
        </Card>

        {/* Disbursements List */}
        <div className="space-y-4">
          {filteredDisbursements.length > 0 ? (
            filteredDisbursements.map((disbursement) => {
              const campaign = userCampaigns.find((c) => c.id === disbursement.campaignId);
              return (
                <Card key={disbursement.id} className="p-4 sm:p-6 card-elevated">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                          <DollarSign className="w-5 h-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-lg mb-1 truncate">
                            {campaign?.title || "Campaign"}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {disbursement.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(disbursement.disbursedAt).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              Ref: {disbursement.transactionRef}
                            </span>
                            <span className={`px-2 py-1 rounded-full ${
                              disbursement.status === 'completed' ? 'bg-green-100 text-green-700' :
                              disbursement.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {disbursement.status === 'completed' && <CheckCircle className="w-3 h-3 inline mr-1" />}
                              {disbursement.status === 'pending' && <Clock className="w-3 h-3 inline mr-1" />}
                              {disbursement.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                      <div className="sm:text-right">
                        <p className="font-bold text-xl">
                          ${(disbursement.amount / 100).toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Disbursed
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                          onClick={() => navigate(`/campaigns/${campaign?.id}`)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {disbursement.status === 'completed' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-full"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          ) : (
            <Card className="p-8 text-center">
              <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">No disbursements found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || filterStatus !== "all"
                  ? "Try adjusting your search or filters"
                  : "No disbursements yet. Disbursements will appear here once funds are released from your campaigns."
                }
              </p>
              <Button
                onClick={() => navigate("/beneficiary")}
                className="btn-cta rounded-full"
              >
                Back to Dashboard
              </Button>
            </Card>
          )}
        </div>

        {/* Monthly Breakdown — driven by GET /api/beneficiaries/me/disbursements (see BACKEND_HANDOFF_BENEFICIARY.md) */}
        <Card className="p-4 sm:p-6 card-elevated">
          <h2 className="text-xl font-bold mb-4">Monthly breakdown</h2>
          {filteredDisbursements.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(() => {
                const byMonth = new Map<string, { amount: number; count: number }>();
                filteredDisbursements.forEach((d) => {
                  const month = new Date(d.disbursedAt).toLocaleString("default", { month: "long", year: "numeric" });
                  const prev = byMonth.get(month) ?? { amount: 0, count: 0 };
                  const amt = typeof d.amount === "number" ? d.amount : Number(d.amount) || 0;
                  byMonth.set(month, { amount: prev.amount + amt, count: prev.count + 1 });
                });
                return Array.from(byMonth.entries())
                  .slice(0, 6)
                  .map(([month, { amount, count }]) => (
                    <div key={month} className="p-4 rounded-xl bg-[var(--color-secondary-bg)] border border-white/10">
                      <p className="text-sm text-[var(--color-text-light)]/70 mb-1">{month}</p>
                      <p className="text-xl font-bold text-[var(--color-text-light)]">${Number(amount).toFixed(0)}</p>
                      <p className="text-xs text-[var(--color-accent)]">{count} disbursement{count !== 1 ? "s" : ""}</p>
                    </div>
                  ));
              })()}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4">
              Monthly breakdown will appear here once disbursements are available. It is derived from the disbursements list when the backend implements <code className="text-xs bg-muted px-1 rounded">GET /api/beneficiaries/me/disbursements</code>.
            </p>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default BeneficiaryFunds;
