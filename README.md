# Левша — AI-бот (SOA)

Сервисы (docker compose): `nginx` (шлюз) → `backend` (Django/DRF/SimpleJWT) · `postgres` · `chroma` (RAG) · `embeddings` (локальная модель eng/rus). LLM — внешний OpenAI-compatible endpoint.

## Запуск
```
cp .env.example .env   # заполнить ключи
docker compose up --build
```
Первый старт скачивает модель эмбеддингов (кэш в volume `models_cache`).

## Роутинг (nginx)
`/admin`, `/api`, `/static`, `/media` → Django; остальное → фронтенд (React SPA, контейнер `frontend`).

## API
| Endpoint | Доступ |
|---|---|
| `POST /api/auth/register/`, `/api/auth/token/`, `/api/auth/token/refresh/`, `GET /api/auth/me/` | все / JWT |
| `POST /api/chat/ask/` `{message, chat_id?}` | гость: без сохранения; участник+: сохраняет чат, выдаёт фото («скинь фотки … в 2023 году») |
| `GET /api/chat/chats/`, `/api/chat/chats/<id>/` | участник+ |
| `/api/knowledge/items/` (CRUD, multipart) | модератор+ |
| `/admin/` | админ (повышение ролей — здесь) |

Роли: гость < участник < модератор < админ. Регистрация всегда создаёт участника.
Данные модератора индексируются в ChromaDB (эмбеддинги считает локальный сервис).
