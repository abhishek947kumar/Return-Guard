# 🛡️ ReturnGuard: Autonomous ReAct E-Commerce Refund Agent

<div align="center">

[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18%2B-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5%2B-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![Architecture: ReAct](https://img.shields.io/badge/Architecture-ReAct_Autonomous_Agent-FF6B6B?style=for-the-badge)](https://arxiv.org/abs/2210.03629)

<p align="center">
  <strong>An autonomous, governed ReAct (Reasoning and Acting) agent that verifies order states, evaluates category return policies, performs multimodal computer vision damage inspection, and triggers automated refund/escalation workflows.</strong>
</p>

[Quick Start](#-quick-start) • [Architecture](#-architecture) • [Features](#-key-features) • [Test Scenarios](#-test-scenarios) • [API Reference](#-api-reference)

</div>

---

## 📌 Overview

Traditional e-commerce return processes are plagued by two major flaws:
1. **Manual Friction:** Support staff spend days verifying receipts, order dates, and policy exceptions.
2. **Naive AI Vulnerabilities:** Standard chatbot wrappers hallucinate, fail to verify order states, and are easily tricked into approving unauthorized refunds.

**ReturnGuard** implements a production-grade **ReAct (Reasoning and Acting)** cognitive architecture with strict **AI governance guardrails** and a **Human-in-the-Loop (HITL)** fail-safe. It autonomously resolves legitimate low-risk returns in under 1 second while intercepting fraud (wardrobing, empty-box claims) and routing high-value edge cases to operations supervisors.

---

## 🧠 Architecture & Cognitive Loop

```
                        ┌────────────────────────────────────────┐
                        │      Customer Inquiry + Photo 📸       │
                        └───────────────────┬────────────────────┘
                                            │
                                            ▼
                              ┌──────────────────────────┐
                              │  Autonomous ReAct Loop   │
                              │ 🧠 Thought ➔ ⚡ Action   │
                              │ 📥 Input   ➔ 👁️ Observe │
                              └─────────────┬────────────┘
                                            │
            ┌───────────────────────────────┼───────────────────────────────┐
            │                               │                               │
            ▼                               ▼                               ▼
  ┌──────────────────┐            ┌──────────────────┐            ┌──────────────────┐
  │   Order State    │            │  Policy Matrix   │            │ Multimodal Vision│
  │    Retrieval     │            │  Clause Engine   │            │ Defect Inspector │
  └──────────────────┘            └──────────────────┘            └──────────────────┘
            │                               │                               │
            └───────────────────────────────┼───────────────────────────────┘
                                            │
                                            ▼
                            ┌───────────────────────────────┐
                            │  AI Governance & Guardrails   │
                            │  - Hard $500 Auto-Refund Cap  │
                            │  - Fraud Lockout (Score ≥ 60) │
                            │  - Mandatory Policy Citation  │
                            └───────────────┬───────────────┘
                                            │
        ┌───────────────────────────────────┼───────────────────────────────────┐
        │                                   │                                   │
        ▼                                   ▼                                   ▼
┌──────────────────┐              ┌──────────────────┐              ┌──────────────────┐
│  🟢 Auto-Refund  │              │  🟡 Tier-2 HITL  │              │  🔴 Policy Denial│
│  & RMA Barcode   │              │  Escalation Desk │              │  or Goodwill Vchr│
└──────────────────┘              └──────────────────┘              └──────────────────┘
```

### The ReAct (Reasoning and Acting) Cycle
1. **🧠 Thought:** The agent plans its next investigative step (e.g., *"Customer claims TV screen is cracked. First retrieve order details, evaluate warranty window, then execute vision analysis on uploaded photo."*).
2. **⚡ Action:** Dispatches a deterministic tool (`lookup_order`, `verify_damage_photo`, `evaluate_return_policy`, `calculate_fraud_risk`, `trigger_automated_refund`).
3. **📥 Action Input:** Passes structured parameters to backend systems.
4. **👁️ Observation:** Ingests live database records, vision defect classifications, and policy rules.
5. **🔄 Reflection:** Iterates until sufficient evidence is verified, then issues a governed final decision.

---

## ✨ Key Features

- **🧠 Autonomous ReAct Cognitive Core:** Step-by-step reasoning trace with transparent internal monologue and tool telemetry.
- **📸 Multimodal Computer Vision AI:** Upload defect photos for automated defect detection (e.g., display fracture, crushed carton, severed security tags).
- **📋 Dynamic Return Policy Engine:** Live configurable rules across 6 verticals (Electronics, Fashion, Beauty, Home, Jewelry, Footwear).
- **🚨 Multi-Dimensional Anti-Fraud:** Detects wardrobing (used occasion wear returned late), serial returners, and empty-box abuse.
- **👥 Human-in-the-Loop (HITL) Review Desk:** Tier-2 review console displaying AI dossiers, photo evidence, and 1-click approvals/rejections.
- **🛡️ Hard AI Safety Guardrails:** Programmatic $500 autonomous ceiling, anti-hallucination grounding, and mandatory policy citation.
- **🛍️ Embeddable Floating Storefront Widget:** Preview how ReturnGuard integrates as a customer-facing returns assistant on Shopify checkout pages.
- **📊 Executive ROI & Analytics Dashboard:** Live tracking of automation throughput (~81%), fraud prevented ($14,850+), and latency (< 850ms).

---

## 🚀 Quick Start

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** & **npm**

### 1-Click Launchers

#### Windows (PowerShell)
```powershell
.\start.ps1
```

#### Windows (CMD)
```cmd
start.bat
```

#### Linux / macOS (Bash)
```bash
chmod +x start.sh
./start.sh
```

---

### Manual Setup

#### 1. Backend Setup
```bash
# Clone the repository
git clone https://github.com/your-username/return-guard.git
cd return-guard

# Install Python dependencies
pip install -r requirements.txt

# Start FastAPI server
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
* Backend API: `http://127.0.0.1:8000`
* Interactive OpenAPI Docs: `http://127.0.0.1:8000/docs`

#### 2. Frontend Setup
```bash
# In a new terminal window:
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```
* Frontend Web App: `http://127.0.0.1:5173`

---

## 🧪 Pre-Loaded Test Scenarios

The web interface includes 1-click scenario triggers:

| Scenario | Target Order | AI ReAct Decision | Generated Artifacts |
| :--- | :--- | :--- | :--- |
| **AirPods Pro 2** | `ORD-7821` | **Auto-Approved** (Within 14d, trust score 95/100) | Prepaid RMA Barcode Label + Instant Refund Receipt ($249.99) |
| **65" OLED TV** | `ORD-5102` | **HITL Escalation** (Transit damage, $1,599 > $500 cap) | Priority Escalation Ticket with **Photo Proof Dossier** |
| **Silk Evening Gown** | `ORD-9430` | **Policy Rejection** (42d late, wardrobing attempt) | Polite denial citing clause `POL-FASH-2026` ($890 saved) |
| **Opened Face Cream** | `ORD-3318` | **Store Credit Concession** (Opened hygiene item) | 25% Goodwill Store Credit Voucher (`CREDIT-XXXX`) |
| **Nike Pegasus** | `ORD-6241` | **Free Exchange** (Merchant sent wrong shoe size) | Instant zero-fee exchange RMA authorization |
| **Gold Jewelry** | `ORD-8852` | **Critical Fraud Flag** (Empty-box claim, 3 prior flags)| Fraud Investigation hold with carrier weight logs |

---

## 🔌 API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/chat` | Submit customer return query (supports `image_data` for Vision AI) |
| `GET` | `/api/orders` | Retrieve simulated orders catalog |
| `GET` | `/api/policies` | Retrieve active category return policies |
| `PUT` | `/api/policies/{category}` | Update return window, restocking fee, or threshold live |
| `GET` | `/api/escalations` | List pending and resolved HITL review tickets |
| `POST` | `/api/escalations/{id}/action` | Take operator action (`APPROVE_REFUND`, `REJECT_REQUEST`, etc.) |
| `GET` | `/api/analytics` | Fetch real-time KPIs, automation rate, and fraud dollars saved |
| `GET` | `/api/analytics/audit-logs` | Fetch immutable AI governance decision traces |
| `POST` | `/api/analytics/reset` | Reset demo database to baseline state |

---

## 📁 Repository Structure

```
return-guard/
  ├── backend/
  │    ├── app/
  │    │    ├── main.py                  # FastAPI entrypoint & middleware
  │    │    ├── agent/
  │    │    │    ├── react_agent.py      # Core ReAct Reasoning & Acting loop
  │    │    │    ├── tools.py            # Concrete tool registry (Order, Policy, Fraud, Refund, RMA)
  │    │    │    ├── vision_inspector.py # Multimodal Computer Vision defect analyzer
  │    │    │    └── governance.py       # Safety guardrails, policy citations, audit logging
  │    │    ├── db/
  │    │    │    └── store.py            # In-memory store with seeded orders, customers, policies
  │    │    ├── models/
  │    │    │    └── schemas.py          # Pydantic schemas for traces, orders, HITL tickets
  │    │    └── routers/
  │    │         ├── chat.py             # Agent conversation & vision reasoning endpoint
  │    │         ├── orders.py           # Orders and customer profiles
  │    │         ├── policies.py         # Dynamic policy management
  │    │         ├── escalations.py      # HITL review and operator actions
  │    │         └── analytics.py        # Executive KPIs and audit log retrieval
  │    └── requirements.txt
  ├── frontend/
  │    ├── index.html                    # SEO tags & Google Fonts (Outfit, Inter)
  │    ├── package.json
  │    ├── vite.config.js
  │    └── src/
  │         ├── App.jsx                  # Main application orchestrator
  │         ├── index.css                # Obsidian dark-mode glassmorphism design system
  │         ├── api.js                   # REST API client
  │         └── components/
  │              ├── Navbar.jsx          # Tab navigation, status indicators, demo reset
  │              ├── ChatConcierge.jsx   # Live chat, photo upload, RMA cards, vision badges
  │              ├── ReactTraceViewer.jsx# Real-time Thought ➔ Action ➔ Observation inspector
  │              ├── EscalationQueue.jsx # Tier-2 HITL review console with photo evidence
  │              ├── FloatingWidget.jsx  # Embeddable storefront customer widget
  │              ├── OrdersExplorer.jsx  # Searchable order database with 1-click test
  │              ├── PolicyMatrix.jsx    # Dynamic return policy editor
  │              ├── AuditGovernance.jsx # AI governance and compliance ledger
  │              └── AnalyticsDashboard.jsx# Real-time KPIs, ROI metrics, fraud radar
  ├── .env.example                       # Environment template
  ├── .gitignore                         # Comprehensive ignore rules
  ├── CONTRIBUTING.md                    # Contribution guidelines
  ├── LICENSE                            # MIT License
  ├── start.ps1                          # Windows PowerShell 1-click launcher
  ├── start.bat                          # Windows CMD 1-click launcher
  ├── start.sh                           # Linux/macOS 1-click launcher
  └── README.md
```

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
