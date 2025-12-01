import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Workflow, ArrowRight, FileText, Receipt, Scale, Play, Loader2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

const Workflows = () => {
  const { toast } = useToast();
  const [runningWorkflow, setRunningWorkflow] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

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
      id: "invoice-processing",
      title: "Invoice Processing",
      description: "Automatically extract data from invoices, validate against purchase orders, and route for approval.",
      icon: FileText,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "group-hover:border-blue-500/50"
    },
    {
      id: "contract-review",
      title: "Contract Review",
      description: "Extract key terms, identify risks, and generate summary reports for legal review.",
      icon: Scale,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      borderColor: "group-hover:border-purple-500/50"
    },
    {
      id: "receipt-reconciliation",
      title: "Receipt Reconciliation",
      description: "Match receipts with expense reports, flag discrepancies, and export for accounting systems.",
      icon: Receipt,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      borderColor: "group-hover:border-green-500/50"
    }
  ];

const handleRunWorkflow = async (workflowId: string, title: string) => {
  if (runningWorkflow) return;

  setRunningWorkflow(workflowId);
  setProgress(0);

  // Initial toast
  const { id: toastId, update } = toast({
    title: `Starting ${title}`,
    description: "Initializing workflow agents...",
  });

  // Simulate workflow steps
  const steps = [
    { progress: 20, message: "Ingesting documents from Raindrop..." },
    { progress: 45, message: "Analyzing content with Vultr Compute..." },
    { progress: 70, message: "Extracting structured data..." },
    { progress: 90, message: "Validating results..." },
    { progress: 100, message: "Workflow completed successfully!" }
  ];

  for (const step of steps) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    setProgress(step.progress);
    update({
      id: toastId,
      title: step.progress === 100 ? "Completed" : "Running",
      description: step.message,
    });
  }

  setTimeout(() => {
    setRunningWorkflow(null);
    setProgress(0);
  }, 1000);
};

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
                <div className="group relative overflow-hidden rounded-xl border-2 border-purple-200/50 dark:border-purple-800/50 bg-card p-6 shadow-lg shadow-purple-500/10 transition-all duration-300 hover:shadow-purple-500/30 hover:border-purple-300 dark:hover:border-purple-600 hover:-translate-y-2">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative flex items-start gap-4">
                    <div className={`rounded-lg p-3 ${workflow.bgColor} ${workflow.color}`}>
                      <workflow.icon className="h-6 w-6" />
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">{workflow.title}</h3>
                        {runningWorkflow === workflow.id ? (
                          <Badge variant="outline" className="animate-pulse border-purple-500 text-purple-600 dark:text-purple-400 gap-1">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Running
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-secondary/50 backdrop-blur-sm">Ready</Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground max-w-2xl">
                        {workflow.description}
                      </p>

                      {runningWorkflow === workflow.id && (
                        <div className="space-y-1 pt-2">
                          <Progress value={progress} className="h-2 [&>div]:bg-purple-600" />
                          <p className="text-xs text-muted-foreground text-right">{progress}%</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center self-center pl-4">
                      <Button
                        onClick={() => handleRunWorkflow(workflow.id, workflow.title)}
                        disabled={runningWorkflow !== null}
                        className={`
                          transition-all duration-300 bg-purple-600 hover:bg-purple-700 text-white
                          ${runningWorkflow === workflow.id ? "opacity-50 cursor-not-allowed" : "opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0"}
                        `}
                      >
                        {runningWorkflow === workflow.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Play className="h-4 w-4 mr-2" />
                        )}
                        {runningWorkflow === workflow.id ? "Running" : "Run Workflow"}
                      </Button>
                    </div>
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