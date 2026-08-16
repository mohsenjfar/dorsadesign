# dorsadesign.ir

*[نسخه فارسی / Persian version](README-fa.md)*

![Version](https://img.shields.io/badge/version-2.0-blue)
![Python](https://img.shields.io/badge/python-3.11-green)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green)
![React](https://img.shields.io/badge/React-18-blue)

## The problem

An architecture studio needed a portfolio site that reads naturally in both English and Persian (including RTL layout), lets non-technical staff add/edit projects without touching code, and looks credible enough to show to prospective clients — most existing template solutions handle one of those, not all three.

## The solution

A custom FastAPI + React site with a bilingual content model baked into the database (JSON fields per field, not a translation plugin bolted on afterward), a project gallery with filtering and a lightbox/slideshow for project details, and a JWT-authenticated admin panel so the studio can manage the catalog themselves after handoff. Live and in production at [dorsadesign.ir](https://dorsadesign.ir).

## ✨ Features

- 🏛️ **Project Gallery** - Browse architectural projects with filtering
- 🌐 **Multilingual** - Full English/Persian support
- 🔍 **Project Details** - Image slideshow, lightbox, and specifications
- 🔐 **Admin Panel** - Secure JWT authentication with CRUD operations
- 🖼️ **Media Management** - Upload cover and gallery images
- 🌓 **Dark/Light Mode** - Toggle between themes
- 📱 **Fully Responsive** - Works on all devices

## 🛠️ Tech Stack

### Backend
- Python 3.11 + FastAPI
- PostgreSQL 15 (JSON fields for multilingual content)
- SQLAlchemy + Alembic
- JWT Authentication with Refresh Token

### Frontend
- React 18 + Vite
- Tailwind CSS
- Framer Motion (animations)
- i18next (multilingual)

### Deployment
- Docker (single container)
- Gitea CI/CD
- Caddy Reverse Proxy

## 🚀 Quick Start

### Local Development

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements/dev.txt
python -m app.main

# Frontend
cd frontend
npm install
npm run dev
```

### Docker Production

```bash
docker build -t dorsadesign:prod .
docker compose up -d app
```

## 📁 Project Structure

```
.
├── backend/          # FastAPI backend
│   ├── app/          # Application code
│   ├── alembic/      # Database migrations
│   ├── requirements/ # Python dependencies
│   └── tests/        # Unit tests
├── frontend/         # React frontend
│   ├── src/          # Source code
│   ├── public/       # Static assets
│   └── package.json  # Node dependencies
├── .gitea/           # CI/CD workflows
├── Dockerfile        # Multi-stage build
├── docker-compose.yml
└── docker-entrypoint.sh
```

## 🔧 Environment Variables

All variables are managed via **Gitea Secrets & Variables**:

| Type | Variables |
|------|-----------|
| **Secrets** | `POSTGRES_PASSWORD`, `SECRET_KEY` |
| **Variables** | `POSTGRES_USER`, `POSTGRES_DB`, `CORS_ORIGINS`, `VITE_API_URL`, `ADMIN_USERNAME`, `ADMIN_PASSWORD` |

## 📚 API Documentation

Once running, visit:
- **Swagger UI**: `/api/docs`
- **ReDoc**: `/api/redoc`
- **Health Check**: `/api/health`

## 🔐 Admin Setup

The first admin account is created from the `ADMIN_USERNAME` / `ADMIN_PASSWORD` environment variables (see `backend/seed_admin.py`) — set strong values via Gitea Secrets before first deploy. If no environment values are provided, the seed script falls back to a well-known placeholder, so **never run it against a public-facing environment without setting these first**.

## 📊 Project Status

✅ **Completed** - Fully deployed and operational

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 👤 Author

**dorsadesign**  
Architecture & Design Studio

---

**Repository**: https://github.com/mohsenjfar/dorsadesign  
**Website**: https://dorsadesign.ir
