import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

print(f"GenAI Version: {genai.__version__}")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

def test_model(model_name):
    print(f"Testing model: {model_name}")
    try:
        model = genai.GenerativeModel(model_name)
        response = model.generate_content("Hello")
        print(f"Success! Response: {response.text}")
        return True
    except Exception as e:
        print(f"Failed: {e}")
        return False

models_to_test = [
    "gemini-2.0-flash-exp",
    "gemini-1.5-flash-latest"
]

for m in models_to_test:
    if test_model(m):
        break
