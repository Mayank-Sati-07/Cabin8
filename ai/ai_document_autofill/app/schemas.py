from pydantic import BaseModel
from typing import Optional, List


class InvoiceItem(BaseModel):
    name: str
    quantity: float
    unit_price: float
    tax_rate: Optional[float] = None
    tax_amount: Optional[float] = None
    total: Optional[float] = None


class InvoiceData(BaseModel):
    vendor_name: Optional[str] = None
    vendor_gstin: Optional[str] = None
    invoice_number: Optional[str] = None
    invoice_date: Optional[str] = None

    items: List[InvoiceItem] = []

    subtotal: Optional[float] = None
    tax_total: Optional[float] = None
    grand_total: Optional[float] = None
    currency: str = "INR"