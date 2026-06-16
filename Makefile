PYTHON     = python3
VENV       = backend/venv
PIP        = $(VENV)/bin/pip
PY         = $(VENV)/bin/python
LOCAL_IP  := $(shell hostname -I | awk '{print $$1}')

.PHONY: all help setup setup-dev install install-backend install-frontend dev backend frontend mobile-sync test lint clean

# CONFIGURACOES

setup:
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo ">>> .env criado a partir de .env.example."; \
		echo ">>> Preencha as variáveis antes de iniciar o projeto."; \
	else \
		echo ">>> .env já existe, nenhuma ação necessária."; \
	fi

setup-dev:
	@echo "VITE_API_URL=http://$(LOCAL_IP):5001" > frontend/.env.local
	@echo "LOCAL_IP=$(LOCAL_IP)" >> frontend/.env.local
	@echo ">>> frontend/.env.local criado com IP: $(LOCAL_IP)"

# INSTALAÇÃO DE DEPENDENCIAS

$(VENV):
	$(PYTHON) -m venv $(VENV)
	@echo ">>> Ambiente virtual criado em $(VENV)"

install-backend: $(VENV)
	$(PIP) install --upgrade pip
	$(PIP) install -r backend/requirements.txt
	@echo ">>> Dependências Python instaladas."

install-frontend:
	cd frontend && npm install
	@echo ">>> Dependências Node instaladas."

install: install-backend install-frontend
	@echo ">>> Todas as dependências instaladas com sucesso."

# EXECUÇÃO

dev: setup-dev
	@VIRTUAL_ENV=$(CURDIR)/$(VENV) PATH=$(CURDIR)/$(VENV)/bin:$$PATH npm run dev

backend:
	$(PY) -m backend.src.main

frontend:
	cd frontend && npm run dev

mobile-sync: setup-dev
	cd frontend && LOCAL_IP=$(LOCAL_IP) npx cap sync
	@echo ">>> Sincronizado! Abra o Android Studio e clique em Run."

# TESTE

test:
	$(PY) -m pytest backend/tests/ -v

lint:
	cd frontend && npm run lint

# LIMPAR

clean:
	rm -rf $(VENV)
	rm -rf frontend/node_modules
	rm -rf frontend/dist
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -name "*.pyc" -delete 2>/dev/null || true
	@echo ">>> Limpeza concluída."
