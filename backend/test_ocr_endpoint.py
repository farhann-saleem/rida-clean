import requests
import os

def test_ocr():
    url = "http://localhost:8000/documents/ocr-test"
    file_path = "backend/test_image.png"
    
    if not os.path.exists(file_path):
        print(f"File {file_path} does not exist.")
        return

    with open(file_path, "rb") as f:
        files = {"file": f}
        try:
            response = requests.post(url, files=files)
            if response.status_code == 200:
                print("Success!")
                print(response.json())
            else:
                print(f"Failed with status {response.status_code}")
                print(response.text)
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    test_ocr()
