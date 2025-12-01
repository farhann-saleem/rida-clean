# RIDA - Raindrop Intelligent Document Assistant 🌧️

**RIDA** is an AI-powered document intelligence platform that combines OCR, LLM-based extraction, analytics, and conversational AI to help you manage and understand your documents.

![RIDA Dashboard](https://img.shields.io/badge/Status-Production%20Ready-success)
![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ Features

### 📄 **Document Intelligence**
- **Smart Upload**: Drag-and-drop document upload with automatic processing
- **OCR Extraction**: Extract text from images and PDFs using Tesseract
- **AI Classification**: Automatically classify documents (invoices, receipts, contracts)
- **Structured Extraction**: Extract key fields (vendor, amount, date, invoice number)
- **Thumbnail Generation**: Auto-generate document previews

### 💬 **Conversational AI**
- **Chat with Documents**: Ask natural language questions about your documents
- **Context-Aware**: Select multiple documents for cross-document queries
- **Smart Responses**: Powered by local LLM (Ollama) for privacy

### 📊 **Analytics & Insights**
- **Financial Analytics**: Track total spend, average amounts, highest transactions
- **Vendor Analysis**: See spending breakdown by vendor
- **Monthly Trends**: Visualize spending patterns over time
- **Natural Language Queries**: Ask questions like "What's my total spend with Acme Corp?"

### ⚡ **Workflow Automation**
- **Pre-built Workflows**: Invoice processing, receipt categorization, contract analysis
- **Real-time Progress**: Visual feedback for each workflow step
- **Export Options**: CSV, QuickBooks IIF, Excel formats

### 🎨 **Beautiful UI**
- **Modern Design**: Purple gradient theme with glassmorphism effects
- **Smooth Animations**: Framer Motion powered interactions
- **Dark Mode**: Full dark mode support
- **Responsive**: Works on desktop, tablet, and mobile

## 🏗️ Architecture

### **Frontend** (React + TypeScript + Vite)
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Animations**: Framer Motion
- **State Management**: React Hooks
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth

### **Backend** (FastAPI + Python)
- **Framework**: FastAPI
- **LLM**: Ollama (local) with Gemma 3:4b model
- **OCR**: Tesseract + pytesseract
- **PDF Processing**: pdfplumber
- **Image Processing**: Pillow
- **Cloud Integration**: Vultr Object Storage (simulated)

### **AI/ML Stack**
- **Local LLM**: Ollama (privacy-first, no external API calls)
- **Model**: Gemma 3:4b (efficient, fast, accurate)
- **RAG**: Retrieval-Augmented Generation for document Q&A
- **Extraction**: LLM-based structured data extraction

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+
- **Ollama** (for local LLM)
- **Tesseract OCR**
- **Supabase Account** (free tier works)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/RIDA.git
cd RIDA
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment template
copy .env.example .env  # Windows
# cp .env.example .env  # Mac/Linux

# Install Ollama and pull the model
ollama pull gemma3:4b

# Run the backend
uvicorn main:app --reload
```

Backend will run on `http://localhost:8000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment template
copy .env.example .env.local  # Windows
# cp .env.example .env.local  # Mac/Linux

# Edit .env.local and add your Supabase credentials
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key

# Run the frontend
npm run dev
```

Frontend will run on `http://localhost:8080`

### 4. Supabase Setup

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Run the SQL schema (see `database/schema.sql`)
4. Copy your project URL and anon key to `.env.local`

## 📦 Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Framer Motion
- React Router
- Supabase Client

### Backend
- FastAPI
- Python 3.10+
- Ollama (LLM)
- Tesseract OCR
- pdfplumber
- Pillow
- python-dotenv

### Database & Auth
- Supabase (PostgreSQL)
- Supabase Auth

### AI/ML
- Ollama
- Gemma 3:4b
- Tesseract OCR

## 🔒 Security

- ✅ **No API Keys in Code**: All secrets in environment variables
- ✅ **Local LLM**: Privacy-first with Ollama (no external API calls)
- ✅ **Secure Auth**: Supabase authentication with JWT
- ✅ **CORS Protection**: Configured for production
- ✅ **.gitignore**: Protects sensitive files

## 📝 Environment Variables

### Backend (`.env`)
```bash
# Optional: Only if using Gemini instead of Ollama
GEMINI_API_KEY=your_key_here

# Ollama Configuration
OLLAMA_MODEL=gemma3:4b
```

### Frontend (`.env.local`)
```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

## 🎯 Key Features Explained

### Document Processing Pipeline
1. **Upload** → User uploads document (PDF/Image)
2. **OCR** → Tesseract extracts text
3. **Classification** → LLM identifies document type
4. **Extraction** → LLM extracts structured fields
5. **Storage** → Saved to Supabase + Vultr backup
6. **Ready** → Available for chat and analytics

### Chat System
- Uses RAG (Retrieval-Augmented Generation)
- Combines extracted data + OCR text for context
- Local LLM ensures privacy
- Supports multi-document queries

### Analytics Engine
- Real-time calculation from extracted data
- Vendor aggregation
- Monthly trend analysis
- Natural language query support

## 🐛 Known Issues & Limitations

- **Rate Limits**: Demo has 3 uploads and 5 questions per document limit
- **OCR Accuracy**: Depends on image quality
- **LLM Speed**: Local Ollama may be slower than cloud APIs
- **File Size**: Large PDFs (>10MB) may take longer to process

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **Ollama** - Local LLM runtime
- **Supabase** - Backend as a Service
- **Tesseract** - OCR engine
- **shadcn/ui** - Beautiful UI components
- **Vultr** - Cloud infrastructure partner

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Built with ❤️ for intelligent document management**
