import { useState, useEffect, useRef } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Send, Bot, User, FileText, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";

interface Document {
  id: string;
  filename: string;
  extracted_data: any;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

const Chat = () => {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchDocuments = async () => {
    const { data } = await supabase
      .from("documents")
      .select("id, filename, extracted_data")
      .order("created_at", { ascending: false });

    if (data) {
      setDocuments(data as any);
    }
  };

  const fetchMessages = async () => {
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .order("created_at", { ascending: true });

    if (data) {
      setMessages(data as ChatMessage[]);
    }
  };

  useEffect(() => {
    fetchDocuments();
    fetchMessages();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleDocToggle = (docId: string) => {
    setSelectedDocs(prev =>
      prev.includes(docId)
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setLoading(true);

    // Add user message
    const userMessage = {
      user_id: user.id,
      role: "user" as const,
      content: input,
      document_ids: selectedDocs
    };

    const { error: userError } = await supabase
      .from("chat_messages")
      .insert(userMessage);

    if (userError) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message"
      });
      setLoading(false);
      return;
    }

    // Prepare Context from Selected Docs
    let contextText = "";
    if (selectedDocs.length > 0) {
      const selectedDocObjects = documents.filter(d => selectedDocs.includes(d.id));
      contextText = selectedDocObjects.map(d => {
        // FIX APPLIED: Improved extracted data handling
        const extractedData = d.extracted_data || {};
        const text = extractedData.text || extractedData.full_text || "";
        
        let context = `Document: ${d.filename}\nExtracted Data: ${JSON.stringify(extractedData, null, 2)}\n`;
        if (text) context += `Full Text: ${text}`;
        return context;
      }).join("\n\n");
    }

    // Call RIDA Backend
    let aiResponseContent = "I'm sorry, I couldn't process that.";
    try {
      const response = await fetch("http://localhost:8000/agents/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          context: contextText
        })
      });

      if (response.ok) {
        const data = await response.json();
        aiResponseContent = data.response;
      } else {
        aiResponseContent = "Error communicating with RIDA Brain.";
      }
    } catch (e) {
      console.error(e);
      aiResponseContent = "Failed to connect to RIDA Backend.";
    }

    // Save RIDA response
    const ridaResponse = {
      user_id: user.id,
      role: "assistant" as const,
      content: aiResponseContent,
      document_ids: selectedDocs
    };

    await supabase
      .from("chat_messages")
      .insert(ridaResponse);

    setInput("");
    fetchMessages();
    setLoading(false);
  };

  return (
    <AppShell>
      <div className="flex flex-col gap-6 h-[calc(100vh-8rem)] lg:grid lg:grid-cols-[300px_1fr]">
        {/* Documents Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="flex flex-col max-h-[200px] lg:max-h-none border-none shadow-md bg-white/50 dark:bg-black/20 backdrop-blur-sm h-full">
            <CardHeader className="pb-3 border-b bg-muted/30">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Context Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto p-0">
              <div className="p-4 space-y-2">
                {documents.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No documents available</p>
                ) : (
                  documents.map((doc, index) => (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-center space-x-3 p-2 rounded-lg transition-colors cursor-pointer ${selectedDocs.includes(doc.id) ? "bg-primary/10" : "hover:bg-muted"
                        }`}
                      onClick={() => handleDocToggle(doc.id)}
                    >
                      <Checkbox
                        id={doc.id}
                        checked={selectedDocs.includes(doc.id)}
                        onCheckedChange={() => handleDocToggle(doc.id)}
                        className="pointer-events-none"
                      />
                      <label
                        htmlFor={doc.id}
                        className="text-sm font-medium leading-none cursor-pointer flex-1 truncate"
                      >
                        {doc.filename}
                      </label>
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Chat Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col h-full min-h-0"
        >
          <Card className="flex flex-1 flex-col min-h-0 border-none shadow-md overflow-hidden bg-white/50 dark:bg-black/20 backdrop-blur-sm">
            <CardHeader className="pb-3 border-b bg-muted/30">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-500" />
                Chat with RIDA
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col min-h-0 p-0">
              <div className="flex-1 space-y-6 overflow-auto p-4 min-h-0">
                {messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-muted-foreground gap-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 260, damping: 20 }}
                      className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center"
                    >
                      <Bot className="h-8 w-8 text-primary" />
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-center"
                    >
                      <p className="font-medium text-foreground">How can I help you today?</p>
                      <p className="text-sm mt-1">Select documents on the left and ask questions.</p>
                    </motion.div>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.2 }}
                        className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"
                          }`}
                      >
                        {msg.role === "assistant" && (
                          <Avatar className="h-8 w-8 border bg-primary/10 mt-1">
                            <AvatarFallback><Bot className="h-4 w-4 text-primary" /></AvatarFallback>
                          </Avatar>
                        )}

                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${msg.role === "user"
                            ? "bg-primary text-primary-foreground rounded-br-none"
                            : "bg-white dark:bg-zinc-800 border rounded-bl-none"
                            }`}
                        >
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                        </div>

                        {msg.role === "user" && (
                          <Avatar className="h-8 w-8 border bg-muted mt-1">
                            <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                          </Avatar>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t bg-background/50 backdrop-blur-sm">
                <div className="relative flex gap-2">
                  <Input
                    placeholder="Ask RIDA about your documents..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && !loading && handleSend()}
                    disabled={loading}
                    className="pr-12 h-12 text-base shadow-sm bg-background/80 backdrop-blur-sm focus-visible:ring-primary/50"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={loading}
                    size="icon"
                    className="absolute right-1 top-1 h-10 w-10 rounded-lg shadow-sm hover:shadow-md transition-all"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-[10px] text-center text-muted-foreground mt-2">
                  RIDA can make mistakes. Please verify important information.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppShell>
  );
};

export default Chat;