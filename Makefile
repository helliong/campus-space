.PHONY: dev up down migrate backend-test frontend-typecheck

dev up:
	docker compose -f docker/docker-compose.yml --env-file .env up --build

down:
	docker compose -f docker/docker-compose.yml --env-file .env down

migrate:
	docker compose -f docker/docker-compose.yml --env-file .env run --rm backend alembic upgrade head

backend-test:
	cd backend && pytest

frontend-typecheck:
	cd frontend && npm run typecheck
