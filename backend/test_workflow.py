import requests
import json

def test_workflow():
    url = "http://localhost:8000/agents/workflow"
    
    # Test Case 1: High Value Invoice
    payload_high = {
        "doc_data": {
            "filename": "expensive_invoice.pdf",
            "extracted_data": {
                "vendor": "Tech Corp",
                "total_amount": "$2500.00"
            }
        }
    }
    
    print(f"Sending workflow request (High Value) to {url}...")
    try:
        response = requests.post(url, json=payload_high)
        print(f"Status: {response.status_code}")
        print(response.json())
    except Exception as e:
        print(f"Connection error: {e}")

    print("-" * 20)

    # Test Case 2: Normal Invoice
    payload_normal = {
        "doc_data": {
            "filename": "lunch.pdf",
            "extracted_data": {
                "vendor": "Burger King",
                "total_amount": "$15.50"
            }
        }
    }
    
    print(f"Sending workflow request (Normal) to {url}...")
    try:
        response = requests.post(url, json=payload_normal)
        print(f"Status: {response.status_code}")
        print(response.json())
    except Exception as e:
        print(f"Connection error: {e}")

if __name__ == "__main__":
    test_workflow()
