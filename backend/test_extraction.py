import requests

def test_extraction():
    url = "http://localhost:8000/agents/extract"
    
    # Sample Invoice Text
    sample_text = """
    INVOICE
    Acme Corp
    123 Widget Way
    Date: 2023-10-27
    Invoice #: INV-2023-001
    
    To: John Doe
    
    Description    Amount
    Web Design     $500.00
    Hosting        $50.00
    
    Total: $550.00
    """
    
    payload = {
        "text": sample_text,
        "doc_type": "invoice"
    }
    
    print(f"Sending extraction request to {url}...")
    try:
        response = requests.post(url, json=payload)
        if response.status_code == 200:
            print("Success!")
            print(response.json())
        else:
            print(f"Failed with status {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_extraction()
