import os
import json
import base64

from dotenv import load_dotenv
from groq import Groq

from .schemas import InvoiceData


from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
ENV_FILE = BASE_DIR / ".env"

load_dotenv(ENV_FILE)

MODEL_NAME = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")

# Image-based extraction needs a vision-capable model. Not every Groq API
# key has access to one, so this is opt-in: leave unset to disable the
# image upload path with a clear error instead of silently failing.
VISION_MODEL_NAME = os.getenv("GROQ_VISION_MODEL")

_client = None


def get_client() -> Groq:
    """Lazily creates the Groq client so the API can start (and /health
    can respond) even before GROQ_API_KEY is configured. The key is only
    required once an extraction is actually requested."""
    global _client

    if _client is None:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise RuntimeError(
                "GROQ_API_KEY is missing. Copy .env.example to .env in "
                "ai/ai_document_autofill/ and set your Groq API key."
            )
        _client = Groq(api_key=api_key)

    return _client


INVOICE_PROMPT = """
You are the invoice intelligence system for Cabin8,
an accounting and asset-management system for furniture businesses.

Analyze the provided invoice carefully.

Extract ONLY information that is actually visible.
Never guess, invent, or hallucinate missing information.

Important rules:

1. Extract the vendor/supplier name.
2. Extract GSTIN if visible.
3. Extract invoice number.
4. Extract invoice date.
5. Extract EVERY invoice line item.
6. Extract quantity and unit price accurately.
7. Extract GST/tax rate if visible.
8. Extract tax amount if visible.
9. Extract line-item total if visible.
10. Extract subtotal, total tax and grand total if visible.
11. Identify the currency.
12. If something is not visible, use null.
13. Do not calculate missing values.
14. Do not invent values.
15. Preserve the numbers exactly as shown wherever possible.

This data will be used by an accounting application,
so accuracy is more important than completing every field.
"""

SCHEMA_INSTRUCTIONS = """
Respond with ONLY a single valid JSON object — no markdown, no code fences,
no commentary before or after it — matching exactly this shape:

{
  "vendor_name": string or null,
  "vendor_gstin": string or null,
  "invoice_number": string or null,
  "invoice_date": string or null,
  "items": [
    {
      "name": string,
      "quantity": number,
      "unit_price": number,
      "tax_rate": number or null,
      "tax_amount": number or null,
      "total": number or null
    }
  ],
  "subtotal": number or null,
  "tax_total": number or null,
  "grand_total": number or null,
  "currency": string
}
"""


def _parse_invoice_json(content: str) -> InvoiceData:
    try:
        data = json.loads(content)
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"AI response was not valid JSON: {exc}") from exc

    return InvoiceData.model_validate(data)


def extract_invoice_data(text: str) -> InvoiceData:

    prompt = f"""
{INVOICE_PROMPT}
{SCHEMA_INSTRUCTIONS}

The invoice is provided as extracted text instead of an image.

Invoice text:

{text}
"""

    response = get_client().chat.completions.create(
        model=MODEL_NAME,
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
        temperature=0,
    )

    return _parse_invoice_json(response.choices[0].message.content)


def extract_invoice_image(
    file_bytes: bytes,
    mime_type: str
) -> InvoiceData:

    if not VISION_MODEL_NAME:
        raise RuntimeError(
            "Image-based invoice extraction requires a vision-capable model, "
            "but no GROQ_VISION_MODEL is configured (or available on this "
            "Groq API key). Please upload the invoice as a PDF instead, or "
            "set GROQ_VISION_MODEL to a vision-capable model your key can use."
        )

    encoded_image = base64.b64encode(file_bytes).decode("utf-8")
    data_url = f"data:{mime_type};base64,{encoded_image}"

    response = get_client().chat.completions.create(
        model=VISION_MODEL_NAME,
        messages=[{
            "role": "user",
            "content": [
                {"type": "text", "text": f"{INVOICE_PROMPT}\n{SCHEMA_INSTRUCTIONS}"},
                {"type": "image_url", "image_url": {"url": data_url}},
            ],
        }],
        response_format={"type": "json_object"},
        temperature=0,
    )

    return _parse_invoice_json(response.choices[0].message.content)
