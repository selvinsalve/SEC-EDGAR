import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient, type DashboardResponse } from "@/lib/api";
import { FilingCard } from "@/components/FilingCard";
import { Shield, LogOut, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const FILINGS = [
  {
    type: "10-K",
    title: "Form 10-K",
    description: "Annual report providing a comprehensive overview of the company's business and financial condition. Includes audited financial statements, management discussion, and risk factors.",
    icon: "annual" as const,
  },
  {
    type: "10-Q",
    title: "Form 10-Q",
    description: "Quarterly report with unaudited financial statements. Provides a continuing view of the company's financial position during the fiscal year.",
    icon: "quarterly" as const,
  },
  {
    type: "8-K",
    title: "Form 8-K",
    description: "Current report filed to announce material events that shareholders must be informed of, including leadership changes, material agreements, and other significant developments.",
    icon: "current" as const,
  },
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getDashboard();
      setDashboard(data);
    } catch {
      // Backend may not be running
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Gov top bar */}
      <div className="gov-topbar" />

      {/* Top navigation */}
      <nav className="border-b border-border sticky top-0 z-50 bg-background/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-sm bg-primary/15 flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <span
              className="text-base font-bold text-foreground tracking-wide"
              style={{ fontFamily: "'Source Serif 4', serif" }}
            >
              SEC<span className="text-primary">Comply</span>
            </span>
            <span className="hidden md:block section-rule pl-4 ml-2 text-xs text-muted-foreground tracking-widest uppercase">
              Compliance Dashboard
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-foreground">{user?.user_id}</p>
              <p className="text-xs text-muted-foreground">{user?.company}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchDashboard}
              className="text-muted-foreground hover:text-foreground"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="text-muted-foreground hover:text-destructive"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Page header */}
        <div className="mb-10 animate-fade-in pb-6 border-b border-border">
          <p className="badge-official inline-flex mb-3">Securities & Exchange Commission</p>
          <h1
            className="text-3xl text-foreground mb-2"
            style={{ fontFamily: "'Source Serif 4', serif", fontWeight: 700 }}
          >
            Filing Compliance Center
          </h1>
          <p className="text-muted-foreground text-sm">
            Select a filing type below to upload documents and initiate compliance analysis. All submissions are reviewed by the multi-agent AI system.
          </p>
        </div>

        {/* Filing Cards */}
        <div className="grid md:grid-cols-3 gap-5">
          {FILINGS.map((filing, i) => (
            <FilingCard
              key={filing.type}
              type={filing.type}
              title={filing.title}
              description={filing.description}
              icon={filing.icon}
              status={dashboard?.filings?.[filing.type]}
              delay={i * 100}
            />
          ))}
        </div>

        {/* Info panel */}
        <div className="mt-10 p-5 bg-muted/40 border border-border rounded-sm animate-slide-up" style={{ animationDelay: "400ms" }}>
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="text-foreground font-semibold">System Notice:</span>{" "}
            All filing analyses are processed in accordance with SEC regulations. Documents uploaded to this system are subject to automated review and may be flagged for manual inspection. Contact your compliance officer if you have questions regarding a specific filing.
          </p>
        </div>
      </div>
    </div>
  );
}
