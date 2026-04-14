import { useNavigate } from "react-router-dom";
import { FileText, TrendingUp, AlertTriangle, ChevronRight } from "lucide-react";

interface FilingCardProps {
  type: string;
  title: string;
  description: string;
  icon: "annual" | "quarterly" | "current";
  status?: {
    document_count: number;
    status: string;
    risk_level: string | null;
  };
  delay?: number;
}

const iconMap = {
  annual: FileText,
  quarterly: TrendingUp,
  current: AlertTriangle,
};

const labelMap = {
  annual: "Annual",
  quarterly: "Quarterly",
  current: "Current",
};

export function FilingCard({ type, title, description, icon, status, delay = 0 }: FilingCardProps) {
  const navigate = useNavigate();
  const Icon = iconMap[icon];
  const label = labelMap[icon];

  return (
    <button
      onClick={() => navigate(`/filing/${type}`)}
      className="group w-full text-left animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="relative overflow-hidden rounded-sm border border-border bg-card p-6 transition-all duration-200 hover:border-primary/60 hover:bg-muted/30">
        {/* Subtle left-border accent on hover */}
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform duration-200 origin-top" />

        <div className="relative">
          {/* Icon row */}
          <div className="flex items-start justify-between mb-5">
            <div className="w-10 h-10 rounded-sm bg-secondary border border-border flex items-center justify-center text-primary">
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground tracking-widest uppercase font-semibold">{label}</span>
              {status && status.document_count > 0 && (
                <span className={`text-xs font-mono px-2 py-0.5 rounded-sm border ${
                  status.risk_level === "LOW"    ? "border-emerald-500/30 bg-emerald-500/8 text-emerald-400" :
                  status.risk_level === "MEDIUM" ? "border-amber-500/30 bg-amber-500/8 text-amber-400" :
                  status.risk_level === "HIGH"   ? "border-rose-500/30 bg-rose-500/8 text-rose-400" :
                  "border-border bg-muted text-muted-foreground"
                }`}>
                  {status.status}
                </span>
              )}
            </div>
          </div>

          {/* Title */}
          <h3
            className="text-xl text-foreground mb-2"
            style={{ fontFamily: "'Source Serif 4', serif", fontWeight: 700 }}
          >
            {title}
          </h3>

          {/* Description */}
          <p className="text-xs text-muted-foreground leading-relaxed mb-5">{description}</p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <span className="text-xs text-muted-foreground font-mono">
              {status && status.document_count > 0
                ? `${status.document_count} document${status.document_count !== 1 ? "s" : ""} on file`
                : "No documents on file"}
            </span>
            <div className="flex items-center gap-1 text-primary text-xs font-semibold tracking-wide uppercase opacity-0 group-hover:opacity-100 transition-opacity">
              Open <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
