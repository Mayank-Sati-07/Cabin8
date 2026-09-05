import fitz

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .ai_service import extract_invoice_data, extract_invoice_image
from .validator import validate_invoice


app = FastAPI(
    title="Cabin8 AI Document Autofill",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "Cabin8 AI Document Autofill is running!"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


def extract_pdf_text(file_bytes: bytes):

    document = fitz.open(
        stream=file_bytes,
        filetype="pdf"
    )

    text = ""

    for page in document:
        text += page.get_text()

    document.close()

    return text.strip()


@app.post("/documents/upload")
async def upload_document(file: UploadFile = File(...)):

    allowed_types = {
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/webp"
    }

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Only PDF, JPG, PNG and WEBP files are supported."
        )

    file_bytes = await file.read()

    if len(file_bytes) == 0:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty."
        )

    try:

        # PDF processing
        if file.content_type == "application/pdf":

            text = extract_pdf_text(file_bytes)

            if not text:
                raise HTTPException(
                    status_code=400,
                    detail="This PDF contains no extractable text."
                )

            invoice = extract_invoice_data(text)

        # Image processing
        else:

            invoice = extract_invoice_image(
                file_bytes,
                file.content_type
            )

        # Validate extracted information
        validation = validate_invoice(invoice)

        return {
            "success": True,
            "filename": file.filename,
            "invoice": invoice.model_dump(),
            "validation": validation
        }

    except HTTPException:
        raise

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"AI document processing failed: {str(e)}"
        )