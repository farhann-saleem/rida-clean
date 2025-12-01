from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import shutil
import os
import uuid
from datetime import datetime
from dotenv import load_dotenv
from ocr import extract_text_from_image, extract_text_from_pdf
from llm_client import generate_text
from agents.ingestion_agent import ingestion_agent
from agents.extraction_agent import extraction_agent
from agents.chat_agent import chat_agent
from agents.workflow_agent import workflow_agent
from agents.analytics_agent import analytics_agent
from agents.export_agent import export_agent
from agents.vultr_service import vultr_service

load_dotenv()

app = FastAPI()

# Simple in-memory rate limiting (for hackathon demo)
# Structure: { "user_id": { "uploads": 0, "questions": 0 } }
usage_limits = {}

def check_limit(user_id: str, limit_type: str, max_count: int):
    if user_id not in usage_limits:
        usage_limits[user_id] = {"uploads": 0, "questions": 0}
    
    if usage_limits[user_id][limit_type] >= max_count:
        raise HTTPException(status_code=429, detail=f"Free Tier Limit Reached: Max {max_count} {limit_type} allowed.")
    
    usage_limits[user_id][limit_type] += 1


# Mount static directory for thumbnails
os.makedirs("backend/static/thumbnails", exist_ok=True)
app.mount("/static", StaticFiles(directory="backend/static"), name="static")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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

@app.post("/llm-test")
async def llm_test(prompt: str = "Hello, who are you?"):
    response = generate_text(prompt)
    return {"response": response}

@app.post("/agents/ingest")
async def ingest_document(file: UploadFile = File(...), user_id: str = "demo_user"):
    # Enforce Rate Limit (3 uploads)
    check_limit(user_id, "uploads", 3)

    file_extension = os.path.splitext(file.filename)[1].lower()
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(TMP_DIR, unique_filename)

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Simulate Raindrop MCP Routing
        print(f"[Raindrop MCP] Routing document {file.filename} to SmartBuckets...")
        
        # Simulate Vultr Backup
        with open(file_path, "rb") as f:
            file_data = f.read()
            vultr_response = vultr_service.upload_file(unique_filename, file_data)
            print(f"[Vultr] Backup status: {vultr_response}")

        result = ingestion_agent.process(file_path, file.filename)
        
        # Add Vultr metadata to result
        result["vultr_backup_url"] = vultr_response.get("url")
        result["raindrop_status"] = "processed"
        
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except:
                pass

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

class ChatRequest(BaseModel):
    message: str
    context: str
    user_id: str = "demo_user"

@app.post("/agents/chat")
async def chat_with_docs(request: ChatRequest):
    # Enforce Rate Limit (5 questions)
    check_limit(request.user_id, "questions", 5)

    try:
        response = chat_agent.chat(request.message, request.context)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class WorkflowRequest(BaseModel):
    doc_data: dict
    all_documents: list = None

@app.post("/agents/workflow")
async def run_workflow(request: WorkflowRequest):
    try:
        result = workflow_agent.evaluate(request.doc_data, request.all_documents)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Analytics endpoint
class AnalyticsRequest(BaseModel):
    documents: list
    query: str = None

@app.post("/agents/analytics")
async def get_analytics(request: AnalyticsRequest):
    try:
        result = analytics_agent.analyze(request.documents, request.query)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Export endpoint
class ExportRequest(BaseModel):
    documents: list
    format: str  # 'csv', 'quickbooks', 'excel'

@app.post("/agents/export")
async def export_documents(request: ExportRequest):
    try:
        if request.format == 'csv':
            content = export_agent.export_to_csv(request.documents)
            return {"content": content, "filename": f"rida_export_{datetime.now().strftime('%Y%m%d')}.csv"}
        elif request.format == 'quickbooks':
            content = export_agent.export_to_quickbooks_iif(request.documents)
            return {"content": content, "filename": f"rida_export_{datetime.now().strftime('%Y%m%d')}.iif"}
        elif request.format == 'excel':
            data = export_agent.export_to_excel_compatible(request.documents)
            return {"data": data, "filename": f"rida_export_{datetime.now().strftime('%Y%m%d')}.xlsx"}
        else:
            raise HTTPException(status_code=400, detail="Invalid format. Use 'csv', 'quickbooks', or 'excel'")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Comparison endpoint
class ComparisonRequest(BaseModel):
    doc1_data: dict
    doc2_data: dict

@app.post("/agents/compare")
async def compare_documents(request: ComparisonRequest):
    try:
        # Extract data from both documents
        doc1_extracted = request.doc1_data.get("extracted_data", {})
        doc2_extracted = request.doc2_data.get("extracted_data", {})
        
        # Build comparison
        comparison = {
            "document1": {
                "filename": request.doc1_data.get("filename"),
                "vendor": doc1_extracted.get("vendor", ""),
                "amount": doc1_extracted.get("total_amount", ""),
                "date": doc1_extracted.get("date", ""),
                "invoice_number": doc1_extracted.get("invoice_number", "")
            },
            "document2": {
                "filename": request.doc2_data.get("filename"),
                "vendor": doc2_extracted.get("vendor", ""),
                "amount": doc2_extracted.get("total_amount", ""),
                "date": doc2_extracted.get("date", ""),
                "invoice_number": doc2_extracted.get("invoice_number", "")
            },
            "differences": [],
            "is_duplicate": False
        }
        
        # Check for differences
        if doc1_extracted.get("vendor") != doc2_extracted.get("vendor"):
            comparison["differences"].append({"field": "vendor", "type": "different"})
        
        if doc1_extracted.get("total_amount") != doc2_extracted.get("total_amount"):
            comparison["differences"].append({"field": "amount", "type": "different"})
        
        # Check for duplicate
        if (doc1_extracted.get("vendor", "").lower() == doc2_extracted.get("vendor", "").lower() and
            doc1_extracted.get("invoice_number") == doc2_extracted.get("invoice_number") and
            doc1_extracted.get("invoice_number")):
            comparison["is_duplicate"] = True
            comparison["differences"].append({"field": "invoice_number", "type": "duplicate"})
        
        return comparison
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
