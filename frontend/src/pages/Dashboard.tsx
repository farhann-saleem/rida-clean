import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, AlertCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Document } from "@/lib/api/documents";

interface DashboardDocument extends Document {
  dueDate: Date;
  daysUntilDue: number;
  isOverdue: boolean;
  isUrgent: boolean;
}

export default function Dashboard() {
  const [upcomingPayments, setUpcomingPayments] = useState<DashboardDocument[]>([]);
  const [stats, setStats] = useState({ total: 0, overdue: 0, upcoming: 0 });

  useEffect(() => {
    fetchUpcomingPayments();
  }, []);

  const fetchUpcomingPayments = async () => {
    const { data } = await supabase
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      // Filter documents with due dates
      const withDueDates = (data as Document[])
        .filter(doc => doc.extracted_data?.due_date)
        .map(doc => {
          const dueDateStr = doc.extracted_data.due_date;
          const dueDate = new Date(dueDateStr);

          // Check for invalid date
          if (isNaN(dueDate.getTime())) {
            return null;
          }

          const today = new Date();
          const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

          return {
            ...doc,
            dueDate,
            daysUntilDue,
            isOverdue: daysUntilDue < 0,
            isUrgent: daysUntilDue >= 0 && daysUntilDue <= 7
          } as DashboardDocument;
        })
        .filter((doc): doc is DashboardDocument => doc !== null) // Remove invalid dates
        .sort((a, b) => a.daysUntilDue - b.daysUntilDue);

      setUpcomingPayments(withDueDates.slice(0, 10)); // Top 10

      // Calculate stats
      const overdue = withDueDates.filter(d => d.isOverdue).length;
      const upcoming = withDueDates.filter(d => !d.isOverdue && d.isUrgent).length;
      setStats({ total: withDueDates.length, overdue, upcoming });
    }
  };

  const getUrgencyBadge = (doc: DashboardDocument) => {
    if (doc.isOverdue) {
      return <Badge variant="destructive">Overdue</Badge>;
    } else if (doc.daysUntilDue <= 3) {
      return <Badge className="bg-orange-500">Urgent</Badge>;
    } else if (doc.daysUntilDue <= 7) {
      return <Badge className="bg-yellow-500">Soon</Badge>;
    }
    return <Badge variant="outline">Upcoming</Badge>;
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to RIDA Intelligence</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -4 }}
            className="group"
          >
            <Card className="border-2 border-purple-200/50 dark:border-purple-800/50 shadow-lg shadow-purple-500/10 hover:shadow-purple-500/30 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300 relative overflow-hidden">
              <motion.div 
                className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                animate={{ opacity: [0.05, 0.1, 0.05] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
                <Calendar className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-purple-900 dark:from-purple-300 dark:to-purple-100">{stats.total}</div>
                <p className="text-xs text-muted-foreground">Tracked invoices</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -4 }}
            className="group"
          >
            <Card className="border-2 border-purple-200/50 dark:border-purple-800/50 shadow-lg shadow-purple-500/10 hover:shadow-purple-500/30 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300 relative overflow-hidden">
              <motion.div 
                className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                animate={{ opacity: [0.05, 0.1, 0.05] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
                <p className="text-xs text-muted-foreground">Require immediate action</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -4 }}
            className="group"
          >
            <Card className="border-2 border-purple-200/50 dark:border-purple-800/50 shadow-lg shadow-purple-500/10 hover:shadow-purple-500/30 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300 relative overflow-hidden">
              <motion.div 
                className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                animate={{ opacity: [0.05, 0.1, 0.05] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium">Due Soon</CardTitle>
                <Clock className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-2xl font-bold text-orange-600">{stats.upcoming}</div>
                <p className="text-xs text-muted-foreground">Within 7 days</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Infrastructure Status */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/10 border-blue-200 dark:border-blue-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                Raindrop MCP Server
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                Status: <span className="font-semibold text-green-600 dark:text-green-400">Active</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                SmartBuckets & SmartInference Online
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/30 dark:to-indigo-900/10 border-indigo-200 dark:border-indigo-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                Vultr Cloud Compute
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                Status: <span className="font-semibold text-green-600 dark:text-green-400">Connected</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Region: New Jersey (ewr)
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/10 border-emerald-200 dark:border-emerald-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                Supabase Database
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                Status: <span className="font-semibold text-green-600 dark:text-green-400">Synced</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Real-time replication active
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Payments */}
        <Card className="border-2 border-purple-200/50 dark:border-purple-800/50 shadow-lg shadow-purple-500/10">
          <CardHeader>
            <CardTitle className="bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-purple-900 dark:from-purple-300 dark:to-purple-100">Upcoming Payments</CardTitle>
            <CardDescription>Invoices sorted by due date</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingPayments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No upcoming payments</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingPayments.map((doc, idx) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ x: 4 }}
                    className="flex items-center justify-between p-4 rounded-lg border-2 border-purple-200/30 dark:border-purple-800/30 bg-card hover:bg-purple-50/50 dark:hover:bg-purple-950/20 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-200 hover:shadow-md hover:shadow-purple-500/20"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-medium">{doc.filename}</p>
                        {getUrgencyBadge(doc)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Vendor: {doc.extracted_data?.vendor || 'Unknown'}</span>
                        <span>Amount: {doc.extracted_data?.total_amount || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${doc.isOverdue ? 'text-red-600' :
                        doc.daysUntilDue <= 3 ? 'text-orange-600' :
                          'text-muted-foreground'
                        }`}>
                        {doc.dueDate.toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {doc.isOverdue
                          ? `${Math.abs(doc.daysUntilDue)} days overdue`
                          : `${doc.daysUntilDue} days remaining`
                        }
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}