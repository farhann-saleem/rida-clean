import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { DocumentDetailsCard } from "@/components/documents/DocumentDetailsCard";
import { DocumentSummaryCard } from "@/components/documents/DocumentSummaryCard";
import { LineItemsTable } from "@/components/documents/LineItemsTable";
import { ArrowLeft, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface Document {
  id: string;
  filename: string;
  file_type: string;
  status: string;
  created_at: string;
  extracted_data: any;
  summary: string;
}

const DocumentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocument();
  }, [id]);

  const fetchDocument = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("id", id)
      .single();

    if (!error && data) {
      setDocument(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <AppShell>
        <div className="space-y-6 max-w-6xl mx-auto">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-6 lg:grid-cols-3">
            <Skeleton className="h-64 lg:col-span-2" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </AppShell>
    );
  }

  if (!document) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
          <p className="text-muted-foreground text-lg">Document not found</p>
          <Button onClick={() => navigate("/documents")}>Back to Documents</Button>
        </div>
      </AppShell>
    );
  }

  // Workflow Logic (Mocked for UI, but logic is sound)
  const totalAmount = parseFloat(document.extracted_data?.total_amount?.replace(/[^0-9.]/g, '') || "0");
  const needsApproval = totalAmount > 1000;
  const workflowStatus = needsApproval ? "Needs Approval" : "Auto-Approved";

  const mockLineItems = [
    { description: "Product A", quantity: 2, unit_price: "$50.00", total: "$100.00" },
    { description: "Product B", quantity: 1, unit_price: "$75.00", total: "$75.00" },
    { description: "Service Fee", quantity: 1, unit_price: "$25.00", total: "$25.00" },
  ];

  return (
    <AppShell>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8 max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Button variant="ghost" size="sm" className="h-6 px-2 -ml-2" onClick={() => navigate("/documents")}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{document.filename}</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" />
              Uploaded on {new Date(document.created_at).toLocaleDateString()} at {new Date(document.created_at).toLocaleTimeString()}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-sm py-1.5 px-3 uppercase tracking-wide">
              {document.file_type}
            </Badge>

            {needsApproval ? (
              <Badge variant="destructive" className="text-sm py-1.5 px-3 gap-1.5 shadow-lg shadow-red-500/20">
                <AlertTriangle className="h-3.5 w-3.5" />
                {workflowStatus}
              </Badge>
            ) : (
              <Badge className="bg-green-500 hover:bg-green-600 text-white text-sm py-1.5 px-3 gap-1.5 shadow-lg shadow-green-500/20">
                <CheckCircle className="h-3.5 w-3.5" />
                {workflowStatus}
              </Badge>
            )}
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content - 2 Columns */}
          <div className="lg:col-span-2 space-y-6">
            <DocumentDetailsCard extractedData={document.extracted_data} />
            <LineItemsTable items={mockLineItems} />
          </div>

          {/* Sidebar - 1 Column */}
          <div className="space-y-6">
            <DocumentSummaryCard summary={document.summary} />

            {/* Workflow Actions Card */}
            {needsApproval && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 space-y-4"
              >
                <h3 className="font-semibold flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  Action Required
                </h3>
                <p className="text-sm text-muted-foreground">
                  This invoice exceeds the $1,000 auto-approval limit. Please review and approve manually.
                </p>
                <div className="flex gap-3 pt-2">
                  <Button className="w-full bg-green-600 hover:bg-green-700">Approve</Button>
                  <Button variant="outline" className="w-full text-destructive hover:text-destructive border-destructive/20 hover:bg-destructive/10">Reject</Button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </AppShell>
  );
};

export default DocumentDetail;