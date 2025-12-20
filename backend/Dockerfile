# =============================================================================
# Dockerfile pour Nesti API - Optimisé pour Render
# Multi-stage build pour une image minimale et sécurisée
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Build
# -----------------------------------------------------------------------------
FROM elixir:1.15-alpine AS builder

# Install build dependencies
RUN apk add --no-cache \
    build-base \
    git \
    nodejs \
    npm \
    python3

# Set build environment
ENV MIX_ENV=prod \
    LANG=C.UTF-8

WORKDIR /app

# Install hex + rebar
RUN mix local.hex --force && \
    mix local.rebar --force

# Copy dependency files first (better caching)
COPY mix.exs mix.lock ./
COPY config config

# Install and compile dependencies
RUN mix deps.get --only prod && \
    mix deps.compile

# Copy application source
COPY lib lib
COPY priv priv

# Compile application
RUN mix compile

# Build assets (if any)
RUN mix assets.deploy 2>/dev/null || true

# Generate digest for static files
RUN mix phx.digest

# Build release
RUN mix release

# -----------------------------------------------------------------------------
# Stage 2: Production Runtime
# -----------------------------------------------------------------------------
FROM alpine:3.18 AS runner

# Install runtime dependencies
RUN apk add --no-cache \
    libstdc++ \
    openssl \
    ncurses-libs \
    ca-certificates \
    curl

# Security: Create non-root user
RUN addgroup -g 1000 nesti && \
    adduser -u 1000 -G nesti -s /bin/sh -D nesti

WORKDIR /app

# Copy release from builder
COPY --from=builder --chown=nesti:nesti /app/_build/prod/rel/nesti_api ./

# Set environment
ENV MIX_ENV=prod \
    PORT=4000 \
    LANG=C.UTF-8 \
    REPLACE_OS_VARS=true \
    PHX_SERVER=true

# Switch to non-root user
USER nesti

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:4000/api/health || exit 1

# Start command
CMD ["bin/nesti_api", "start"]
