# runtime.exs - Configuration at runtime (for Render deployment)

import Config

# Helper function to get required env var
defmodule ConfigHelper do
  def get_env!(key) do
    System.get_env(key) ||
      raise """
      Environment variable #{key} is missing.
      Please set it in your Render dashboard.
      """
  end
  
  def get_env(key, default \\ nil) do
    System.get_env(key) || default
  end
end

if config_env() == :prod do
  # =============================================================================
  # Database Configuration (Supabase PostgreSQL)
  # =============================================================================
  
  database_url = ConfigHelper.get_env!("DATABASE_URL")
  
  config :nesti_api, NestiApi.Repo,
    url: database_url,
    pool_size: String.to_integer(ConfigHelper.get_env("POOL_SIZE", "10")),
    ssl: true,
    ssl_opts: [
      verify: :verify_none  # Supabase uses self-signed certs
    ],
    socket_options: [:inet6]

  # =============================================================================
  # Endpoint Configuration
  # =============================================================================
  
  host = ConfigHelper.get_env!("PHX_HOST")
  port = String.to_integer(ConfigHelper.get_env("PORT", "4000"))
  secret_key_base = ConfigHelper.get_env!("SECRET_KEY_BASE")
  
  config :nesti_api, NestiApiWeb.Endpoint,
    url: [host: host, port: 443, scheme: "https"],
    http: [
      ip: {0, 0, 0, 0, 0, 0, 0, 0},
      port: port
    ],
    secret_key_base: secret_key_base,
    server: true,
    # Security settings
    force_ssl: [rewrite_on: [:x_forwarded_proto]],
    cache_static_manifest: "priv/static/cache_manifest.json"

  # =============================================================================
  # Session/Cookie Configuration (HttpOnly, Secure)
  # =============================================================================
  
  config :nesti_api, NestiApiWeb.Endpoint,
    session_options: [
      store: :cookie,
      key: "_nesti_session",
      signing_salt: secret_key_base |> binary_part(0, 8),
      encryption_salt: secret_key_base |> binary_part(8, 8),
      http_only: true,
      secure: true,
      same_site: "Strict",
      max_age: 60 * 60 * 24 * 7  # 7 days
    ]

  # =============================================================================
  # Guardian JWT Configuration
  # =============================================================================
  
  guardian_secret = ConfigHelper.get_env!("GUARDIAN_SECRET")
  
  config :nesti_api, NestiApi.Guardian,
    issuer: "nesti_api",
    secret_key: guardian_secret,
    ttl: {15, :minutes},  # Short-lived access tokens
    token_ttl: %{
      "access" => {15, :minutes},
      "refresh" => {7, :days}
    }

  # =============================================================================
  # Encryption Configuration (AES-256-GCM)
  # =============================================================================
  
  encryption_key = ConfigHelper.get_env!("ENCRYPTION_KEY")
  
  # Validate encryption key length
  if String.length(encryption_key) < 32 do
    raise "ENCRYPTION_KEY must be at least 32 characters long"
  end
  
  config :nesti_api, NestiApi.Vault,
    ciphers: [
      default: {
        Cloak.Ciphers.AES.GCM,
        tag: "AES.GCM.V1",
        key: Base.decode64!(Base.encode64(encryption_key |> binary_part(0, 32))),
        iv_length: 12
      }
    ]

  # =============================================================================
  # OpenAI Configuration
  # =============================================================================
  
  openai_key = ConfigHelper.get_env("OPENAI_API_KEY")
  
  if openai_key do
    config :nesti_api, :openai,
      api_key: openai_key,
      model: "gpt-4o-mini",
      max_tokens: 500
  end

  # =============================================================================
  # CORS Configuration
  # =============================================================================
  
  allowed_origins = ConfigHelper.get_env("ALLOWED_ORIGINS", "https://nesti.app")
  
  config :cors_plug,
    origin: String.split(allowed_origins, ","),
    max_age: 86400,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    headers: ["Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"]

  # =============================================================================
  # Logger Configuration (Production)
  # =============================================================================
  
  config :logger, level: :info
  
  config :logger, :console,
    format: "$time $metadata[$level] $message\n",
    metadata: [:request_id, :user_id]
end
