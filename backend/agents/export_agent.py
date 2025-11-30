import csv
import io
from datetime import datetime

class ExportAgent:
    def export_to_csv(self, documents: list) -> str:
        """
        Export documents to CSV format
        """
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Header
        writer.writerow([
            'Filename', 'Vendor', 'Invoice Number', 'Date', 'Due Date',
            'Amount', 'Status', 'Category', 'Payment Terms'
        ])
        
        # Data rows
        for doc in documents:
            extracted = doc.get('extracted_data', {})
            writer.writerow([
                doc.get('filename', ''),
                extracted.get('vendor', extracted.get('vendor_name', extracted.get('merchant_name', ''))),
                extracted.get('invoice_number', ''),
                extracted.get('date', ''),
                extracted.get('due_date', ''),
                extracted.get('total_amount', ''),
                doc.get('status', ''),
                extracted.get('detected_type', doc.get('file_type', '')),
                extracted.get('payment_terms', '')
            ])
        
        return output.getvalue()
    
    def export_to_quickbooks_iif(self, documents: list) -> str:
        """
        Export to QuickBooks IIF format (simplified)
        """
        output = io.StringIO()
        
        # IIF Header for Bills
        output.write("!TRNS\tTRNSID\tTRNSTYPE\tDATE\tACCNT\tNAME\tAMOUNT\tMEMO\n")
        output.write("!SPL\tSPLID\tTRNSTYPE\tDATE\tACCNT\tAMOUNT\tMEMO\n")
        output.write("!ENDTRNS\n")
        
        for idx, doc in enumerate(documents):
            extracted = doc.get('extracted_data', {})
            vendor = extracted.get('vendor', extracted.get('vendor_name', 'Unknown'))
            amount_str = extracted.get('total_amount', '0')
            
            # Clean amount
            try:
                amount = float(str(amount_str).replace('$', '').replace(',', '').strip())
            except:
                amount = 0
            
            date = extracted.get('date', datetime.now().strftime('%Y-%m-%d'))
            memo = doc.get('filename', '')
            
            # Transaction line
            output.write(f"TRNS\t{idx+1}\tBILL\t{date}\tAccounts Payable\t{vendor}\t{amount:.2f}\t{memo}\n")
            # Split line (expense account)
            output.write(f"SPL\t{idx+1}\tBILL\t{date}\tExpenses\t-{amount:.2f}\t{memo}\n")
            output.write("ENDTRNS\n")
        
        return output.getvalue()
    
    def export_to_excel_compatible(self, documents: list) -> dict:
        """
        Export to Excel-compatible JSON format (can be converted to XLSX on frontend)
        """
        rows = []
        for doc in documents:
            extracted = doc.get('extracted_data', {})
            rows.append({
                'Filename': doc.get('filename', ''),
                'Vendor': extracted.get('vendor', extracted.get('vendor_name', extracted.get('merchant_name', ''))),
                'Invoice Number': extracted.get('invoice_number', ''),
                'Date': extracted.get('date', ''),
                'Due Date': extracted.get('due_date', ''),
                'Amount': extracted.get('total_amount', ''),
                'Status': doc.get('status', ''),
                'Category': extracted.get('detected_type', doc.get('file_type', '')),
                'Payment Terms': extracted.get('payment_terms', ''),
                'Summary': doc.get('summary', '')
            })
        
        return {
            'headers': list(rows[0].keys()) if rows else [],
            'data': rows
        }

export_agent = ExportAgent()
