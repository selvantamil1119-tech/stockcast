# StockCast — Smart Retail Demand Forecasting & Inventory Replenishment Platform

> **Full-Stack Development (FSD) Project Built Exclusively with the MERN Stack**  
> **Stack**: MongoDB (Mongoose) • Express.js • React • Node.js

---

## 📌 Problem Statement
Retail businesses frequently suffer from either **costly overstocking** (tying up working capital in excess stock and incurring high holding costs) or **damaging stock shortages** (loss of revenue, customer churn, and missed sales opportunities) due to inaccurate, reactive demand planning.

**StockCast** is an intelligent, automated inventory optimization platform that:
1. **Forecasts future demand** using mathematical statistical models (Holt-Winters Exponential Smoothing & Moving Averages).
2. **Monitors real-time inventory health** and flags imminent stockouts before supplier lead times elapse.
3. **Automates replenishment decisions** using Economic Order Quantity (**EOQ**) and Reorder Point (**ROP**) formulas.
4. **Delivers sales analytics** on revenue, profit margins, sales velocity, and inventory turnover.
5. **Provides a "What-If" Demand Spike & Delay Simulator** to stress-test supply chain resilience.

---

## 🏗️ Architecture & Technology Stack

```
   ┌────────────────────────────────────────────────────────┐
   │             StockCast Frontend (React + Vite)          │
   │  - Recharts Data Visualizations  - Tailwind CSS Glass  │
   │  - Lucide Icons                  - Dynamic Modals      │
   └──────────────────────────┬─────────────────────────────┘
                              │ REST API Calls / JSON
   ┌──────────────────────────▼─────────────────────────────┐
   │               StockCast Backend (Node + Express)       │
   │  - Holt-Winters Smoothing        - EOQ & ROP Engine    │
   │  - Inventory & Stock Management  - Sales Analytics     │
   └──────────────────────────┬─────────────────────────────┘
                              │ Mongoose ODM
   ┌──────────────────────────▼─────────────────────────────┐
   │                    MongoDB Database                    │
   │  - Products Collection           - Sales Collection    │
   │  - Purchase Orders Collection    - Auto-seeder Engine  │
   └────────────────────────────────────────────────────────┘
```

- **M (MongoDB / Mongoose ODM)**: Stores product catalog, supplier details, 90-day transaction history, and purchase orders. Includes zero-configuration auto-fallback with embedded persistence for instant presentation grading.
- **E (Express.js)**: High-performance RESTful API endpoints with modular routers and error handlers.
- **R (React 18 + Vite)**: Executive retail dashboard with interactive Recharts diagrams, responsive design, and status indicators.
- **N (Node.js)**: Asynchronous runtime powering mathematical forecasting algorithms and replenishment pipelines.

---

## 📐 Mathematical Models & Formulas Implemented

### 1. Holt's Linear Exponential Smoothing (Level + Trend)
Forecasts demand into future horizons (7, 14, 30, 90 days) by smoothing both baseline sales level ($S_t$) and trend trajectory ($b_t$):
$$\begin{aligned}
S_t &= \alpha Y_t + (1 - \alpha)(S_{t-1} + b_{t-1}) \\
b_t &= \beta (S_t - S_{t-1}) + (1 - \beta) b_{t-1} \\
\hat{Y}_{t+m} &= S_t + m \cdot b_t
\end{aligned}$$

### 2. Economic Order Quantity (EOQ)
Calculates the optimal order size that minimizes total inventory ordering and holding costs:
$$EOQ = \sqrt{\frac{2 \cdot D \cdot S}{H}}$$
- $D$ = Annualized product demand (units)
- $S$ = Fixed cost per purchase order
- $H$ = Annual inventory holding cost per unit ($unitCost \times holdingCostRate$)

### 3. Reorder Point (ROP) & Safety Stock
Triggers replenishment orders early enough to prevent stockouts while waiting for supplier delivery:
$$ROP = (Demand_{daily} \times Lead\ Time_{days}) + Safety\ Stock$$

### 4. Inventory Turnover Ratio
Evaluates retail capital efficiency:
$$\text{Turnover Ratio} = \frac{\text{Annualized Cost of Goods Sold (COGS)}}{\text{Total Current Inventory Value}}$$

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### 1. Start the Backend Server
```bash
cd server
npm install
npm start
```
> The server will start on `http://localhost:5001`.  
> *Note: If a MongoDB server is running or configured in `.env`, it connects immediately; otherwise it activates the high-performance embedded store with zero setup required.*

### 2. Start the Frontend Client
In a new terminal window:
```bash
cd client
npm install
npm run dev
```
> Open your browser at `http://localhost:3000`.

---

## 🗂️ Platform Modules & Features

| View | Key Capabilities |
| :--- | :--- |
| **Executive Overview** | Real-time KPI summary cards, stock health score, stockout risk radar, and 30-day sales velocity chart. |
| **Inventory Manager** | Searchable & filterable SKU catalog, margin calculation, quick inline stock adjustment (+ Restock / - Loss), and Add/Edit SKU modals. |
| **Demand Forecasting** | Forecast next 7, 14, 30, or 90 days with Holt-Winters Exponential Smoothing or Moving Averages. Visualizes actual sales vs predicted curve with 95% confidence intervals and stockout date projection. |
| **Replenishment Engine** | Prioritized reorder recommendations, EOQ and ROP calculations, estimated capital required, one-click purchase order generator, and Inbound PO tracker with stock fulfillment. |
| **Sales & Margins** | Revenue vs profit breakdown, category revenue distribution donut chart, top-5 revenue driving SKUs, and inventory turnover ratio. |
| **What-If Simulator** | Interactive sliders for Demand Spikes (+0% to +100%) and Supplier Delivery Delays (+0 to +21 days) with live portfolio vulnerability stress-testing. |

---

## 📡 REST API Documentation

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status check |
| `GET` | `/api/inventory` | List products with search, category, and status filters |
| `GET` | `/api/inventory/summary` | Portfolio summary (stock value, retail value, counts) |
| `POST` | `/api/inventory` | Create new SKU in catalogue |
| `PUT` | `/api/inventory/:sku` | Update SKU attributes |
| `PATCH`| `/api/inventory/:sku/adjust`| Increment/decrement live stock units |
| `DELETE`| `/api/inventory/:sku` | Delete SKU from catalog |
| `GET` | `/api/forecast/:sku` | Run demand forecast with confidence intervals & stockout date |
| `GET` | `/api/forecast/risks` | Comprehensive stockout risk ranking |
| `GET` | `/api/replenishment/recommendations` | Algorithmic EOQ & ROP restock recommendations |
| `GET` | `/api/replenishment/orders` | Fetch active purchase orders |
| `POST` | `/api/replenishment/orders` | Generate new replenishment purchase order |
| `PATCH`| `/api/replenishment/orders/:id/receive` | Receive order and automatically increment inventory |
| `GET` | `/api/analytics/dashboard` | Sales timeline, margins, turnover, category share |
| `POST` | `/api/analytics/sales` | Record new retail sale & decrement live stock |
