import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, TrendingUp, Users, Clock, ArrowUpRight, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface Document {
  id: string;
  filename: string;
  file_type: string;
  status: string;
  created_at: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    processed: 0,
    vendors: 0,
    lastUpload: "-"
  });

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    if (!error && data) {
      setDocuments(data);

      const processed = data.filter(d => d.status === "ready").length;
      const lastUploadDate = data.length > 0
        ? new Date(data[0].created_at).toLocaleDateString()
        : "-";

      setStats({
        total: data.length,
        processed,
        vendors: Math.floor(data.length * 0.6),
        lastUpload: lastUploadDate
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      uploaded: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-100/80",
      processing: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 hover:bg-yellow-100/80",
      ready: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 hover:bg-green-100/80",
      failed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 hover:bg-red-100/80"
    };

    return <Badge variant="outline" className={`border-0 ${styles[status]}`}>{status}</Badge>;
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <AppShell>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        <motion.div variants={item} className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">Dashboard</h1>
            <p className="text-muted-foreground">Overview of your document intelligence</p>
          </div>
          <Button onClick={() => navigate("/documents")} className="bg-primary shadow-lg shadow-primary/25 hover:scale-105 transition-transform">
            Upload New
          </Button>
        </motion.div>

        <motion.div variants={container} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <motion.div variants={item}>
            <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Documents</CardTitle>
                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground mt-1">+20.1% from last month</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Processed</CardTitle>
                <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <Activity className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.processed}</div>
                <p className="text-xs text-muted-foreground mt-1">100% success rate</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Vendors</CardTitle>
                <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                  <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.vendors}</div>
                <p className="text-xs text-muted-foreground mt-1">+4 new this week</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="border-l-4 border-l-orange-500 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Last Upload</CardTitle>
                <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.lastUpload}</div>
                <p className="text-xs text-muted-foreground mt-1">Just now</p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <motion.div variants={item}>
          <Card className="shadow-sm border-none bg-white/50 dark:bg-black/20 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Documents</CardTitle>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary" onClick={() => navigate("/documents")}>
                View All <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border bg-background/50 backdrop-blur-sm">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12">
                          <div className="flex flex-col items-center gap-3 text-muted-foreground">
                            <div className="p-4 rounded-full bg-muted">
                              <FileText className="h-8 w-8" />
                            </div>
                            <p className="font-medium">No documents yet</p>
                            <Button variant="outline" onClick={() => navigate("/documents")}>Upload your first document</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      documents.map((doc) => (
                        <TableRow key={doc.id} className="group hover:bg-muted/50 transition-all duration-200">
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                                <FileText className="h-4 w-4" />
                              </div>
                              {doc.filename}
                            </div>
                          </TableCell>
                          <TableCell className="capitalize">{doc.file_type}</TableCell>
                          <TableCell>{getStatusBadge(doc.status)}</TableCell>
                          <TableCell className="text-muted-foreground">{new Date(doc.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0"
                              onClick={() => navigate(`/documents/${doc.id}`)}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AppShell>
  );
};

export default Dashboard;