class WorkflowAgent:
    def evaluate(self, doc_data: dict) -> dict:
        """
        Evaluates document data against business rules.
        """
        print(f"Evaluating workflow for: {doc_data.get('filename', 'Unknown')}")
        
        triggers = []
        status = "approved"
        
        # Rule 1: High Value Invoice
        try:
            total_amount_str = doc_data.get("extracted_data", {}).get("total_amount", "0")
            # Clean string to get number (remove $, commas)
            if total_amount_str:
                clean_amount = float(str(total_amount_str).replace("$", "").replace(",", "").strip())
                if clean_amount > 1000:
                    triggers.append("High Value Invoice (> $1000)")
                    status = "needs_approval"
        except:
            pass # Ignore parsing errors
            
        # Rule 2: Missing Vendor
        if not doc_data.get("extracted_data", {}).get("vendor"):
             triggers.append("Missing Vendor Information")
             status = "needs_review"

        return {
            "status": status,
            "triggers": triggers,
            "requires_human_review": status != "approved"
        }

workflow_agent = WorkflowAgent()
