import { useNavigate } from "react-router-dom";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Footer } from "@/components/ui/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, MessageSquare, Brain, ArrowRight, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const Index = () => {
  const navigate = useNavigate();
  const [textState, setTextState] = useState<"short" | "expanding" | "full" | "collapsing">("short");

  useEffect(() => {
    const loop = async () => {
      // Start short: "RIDA"
      await new Promise(r => setTimeout(r, 3000));

      // Expand to full
      setTextState("expanding");
      await new Promise(r => setTimeout(r, 600)); // Animation duration
      setTextState("full");

      // Stay full: "Raindrop Intelligent Document Agent"
      await new Promise(r => setTimeout(r, 3000));

      // Collapse back
      setTextState("collapsing");
      await new Promise(r => setTimeout(r, 600)); // Animation duration
      setTextState("short");
    };

    const interval = setInterval(loop, 8000);
    loop(); // Start immediately

    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      title: "Smart Extraction",
      description: "Automatically extract key data points from invoices, receipts, and contracts with high accuracy.",
      icon: FileText,
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      title: "Cross-Doc Chat",
      description: "Ask questions across your entire document repository. Connect the dots between different files.",
      icon: MessageSquare,
      color: "text-purple-500",
      bg: "bg-purple-500/10"
    },
    {
      title: "Raindrop Memory",
      description: "RIDA remembers context from previous interactions, making it smarter the more you use it.",
      icon: Brain,
      color: "text-green-500",
      bg: "bg-green-500/10"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Hero Section with Aurora Background */}
      <div className="relative h-screen">
        <AuroraBackground className="h-full">
          <motion.div
            initial={{ opacity: 0.0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.3,
              duration: 0.8,
              ease: "easeInOut",
            }}
            className="relative flex flex-col gap-4 items-center justify-center px-4 text-center"
          >
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 mb-4">
              <span className="flex h-2 w-2 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
              Powered by Raindrop AI
            </div>

            <h1 className="font-bold text-foreground text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight mb-4 tracking-tight min-h-[1.2em] flex items-center justify-center">
              <AnimatePresence mode="wait">
                {textState === "short" || textState === "collapsing" ? (
                  <motion.span
                    key="short"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                    transition={{ duration: 0.5 }}
                    className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300"
                  >
                    RIDA
                  </motion.span>
                ) : (
                  <motion.span
                    key="full"
                    initial={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 dark:from-white dark:to-purple-300"
                  >
                    Raindrop Intelligent Document Agent
                  </motion.span>
                )}
              </AnimatePresence>
            </h1>

            <p className="font-light text-base md:text-xl text-muted-foreground py-4 max-w-2xl mx-auto">
              From static files to instant answers. Upload invoices, contracts, and reports, then ask questions in plain language.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="rounded-full px-8 shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
              >
                Get Started
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate("/dashboard")}
                className="rounded-full px-8 bg-white/50 dark:bg-black/50 backdrop-blur-sm"
              >
                View Console Demo <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </AuroraBackground>
      </div>

      {/* Features Section */}
      <section className="py-12 px-6 bg-background relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose RIDA?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Built on the Raindrop platform, RIDA brings enterprise-grade AI to your document workflows.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
              >
                <Card className="border shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg ${feature.bg} flex items-center justify-center mb-4`}>
                      <feature.icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-12 px-6 bg-muted/30 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Three simple steps to intelligent document management.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

            {[
              { title: "Upload", desc: "Drag & drop your files. RIDA supports PDF, PNG, and JPG.", icon: Zap },
              { title: "Process", desc: "AI analyzes and extracts structured data instantly.", icon: Brain },
              { title: "Interact", desc: "Chat with your documents to get answers and insights.", icon: MessageSquare }
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2, duration: 0.6 }}
                className="relative flex flex-col items-center text-center"
              >
                <div className="w-24 h-24 rounded-full bg-background border-4 border-primary/10 flex items-center justify-center mb-6 relative z-10 shadow-sm">
                  <step.icon className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
