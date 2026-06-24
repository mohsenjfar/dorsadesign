# dorsadesign.ir

A modern architecture portfolio website with multilingual support (English/Persian), featuring a project gallery and an admin panel for content management.

![Version](https://img.shields.io/badge/version-2.0-blue)
![Python](https://img.shields.io/badge/python-3.11-green)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green)
![React](https://img.shields.io/badge/React-18-blue)

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

## 🔐 Default Admin Credentials

```
Username: admin
Password: admin123
```

⚠️ **IMPORTANT**: Change the default password immediately after first login!

## 📊 Project Status

✅ **Completed** - Fully deployed and operational

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 👤 Author

**dorsadesign**  
Architecture & Design Studio

---

**Repository**: https://git.aracom.ir/ARACOM/dorsadesign.ir.git  
**Website**: https://dorsadesign.ir
