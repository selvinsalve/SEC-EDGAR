import { AuthForm } from "@/components/AuthForm";
import { Shield, FileCheck, BarChart3, Lock } from "lucide-react";

const features = [
  {
    icon: FileCheck,
    title: "Multi-Filing Analysis",
    desc: "Automated compliance review for 10-K, 10-Q, and 8-K filings with comprehensive redline generation.",
  },
  {
    icon: BarChart3,
    title: "Risk Assessment & Scoring",
    desc: "AI-powered risk scoring with section-level analysis and actionable remediation guidance.",
  },
  {
    icon: Lock,
    title: "Real-Time Processing",
    desc: "Instant document analysis via multi-agent RAG architecture, ensuring consistency across submissions.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Official gov top bar */}
      <div className="gov-topbar" />

      {/* Nav */}
      <nav className="border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-sm bg-primary/15 flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <div>
              <span className="text-base font-bold text-foreground tracking-wide" style={{ fontFamily: "'Source Serif 4', serif" }}>
                SEC<span className="text-primary">Comply</span>
              </span>
              <span className="hidden sm:inline text-xs text-muted-foreground ml-3 tracking-widest uppercase">
                Securities Compliance System
              </span>
            </div>
          </div>
          <span className="badge-official">Official Use Only</span>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — Hero copy */}
          <div className="animate-fade-in">
            <div className="badge-official inline-flex items-center gap-2 mb-8">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              SEC Compliance Dashboard · v1.0
            </div>

            <h1
              className="text-4xl lg:text-5xl text-foreground leading-tight mb-6"
              style={{ fontFamily: "'Source Serif 4', serif", fontWeight: 700 }}
            >
              Automated SEC Filing{" "}
              <span className="text-gradient-gov">Compliance Review</span>
            </h1>

            <p className="text-base text-muted-foreground leading-relaxed mb-10 max-w-lg border-l-2 border-primary/40 pl-4">
              A multi-agent AI system that analyzes, redlines, and ensures
              consistency across your SEC filings. Upload documents, review
              recommendations, and submit with regulatory confidence.
            </p>

            {/* Features list */}
            <div className="space-y-5">
              {features.map((f, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 animate-slide-up"
                  style={{ animationDelay: `${150 + i * 100}ms` }}
                >
                  <div className="w-9 h-9 rounded-sm bg-secondary border border-border flex items-center justify-center flex-shrink-0 mt-0.5">
                    <f.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-0.5">{f.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Official notice */}
            <div className="mt-10 p-4 bg-muted/50 border border-border rounded-sm">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="text-foreground font-semibold">NOTICE:</span>{" "}
                This system is intended for authorized personnel only. All
                activity is subject to monitoring in accordance with applicable
                federal regulations.
              </p>
            </div>
          </div>

          {/* Right — Auth */}
          <div className="animate-fade-in" style={{ animationDelay: "200ms" }}>
            <AuthForm />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="section-rule mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} SECComply · Securities Exchange Commission Compliance System
          </p>
          <p className="text-xs text-muted-foreground tracking-wide uppercase">
            Powered by Multi-Agent RAG Architecture
          </p>
        </div>
      </footer>
    </div>
  );
}
