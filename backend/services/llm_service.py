import httpx
import json

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "llama3.1:8b"

async def generate_completion(prompt: str) -> str:
    """Wrapper to interact with Ollama via HTTP directly. No timeout to allow for slow local inference."""
    async with httpx.AsyncClient(timeout=None) as client:
        payload = {
            "model": MODEL_NAME,
            "prompt": prompt,
            "stream": False,
        }
        response = await client.post(OLLAMA_URL, json=payload)
        response.raise_for_status()
        data = response.json()
        return data.get("response", "")

async def analyze_compliance(document_chunk: str, rules_context: str) -> dict:
    """Uses Ollama to analyze the document chunk against rules and extract a JSON structure."""
    prompt = f"""
You are an expert strict compliance officer reviewing SEC Form 10-K documents. 
You must output ONLY valid JSON. No conversational text.
    
Check the following Document Chunk against the provided Rules Context.
Determine the risk level (Low, Medium, High). 
If it is Medium or High risk, provide proposed redlines (original text and proposed text).
If it is Low risk, you can leave redlines empty.

Rules Context:
{rules_context}

Document Chunk:
{document_chunk}

Output strict JSON Format:
{{
  "risk_level": "Low" | "Medium" | "High",
  "reasonings": "Short explanation of the risk",
  "redlines": [
    {{
      "original_text": "...",
      "proposed_text": "...",
      "reason": "..."
    }}
  ]
}}
"""
    result = await generate_completion(prompt)
    clean_result = result.replace("```json", "").replace("```", "").strip()
    try:
        return json.loads(clean_result)
    except json.JSONDecodeError:
        return {"risk_level": "Low", "reasonings": "Parse error", "redlines": []}

async def extract_financials(full_text: str) -> dict:
    """Extracts key financial metrics for charting from the 10-K text."""
    prompt = f"""
You are a senior financial analyst. Extract exactly the following financial data from the SEC Form 10-K text for the last 3 fiscal years.
Output ONLY strict JSON. 

IMPORTANT: Values must be literal numbers. DO NOT include calculations, formulas (e.g. (A-B)/C), or units (e.g. '$', 'M', 'B'). 
If a value is $24.2M, return 24200000.

Metrics to find:
- Revenue
- Net Income
- Free Cash Flow
- Gross Margin (as a percentage, e.g. 40.5)
- Revenue by segment (Top 3-4 segments)
- Operating Cash Flow
- Total Debt
- Total Shareholders Equity (to calculate Debt to Equity)

Document Text Snippet (Financials):
{full_text[:10000]} 

Output format:
{{
  "fiscal_years": [2023, 2022, 2021],
  "revenue": [val1, val2, val3],
  "net_income": [val1, val2, val3],
  "free_cash_flow": [val1, val2, val3],
  "gross_margin": [val1, val2, val3],
  "operating_cash_flow": [val1, val2, val3],
  "total_debt": [val1, val2, val3],
  "shareholders_equity": [val1, val2, val3],
  "segments": [
    {{ "name": "Segment A", "revenue": val }},
    {{ "name": "Segment B", "revenue": val }}
  ]
}}
If a value is missing, use 0. Return ONLY the JSON.
"""
    result = await generate_completion(prompt)
    clean_result = result.replace("```json", "").replace("```", "").strip()
    try:
        return json.loads(clean_result)
    except json.JSONDecodeError:
        print("Failed to parse Financials JSON: ", result)
        return {}
