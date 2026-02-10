FROM python:3.11-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Prod image installs API/runtime dependencies once and runs without source mounts.
COPY requirements.txt requirements-ai.txt ./

ARG INSTALL_AI_DEPS=false
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --upgrade pip setuptools wheel \
    && pip install --no-cache-dir -r requirements.txt \
    && if [ "$INSTALL_AI_DEPS" = "true" ]; then pip install --no-cache-dir -r requirements-ai.txt; fi

COPY app ./app

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
