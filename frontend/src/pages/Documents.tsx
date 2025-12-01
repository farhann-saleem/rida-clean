import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Upload, FileText, CloudUpload, Loader2, CheckCircle, AlertCircle, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { fetchDocuments, createDocument, deleteDocument, type Document } from "@/lib/api/documents";
import { motion, AnimatePresence } from "framer-motion";

const Documents = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const data = await fetchDocuments();
      setDocuments(data);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const processFile = async (file: File) => {
    setUploading(true);
    // Use the toast function correctly to get the update handle
    const { id: toastId, update } = toast({
      title: "Processing",
      description: "Initializing upload...",
    });

    try {
      // 1. Upload to backend (Ingestion Agent)
      update({ id: toastId, title: "Processing", description: "Ingesting to Raindrop SmartBuckets..." });

      // Simulate a slight delay for visual effect
      await new Promise(resolve => setTimeout(resolve, 800));

      update({ id: toastId, title: "Processing", description: "Backing up to Vultr Object Storage..." });

      const formData = new FormData();
      formData.append("file", file);

      const ingestResponse = await fetch("http://localhost:8000/agents/ingest", {
        method: "POST",
        body: formData,
      });

      if (!ingestResponse.ok) {
        if (ingestResponse.status === 429) {
          throw new Error("Free Tier Limit Reached: Max 3 uploads allowed.");
        }
        throw new Error("Ingestion failed");
      }

      const ingestData = await ingestResponse.json();

      update({ id: toastId, title: "Processing", description: "Extracting data with Raindrop SmartInference..." });

      // 2. Extract data (Extraction Agent)
      const extractResponse = await fetch("http://localhost:8000/agents/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: ingestData.text,
          doc_type: ingestData.type
        }),
      });

      if (!extractResponse.ok) {
        throw new Error("Extraction failed");
      }

      const extractData = await extractResponse.json();

      // 3. Save to Supabase
      const { error } = await createDocument({
        filename: file.name,
        file_type: ingestData.type,
        file_url: ingestData.vultr_backup_url || "", // Use mock URL
        extracted_data: {
          ...extractData,
          thumbnail_url: ingestData.thumbnail,
          raindrop_id: ingestData.raindrop_id
        },
        status: "ready"
      });

      if (error) throw error;

      await loadDocuments();

      update({
        id: toastId,
        title: "Success",
        description: "Document processed and stored securely.",
      });

    } catch (error: any) {
      console.error("Upload error:", error);
      update({
        id: toastId,
        variant: "destructive",
        title: "Upload failed",
        description: error.message
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent any parent click events

    if (!window.confirm("Are you sure you want to delete this document?")) {
      return;
    }

    try {
      await deleteDocument(id);

      // Update local state immediately
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));

      toast({
        title: "Deleted",
        description: "Document removed successfully"
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: error.message || "Could not delete document"
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
    e.target.value = "";
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      uploaded: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
      processing: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800",
      ready: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
      failed: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800"
    };

    const icons: Record<string, any> = {
      uploaded: CloudUpload,
      processing: Loader2,
      ready: CheckCircle,
      failed: AlertCircle
    };

    const Icon = icons[status] || FileText;

    return (
      <Badge variant="outline" className={`gap-1.5 py-1 px-2.5 ${styles[status] || ""}`}>
        <Icon className={`h-3.5 w-3.5 ${status === 'processing' ? 'animate-spin' : ''}`} />
        <span className="capitalize">{status}</span>
      </Badge>
    );
  };

  return (
    <AppShell>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8 max-w-6xl mx-auto"
      >
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">Manage and analyze your operational documents</p>
        </div>

        <Card className="border-dashed border-2 border-purple-200/50 dark:border-purple-800/50 overflow-hidden relative group transition-all duration-500 hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-2xl hover:shadow-purple-500/20 bg-white/40 dark:bg-black/40 backdrop-blur-sm">
          <div className={`absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`} />

          <CardContent className="p-0">
            <motion.div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              animate={{
                scale: isDragging ? 1.02 : 1,
                backgroundColor: isDragging ? "rgba(var(--primary), 0.05)" : "transparent"
              }}
              className={`
                relative flex flex-col items-center justify-center py-20 px-4 transition-all duration-300 ease-in-out min-h-[400px]
                ${isDragging ? "bg-primary/5" : ""}
              `}
            >
              {uploading ? (
                <div className="relative w-full max-w-md aspect-[3/4] bg-white dark:bg-zinc-900 rounded-lg shadow-2xl overflow-hidden border">
                  {/* Scanning Animation */}
                  <div className="scan-line" />

                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center space-y-4">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center"
                    >
                      <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    </motion.div>
                    <div>
                      <h3 className="font-semibold text-lg">Analyzing Document</h3>
                      <p className="text-sm text-muted-foreground">RIDA is extracting structured data...</p>
                    </div>
                  </div>

                  {/* Faux Document Content for Visual Effect */}
                  <div className="p-8 space-y-4 opacity-30 blur-[1px]">
                    <div className="h-8 w-1/2 bg-foreground/20 rounded" />
                    <div className="space-y-2 pt-4">
                      <div className="h-4 w-full bg-foreground/10 rounded" />
                      <div className="h-4 w-5/6 bg-foreground/10 rounded" />
                      <div className="h-4 w-4/6 bg-foreground/10 rounded" />
                    </div>
                    <div className="pt-8 grid grid-cols-3 gap-4">
                      <div className="h-20 bg-foreground/5 rounded" />
                      <div className="h-20 bg-foreground/5 rounded" />
                      <div className="h-20 bg-foreground/5 rounded" />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <motion.div
                    animate={{
                      y: isDragging ? -10 : 0,
                      scale: isDragging ? 1.1 : 1,
                    }}
                    className={`
                      h-24 w-24 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-8
                      shadow-xl shadow-primary/10 border border-primary/10 backdrop-blur-sm
                    `}
                  >
                    <CloudUpload className={`h-12 w-12 text-primary`} />
                  </motion.div>

                  <h3 className="text-2xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                    {isDragging ? "Drop file to upload" : "Upload your documents"}
                  </h3>
                  <p className="text-muted-foreground text-center max-w-md mb-8 text-lg">
                    Drag and drop your invoices, contracts, or receipts here.
                    <br />
                    <span className="text-sm opacity-70">Supports PDF, PNG, JPG up to 10MB</span>
                  </p>

                  <div className="relative group/btn">
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                    />
                    <Button size="lg" className="relative z-0 min-w-[200px] h-12 text-base shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all bg-primary hover:bg-primary/90">
                      <Upload className="mr-2 h-5 w-5" />
                      Browse Files
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200/50 dark:border-purple-800/50 shadow-lg shadow-purple-500/10 bg-white/50 dark:bg-black/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-purple-900 dark:from-purple-300 dark:to-purple-100">Recent Uploads</CardTitle>
            <CardDescription>Manage your document repository</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border bg-background/50">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[300px]">Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {documents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12">
                          <div className="flex flex-col items-center gap-3 text-muted-foreground">
                            <FileText className="h-10 w-10 opacity-20" />
                            <p>No documents found</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      documents.map((doc, index) => (
                        <motion.tr
                          key={doc.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ x: 4 }}
                          className="group hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition-all duration-200 border-b border-purple-200/20 dark:border-purple-800/20 last:border-0 hover:shadow-sm hover:shadow-purple-500/10"
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-lg overflow-hidden bg-primary/10 relative group-hover:scale-110 transition-transform flex-shrink-0">
                                {doc.extracted_data?.thumbnail_url ? (
                                  <img
                                    src={doc.extracted_data.thumbnail_url}
                                    alt="Thumbnail"
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                      (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                    }}
                                  />
                                ) : null}
                                <div className={`absolute inset-0 flex items-center justify-center ${doc.extracted_data?.thumbnail_url ? 'hidden' : ''}`}>
                                  <FileText className="h-5 w-5 text-primary" />
                                </div>
                              </div>
                              <span className="group-hover:text-primary transition-colors font-medium">{doc.filename}</span>
                            </div>
                          </TableCell>
                          <TableCell className="uppercase text-xs font-medium text-muted-foreground">{doc.file_type}</TableCell>
                          <TableCell>{getStatusBadge(doc.status)}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">{new Date(doc.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/documents/${doc.id}`)}
                              >
                                View
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => handleDelete(e, doc.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))
                    )}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AppShell>
  );
};

export default Documents;