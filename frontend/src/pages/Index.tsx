import { useNavigate } from "react-router-dom";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Footer } from "@/components/ui/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, MessageSquare, Brain, ArrowRight, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const MorphingWord = ({ letter, rest, expanded, delay }: { letter: string, rest: string, expanded: boolean, delay: number }) => {
  return (
    <motion.div layout className="flex items-center relative">
      <motion.span
        layout
        className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 dark:from-white dark:to-purple-300"
      >
        {letter}
      </motion.span>
      <AnimatePresence mode="wait">
        {expanded && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.8, delay: delay, ease: "easeOut" }}
            className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 dark:from-white dark:to-purple-300 whitespace-nowrap overflow-hidden"
          >
            {rest}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const MorphingSpacer = ({ expanded }: { expanded: boolean }) => (
  <motion.div
    layout
    animate={{ width: expanded ? "0.8rem" : "0rem" }}
    transition={{ duration: 0.8 }}
    className="h-1"
  />
);

const Index = () => {
  const navigate = useNavigate();
  const [textState, setTextState] = useState<"short" | "expanding" | "full" | "collapsing">("short");

  useEffect(() => {
    const loop = async () => {
      // Start short: "RIDA"
      await new Promise(r => setTimeout(r, 3000));

      // Expand to full
      setTextState("expanding");
      await new Promise(r => setTimeout(r, 1200)); // Animation duration
      setTextState("full");

      // Stay full: "Raindrop Intelligent Document Agent"
      await new Promise(r => setTimeout(r, 4000));

      // Collapse back
      setTextState("collapsing");
      await new Promise(r => setTimeout(r, 1200)); // Animation duration
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
      <div className="relative h-screen overflow-hidden">
        <AuroraBackground className="h-full">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-200/60 via-purple-50/30 to-transparent z-10 pointer-events-none" />
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
              <div className="flex flex-row items-center justify-center">
                <MorphingWord letter="R" rest="aindrop" expanded={textState === "full" || textState === "expanding"} delay={0} />
                <MorphingSpacer expanded={textState === "full" || textState === "expanding"} />
                <MorphingWord letter="I" rest="ntelligent" expanded={textState === "full" || textState === "expanding"} delay={0.1} />
                <MorphingSpacer expanded={textState === "full" || textState === "expanding"} />
                <MorphingWord letter="D" rest="ocument" expanded={textState === "full" || textState === "expanding"} delay={0.2} />
                <MorphingSpacer expanded={textState === "full" || textState === "expanding"} />
                <MorphingWord letter="A" rest="gent" expanded={textState === "full" || textState === "expanding"} delay={0.3} />
              </div>
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
                whileHover={{ y: -8 }}
                className="group"
              >
                <Card className="border-2 border-purple-200/50 dark:border-purple-800/50 shadow-lg shadow-purple-500/10 hover:shadow-purple-500/30 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300 h-full relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    animate={{
                      opacity: [0.05, 0.1, 0.05]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <CardHeader className="relative z-10">
                    <motion.div
                      className={`w-12 h-12 rounded-lg ${feature.bg} flex items-center justify-center mb-4 shadow-md group-hover:shadow-lg group-hover:shadow-purple-500/20 transition-shadow`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <feature.icon className={`h-6 w-6 ${feature.color}`} />
                    </motion.div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
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
            <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-400/40 to-transparent" />

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
                whileHover={{ y: -8 }}
                className="relative flex flex-col items-center text-center group"
              >
                <motion.div
                  className="w-24 h-24 rounded-full bg-background border-4 border-purple-200 dark:border-purple-800 flex items-center justify-center mb-6 relative z-10 shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 group-hover:border-purple-300 dark:group-hover:border-purple-600 transition-all duration-300"
                  whileHover={{ scale: 1.1 }}
                  animate={{
                    boxShadow: [
                      "0 0 20px rgba(168, 85, 247, 0.2)",
                      "0 0 30px rgba(168, 85, 247, 0.4)",
                      "0 0 20px rgba(168, 85, 247, 0.2)"
                    ]
                  }}
                  transition={{
                    boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                  }}
                >
                  <step.icon className="h-10 w-10 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
                </motion.div>
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
