import fitz
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_JUSTIFY, TA_CENTER, TA_LEFT
from reportlab.lib.colors import black
import html
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
    """Generates an advanced SEC Styled Form PDF with improved formatting."""
    fd, path = tempfile.mkstemp(suffix=".pdf")
    os.close(fd)
    
    doc = SimpleDocTemplate(
        path,
        pagesize=letter,
        rightMargin=54,
        leftMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    
    styles = getSampleStyleSheet()
    
    # Custom Title Style
    styles.add(ParagraphStyle(
        'SECTitle',
        parent=styles['Heading1'],
        fontName='Times-Bold',
        fontSize=14,
        leading=18,
        spaceAfter=12,
        alignment=TA_CENTER,
        textTransform='uppercase'
    ))
    
    # Custom Part Header Style
    styles.add(ParagraphStyle(
        'SECPartHeader',
        parent=styles['Heading2'],
        fontName='Times-Bold',
        fontSize=12,
        leading=16,
        spaceBefore=18,
        spaceAfter=8,
        alignment=TA_CENTER
    ))

    # Custom Item Header Style
    styles.add(ParagraphStyle(
        'SECItemHeader',
        parent=styles['Heading3'],
        fontName='Times-Bold',
        fontSize=11,
        leading=14,
        spaceBefore=12,
        spaceAfter=6,
        alignment=TA_LEFT
    ))
    
    # Custom Body Style
    styles.add(ParagraphStyle(
        'SECBody',
        parent=styles['Normal'],
        fontName='Times-Roman',
        fontSize=10,
        leading=14,
        spaceAfter=10,
        alignment=TA_JUSTIFY,
        firstLineIndent=24
    ))

    story = []
    
    # Official SEC Header
    story.append(Paragraph("UNITED STATES<br/>SECURITIES AND EXCHANGE COMMISSION<br/>Washington, D.C. 20549", styles['SECTitle']))
    story.append(HRFlowable(width="100%", thickness=1.5, color=black, spaceBefore=4, spaceAfter=8))
    story.append(Paragraph("FORM 10-K", styles['SECTitle']))
    story.append(HRFlowable(width="100%", thickness=1.5, color=black, spaceBefore=4, spaceAfter=24))
    
    # Improved text splitting: handle literal \n and real newlines
    import re
    # Split by literal \\n or actual \n
    chunks = re.split(r'\\n|\n', text)
    
    for chunk in chunks:
        cleaned = chunk.strip()
        if not cleaned:
            continue
            
        # Escape for ReportLab Paragraph
        cleaned_escaped = html.escape(cleaned)
            
        # Refined Header Detection using original casing for matching
        upper_cleaned = cleaned.upper()
        if upper_cleaned.startswith("PART ") or "PART " in upper_cleaned[:10]:
            story.append(Paragraph(cleaned_escaped, styles['SECPartHeader']))
        elif upper_cleaned.startswith("ITEM ") or re.match(r'^ITEM\s+\d', upper_cleaned):
            story.append(Paragraph(cleaned_escaped, styles['SECItemHeader']))
        elif len(cleaned) < 100 and cleaned.isupper() and not cleaned.isdigit():
            # Potential section header in all caps
            story.append(Paragraph(cleaned_escaped, styles['SECItemHeader']))
        else:
            # Regular paragraph
            # Escape HTML special characters but preserve our bold tags logic
            cleaned = cleaned_escaped
            
            # Basic support for bolding if marked with ** (common in LLM output)
            if "**" in cleaned:
                # Handle multiple bolds
                cleaned = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', cleaned)
            
            story.append(Paragraph(cleaned, styles['SECBody']))
            
    doc.build(story)
    return path
