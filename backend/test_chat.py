import requests
import json

def test_chat():
    url = "http://localhost:8000/agents/chat"
    
    payload = {
        "message": "What is the total amount?",
        "context": "Document: invoice.pdf\nVendor: Acme Corp\nDate: 2023-10-27\nTotal Amount: $550.00\nItems: Widget A, Widget B"
    }
    
    print(f"Sending chat request to {url}...")
    try:
        response = requests.post(url, json=payload)
        if response.status_code == 200:
            print("Success!")
            print(response.json())
        else:
            print(f"Error: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"Connection error: {e}")

if __name__ == "__main__":
    test_chat()
