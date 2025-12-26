# Nesti API Backend - Elixir/Phoenix
FROM elixir:1.17-alpine AS builder

# Install build dependencies
RUN apk add --no-cache build-base git npm

# Set environment
ENV MIX_ENV=prod

WORKDIR /app

# Install hex and rebar
RUN mix local.hex --force && mix local.rebar --force

# Copy dependency files
COPY mix.exs mix.lock ./
COPY config config

# Install dependencies
RUN mix deps.get --only prod
RUN mix deps.compile

# Copy application code
COPY lib lib
COPY priv priv

# Compile application
RUN mix compile

# Build release
RUN mix release

# --- Production Image ---
FROM alpine:3.19 AS runner

RUN apk add --no-cache libstdc++ openssl ncurses-libs libgcc

WORKDIR /app

# Copy release from builder
COPY --from=builder /app/_build/prod/rel/nesti_api ./

ENV HOME=/app
ENV PORT=8080
ENV PHX_HOST=nesti-api.fly.dev

EXPOSE 8080

CMD ["bin/nesti_api", "start"]

