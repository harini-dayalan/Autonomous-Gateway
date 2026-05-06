# 🛡️ Sentinel-DS: Zero-Trust Privacy Gateway

> **An enterprise-grade privacy middleware that intercepts, tokenizes, and encrypts Personally Identifiable Information (PII) before it reaches external AI systems — ensuring zero sensitive data leakage while maintaining full LLM functionality.**

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Transformers.js](https://img.shields.io/badge/Transformers.js-Edge_AI-yellow?logo=huggingface)](https://huggingface.co/docs/transformers.js/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000?logo=vercel)](https://vercel.com/)

---

## 📋 Table of Contents

- [Problem Statement](#-problem-statement)
- [Solution Architecture](#-solution-architecture)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [5-Step Privacy Pipeline](#-5-step-privacy-pipeline)
- [Project Structure](#-project-structure)
- [Installation & Setup](#-installation--setup)
- [Database Schema](#-database-schema)
- [Security Features](#-security-features)
- [Screenshots](#-screenshots)
- [Future Enhancements](#-future-enhancements)
- [References](#-references)
- [License](#-license)

---

## 🔴 Problem Statement

Every major enterprise wants to leverage AI (ChatGPT, Claude, Gemini) for productivity. However, employees routinely paste **sensitive customer data** — Social Security Numbers, emails, phone numbers, medical records — directly into AI prompts. This data is then:

- Transmitted across the public internet
- Stored on third-party servers
- Potentially used for model training
- Exposed to data breaches

This creates **massive regulatory violations** under GDPR, HIPAA, CCPA, and India's DPDPA.

---

## ✅ Solution Architecture

**Sentinel-DS** acts as a **privacy shield** between the employee and the AI. It:

1. **Intercepts** the raw prompt before it leaves the system
2. **Detects** all PII using regex pattern matching and NER scanning
3. **Vaults** the original sensitive data in an encrypted local store
4. **Replaces** PII with tokens or Format-Preserving Encrypted (FPE) synthetic data
5. **De-tokenizes** the AI's response back to real data before showing it to the user

The AI **never sees any real sensitive data**. The employee gets perfect results.

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| **🔐 Format-Preserving Encryption (FPE)** | Replaces real PII with structurally valid fake data (e.g., real SSN → fake SSN) so AI processing isn't disrupted |
| **🏷️ Deterministic Tokenization** | Swaps PII with hash-based tokens like `[ENT_SSN_119]` for strict data masking |
| **🧠 Edge AI (In-Browser LLM)** | Runs Flan-T5-Base entirely in the browser via Web Workers — no cloud API needed |
| **🌍 3D Global Threat Map** | WebGL-powered interactive globe showing real-time data intercepts and blocked threats |
| **🗑️ SISA Cryptographic Erasure** | GDPR Article 17 "Right to be Forgotten" — destroys HMAC keys to permanently anonymize data |
| **👥 Role-Based Access Control (RBAC)** | Security Admin vs Standard User with dynamically adapting dashboard UI |
| **📊 Live Audit Trail** | Every interception, tokenization, and erasure is logged with timestamps |
| **🔄 5-Step Pipeline Visualization** | Real-time animated visualization of the full intercept → vault → AI → de-tokenize flow |
| **☁️ Live Database Integration** | Supabase PostgreSQL for user management and session logging |
| **📡 Real-Time Telemetry** | Matrix-style scrolling terminal showing live packet inspection |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **Next.js 14** (App Router) | React-based full-stack framework with server-side rendering |
| **React 18** | Component-based UI with hooks for state management |
| **TypeScript 5** | Type-safe development with strict compile-time checking |
| **Tailwind CSS 3.4** | Utility-first CSS framework for rapid UI development |
| **Google Material Symbols** | Icon library for consistent iconography |

### Backend & Database
| Technology | Purpose |
|-----------|---------|
| **Next.js API Routes** | Serverless backend endpoints for authentication |
| **Supabase** | Managed PostgreSQL database with REST API |
| **@supabase/supabase-js** | Official JavaScript client for database operations |
| **Node.js `fs` module** | Local file-system fallback for offline development |

### AI & Machine Learning
| Technology | Purpose |
|-----------|---------|
| **@xenova/transformers** | Run HuggingFace models directly in the browser |
| **Flan-T5-Base** | Google's instruction-tuned language model (250MB) |
| **Web Workers API** | Background thread execution to prevent UI blocking |

### 3D Visualization
| Technology | Purpose |
|-----------|---------|
| **react-globe.gl** | React wrapper for Three.js globe rendering |
| **Three.js** | WebGL-based 3D graphics engine |
| **Globe arcs & rings** | Animated data flow and threat visualization |

### Security & Cryptography
| Technology | Purpose |
|-----------|---------|
| **Regex Pattern Matching** | PII detection (SSN, Email, Phone, IP, DOB) |
| **Format-Preserving Encryption** | NIST SP 800-38G compliant data substitution |
| **HMAC Tokenization** | Deterministic hash-based token generation |
| **Cryptographic Erasure (SISA)** | Key destruction for permanent data anonymization |

### DevOps & Deployment
| Technology | Purpose |
|-----------|---------|
| **Vercel** | Serverless deployment with automatic CI/CD |
| **GitHub** | Version control and source code management |
| **ESLint** | Code quality and linting |
| **PostCSS** | CSS processing pipeline |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     EMPLOYEE BROWSER                         │
│                                                              │
│  ┌──────────┐    ┌──────────────┐    ┌───────────────────┐  │
│  │ Login    │───▶│  Dashboard   │───▶│  LLM Gateway      │  │
│  │ (RBAC)   │    │  (Overview)  │    │  (Prompt Composer) │  │
│  └──────────┘    └──────────────┘    └─────────┬─────────┘  │
│                                                 │            │
│  ┌──────────────────────────────────────────────▼─────────┐  │
│  │              SENTINEL PRIVACY ENGINE                    │  │
│  │                                                         │  │
│  │  ┌─────────┐  ┌──────────┐  ┌────────┐  ┌──────────┐  │  │
│  │  │ Regex   │─▶│  Vault   │─▶│  FPE/  │─▶│ Sanitized│  │  │
│  │  │ Scanner │  │ (Store)  │  │ Token  │  │ Prompt   │  │  │
│  │  └─────────┘  └──────────┘  └────────┘  └────┬─────┘  │  │
│  └───────────────────────────────────────────────┼────────┘  │
│                                                  │           │
│  ┌───────────────┐              ┌────────────────▼────────┐  │
│  │ Edge AI       │              │ External LLM (GPT-4)    │  │
│  │ (Flan-T5)     │              │ Receives ONLY fake data  │  │
│  │ Web Worker    │              └────────────────┬────────┘  │
│  └───────────────┘                               │           │
│                                   ┌──────────────▼────────┐  │
│                                   │ De-Tokenizer          │  │
│                                   │ (Vault Reverse Lookup)│  │
│                                   └──────────────┬────────┘  │
│                                                  │           │
│                                   ┌──────────────▼────────┐  │
│                                   │ Final Response        │  │
│                                   │ (Real Data Restored)  │  │
│                                   └───────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          │
              ┌───────────▼───────────┐
              │   SUPABASE (PostgreSQL)│
              │  ┌───────┐ ┌────────┐ │
              │  │ users │ │ logins │ │
              │  └───────┘ └────────┘ │
              └───────────────────────┘
```

---

## 🔄 5-Step Privacy Pipeline

The core innovation of Sentinel-DS is the **5-step privacy pipeline**, fully visualized in the LLM Gateway tab:

| Step | Name | What Happens |
|------|------|-------------|
| **1** | **Intercept** | Raw prompt is scanned for PII patterns (SSN, Email, Phone, IP) |
| **2** | **Vault & Tokenize** | Real PII is stored in a secure vault; tokens or FPE data replace it |
| **3** | **Send to AI** | Only the sanitized prompt (with fake/token data) is sent to the LLM |
| **4** | **AI Response** | LLM processes the sanitized prompt and returns a response with fake data |
| **5** | **De-tokenize** | Vault mapping reverses the transformation, restoring real data for the user |

---

## 📁 Project Structure

```
privacy-gateway/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── login/
│   │           └── route.ts          # Supabase auth API with fallback
│   ├── dashboard/
│   │   └── page.tsx                  # Main dashboard (600+ lines)
│   ├── login/
│   │   └── page.tsx                  # Multi-step RBAC login
│   ├── globals.css                   # Midnight Amethyst design system
│   ├── layout.tsx                    # Root layout with fonts
│   └── page.tsx                      # Landing page
├── components/
│   └── GlobeComponent.tsx            # 3D WebGL threat map
├── public/
│   └── llm-worker.js                # Edge AI Web Worker
├── .env.local                        # Supabase credentials (gitignored)
├── package.json                      # Dependencies
├── tailwind.config.ts                # Tailwind configuration
├── tsconfig.json                     # TypeScript configuration
└── next.config.mjs                   # Next.js + Webpack config
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- A Supabase account (free tier works)

### 1. Clone the Repository
```bash
git clone https://github.com/harini-dayalan/Autonomous-Gateway.git
cd Autonomous-Gateway
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Set Up the Database
Run this SQL in your Supabase SQL Editor:
```sql
-- Create Users Table
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create Logins Table
CREATE TABLE logins (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  ip_address TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Disable RLS for development
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE logins DISABLE ROW LEVEL SECURITY;
```

### 5. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Database Schema

### `users` Table
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Auto-generated primary key |
| `email` | TEXT | Unique corporate email |
| `role` | TEXT | `admin` or `user` |
| `created_at` | TIMESTAMP | Account creation timestamp |

### `logins` Table
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Auto-generated primary key |
| `user_id` | UUID | Foreign key to `users.id` |
| `email` | TEXT | Email used for login |
| `role` | TEXT | Role selected during login |
| `ip_address` | TEXT | Client IP address |
| `timestamp` | TIMESTAMP | Login timestamp |

---

## 🔒 Security Features

| Feature | Implementation |
|---------|---------------|
| **Zero-Trust Architecture** | No implicit trust; every request is verified (NIST SP 800-207) |
| **Format-Preserving Encryption** | NIST SP 800-38G compliant data substitution |
| **RBAC** | Role-based UI and API access control |
| **Immutable Audit Trail** | Every security event is logged with timestamp and context |
| **Edge AI** | LLM runs locally — no data transmitted to cloud |
| **Cryptographic Erasure** | HMAC key destruction for GDPR Art. 17 compliance |
| **Vault Architecture** | PII stored in isolated, encrypted vault separate from tokens |

---

## 🖼️ Screenshots

### Landing Page
- Dark purple glassmorphism UI with the "Midnight Amethyst" design system
- Animated hero section with feature cards

### Login (RBAC)
- Two-step authentication: Role Selection → Credential Entry
- Security Admin vs Standard User

### Dashboard Overview
- Real-time metric cards, live telemetry matrix, 3D interactive globe

### LLM Gateway (5-Step Pipeline)
- Prompt Composer → Vault Mapping → AI Processing → De-tokenization
- Animated progress bar showing all 5 stages

### Cryptographic Erasure
- 4-stage SISA process with certificate generation

---

## 🔮 Future Enhancements

- [ ] **NLP-Based NER Detection** — Replace regex with transformer-based Named Entity Recognition for higher PII precision
- [ ] **JWT Session Management** — Replace `localStorage` with secure HTTP-only cookies
- [ ] **Real LLM Integration** — Connect to OpenAI/Anthropic APIs with actual FPE round-trip
- [ ] **Differential Privacy** — Add noise injection for statistical privacy guarantees
- [ ] **Multi-Tenant Support** — Isolated vaults per organization
- [ ] **Compliance Dashboard** — Automated GDPR/HIPAA/DPDPA compliance scoring

---

## 📚 References

1. **NIST SP 800-207** — Zero Trust Architecture. Rose, S. et al. [Link](https://csrc.nist.gov/publications/detail/sp/800-207/final)
2. **NIST SP 800-38G** — Format-Preserving Encryption. Dworkin, M. [Link](https://csrc.nist.gov/publications/detail/sp/800-38g/rev-1/final)
3. **Cryptographic Erasure** — Garfinkel, S. & Shelat, A. [IEEE](https://ieeexplore.ieee.org/document/1430268)
4. **Privacy-Preserving Machine Learning** — Al-Rubaie, M. & Chang, J.M. [IEEE](https://ieeexplore.ieee.org/document/8713837)
5. **Edge Intelligence** — Zhou, Z. et al. [IEEE](https://ieeexplore.ieee.org/document/8736011)
6. **Role-Based Access Controls** — Ferraiolo, D.F. & Kuhn, D.R. [NIST](https://csrc.nist.gov/publications/detail/conference-paper/1992/10/13/role-based-access-controls)

---

## 📄 License

This project is developed as an academic capstone project. All rights reserved.

---

<p align="center">
  <b>Built with 🛡️ by Harini Dayalan</b><br>
  <i>Sentinel-DS — Because privacy is not optional.</i>
</p>
