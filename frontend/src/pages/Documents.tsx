import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Upload, FileText, CloudUpload, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { fetchDocuments, createDocument, updateDocumentStatus, type Document } from "@/lib/api/documents";
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

    try {
      const doc = await createDocument(file);

      toast({
        title: "Uploading",
        description: `${file.name} is being processed...`
      });

      await loadDocuments();

      // Simulate processing delay and status change
      setTimeout(async () => {
        await updateDocumentStatus(doc.id, "ready");
        await loadDocuments();

        toast({
          title: "Ready",
          description: `${file.name} is ready for review`
        });
      }, 2000);

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message
      });
    } finally {
      setUploading(false);
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

        <Card className="border-dashed border-2 overflow-hidden relative group transition-colors duration-300 hover:border-primary/50">
          <div className={`absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`} />
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
                relative flex flex-col items-center justify-center py-16 px-4 transition-all duration-300 ease-in-out
                ${isDragging ? "bg-primary/5" : "bg-background hover:bg-muted/30"}
              `}
            >
              <motion.div
                animate={{
                  scale: isDragging ? 1.1 : 1,
                  rotate: isDragging ? 10 : 0
                }}
                className={`
                  h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6
                  shadow-lg shadow-primary/10
                `}
              >
                <CloudUpload className={`h-10 w-10 text-primary`} />
              </motion.div>

              <h3 className="text-xl font-semibold mb-2">
                {isDragging ? "Drop file to upload" : "Upload your documents"}
              </h3>
              <p className="text-muted-foreground text-center max-w-sm mb-6">
                Drag and drop your invoices, contracts, or receipts here.
                We support PDF, PNG, and JPG up to 10MB.
              </p>

              <div className="relative">
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                />
                <Button size="lg" className="relative z-0 min-w-[160px] shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all" disabled={uploading}>
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Browse Files
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none bg-white/50 dark:bg-black/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Recent Uploads</CardTitle>
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
                          className="group hover:bg-muted/50 transition-colors border-b last:border-0"
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                                <FileText className="h-4 w-4" />
                              </div>
                              <span className="group-hover:text-primary transition-colors">{doc.filename}</span>
                            </div>
                          </TableCell>
                          <TableCell className="uppercase text-xs font-medium text-muted-foreground">{doc.file_type}</TableCell>
                          <TableCell>{getStatusBadge(doc.status)}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">{new Date(doc.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/documents/${doc.id}`)}
                              className="opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0"
                            >
                              View
                            </Button>
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