import os
import json
from ocr import extract_text_from_image, extract_text_from_pdf, generate_thumbnail
from llm_client import generate_text

class IngestionAgent:
    def __init__(self):
        self.supported_types = ["invoice", "receipt", "contract", "financial_statement", "other"]

    def process(self, file_path: str, filename: str) -> dict:
        """
        Ingests a document:
        1. Extracts text (OCR).
        2. Classifies the document type using LLM.
        3. Generates a brief summary.
        """
        print(f"[Raindrop MCP] Ingesting document: {filename}")
        print(f"[Raindrop MCP] Initializing SmartBucket for storage...")
        
        # 1. Extract Text
        file_ext = os.path.splitext(filename)[1].lower()
        text = ""
        
        if file_ext in [".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tiff"]:
            text = extract_text_from_image(file_path)
        elif file_ext == ".pdf":
            text = extract_text_from_pdf(file_path)
        else:
            return {"error": f"Unsupported file type: {file_ext}"}

        if not text:
            return {"error": "No text extracted from document."}

        # 2. Classify & Summarize (One shot for efficiency)
        prompt = f"""
        You are an expert document analysis AI. Analyze the following document text and provide a structured JSON response.
        
        Document Text:
        {text[:2000]}  # Truncate to avoid context limits if necessary, usually header contains type info

        Task:
        1. Classify the document into one of these types: {', '.join(self.supported_types)}.
        2. Provide a confidence score (0.0 to 1.0).
        3. Write a 1-sentence summary of what this document is about.

        Return ONLY valid JSON in this format:
        {{
            "type": "invoice",
            "confidence": 0.95,
            "summary": "Invoice from Acme Corp for web services."
        }}
        """
        
        try:
            llm_response = generate_text(prompt)
            # Clean up response if LLM adds markdown blocks
            clean_response = llm_response.replace("```json", "").replace("```", "").strip()
            result = json.loads(clean_response)
            
            # Generate Thumbnail
            print(f"[Raindrop MCP] Generating SmartThumbnail...")
            thumbnail_filename = f"{os.path.splitext(os.path.basename(filename))[0]}_{os.path.basename(file_path)}.png"
            thumbnail_path = os.path.join("backend/static/thumbnails", thumbnail_filename)
            thumbnail_url = ""
            
            if generate_thumbnail(file_path, thumbnail_path):
                # URL accessible from frontend
                thumbnail_url = f"http://localhost:8000/static/thumbnails/{thumbnail_filename}"

            # Add metadata
            result["filename"] = filename
            result["extracted_text_length"] = len(text)
            result["text"] = text  # Return full text for extraction
            result["thumbnail_url"] = thumbnail_url
            
            return result
        except json.JSONDecodeError:
            print(f"Failed to parse LLM response: {llm_response}")
            return {
                "filename": filename,
                "type": "unknown",
                "confidence": 0.0,
                "summary": "Failed to classify document.",
                "raw_llm_response": llm_response
            }
        except Exception as e:
            print(f"Error in IngestionAgent: {e}")
            return {"error": str(e)}

ingestion_agent = IngestionAgent()
