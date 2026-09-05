# seed_data.py
import json
import random
from datetime import datetime, timedelta

# Set seed for reproducible demo numbers
random.seed(42)

def days_ago(n):
    return (datetime.now() - timedelta(days=n)).strftime("%Y-%m-%d")

# 1. Master Data Setup
users = [
    {"id": "usr_01", "email": "admin@urbanfurniture.com", "name": "Admin User", "role": "Admin", "contact_id": None},
    {"id": "usr_02", "email": "accountant@urbanfurniture.com", "name": "Accountant User", "role": "Accountant", "contact_id": None},
    {"id": "usr_03", "email": "rahul@rahulsharma.com", "name": "Rahul Sharma", "role": "Contact", "contact_id": "cnt_01"},
    {"id": "usr_04", "email": "nimesh@pathak.com", "name": "Nimesh Pathak", "role": "Contact", "contact_id": "cnt_03"}
]

contacts = [
    {"id": "cnt_01", "name": "Rahul Sharma", "type": "Vendor", "email": "rahul@rahulsharma.com", "mobile": "+91 98765 43210", "address": {"city": "Delhi", "state": "Delhi", "pincode": "110001"}},
    {"id": "cnt_02", "name": "Azure Furniture", "type": "Vendor", "email": "contact@azurefurniture.com", "mobile": "+91 98123 45678", "address": {"city": "Mumbai", "state": "Maharashtra", "pincode": "400001"}},
    {"id": "cnt_03", "name": "Nimesh Pathak", "type": "Customer", "email": "nimesh@pathak.com", "mobile": "+91 99887 76655", "address": {"city": "Ahmedabad", "state": "Gujarat", "pincode": "380001"}},
    {"id": "cnt_04", "name": "Bharat Traders", "type": "Vendor", "email": "info@bharattraders.com", "mobile": "+91 97111 22334", "address": {"city": "Jaipur", "state": "Rajasthan", "pincode": "302001"}},
    {"id": "cnt_05", "name": "Priya Furniture Store", "type": "Customer", "email": "orders@priyafurniture.com", "mobile": "+91 96555 44332", "address": {"city": "Bangalore", "state": "Karnataka", "pincode": "560001"}}
]

products = [
    {"id": "prd_01", "name": "Wooden Chair", "type": "Goods", "sales_price": 2000.0, "cost": 1200.0, "category": "Furniture"},
    {"id": "prd_02", "name": "Office Chair", "type": "Goods", "sales_price": 3500.0, "cost": 2200.0, "category": "Furniture"},
    {"id": "prd_03", "name": "Wooden Table", "type": "Goods", "sales_price": 6000.0, "cost": 4000.0, "category": "Furniture"},
    {"id": "prd_04", "name": "Sofa", "type": "Goods", "sales_price": 15000.0, "cost": 9000.0, "category": "Furniture"},
    {"id": "prd_05", "name": "Dining Table", "type": "Goods", "sales_price": 12000.0, "cost": 8000.0, "category": "Furniture"}
]

accounts = [
    {"id": "acc_asset_cash", "name": "Cash", "type": "Asset", "code": "1010"},
    {"id": "acc_asset_bank", "name": "Bank", "type": "Asset", "code": "1020"},
    {"id": "acc_asset_debtors", "name": "Debtors (Accounts Receivable)", "type": "Asset", "code": "1030"},
    {"id": "acc_liab_creditors", "name": "Creditors (Accounts Payable)", "type": "Liability", "code": "2010"},
    {"id": "acc_income_sales", "name": "Sales Income", "type": "Income", "code": "3010"},
    {"id": "acc_exp_purchase", "name": "Purchase Expense", "type": "Expense", "code": "4010"},
    {"id": "acc_cap_owner", "name": "Owner's Capital", "type": "Capital", "code": "5010"}
]

journals = [
    {"id": "jrn_sales", "name": "Sales Journal", "type": "Sales", "default_account_id": "acc_income_sales"},
    {"id": "jrn_purchase", "name": "Purchase Journal", "type": "Purchase", "default_account_id": "acc_exp_purchase"},
    {"id": "jrn_bank", "name": "Bank Journal", "type": "Bank", "default_account_id": "acc_asset_bank"},
    {"id": "jrn_cash", "name": "Cash Journal", "type": "Cash", "default_account_id": "acc_asset_cash"}
]

analytic_accounts = [
    {"id": "ana_01", "name": "Retail Sales", "type": "Income/Expense"},
    {"id": "ana_02", "name": "Corporate Orders", "type": "Income/Expense"}
]

budgets = [
    {"id": "bdg_01", "name": "Q1 2026 Retail Budget", "analytic_account_id": "ana_01", "period": "Q1 2026", "planned_amount": 50000.0, "responsible_person": "Accountant User"},
    {"id": "bdg_02", "name": "Q1 2026 Corporate Budget", "analytic_account_id": "ana_02", "period": "Q1 2026", "planned_amount": 100000.0, "responsible_person": "Admin User"}
]

# 2. Dynamic Transaction Generator Engine
journal_entries = []
journal_items = []
_entry_idx = 0
_item_idx = 1

