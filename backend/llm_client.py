import ollama
import os
from dotenv import load_dotenv

load_dotenv()

# Configuration
OLLAMA_MODEL = "gemma3:4b"

def generate_text(prompt: str) -> str:
    """
    Generates text using local Ollama model.
    """
    try:
        response = ollama.chat(model=OLLAMA_MODEL, messages=[
            {
                'role': 'user',
                'content': prompt,
            },
        ])
        return response['message']['content']
    except Exception as e:
        print(f"Ollama API Error: {e}")
        return f"Error generating text: {str(e)}"

def analyze_document(text: str, prompt: str) -> str:
    """
    Analyzes document text with a specific prompt.
    """
    full_prompt = f"Document Text:\n{text}\n\nTask:\n{prompt}"
    return generate_text(full_prompt)
