import Config

# Production configuration for Nesti API
# Note: Database and secrets are configured via runtime.exs for security

# For production, don't forget to configure the url host
# to something meaningful, Phoenix uses this information
# when generating URLs.
config :nesti_api, NestiApiWeb.Endpoint,
  url: [host: System.get_env("PHX_HOST") || "example.com", port: 443, scheme: "https"],
  http: [
    ip: {0, 0, 0, 0, 0, 0, 0, 0},
    port: String.to_integer(System.get_env("PORT") || "4000")
  ],
  cache_static_manifest: "priv/static/cache_manifest.json",
  check_origin: false,
  server: true

# Database configuration - will be overridden by runtime.exs
config :nesti_api, NestiApi.Repo,
  ssl: true,
  ssl_opts: [verify: :verify_none],
  pool_size: String.to_integer(System.get_env("DATABASE_POOL_SIZE") || "10")

# Do not print debug messages in production
config :logger, level: :info

# Disable runtime configuration for compile-time values
config :phoenix, :logger, false

# CORS for production - allow all origins or configure specific ones
config :cors_plug,
  origin: ["*"],
  max_age: 86400,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]

# Runtime production configuration, including reading
# of environment variables, is done on config/runtime.exs.
