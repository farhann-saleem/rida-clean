import json
from llm_client import generate_text

class ExtractionAgent:
    def extract(self, text: str, doc_type: str) -> dict:
        """
        Extracts structured fields from text based on document type.
        """
        print(f"Extracting data for type: {doc_type}")
        
        # Define fields based on type
        fields_prompt = ""
        if doc_type.lower() == "invoice":
            fields_prompt = "Vendor Name, Invoice Date, Invoice Number, Total Amount, Currency"
        elif doc_type.lower() == "receipt":
            fields_prompt = "Merchant Name, Date, Total Amount, Tax Amount"
        elif doc_type.lower() == "contract":
            fields_prompt = "Parties Involved, Effective Date, Expiration Date, Key Terms"
        else:
            fields_prompt = "Key Entities, Dates, Monetary Values, Summary"

        prompt = f"""
        You are an expert data extraction AI. Extract the following fields from the document text below.
        
        Document Text:
        {text[:3000]} # Truncate to fit context

        Fields to Extract: {fields_prompt}

        Return ONLY valid JSON in this format:
        {{
            "field_name": "extracted_value",
            ...
        }}
        If a field is not found, use null.
        """

        try:
            llm_response = generate_text(prompt)
            clean_response = llm_response.replace("```json", "").replace("```", "").strip()
            result = json.loads(clean_response)
            return result
        except json.JSONDecodeError:
            print(f"Failed to parse LLM response: {llm_response}")
            return {"error": "Failed to parse extraction result", "raw": llm_response}
        except Exception as e:
            print(f"Error in ExtractionAgent: {e}")
            return {"error": str(e)}

extraction_agent = ExtractionAgent()
