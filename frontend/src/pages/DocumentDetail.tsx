import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { DocumentDetailsCard } from "@/components/documents/DocumentDetailsCard";
import { DocumentSummaryCard } from "@/components/documents/DocumentSummaryCard";
import { LineItemsTable } from "@/components/documents/LineItemsTable";

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
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </AppShell>
    );
  }

  if (!document) {
    return (
      <AppShell>
        <div className="text-center">
          <p className="text-muted-foreground">Document not found</p>
        </div>
      </AppShell>
    );
  }

  const mockLineItems = [
    { description: "Product A", quantity: 2, unit_price: "$50.00", total: "$100.00" },
    { description: "Product B", quantity: 1, unit_price: "$75.00", total: "$75.00" },
    { description: "Service Fee", quantity: 1, unit_price: "$25.00", total: "$25.00" },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight md:text-2xl lg:text-3xl">{document.filename}</h1>
            <p className="text-xs text-muted-foreground md:text-sm">
              Uploaded on {new Date(document.created_at).toLocaleDateString()}
            </p>
          </div>
          <Badge className="self-start sm:self-auto">{document.status}</Badge>
        </div>

        <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
          <DocumentDetailsCard extractedData={document.extracted_data} />
          <DocumentSummaryCard summary={document.summary} />
        </div>

        <LineItemsTable items={mockLineItems} />
      </div>
    </AppShell>
  );
};

export default DocumentDetail;