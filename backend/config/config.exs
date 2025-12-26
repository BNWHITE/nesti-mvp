# This file is responsible for configuring your application
# and its dependencies with the aid of the Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.

# General application configuration
import Config

config :nesti_api,
  ecto_repos: [NestiApi.Repo],
  generators: [timestamp_type: :utc_datetime]

# Configures the endpoint
config :nesti_api, NestiApiWeb.Endpoint,
  url: [host: "localhost"],
  adapter: Bandit.PhoenixAdapter,
  render_errors: [
    formats: [json: NestiApiWeb.ErrorJSON],
    layout: false
  ],
  pubsub_server: NestiApi.PubSub,
  live_view: [signing_salt: System.get_env("SESSION_SIGNING_SALT")]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

# Guardian JWT Configuration
config :nesti_api, NestiApi.Guardian,
  issuer: "nesti_api",
  secret_key: System.get_env("GUARDIAN_SECRET_KEY"),
  token_ttl: %{
    "access" => {15, :minutes},
    "refresh" => {7, :days}
  }

# Cloak Encryption Configuration
config :nesti_api, NestiApi.Vault,
  ciphers: [
    default: {Cloak.Ciphers.AES.GCM, tag: "AES.GCM.V1", key: Base.decode64!(System.get_env("CLOAK_KEY") || "")}
  ]

# CORS Configuration
config :cors_plug,
  origin: [System.get_env("CORS_ALLOWED_ORIGINS") || "http://localhost:5000"],
  max_age: 86400,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]

# Hammer Rate Limiting Configuration
config :hammer,
  backend: {Hammer.Backend.ETS, [expiry_ms: 60_000 * 60 * 4, cleanup_interval_ms: 60_000 * 10]}

# Import environment specific config
import_config "#{config_env()}.exs"
