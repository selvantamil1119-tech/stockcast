# 🏢 Real-World Production Architecture: How StockCast Works in a Live Retail Business

When presenting to faculty or clients, here is the complete end-to-end explanation of how real retail stores onboard and collect live sales data with StockCast.

---

## 1. The Real-World Data Journey (3 Phases)

```
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 1: Store Registration & Profile Setup                            │
│ Owner creates account -> fills GST, address, store type -> gets API Key│
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│ Phase 2: One-Time Product Catalog Import (CSV Bulk Upload)              │
│ Owner exports catalog from Excel/ERP -> Uploads CSV -> 100s of SKUs in │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│ Phase 3: Daily Real-Time Sales Collection (Automated POS Webhooks)      │
│ Cashier scans barcode at billing counter -> POS pushes sale via API    │
│ Stock automatically decremented -> Forecast & Reorder alerts update live│
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Phase-by-Phase Breakdown

### Phase 1: Onboarding & Authentication
1. **Store Owner Sign Up**:
   - The shop manager creates an account with their email, password, and business name.
   - The system automatically issues a unique **POS API Key** (e.g., `sc_79bde69c159e...`).
2. **Business Details**:
   - In **Settings & POS**, the manager configures their GST Number, phone, and store type (`Retail Store`, `Supermarket`, `Wholesale`).
   - This information is stamped on purchase orders generated for suppliers.

### Phase 2: How the Catalog is Uploaded (No Manual Entry Needed)
- **The Challenge**: A real supermarket has 500 to 5,000 SKUs. Typing them one-by-one is impossible.
- **The Solution (Bulk CSV Import)**:
  1. The manager navigates to **Settings & POS** → clicks **Download CSV Template**.
  2. The CSV contains standard inventory columns:
     `sku, name, category, unitCost, unitPrice, currentStock, minStockLevel, maxStockLevel, safetyStock, leadTimeDays, supplierName`
  3. The manager drags and drops their exported store inventory file.
  4. The server parses the file stream using `csv-parser` and bulk-inserts all products into MongoDB in seconds.

### Phase 3: How Real-Time Sales are Collected Automatically
- **The Challenge**: Cashiers do not have time to log into an inventory website after every customer purchase.
- **The Solution (POS API Key Webhook Integration)**:
  - Every modern billing software (like Tally, Petpooja, Zoho POS, or custom barcode scanners) supports **HTTP Webhooks / REST API calls**.
  - The technician enters StockCast's endpoint into the billing machine settings:
    ```http
    POST http://your-domain.com/api/pos/sale
    Header: X-API-Key: sc_79bde69c159e40bf806f9aa4bf88fa92
    Content-Type: application/json

    {
      "sku": "ELEC-101",
      "quantity": 2
    }
    ```
  - **What happens instantly**:
    1. The API verifies the store's `X-API-Key`.
    2. It decrements the live stock count in the database (e.g., stock drops from 8 to 6).
    3. It records the transaction with revenue, COGS, and profit margin.
    4. If the new stock drops below the **Reorder Point (ROP)**, it automatically triggers an alert on the **Replenishment** dashboard and flags an urgent purchase order.

---

## 3. What to Say in Viva / Demo to Mam

> *"Ma'am, in a real-world company, data entry is **never done manually**. Here is how our architecture handles it:*
>
> 1. ***Initial Setup***: *The business uploads their entire catalog of hundreds of items in one click using our **CSV Bulk Upload** engine.*
> 2. ***Daily Operations***: *The platform provides each shop with a secure **POS API Key**. The shop's billing counter software calls our `/api/pos/sale` endpoint every time a bill is generated.*
> 3. ***Live Automation***: *The moment a barcode is scanned at the counter, StockCast decrements warehouse stock, updates the revenue charts, recalculates the **Holt-Winters demand forecast**, and notifies the manager if replenishment is needed."*
