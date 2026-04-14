import fitz
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_JUSTIFY, TA_CENTER
from reportlab.lib.colors import black
import tempfile
import os

def extract_text_from_pdf(filepath: str, max_pages: int = 20) -> str:
    text = ""
    try:
        with fitz.open(filepath) as doc:
            for i, page in enumerate(doc):
                if i >= max_pages:
                    print(f"Reached limit of {max_pages} pages. Stopping extraction.")
                    break
                text += page.get_text("text") + "\\n"
    except Exception as e:
        print(f"Error extracting PDF: {e}")
    return text

def generate_sec_10k_pdf(text: str) -> str:
    """Generates an advanced SEC Styled Form PDF"""
    fd, path = tempfile.mkstemp(suffix=".pdf")
    os.close(fd)
    
    doc = SimpleDocTemplate(
        path,
        pagesize=letter,
        rightMargin=54,
        leftMargin=54,
        topMargin=54,
        bottomMargin=36
    )
    
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'SECTitle',
        parent=styles['Heading1'],
        fontName='Times-Bold',
        fontSize=13,
        spaceAfter=12,
        alignment=TA_CENTER,
        textTransform='uppercase'
    )
    
    part_header_style = ParagraphStyle(
        'SECPartHeader',
        parent=styles['Heading2'],
        fontName='Times-Bold',
        fontSize=12,
        spaceBefore=18,
        spaceAfter=6,
        alignment=TA_CENTER
    )
    
    body_style = ParagraphStyle(
        'SECBody',
        parent=styles['Normal'],
        fontName='Times-Roman',
        fontSize=10,
        spaceAfter=12,
        alignment=TA_JUSTIFY,
        leading=14
    )

    story = []
    
    # Official SEC Header layout
    story.append(Paragraph("UNITED STATES<br/>SECURITIES AND EXCHANGE COMMISSION<br/>Washington, D.C. 20549", title_style))
    story.append(HRFlowable(width="100%", thickness=1, color=black, spaceBefore=4, spaceAfter=8))
    story.append(Paragraph("FORM 10-K", title_style))
    story.append(HRFlowable(width="100%", thickness=1, color=black, spaceBefore=4, spaceAfter=24))
    
    # Text parsing to divide into parts or paragraphs
    paragraphs = text.split('\\n')
    
    for p in paragraphs:
        cleaned = p.strip()
        if not cleaned:
            continue
            
        # Detect headers like "PART I", "ITEM 1."
        if cleaned.upper().startswith("PART ") or cleaned.upper().startswith("ITEM "):
            story.append(Spacer(1, 12))
            story.append(Paragraph(cleaned, part_header_style))
        else:
            story.append(Paragraph(cleaned, body_style))
            
    doc.build(story)
    return path
