# dorsadesign.ir

*[English version](README.md)*

![Version](https://img.shields.io/badge/version-2.0-blue)
![Python](https://img.shields.io/badge/python-3.11-green)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green)
![React](https://img.shields.io/badge/React-18-blue)

## مسئله

یک استودیوی معماری به یک سایت نمونه‌کار نیاز داشت که هم به فارسی و هم انگلیسی طبیعی به نظر برسه (شامل چیدمان راست‌به‌چپ)، به کارکنان غیرفنی اجازه بده پروژه‌ها رو بدون دست‌زدن به کد اضافه/ویرایش کنن، و به اندازه‌ی کافی حرفه‌ای به نظر برسه که بشه به کارفرمای بالقوه نشونش داد — اکثر قالب‌های آماده فقط یکی از این سه مورد رو پوشش می‌دن، نه هر سه رو.

## راه‌حل

یک سایت اختصاصی با FastAPI + React که مدل محتوای دوزبانه مستقیم توی دیتابیس تعبیه شده (فیلدهای JSON برای هر فیلد، نه یک افزونه‌ی ترجمه که بعداً اضافه شده باشه)، یک گالری پروژه با فیلتر و lightbox/اسلایدشو برای جزئیات پروژه، و یک پنل ادمین با احراز هویت JWT که استودیو بتونه بعد از تحویل، کاتالوگ رو خودش مدیریت کنه. الان به‌صورت زنده روی [dorsadesign.ir](https://dorsadesign.ir) در حال اجراست.

## ✨ ویژگی‌ها

- 🏛️ **گالری پروژه** - مرور پروژه‌های معماری با قابلیت فیلتر
- 🌐 **چندزبانه** - پشتیبانی کامل فارسی/انگلیسی
- 🔍 **جزئیات پروژه** - اسلایدشو تصاویر، lightbox، و مشخصات فنی
- 🔐 **پنل ادمین** - احراز هویت امن JWT با عملیات CRUD
- 🖼️ **مدیریت رسانه** - آپلود تصویر کاور و گالری
- 🌓 **حالت روشن/تیره** - جابه‌جایی بین تم‌ها
- 📱 **کاملاً واکنش‌گرا** - روی همه‌ی دستگاه‌ها

## 🛠️ پشته‌ی فنی

### بک‌اند
- پایتون ۳.۱۱ + FastAPI
- PostgreSQL 15 (فیلدهای JSON برای محتوای چندزبانه)
- SQLAlchemy + Alembic
- احراز هویت JWT با Refresh Token

### فرانت‌اند
- React 18 + Vite
- Tailwind CSS
- Framer Motion (انیمیشن)
- i18next (چندزبانه)

### دیپلوی
- Docker (تک کانتینر)
- Gitea CI/CD
- Caddy Reverse Proxy

## 🚀 شروع سریع

### توسعه‌ی لوکال

```bash
# بک‌اند
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements/dev.txt
python -m app.main

# فرانت‌اند
cd frontend
npm install
npm run dev
```

### تولید با Docker

```bash
docker build -t dorsadesign:prod .
docker compose up -d app
```

## 📁 ساختار پروژه

```
.
├── backend/          # بک‌اند FastAPI
│   ├── app/          # کد اپلیکیشن
│   ├── alembic/      # مایگریشن‌های دیتابیس
│   ├── requirements/ # وابستگی‌های پایتون
│   └── tests/        # تست‌های واحد
├── frontend/         # فرانت‌اند React
│   ├── src/          # کد منبع
│   ├── public/       # فایل‌های استاتیک
│   └── package.json  # وابستگی‌های Node
├── .gitea/           # ورک‌فلوهای CI/CD
├── Dockerfile        # بیلد چندمرحله‌ای
├── docker-compose.yml
└── docker-entrypoint.sh
```

## 🔧 متغیرهای محیطی

همه‌ی متغیرها از طریق **Gitea Secrets & Variables** مدیریت می‌شن:

| نوع | متغیرها |
|------|-----------|
| **سکرت‌ها** | `POSTGRES_PASSWORD`, `SECRET_KEY` |
| **متغیرها** | `POSTGRES_USER`, `POSTGRES_DB`, `CORS_ORIGINS`, `VITE_API_URL`, `ADMIN_USERNAME`, `ADMIN_PASSWORD` |

## 📚 مستندات API

پس از اجرا، این آدرس‌ها در دسترسن:
- **Swagger UI**: `/api/docs`
- **ReDoc**: `/api/redoc`
- **Health Check**: `/api/health`

## 🔐 راه‌اندازی ادمین

اولین اکانت ادمین از روی متغیرهای محیطی `ADMIN_USERNAME` / `ADMIN_PASSWORD` ساخته می‌شه (نگاه کنید به `backend/seed_admin.py`) — قبل از اولین دیپلوی، مقادیر قوی رو از طریق Gitea Secrets تنظیم کنید. اگه هیچ مقداری از محیط داده نشه، اسکریپت seed به یک مقدار پیش‌فرض شناخته‌شده برمی‌گرده، پس **هرگز بدون تنظیم اول این متغیرها، روی محیط عمومی اجراش نکنید**.

## 📊 وضعیت پروژه

✅ **تکمیل‌شده** - کاملاً دیپلوی‌شده و در حال اجرا

## 📝 لایسنس

MIT License - فایل [LICENSE](LICENSE) رو ببینید.

## 👤 سازنده

**dorsadesign**
استودیوی معماری و طراحی

---

**مخزن**: https://github.com/mohsenjfar/dorsadesign
**وب‌سایت**: https://dorsadesign.ir
