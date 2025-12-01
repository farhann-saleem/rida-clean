import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { TrendingUp, DollarSign, FileText, AlertCircle, Download, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

export default function Analytics() {
    const [documents, setDocuments] = useState([]);
    const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
    const [analytics, setAnalytics] = useState(null);
    const [query, setQuery] = useState("");
    const [queryResponse, setQueryResponse] = useState("");
    const [loading, setLoading] = useState(true);
    const [queryLoading, setQueryLoading] = useState(false);

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        const { data } = await supabase
            .from("documents")
            .select("*")
            .order("created_at", { ascending: false });

        if (data) {
            setDocuments(data);
            // Select all documents by default
            setSelectedDocuments(data.map(doc => doc.id));
            fetchAnalytics(data);
        }
        setLoading(false);
    };

    const fetchAnalytics = async (docs) => {
        try {
            const response = await fetch("http://localhost:8000/agents/analytics", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ documents: docs })
            });
            const data = await response.json();
            setAnalytics(data);
        } catch (error) {
            console.error("Analytics error:", error);
        }
    };

    const handleQuery = async () => {
        if (!query.trim()) return;

        setQueryLoading(true);
        setQueryResponse("");

        try {
            const selectedDocs = documents.filter(doc => selectedDocuments.includes(doc.id));
            const response = await fetch("http://localhost:8000/agents/analytics", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ documents: selectedDocs, query })
            });
            const data = await response.json();
            setQueryResponse(data.query_response || "No response received");
        } catch (error) {
            console.error("Query error:", error);
            setQueryResponse("Error processing query. Please try again.");
        } finally {
            setQueryLoading(false);
        }
    };

    const handleDocumentToggle = (docId: string) => {
        setSelectedDocuments(prev => {
            const newSelection = prev.includes(docId)
                ? prev.filter(id => id !== docId)
                : [...prev, docId];

            // Update analytics with new selection
            const selectedDocs = documents.filter(doc => newSelection.includes(doc.id));
            if (selectedDocs.length > 0) {
                fetchAnalytics(selectedDocs);
            }

            return newSelection;
        });
    };

    const handleSelectAll = () => {
        if (selectedDocuments.length === documents.length) {
            setSelectedDocuments([]);
            setAnalytics(null);
        } else {
            setSelectedDocuments(documents.map(doc => doc.id));
            fetchAnalytics(documents);
        }
    };

    const handleExport = async (format) => {
        try {
            const selectedDocs = documents.filter(doc => selectedDocuments.includes(doc.id));
            const response = await fetch("http://localhost:8000/agents/export", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ documents: selectedDocs, format })
            });
            const data = await response.json();

            if (format === 'excel') {
                console.log("Excel data:", data.data);
                alert("Excel export ready! (Frontend conversion needed)");
            } else {
                const blob = new Blob([data.content], { type: 'text/plain' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = data.filename;
                a.click();
            }
        } catch (error) {
            console.error("Export error:", error);
        }
    };

    if (loading) {
        return (
            <AppShell>
                <div className="flex items-center justify-center h-96">Loading analytics...</div>
            </AppShell>
        );
    }

    return (
        <AppShell>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
                        <p className="text-muted-foreground">Multi-document intelligence and insights</p>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={() => handleExport('csv')} variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Export CSV
                        </Button>
                        <Button onClick={() => handleExport('quickbooks')} variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            QuickBooks
                        </Button>
                    </div>
                </div>

                {/* Document Selection */}
                <Card className="border-2 border-purple-200/50 dark:border-purple-800/50 shadow-lg shadow-purple-500/10">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-purple-900 dark:from-purple-300 dark:to-purple-100">Select Documents</CardTitle>
                                <CardDescription>Choose which documents to include in analytics</CardDescription>
                            </div>
                            <Button onClick={handleSelectAll} variant="outline" size="sm">
                                {selectedDocuments.length === documents.length ? "Deselect All" : "Select All"}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                            {documents.map((doc) => (
                                <div
                                    key={doc.id}
                                    onClick={() => handleDocumentToggle(doc.id)}
                                    className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${selectedDocuments.includes(doc.id)
                                        ? 'border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20'
                                        : 'border-purple-100 dark:border-purple-800/30 hover:border-purple-300 dark:hover:border-purple-600 hover:bg-purple-50/50 dark:hover:bg-purple-950/10'
                                    }`}
                                >
                                    <Checkbox
                                        checked={selectedDocuments.includes(doc.id)}
                                        onCheckedChange={() => handleDocumentToggle(doc.id)}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{doc.filename}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {doc.extracted_data?.vendor || 'Unknown'} • {doc.extracted_data?.total_amount || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-3 text-sm text-muted-foreground">
                            {selectedDocuments.length} of {documents.length} documents selected
                        </div>
                    </CardContent>
                </Card>

                {/* Summary Cards */}
                {analytics && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                            <Card className="border-2 border-purple-200/50 dark:border-purple-800/50 shadow-lg shadow-purple-500/10 hover:shadow-purple-500/30 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300 relative overflow-hidden group">
                                <motion.div 
                                    className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                    animate={{ opacity: [0.05, 0.1, 0.05] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                />
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                                    <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent className="relative z-10">
                                    <div className="text-2xl font-bold">{analytics.summary.total_documents}</div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                            <Card className="border-2 border-purple-200/50 dark:border-purple-800/50 shadow-lg shadow-purple-500/10 hover:shadow-purple-500/30 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300 relative overflow-hidden group">
                                <motion.div 
                                    className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                    animate={{ opacity: [0.05, 0.1, 0.05] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                />
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                                    <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent className="relative z-10">
                                    <div className="text-2xl font-bold">{analytics.summary.total_spend}</div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                            <Card className="border-2 border-purple-200/50 dark:border-purple-800/50 shadow-lg shadow-purple-500/10 hover:shadow-purple-500/30 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300 relative overflow-hidden group">
                                <motion.div 
                                    className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                    animate={{ opacity: [0.05, 0.1, 0.05] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                />
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                                    <CardTitle className="text-sm font-medium">Average Amount</CardTitle>
                                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent className="relative z-10">
                                    <div className="text-2xl font-bold">{analytics.summary.average_spend}</div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                            <Card className="border-2 border-purple-200/50 dark:border-purple-800/50 shadow-lg shadow-purple-500/10 hover:shadow-purple-500/30 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300 relative overflow-hidden group">
                                <motion.div 
                                    className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                    animate={{ opacity: [0.05, 0.1, 0.05] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                />
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                                    <CardTitle className="text-sm font-medium">Highest Amount</CardTitle>
                                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent className="relative z-10">
                                    <div className="text-2xl font-bold">{analytics.summary.highest_amount}</div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                )}

                {/* Natural Language Query */}
                <Card className="border-2 border-purple-200/50 dark:border-purple-800/50 shadow-lg shadow-purple-500/10">
                    <CardHeader>
                        <CardTitle className="bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-purple-900 dark:from-purple-300 dark:to-purple-100">Ask Questions</CardTitle>
                        <CardDescription>Query your selected documents using natural language</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Input
                                placeholder="e.g., What's my total spend with Acme Corp?"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && !queryLoading && handleQuery()}
                                disabled={queryLoading || selectedDocuments.length === 0}
                            />
                            <Button onClick={handleQuery} disabled={queryLoading || selectedDocuments.length === 0} className="bg-purple-600 hover:bg-purple-700 text-white">
                                {queryLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Asking...
                                    </>
                                ) : (
                                    'Ask'
                                )}
                            </Button>
                        </div>
                        {queryResponse && (
                            <div className="p-4 bg-muted rounded-lg">
                                <p className="text-sm whitespace-pre-wrap">{queryResponse}</p>
                            </div>
                        )}
                        {selectedDocuments.length === 0 && (
                            <p className="text-sm text-muted-foreground">Select at least one document to ask questions</p>
                        )}
                    </CardContent>
                </Card>

                {/* Top Vendors */}
                {analytics && analytics.by_vendor.length > 0 && (
                    <Card className="border-2 border-purple-200/50 dark:border-purple-800/50 shadow-lg shadow-purple-500/10">
                        <CardHeader>
                            <CardTitle className="bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-purple-900 dark:from-purple-300 dark:to-purple-100">Top Vendors</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {analytics.by_vendor.map((vendor, idx) => (
                                    <div key={idx} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Badge variant="outline">{vendor.count}</Badge>
                                            <span className="font-medium">{vendor.vendor}</span>
                                        </div>
                                        <span className="text-lg font-bold">{vendor.total}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Monthly Trends */}
                {analytics && analytics.monthly_trends.length > 0 && (
                    <Card className="border-2 border-purple-200/50 dark:border-purple-800/50 shadow-lg shadow-purple-500/10">
                        <CardHeader>
                            <CardTitle className="bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-purple-900 dark:from-purple-300 dark:to-purple-100">Monthly Spending</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {analytics.monthly_trends.map((month, idx) => (
                                    <div key={idx} className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">{month.month}</span>
                                        <span className="font-semibold">{month.total}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppShell>
    );
}