import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileText, ExternalLink, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PDFPreviewPaneProps {
  filingType: string;
}

export function PDFPreviewPane({ filingType }: PDFPreviewPaneProps) {
  const previewUrl = `http://localhost:8000/api/preview/${filingType}`;

  return (
    <Card className="bg-card border-border shadow-md overflow-hidden animate-in fade-in zoom-in duration-500">
      <CardHeader className="flex flex-row items-center justify-between py-3 border-b border-border bg-muted/30">
        <CardTitle className="text-sm font-semibold flex items-center" style={{ fontFamily: "'Source Serif 4', serif" }}>
          <FileText className="w-4 h-4 mr-2 text-primary" /> 
          Generated Form {filingType} Preview
        </CardTitle>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
            <a href={previewUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-3 h-3" />
            </a>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 bg-secondary/20 aspect-[4/5] relative">
        <iframe 
          src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
          className="w-full h-full border-none"
          title="PDF Preview"
        />
        <div className="absolute bottom-4 right-4 shadow-2xl">
           <p className="text-[10px] bg-background/80 backdrop-blur-sm px-2 py-1 rounded border border-border text-muted-foreground">
             Interactive Preview Mode
           </p>
        </div>
      </CardContent>
    </Card>
  );
}
