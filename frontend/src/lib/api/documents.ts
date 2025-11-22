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

  const { data, error } = await supabase
    .from("documents")
    .insert({
      user_id: user.id,
      filename: file.name,
      file_type: file.type,
      status: "uploaded",
      extracted_data: {
        vendor: "Sample Vendor",
        invoice_number: "INV-" + Math.floor(Math.random() * 10000),
        date: new Date().toISOString().split('T')[0],
        total_amount: "$" + (Math.random() * 1000).toFixed(2)
      },
      summary: "Processing document..."
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
