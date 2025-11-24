from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import uuid
from dotenv import load_dotenv
from ocr import extract_text_from_image, extract_text_from_pdf

load_dotenv()

app = FastAPI()

# CORS configuration
origins = [
    "http://localhost:5173", # Vite default port
    "http://localhost:3000", # Next.js default port
    "*" # Allow all for hackathon/dev speed
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure tmp directory exists
TMP_DIR = os.path.join(os.path.dirname(__file__), "tmp")
os.makedirs(TMP_DIR, exist_ok=True)

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.post("/documents/ocr-test")
async def ocr_test(file: UploadFile = File(...)):
    file_extension = os.path.splitext(file.filename)[1].lower()
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(TMP_DIR, unique_filename)

    try:
        # Save uploaded file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        extracted_text = ""
        content_type = "unknown"

        if file_extension in [".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tiff"]:
            content_type = "image"
            extracted_text = extract_text_from_image(file_path)
        elif file_extension == ".pdf":
            content_type = "pdf"
            extracted_text = extract_text_from_pdf(file_path)
        else:
            # Fallback or error for unsupported types
            # For now, let's just try to read it as text or return error
             raise HTTPException(status_code=400, detail=f"Unsupported file type: {file_extension}")

        return {
            "filename": file.filename,
            "content_type": content_type,
            "text": extracted_text
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Cleanup: remove the temporary file
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception as cleanup_error:
                print(f"Failed to remove temp file {file_path}: {cleanup_error}")

from llm_client import generate_text

@app.post("/llm-test")
async def llm_test(prompt: str = "Hello, who are you?"):
    response = generate_text(prompt)
    return {"response": response}

from agents.ingestion_agent import ingestion_agent

@app.post("/agents/ingest")
async def ingest_document(file: UploadFile = File(...)):
    file_extension = os.path.splitext(file.filename)[1].lower()
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(TMP_DIR, unique_filename)

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        result = ingestion_agent.process(file_path, file.filename)
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except:
                pass

from agents.extraction_agent import extraction_agent
from pydantic import BaseModel

class ExtractRequest(BaseModel):
    text: str
    doc_type: str

@app.post("/agents/extract")
async def extract_data(request: ExtractRequest):
    try:
        result = extraction_agent.extract(request.text, request.doc_type)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from agents.chat_agent import chat_agent
from agents.workflow_agent import workflow_agent

class ChatRequest(BaseModel):
    message: str
    context: str

@app.post("/agents/chat")
async def chat_with_docs(request: ChatRequest):
    try:
        response = chat_agent.chat(request.message, request.context)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class WorkflowRequest(BaseModel):
    doc_data: dict

@app.post("/agents/workflow")
async def run_workflow(request: WorkflowRequest):
    try:
        result = workflow_agent.evaluate(request.doc_data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
