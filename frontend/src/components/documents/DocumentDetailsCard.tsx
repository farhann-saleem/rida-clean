import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Calendar, DollarSign, FileText, Hash } from "lucide-react";

interface DocumentDetailsCardProps {
  extractedData: Record<string, any> | null;
}

export const DocumentDetailsCard = ({ extractedData }: DocumentDetailsCardProps) => {
  if (!extractedData || Object.keys(extractedData).length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Key Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No extracted data available</p>
        </CardContent>
      </Card>
    );
  }

  // Helper to get icon based on key
  const getIcon = (key: string) => {
    const k = key.toLowerCase();
    if (k.includes('vendor') || k.includes('supplier')) return <Building2 className="h-4 w-4 text-primary" />;
    if (k.includes('date')) return <Calendar className="h-4 w-4 text-primary" />;
    if (k.includes('amount') || k.includes('total') || k.includes('price')) return <DollarSign className="h-4 w-4 text-primary" />;
    if (k.includes('number') || k.includes('id')) return <Hash className="h-4 w-4 text-primary" />;
    return <FileText className="h-4 w-4 text-primary" />;
  };

  return (
    <Card className="h-full border-none shadow-md bg-white/50 dark:bg-black/20 backdrop-blur-sm">
      <CardHeader className="pb-3 border-b bg-muted/30">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          Extracted Data
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {Object.entries(extractedData).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-primary/5">
                  {getIcon(key)}
                </div>
                <span className="text-sm font-medium capitalize text-muted-foreground">
                  {key.replace(/_/g, " ")}
                </span>
              </div>
              <span className="text-sm font-semibold text-foreground">{String(value)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
