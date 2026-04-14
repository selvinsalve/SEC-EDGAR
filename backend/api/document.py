from fastapi import APIRouter, UploadFile, File, Request, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from pydantic import BaseModel
import shutil
import os
import uuid
import asyncio

from services import pdf_service, chroma_service, llm_service

router = APIRouter()
UPLOAD_DIR = "uploads/documents"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# In-memory storage for filing sessions
sessions = {}

class EditRedlineReq(BaseModel):
    redline_index: int
    edited_text: str
    filing_type: str

class ApproveReq(BaseModel):
    filing_type: str
    approve: bool

@router.get("/dashboard")
def get_dashboard():
    # Return mock data conforming to template structure
    return {
        "user_id": "test",
        "company": "SEC Comply",
        "filings": {
            "10-K": { "document_count": 1, "status": "Ready", "risk_level": sessions.get("10-K", {}).get("risk_level", "Unknown") },
            "10-Q": { "document_count": 0, "status": "Pending", "risk_level": None },
            "8-K": { "document_count": 0, "status": "Pending", "risk_level": None }
        }
    }

async def analyze_document_background(filing_type: str, session_id: str, full_text: str):
    """Exhaustive background scan of the entire document."""
    print(f"Starting background scan for {filing_type} ({session_id})")
    
    # Split the document into chunks
    chunks = chroma_service.chunk_text(full_text, chunk_size=3000, overlap=500)
    total_chunks = len(chunks)
    
    overall_risk = "LOW"
    all_redlines = []
    
    for i, chunk in enumerate(chunks):
        progress_msg = f"Analyzing section {i+1} of {total_chunks}..."
        print(progress_msg)
        
        # Update session status with progress
        if filing_type in sessions:
            sessions[filing_type]["status"] = "Processing"
            sessions[filing_type]["message"] = progress_msg
            
        # Get rules for this specific chunk
        rules_context = chroma_service.query_relevant_rules(f"Form {filing_type}", chunk)
        
        # Call LLM
        analysis = await llm_service.analyze_compliance(chunk, rules_context)
        
        # Aggregate Redlines
        if "redlines" in analysis:
            all_redlines.extend(analysis["redlines"])
            
        # Aggregate Risk: HIGH > MEDIUM > LOW
        chunk_risk = (analysis.get("risk_level") or "LOW").upper()
        if chunk_risk == "HIGH":
            overall_risk = "HIGH"
        elif chunk_risk == "MEDIUM" and overall_risk != "HIGH":
            overall_risk = "MEDIUM"
            
    # Final Update
    if filing_type in sessions:
        sessions[filing_type].update({
            "status": "Completed",
            "risk_level": overall_risk,
            "redlines": all_redlines,
            "message": "Full document analysis complete."
        })
    print(f"Background scan complete for {filing_type}. Result: {overall_risk}")

@router.get("/status/{filing_type}")
def get_status(filing_type: str):
    session = sessions.get(filing_type)
    if not session:
        return {"filing_type": filing_type, "status": "idle", "message": "Ready to analyze."}
    
    status_str = session.get("status", "Unknown")
    message = session.get("message", "Processing...")
    
    # Ensure redlines match frontend keys (suggested or text)
    redlines = session.get("redlines", [])
    for r in redlines:
        if "proposed_text" in r and "suggested" not in r:
            r["suggested"] = r["proposed_text"]
        if "proposed_text" in r and "text" not in r:
            r["text"] = r["proposed_text"]

    risk_level = (session.get("risk_level") or "UNKNOWN").upper()

    return {
        "filing_type": filing_type,
        "session_id": session["session_id"],
        "status": status_str,
        "risk_level": risk_level,
        "redlines": redlines,
        "needs_review": risk_level in ["MEDIUM", "HIGH"],
        "consistency_score": 0.85,
        "message": message
    }

@router.post("/upload/{filing_type}")
async def upload_filing(filing_type: str, background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    print(f"--- Received upload for {filing_type} ---")
    doc_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{doc_id}_{file.filename}")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    print(f"Extracting text from {file.filename}...")
    full_text = pdf_service.extract_text_from_pdf(file_path, max_pages=20)
    
    # Initialize session in "Processing" state
    sessions[filing_type] = {
        "session_id": doc_id,
        "full_text": full_text,
        "status": "Processing",
        "message": "Initializing background scan...",
        "risk_level": "UNKNOWN",
        "redlines": []
    }
    
    # Start the exhaustive scan in the background
    background_tasks.add_task(analyze_document_background, filing_type, doc_id, full_text)
    
    return get_status(filing_type)

@router.post("/edit-redline/{filing_type}")
def edit_redline(req: EditRedlineReq, filing_type: str):
    session = sessions.get(filing_type)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    session["redlines"][req.redline_index]["proposed_text"] = req.edited_text
    return {"status": "success"}

@router.post("/continue-workflow/{filing_type}")
async def continue_workflow(filing_type: str, background_tasks: BackgroundTasks):
    session = sessions.get(filing_type)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    print(f"Applying edits and starting re-analysis for {filing_type}...")
    
    # Apply redlines to full_text
    modified_text = session["full_text"]
    for rr in session["redlines"]:
        orig = rr.get("original_text")
        prop = rr.get("proposed_text")
        if orig and prop:
            modified_text = modified_text.replace(orig, prop)
            
    session["full_text"] = modified_text
    session["status"] = "Processing"
    session["message"] = "Starting exhaustive re-scan..."
    
    background_tasks.add_task(analyze_document_background, filing_type, session["session_id"], modified_text)
    
    return get_status(filing_type)

@router.post("/approve/{filing_type}")
def approve_filing(req: ApproveReq, filing_type: str):
    session = sessions.get(filing_type)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    if req.approve:
        print(f"Generating final SEC styled PDF for {filing_type}...")
        pdf_path = pdf_service.generate_sec_10k_pdf(session["full_text"])
        return FileResponse(pdf_path, media_type="application/pdf", filename=f"Form_{filing_type}_Compliant.pdf")
    else:
        return {"status": "rejected"}

@router.get("/analytics/{filing_type}")
async def get_analytics(filing_type: str):
    session = sessions.get(filing_type)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    print(f"Extracting financial analytics for {filing_type}...")
    financials = await llm_service.extract_financials(session["full_text"])
    return financials

@router.get("/preview/{filing_type}")
def get_pdf_preview(filing_type: str):
    session = sessions.get(filing_type)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Generate current version of PDF from full_text
    print(f"Generating preview PDF for {filing_type}...")
    pdf_path = pdf_service.generate_sec_10k_pdf(session["full_text"])
    return FileResponse(pdf_path, media_type="application/pdf")

@router.delete("/session/{filing_type}")
def delete_session(filing_type: str):
    if filing_type in sessions:
        del sessions[filing_type]
    return {"status": "cleared"}
