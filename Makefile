.PHONY: dev up down backend-test frontend-typecheck

dev up:
	docker compose -f docker/docker-compose.yml --env-file .env up --build

down:
	docker compose -f docker/docker-compose.yml --env-file .env down

backend-test:
	cd backend && pytest

frontend-typecheck:
	cd frontend && npm run typecheck

