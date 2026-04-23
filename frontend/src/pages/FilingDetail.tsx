import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiClient, type FilingStatusResponse } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Upload, Loader2, CheckCircle, AlertTriangle, Shield, Download, RefreshCw, BarChart3, FileSearch } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RedlineItem } from "@/components/RedlineItem";
import { FinancialDashboard } from "@/components/FinancialDashboard";
import { PDFPreviewPane } from "@/components/PDFPreviewPane";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const filingNames: Record<string, string> = {
  "10-K": "Form 10-K — Annual Report",
  "10-Q": "Form 10-Q — Quarterly Report",
  "8-K": "Form 8-K — Current Report",
};

export default function FilingDetail() {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<FilingStatusResponse | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  useEffect(() => {
    if (!type) return;

    // Initial fetch
    apiClient.getFilingStatus(type).then(setStatus).catch(() => { }).finally(() => setLoading(false));

    // Polling for processing status
    const interval = setInterval(() => {
      if (status?.status === "Processing") {
        apiClient.getFilingStatus(type).then(setStatus).catch(console.error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [type, status?.status]);

  // Fetch analytics when risk becomes LOW
  useEffect(() => {
    if (status?.risk_level === "LOW" && !analyticsData && !analyticsLoading && type) {
      setAnalyticsLoading(true);
      fetch(`http://localhost:8000/api/analytics/${type}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("sec_auth") ? JSON.parse(localStorage.getItem("sec_auth")!).token : ""}`
        }
      })
        .then(res => res.json())
        .then(data => {
          setAnalyticsData(data);
        })
        .catch(console.error)
        .finally(() => setAnalyticsLoading(false));
    }
  }, [status?.risk_level, type]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !type) return;

    setUploading(true);
    setAnalyticsData(null); // Reset when new doc uploaded
    try {
      const res = await apiClient.uploadFiling(type, file);
      setStatus(res as any);
      toast({ title: "Document Uploaded", description: "Full-document compliance scan started in the background." });
    } catch (err: any) {
      toast({ title: "Upload Failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveRedline = async (index: number, newText: string) => {
    if (!type) return;
    await apiClient.editRedline(type, index, newText);
    // Optimistic update
    if (status && status.redlines) {
      const updated = [...status.redlines];
      updated[index] = { ...updated[index], suggested: newText, proposed_text: newText, text: newText };
      setStatus({ ...status, redlines: updated });
    }
  };

  const handleReevaluate = async () => {
    if (!type) return;
    setProcessing(true);
    setAnalyticsData(null);

    // Set immediate state for feedback
    if (status) {
      setStatus({
        ...status,
        status: "Processing",
        risk_level: "MEDIUM",
        message: "Starting exhaustive re-scan..."
      });
    }

    try {
      const res = await apiClient.continueWorkflow(type);
      setStatus(res as any);
      toast({ title: "Re-evaluation Started", description: "Performing full-document compliance re-scan." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!type) return;
    try {
      const res = await fetch(`http://localhost:8000/api/approve/${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("sec_auth") ? JSON.parse(localStorage.getItem("sec_auth")!).token : ""}`
        },
        body: JSON.stringify({ filing_type: type, approve: true })
      });

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SEC_Form_${type}_Compliant.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast({ title: "Download Started" });
    } catch (err: any) {
      toast({ title: "Download Failed", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="gov-topbar" />

      {/* Nav */}
      <nav className="border-b border-border sticky top-0 z-50 bg-background/90 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <span
              className="text-base font-bold tracking-wide text-foreground"
              style={{ fontFamily: "'Source Serif 4', serif" }}
            >
              SEC<span className="text-primary">Comply</span>
            </span>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="animate-fade-in pb-6 border-b border-border mb-8">
          <p className="badge-official inline-flex mb-3">Filing Review Module</p>
          <h1
            className="text-3xl text-foreground mb-2"
            style={{ fontFamily: "'Source Serif 4', serif", fontWeight: 700 }}
          >
            {filingNames[type || ""] || type}
          </h1>
          <p className="text-sm text-muted-foreground">
            Iterative compliance checking. Edit suggestions and re-evaluate until risk is LOW.
          </p>
        </div>

        {/* Upload area */}
        <div className="animate-slide-up border border-dashed border-border rounded-sm p-10 text-center hover:border-primary/50 transition-colors mb-8 bg-muted/20">
          <input
            type="file"
            accept=".pdf,.txt"
            onChange={handleUpload}
            className="hidden"
            id="file-upload"
            disabled={uploading || processing}
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            {uploading ? (
              <Loader2 className="w-10 h-10 text-primary mx-auto mb-3 animate-spin" />
            ) : (
              <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            )}
            <p className="text-sm font-semibold text-foreground mb-1">
              {uploading ? "Analyzing document…" : "Click to upload filing document"}
            </p>
            {/* <p className="text-xs text-muted-foreground">
              Exhaustive 20-page compliance scan powered by Llama 3.1
            </p> */}
          </label>
        </div>

        {/* Status / Results */}
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : status && status.status !== "idle" ? (
          <div className="space-y-8 animate-slide-up" style={{ animationDelay: "100ms" }}>
            {/* Status banner */}
            <div className={`rounded-sm p-5 border transition-all duration-500 ${status.status === "Processing" ? "border-primary/50 bg-primary/5 shadow-md animate-pulse" :
              status.risk_level === "LOW" ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400" :
                status.risk_level === "MEDIUM" ? "border-amber-500/30 bg-amber-500/5 text-amber-400" :
                  status.risk_level === "HIGH" ? "border-rose-500/30 bg-rose-500/5 text-rose-400" :
                    "border-border bg-card"
              }`}>
              <div className="flex items-center gap-3">
                {status.status === "Processing" ? (
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                ) : status.risk_level === "LOW" ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    {/* <span className="font-semibold text-foreground text-sm tracking-wide uppercase">
                      {status.status === "Processing" ? "Deep Scan in Progress" : "Risk Assessment Completed"}
                    </span> */}
                    {status.status === "Processing" && (
                      <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">
                        RISK: {status.risk_level}
                      </span>
                    )}
                  </div>
                  {!status.status.includes("Processing") && status.status !== "Processing" && (
                    <span className="font-semibold text-foreground text-sm tracking-wide uppercase block">
                      Risk Assessment: {status.risk_level}
                    </span>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {status.status === "Processing"
                      ? status.message
                      : status.risk_level === "LOW"
                        ? "Document meets compliance standards. Ready for generation."
                        : "Regulatory gaps detected. Review Suggested Redlines below."}
                  </p>
                </div>
              </div>
            </div>

            {/* Redlines section - only show if there are redlines AND risk is not LOW */}
            {status.redlines && status.redlines.length > 0 && status.risk_level !== "LOW" && (
              <div className="border border-border rounded-sm bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
                  <h3 className="font-bold text-foreground text-base" style={{ fontFamily: "'Source Serif 4', serif" }}>
                    Interactive Redline Review
                  </h3>
                  <Button
                    onClick={handleReevaluate}
                    disabled={processing}
                    size="sm"
                    className="h-8 text-[10px] uppercase font-bold tracking-widest bg-primary hover:bg-primary/90"
                  >
                    {processing ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <RefreshCw className="w-3 h-3 mr-2" />}
                    Apply Edits & Re-evaluate
                  </Button>
                </div>
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {status.redlines.map((r: any, i: number) => (
                    <RedlineItem
                      key={i}
                      index={i}
                      original={r.original_text || "Original text snippet missing"}
                      suggested={r.suggested || r.proposed_text || r.text || ""}
                      reason={r.reason}
                      onSave={handleSaveRedline}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Post-Compliance Suite: Analytics + Preview */}
            {status.risk_level === "LOW" && (
              <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-10">
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-sm p-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-emerald-500" />
                    <div>
                      <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: "'Source Serif 4', serif" }}>Compliance Verified</h2>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">SEC Document Ready for Publication</p>
                    </div>
                  </div>
                  <Button
                    onClick={handleDownload}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-10 px-6"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </div>

                <Tabs defaultValue="analytics" className="w-full">
                  <TabsList className="bg-muted/50 border border-border mb-6">
                    <TabsTrigger value="analytics" className="text-xs flex items-center gap-2">
                      <BarChart3 className="w-3 h-3" /> Financial Performance
                    </TabsTrigger>
                    <TabsTrigger value="preview" className="text-xs flex items-center gap-2">
                      <FileSearch className="w-3 h-3" /> Document Preview
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="analytics" className="mt-0">
                    <FinancialDashboard data={analyticsData} loading={analyticsLoading} />
                  </TabsContent>

                  <TabsContent value="preview" className="mt-0">
                    <div className="max-w-3xl mx-auto">
                      <PDFPreviewPane filingType={type || ""} />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8 text-sm">
            No documents have been submitted for this filing type. Upload a document above to begin analysis.
          </p>
        )}
      </div>
    </div >
  );
}
