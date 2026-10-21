# Архитектура и стек CampusSpace

## 1. Рекомендуемый стек: FastAPI + Next.js + PostgreSQL + Redis
- **Frontend**: Next.js 15 / React, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, Lucide Icons.
- **Backend**: Python 3.12+ / FastAPI, Pydantic v2, SQLAlchemy 2.0 (async), Alembic.
- **СУБД**: PostgreSQL 16 (расширение btree_gist для исключения пересечений слотов).
- **Кэш и фоновые задачи**: Redis + Celery / APScheduler.
- **Уведомления**: Telegram Bot API + Email (SMTP / Resend).
- **Инфраструктура**: Docker & Docker Compose.

## 2. Структура монорепозитория
- rontend/ — Веб-клиент (каталог, интерактивная карта, сетка бронирования, ЛК, админка).
- ackend/ — REST API, бизнес-логика, алгоритмы проверки слотов, авторизация, интеграции.
- docker/ — Dockerfile и docker-compose.yml.
- docs/ — Спецификации, ER-диаграммы, пояснительная записка.