def post_journal_entry(journal_id, date, ref, lines):
    """Encapsulates double-entry creation and keeps line items tracked."""
    global _entry_idx, _item_idx
    entry_id = f"je_{_entry_idx:02d}"
    _entry_idx += 1

    journal_entries.append({
        "id": entry_id,
        "journal_id": journal_id,
        "date": date,
        "reference": ref
    })

    for line in lines:
        journal_items.append({
            "id": f"item_{_item_idx:03d}",
            "journal_entry_id": entry_id,
            "account_id": line["account_id"],
            "debit": line.get("debit", 0.0),
            "credit": line.get("credit", 0.0),
            "analytic_account_id": line.get("analytic_account_id")
        })
        _item_idx += 1

def generate_random_ledger(num_purchases=4, num_sales=4):
    """Generates randomized but strictly balanced double-entry transactions."""
    
    # Capital Injection (Base liquidity)
    post_journal_entry("jrn_bank", days_ago(30), "CAP-INIT-001", [
        {"account_id": "acc_asset_bank", "debit": 80000.0},
        {"account_id": "acc_asset_cash", "debit": 20000.0},
        {"account_id": "acc_cap_owner", "credit": 100000.0}
    ])

    analytics = [a["id"] for a in analytic_accounts]

    # Generate Purchase Bills + Payments
    for i in range(1, num_purchases + 1):
        days_back = random.randint(5, 25)
        product = random.choice(products)
        qty = random.randint(2, 6)
        total_cost = product["cost"] * qty
        analytic_id = random.choice(analytics)

        # 1. Vendor Bill (Dr Purchase Expense / Cr Creditors)
        post_journal_entry("jrn_purchase", days_ago(days_back), f"BILL/2026/{i:03d}", [
            {"account_id": "acc_exp_purchase", "debit": total_cost, "analytic_account_id": analytic_id},
            {"account_id": "acc_liab_creditors", "credit": total_cost}
        ])

        # 2. Payment (Leave the last bill unpaid so Creditors shows an open balance)
        if i < num_purchases:
            pay_journal = random.choice(["jrn_bank", "jrn_cash"])
            pay_account = "acc_asset_bank" if pay_journal == "jrn_bank" else "acc_asset_cash"
            post_journal_entry(pay_journal, days_ago(max(1, days_back - 2)), f"PAY/2026/{i:03d}", [
                {"account_id": "acc_liab_creditors", "debit": total_cost},
                {"account_id": pay_account, "credit": total_cost}
            ])

    # Generate Sales Invoices + Receipts
    for i in range(1, num_sales + 1):
        days_back = random.randint(2, 20)
        product = random.choice(products)
        qty = random.randint(2, 5)
        total_sales = product["sales_price"] * qty
        analytic_id = random.choice(analytics)

        # 1. Customer Invoice (Dr Debtors / Cr Sales Income)
        post_journal_entry("jrn_sales", days_ago(days_back), f"INV/2026/{i:03d}", [
            {"account_id": "acc_asset_debtors", "debit": total_sales},
            {"account_id": "acc_income_sales", "credit": total_sales, "analytic_account_id": analytic_id}
        ])

        # 2. Receipt (Leave the last invoice unpaid so Debtors shows an open balance)
        if i < num_sales:
            rec_journal = random.choice(["jrn_bank", "jrn_cash"])
            rec_account = "acc_asset_bank" if rec_journal == "jrn_bank" else "acc_asset_cash"
            post_journal_entry(rec_journal, days_ago(max(1, days_back - 1)), f"REC/2026/{i:03d}", [
                {"account_id": rec_account, "debit": total_sales},
                {"account_id": "acc_asset_debtors", "credit": total_sales}
            ])

# Run generator
generate_random_ledger(num_purchases=4, num_sales=4)

# 3. AI Cache Data
ai_cache = {
    "scanned_bill_sample": {
        "vendor_name": "Azure Furniture",
        "invoice_date": "2026-09-01",
        "due_date": "2026-09-15",
        "line_items": [
            {"product_name": "Wooden Chair", "quantity": 5, "unit_price": 1200.0, "subtotal": 6000.0},
            {"product_name": "Wooden Table", "quantity": 2, "unit_price": 4000.0, "subtotal": 8000.0}
        ],
        "total_amount": 14000.0
    },
    "report_insights_sample": {
        "generated_at": days_ago(0),
        "cfo_summary": "Cabin8 maintains a strong cash position with automated double-entry ledger verification. Open receivables and payables are appropriately tracked across active vendor and customer accounts."
    }
}

# 4. Final Payload Assembly
seed_db = {
    "users": users,
    "contacts": contacts,
    "products": products,
    "accounts": accounts,
    "journals": journals,
    "analytic_accounts": analytic_accounts,
    "budgets": budgets,
    "journal_entries": journal_entries,
    "journal_items": journal_items,
    "ai_cache": ai_cache
}

if __name__ == "__main__":
    deb = sum(x["debit"] for x in journal_items)
    cred = sum(x["credit"] for x in journal_items)
    
    print(f"Total Entries Generated : {len(journal_entries)}")
    print(f"Total Debits            : ₹{deb:,.2f}")
    print(f"Total Credits           : ₹{cred:,.2f}")
    print(f"Balanced?               : {deb == cred}")

    with open("cabin8_seed_data.json", "w") as f:
        json.dump(seed_db, f, indent=2)
    print("Exported randomly generated seed data to cabin8_seed_data.json")