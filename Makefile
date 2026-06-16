PYTHON     = python3
VENV       = backend/venv
PIP        = $(VENV)/bin/pip
PY         = $(VENV)/bin/python

.PHONY: all help setup install install-backend install-frontend dev backend frontend test lint clean

setup:
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo ">>> .env criado a partir de .env.example."; \
		echo ">>> Preencha as variáveis antes de iniciar o projeto."; \
	else \
		echo ">>> .env já existe, nenhuma ação necessária."; \
	fi

#  Dependências

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

# Execução 

dev:
	@VIRTUAL_ENV=$(CURDIR)/$(VENV) PATH=$(CURDIR)/$(VENV)/bin:$$PATH npm run dev

backend:
	$(PY) -m backend.src.main

frontend:
	cd frontend && npm run dev

# Qualidade

test:
	$(PY) -m pytest backend/tests/ -v

lint:
	cd frontend && npm run lint

# Limpeza

clean:
	rm -rf $(VENV)
	rm -rf frontend/node_modules
	rm -rf frontend/dist
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -name "*.pyc" -delete 2>/dev/null || true
	@echo ">>> Limpeza concluída."
