FROM python:3.14-slim

WORKDIR /app

RUN pip install uv

COPY pyproject.toml uv.lock ./
COPY README.md ./
COPY src ./src

RUN uv sync --frozen

EXPOSE 5000

CMD ["uv", "run", "shop-api"]