from llm_client import generate_text
import json

class AnalyticsAgent:
    def analyze(self, documents: list, query: str = None) -> dict:
        """
        Performs multi-document analytics and intelligence.
        Can answer natural language queries about documents.
        """
        print(f"Analyzing {len(documents)} documents...")
        
        # Basic analytics
        total_documents = len(documents)
        
        # Extract amounts and vendors
        amounts = []
        vendors = {}
        categories = {}
        monthly_spend = {}
        
        for doc in documents:
            extracted = doc.get("extracted_data", {})
            
            print(f"DEBUG: Processing doc {doc.get('filename', 'unknown')}")
            print(f"DEBUG: Extracted data: {extracted}")
            
            # Parse amount
            amount_str = extracted.get("total_amount", "0")
            print(f"DEBUG: Amount string: {amount_str}")
            
            # Skip documents with pending extraction
            if amount_str in ["Pending", "N/A", "Pending Extraction", None, "", "Unknown"]:
                print(f"DEBUG: Skipping document with pending extraction")
                continue
            
            try:
                amount = float(str(amount_str).replace("$", "").replace(",", "").strip())
                amounts.append(amount)
                print(f"DEBUG: Parsed amount: {amount}")
            except Exception as e:
                print(f"DEBUG: Failed to parse amount: {e}")
                continue
            
            # Track by vendor - check 'vendor' field (what we actually save)
            vendor = extracted.get("vendor") or "Unknown"
            print(f"DEBUG: Vendor: {vendor}")
            
            # Skip documents with pending vendor
            if vendor in ["Pending Extraction", "Unknown", None, ""]:
                print(f"DEBUG: Skipping document with unknown vendor")
                continue
                
            vendors[vendor] = vendors.get(vendor, 0) + amount
            
            # Track by category/type
            doc_type = extracted.get("detected_type", doc.get("file_type", "other"))
            categories[doc_type] = categories.get(doc_type, 0) + amount
            
            # Track by month
            date_str = extracted.get("date", "")
            if date_str:
                try:
                    month = date_str[:7]  # YYYY-MM
                    monthly_spend[month] = monthly_spend.get(month, 0) + amount
                except:
                    pass
        
        # Calculate statistics
        total_spend = sum(amounts)
        avg_spend = total_spend / len(amounts) if amounts else 0
        max_spend = max(amounts) if amounts else 0
        min_spend = min(amounts) if amounts else 0
        
        # Top vendors
        top_vendors = sorted(vendors.items(), key=lambda x: x[1], reverse=True)[:5]
        
        # Prepare response
        analytics = {
            "summary": {
                "total_documents": total_documents,
                "total_spend": f"${total_spend:,.2f}",
                "average_spend": f"${avg_spend:,.2f}",
                "highest_amount": f"${max_spend:,.2f}",
                "lowest_amount": f"${min_spend:,.2f}"
            },
            "by_vendor": [
                {
                    "vendor": v, 
                    "total": f"${amt:,.2f}", 
                    "count": sum(1 for d in documents if (d.get("extracted_data", {}).get("vendor_name") or d.get("extracted_data", {}).get("vendor") or d.get("extracted_data", {}).get("merchant_name")) == v)
                }
                for v, amt in top_vendors
            ],
            "by_category": [
                {"category": cat, "total": f"${amt:,.2f}"}
                for cat, amt in sorted(categories.items(), key=lambda x: x[1], reverse=True)
            ],
            "monthly_trends": [
                {"month": month, "total": f"${amt:,.2f}"}
                for month, amt in sorted(monthly_spend.items())
            ]
        }
        
        # Natural language query processing
        if query:
            analytics["query_response"] = self._process_query(query, documents, analytics)
        
        return analytics
    
    def _process_query(self, query: str, documents: list, analytics: dict) -> str:
        """Process natural language queries using LLM"""
        context = f"""
        Analytics Summary:
        {json.dumps(analytics, indent=2)}
        
        Total Documents: {len(documents)}
        """
        
        prompt = f"""
        You are a financial analytics assistant. Answer the user's question based on the data provided.
        
        {context}
        
        User Question: {query}
        
        Provide a clear, concise answer with specific numbers.
        """
        
        try:
            response = generate_text(prompt)
            return response.strip()
        except:
            return "Unable to process query at this time."

analytics_agent = AnalyticsAgent()
