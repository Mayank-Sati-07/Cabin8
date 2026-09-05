import os
import base64

from dotenv import load_dotenv
from google import genai

from .schemas import InvoiceData


from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
ENV_FILE = BASE_DIR / ".env"

load_dotenv(ENV_FILE)

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise RuntimeError("GEMINI_API_KEY is missing from .env")


client = genai.Client(api_key=api_key)


INVOICE_PROMPT = """
You are the invoice intelligence system for Cabin8,
an accounting and asset-management system for furniture businesses.

Analyze the provided invoice carefully.

Extract ONLY information that is actually visible.
Never guess, invent, or hallucinate missing information.

Return the information using the provided InvoiceData schema.

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
12. If something is not visible, return null.
13. Do not calculate missing values.
14. Do not invent values.
15. Preserve the numbers exactly as shown wherever possible.

This data will be used by an accounting application,
so accuracy is more important than completing every field.
"""


def extract_invoice_image(
    file_bytes: bytes,
    mime_type: str
) -> InvoiceData:

    encoded_image = base64.b64encode(file_bytes).decode("utf-8")

    response = client.models.generate_content(
        model="gemini-3.7-flash",
        contents=[
            {
                "text": INVOICE_PROMPT
            },
            {
                "inline_data": {
                    "mime_type": mime_type,
                    "data": encoded_image
                }
            }
        ],
        config={
            "response_mime_type": "application/json",
            "response_schema": InvoiceData,
            "temperature": 0
        }
    )

    if response.parsed is not None:
        return response.parsed

    return InvoiceData.model_validate_json(response.text)


def extract_invoice_data(text: str) -> InvoiceData:

    prompt = f"""
{INVOICE_PROMPT}

The invoice is provided as extracted text instead of an image.

Invoice text:

{text}
"""

    response = client.models.generate_content(
        model="gemini-3.7-flash",
        contents=prompt,
        config={
            "response_mime_type": "application/json",
            "response_schema": InvoiceData,
            "temperature": 0
        }
    )

    if response.parsed is not None:
        return response.parsed

    return InvoiceData.model_validate_json(response.text)