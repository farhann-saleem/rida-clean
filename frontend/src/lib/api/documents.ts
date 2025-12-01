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

export const createDocument = async (doc: any) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("documents")
    .insert({
      ...doc,
      user_id: user.id
    })
    .select()
    .single();

  return { data, error };
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
