from datetime import datetime, timedelta

class WorkflowAgent:
    def __init__(self):
        # In-memory cache for vendor averages (in production, use database)
        self.vendor_history = {}
    
    def evaluate(self, doc_data: dict, all_documents: list = None) -> dict:
        """
        Evaluates document data against business rules and detects anomalies.
        """
        print(f"Evaluating workflow for: {doc_data.get('filename', 'Unknown')}")
        
        triggers = []
        anomalies = []
        status = "approved"
        
        # Extract key data
        extracted = doc_data.get("extracted_data", {})
        vendor = extracted.get("vendor", "").strip()
        total_amount_str = extracted.get("total_amount", "0")
        invoice_number = extracted.get("invoice_number", "")
        date_str = extracted.get("date", "")
        
        # Parse amount
        try:
            clean_amount = float(str(total_amount_str).replace("$", "").replace(",", "").strip())
        except:
            clean_amount = 0
            anomalies.append({
                "type": "missing_amount",
                "severity": "high",
                "message": "Unable to extract total amount"
            })
        
        # Rule 1: High Value Invoice
        if clean_amount > 1000:
            triggers.append("High Value Invoice (> $1000)")
            status = "needs_approval"
        
        # Rule 2: Missing Required Fields
        if not vendor:
            triggers.append("Missing Vendor Information")
            anomalies.append({
                "type": "missing_vendor",
                "severity": "high",
                "message": "Vendor name is missing"
            })
            status = "needs_review"
        
        if not date_str:
            anomalies.append({
                "type": "missing_date",
                "severity": "medium",
                "message": "Invoice date is missing"
            })
        
        # Anomaly Detection (if we have historical data)
        if all_documents and vendor:
            # Calculate vendor average
            vendor_amounts = []
            vendor_invoices = []
            
            for doc in all_documents:
                doc_vendor = doc.get("extracted_data", {}).get("vendor", "").strip()
                if doc_vendor.lower() == vendor.lower():
                    try:
                        amt_str = doc.get("extracted_data", {}).get("total_amount", "0")
                        amt = float(str(amt_str).replace("$", "").replace(",", "").strip())
                        vendor_amounts.append(amt)
                        vendor_invoices.append(doc)
                    except:
                        pass
            
            # Anomaly 1: Outlier Detection (amount > 3x average)
            if len(vendor_amounts) >= 2:
                avg_amount = sum(vendor_amounts) / len(vendor_amounts)
                if clean_amount > avg_amount * 3:
                    anomalies.append({
                        "type": "outlier_amount",
                        "severity": "high",
                        "message": f"Amount ${clean_amount:,.2f} is {clean_amount/avg_amount:.1f}x higher than average ${avg_amount:,.2f} for {vendor}",
                        "details": {
                            "average": avg_amount,
                            "current": clean_amount,
                            "multiplier": clean_amount / avg_amount
                        }
                    })
                    status = "needs_review"
            
            # Anomaly 2: Duplicate Invoice Detection
            if invoice_number:
                for doc in vendor_invoices:
                    doc_inv_num = doc.get("extracted_data", {}).get("invoice_number", "")
                    if doc_inv_num and doc_inv_num.strip().lower() == invoice_number.strip().lower():
                        if doc.get("id") != doc_data.get("id"):  # Not the same document
                            anomalies.append({
                                "type": "duplicate_invoice",
                                "severity": "critical",
                                "message": f"Duplicate invoice number {invoice_number} detected for {vendor}",
                                "details": {
                                    "duplicate_doc_id": doc.get("id"),
                                    "duplicate_filename": doc.get("filename")
                                }
                            })
                            status = "needs_review"
                            break
        
        # Anomaly 3: Unusually Low Amount (possible data entry error)
        if clean_amount > 0 and clean_amount < 1:
            anomalies.append({
                "type": "suspiciously_low",
                "severity": "medium",
                "message": f"Amount ${clean_amount:.2f} is unusually low - possible data entry error"
            })
        
        # Anomaly 4: Round Number (might indicate estimate)
        if clean_amount > 0 and clean_amount % 100 == 0 and clean_amount >= 500:
            anomalies.append({
                "type": "round_number",
                "severity": "low",
                "message": f"Amount ${clean_amount:,.0f} is a round number - might be an estimate"
            })
        
        return {
            "status": status,
            "triggers": triggers,
            "anomalies": anomalies,
            "requires_human_review": status != "approved",
            "anomaly_count": len(anomalies),
            "risk_level": "high" if any(a["severity"] == "critical" for a in anomalies) else 
                         "medium" if any(a["severity"] == "high" for a in anomalies) else "low"
        }

workflow_agent = WorkflowAgent()
