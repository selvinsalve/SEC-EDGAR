from fastapi import APIRouter, UploadFile, File, BackgroundTasks
import shutil
import os
from services import pdf_service, chroma_service

router = APIRouter()
UPLOAD_DIR = "uploads/rules"

os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_rules(file: UploadFile = File(...)):
    """Uploads the rulebook PDF and stores it in ChromaDB."""
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Extract text
    text = pdf_service.extract_text_from_pdf(file_path)
    
    # Index in ChromaDB
    chunks_count = chroma_service.index_rules(text)
    
    return {
        "status": "success",
        "message": f"Rulebook indexed successfully. Indexed {chunks_count} chunks.",
        "filename": file.filename
    }
