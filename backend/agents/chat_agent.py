from llm_client import generate_text

class ChatAgent:
    def chat(self, message: str, context_text: str) -> str:
        """
        Answers a user question based on the provided document context.
        """
        print(f"Chat request: {message}")
        
        # Construct RAG prompt
        prompt = f"""
        You are RIDA, an intelligent document assistant. Answer the user's question based ONLY on the provided document context.
        
        Document Context:
        {context_text[:10000]} # Limit context to avoid token overflow
        
        User Question:
        {message}
        
        Instructions:
        1. Be concise and helpful.
        2. If the answer is not in the context, say "I cannot find that information in the documents."
        3. Do not hallucinate facts.
        """
        
        try:
            response = generate_text(prompt)
            return response
        except Exception as e:
            print(f"Error in ChatAgent: {e}")
            return "I encountered an error while processing your request."

chat_agent = ChatAgent()
