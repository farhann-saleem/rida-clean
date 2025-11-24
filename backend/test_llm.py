import requests

def test_llm():
    url = "http://localhost:8000/llm-test"
    params = {"prompt": "Briefly explain what OCR is in one sentence."}
    
    try:
        response = requests.post(url, params=params)
        if response.status_code == 200:
            print("Success!")
            print(response.json())
        else:
            print(f"Failed with status {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_llm()
