import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Workflow, ArrowRight, FileText, Receipt, Scale } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const Workflows = () => {
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

  const workflows = [
    {
      title: "Invoice Processing",
      description: "Automatically extract data from invoices, validate against purchase orders, and route for approval.",
      icon: FileText,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "group-hover:border-blue-500/50"
    },
    {
      title: "Contract Review",
      description: "Extract key terms, identify risks, and generate summary reports for legal review.",
      icon: Scale,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      borderColor: "group-hover:border-purple-500/50"
    },
    {
      title: "Receipt Reconciliation",
      description: "Match receipts with expense reports, flag discrepancies, and export for accounting systems.",
      icon: Receipt,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      borderColor: "group-hover:border-green-500/50"
    }
  ];

  return (
    <AppShell>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-8 max-w-5xl mx-auto"
      >
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Workflows</h1>
          <p className="text-muted-foreground">Automated document processing pipelines</p>
        </div>

        <Card className="border-none shadow-none bg-transparent">
          <CardHeader className="px-0">
            <CardTitle className="text-xl">Available Workflows</CardTitle>
            <CardDescription>
              Select a workflow to automate your document tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 space-y-4">
            {workflows.map((workflow, index) => (
              <motion.div key={index} variants={item}>
                <div className={`
                  group relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-all duration-300 
                  hover:shadow-lg hover:-translate-y-1 ${workflow.borderColor}
                `}>
                  <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-transparent group-hover:from-${workflow.color.split('-')[1]}-500/5 transition-all duration-500`} />

                  <div className="relative flex items-start gap-4">
                    <div className={`rounded-lg p-3 ${workflow.bgColor} ${workflow.color}`}>
                      <workflow.icon className="h-6 w-6" />
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">{workflow.title}</h3>
                        <Badge variant="secondary" className="bg-secondary/50 backdrop-blur-sm">Coming Soon</Badge>
                      </div>
                      <p className="text-muted-foreground max-w-2xl">
                        {workflow.description}
                      </p>
                    </div>

                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0">
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </AppShell>
  );
};

export default Workflows;