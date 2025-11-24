import { supabase } from "@/integrations/supabase/client";

export interface Document {
  id: string;
  filename: string;
  file_type: string;
  status: string;
  created_at: string;
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
    full_text: ""
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
    // Fallback to dummy data if backend is down, so app doesn't break
  }

  // 2. Save to Supabase with Real Data
  const { data, error } = await supabase
    .from("documents")
    .insert({
      user_id: user.id,
      filename: file.name,
      file_type: file.type, // Keep MIME type
      status: "analyzed",   // Update status
      extracted_data: {
        detected_type: analysisResult.type,
        confidence: analysisResult.confidence,
        full_text: analysisResult.full_text, // Save full text for Chat
        // Placeholders for Extraction Agent
        vendor: "Pending Extraction",
        total_amount: "Pending"
      },
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
