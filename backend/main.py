import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from api import auth, document
from services import pdf_service, chroma_service

RULES_DIR = "rules_pdfs"

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup Sync Database tables
    Base.metadata.create_all(bind=engine)
    
    # Startup Sync Rule PDFs
    os.makedirs(RULES_DIR, exist_ok=True)
    pdf_files = [f for f in os.listdir(RULES_DIR) if f.endswith(".pdf")]
    
    for pdf_file in pdf_files:
        filepath = os.path.join(RULES_DIR, pdf_file)
        form_type = pdf_file.replace(".pdf", "") # e.g. "Form 10-K"
        try:
            print(f"Checking for updates in {pdf_file}...")
            text = pdf_service.extract_text_from_pdf(filepath)
            chroma_service.sync_rule_pdf(form_type, text, filepath)
        except Exception as e:
            print(f"Failed to index {pdf_file}: {e}")
            
    yield
    # Shutdown logic if any

app = FastAPI(title="SEC Comply Backend", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(document.router, prefix="/api", tags=["document"])

@app.get("/")
def root():
    return {"status": "running", "message": "SEC Comply Backend"}
