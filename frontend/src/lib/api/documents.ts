import { supabase } from "@/integrations/supabase/client";

export interface Document {
  id: string;
  filename: string;
  file_type: string;
  status: string;
  created_at: string;
  extracted_data?: any;
}

export const fetchDocuments = async (): Promise<Document[]> => {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

export const createDocument = async (file: File) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  // 1. Upload to Python Backend for Analysis
  const formData = new FormData();
  formData.append("file", file);

  let analysisResult = {
    type: "unknown",
    summary: "Pending analysis...",
    confidence: 0,
    full_text: "",
    thumbnail_url: ""
  };

  try {
    console.log("Sending file to RIDA Backend...");
    const response = await fetch("http://localhost:8000/agents/ingest", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      analysisResult = await response.json();
      console.log("RIDA Backend Analysis:", analysisResult);
    } else {
      console.error("Backend analysis failed:", await response.text());
    }
  } catch (err) {
    console.error("Backend connection error:", err);
  }

  // 2. Extract structured data
  let extractedData: any = {
    detected_type: analysisResult.type,
    confidence: analysisResult.confidence,
    full_text: analysisResult.full_text,
    thumbnail_url: analysisResult.thumbnail_url,
    vendor: "Unknown",
    total_amount: "N/A"
  };

  try {
    console.log("Calling extraction agent...");
    const extractResponse = await fetch("http://localhost:8000/agents/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: analysisResult.full_text, doc_type: analysisResult.type })
    });

    if (extractResponse.ok) {
      const extracted = await extractResponse.json();
      console.log("Extracted data:", extracted);

      extractedData.vendor = extracted["Vendor Name"] || extracted.vendor_name || "Unknown";
      extractedData.total_amount = extracted["Total Amount"] || extracted.total_amount || "N/A";
      extractedData.date = extracted["Invoice Date"] || extracted.date;
      extractedData.invoice_number = extracted["Invoice Number"] || extracted.invoice_number;
    }
  } catch (err) {
    console.error("Extraction error:", err);
  }

  // 3. Save to Supabase
  const { data, error } = await supabase
    .from("documents")
    .insert({
      user_id: user.id,
      filename: file.name,
      file_type: file.type,
      status: "analyzed",
      extracted_data: extractedData,
      summary: analysisResult.summary
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateDocumentStatus = async (id: string, status: string) => {
  const { error } = await supabase
    .from("documents")
    .update({ status })
    .eq("id", id);

  if (error) throw error;
};

export const deleteDocument = async (id: string) => {
  const { error } = await supabase
    .from("documents")
    .delete()
    .eq("id", id);

  if (error) throw error;
};

// Export all functions
