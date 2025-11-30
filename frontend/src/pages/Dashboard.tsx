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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Tracked invoices</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
              <p className="text-xs text-muted-foreground">Require immediate action</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Due Soon</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.upcoming}</div>
              <p className="text-xs text-muted-foreground">Within 7 days</p>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Payments */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Payments</CardTitle>
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
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
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