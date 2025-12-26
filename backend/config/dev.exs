import Config

# Configure your database - Use DATABASE_URL from .env if available
database_url = System.get_env("DATABASE_URL")

if database_url do
  config :nesti_api, NestiApi.Repo,
    url: database_url,
    pool_size: String.to_integer(System.get_env("DATABASE_POOL_SIZE") || "10"),
    stacktrace: true,
    show_sensitive_data_on_connection_error: true
else
  config :nesti_api, NestiApi.Repo,
    username: "postgres",
    password: "postgres",
    hostname: "localhost",
    database: "nesti_api_dev",
    stacktrace: true,
    show_sensitive_data_on_connection_error: true,
    pool_size: 10
end

# For development, we disable any cache and enable
# debugging and code reloading.
#
# The watchers configuration can be used to run external
# watchers to your application. For example, we can use it
# to bundle .js and .css sources.
config :nesti_api, NestiApiWeb.Endpoint,
  # Binding to loopback ipv4 address prevents access from other machines.
  # Change to `ip: {0, 0, 0, 0}` to allow access from other machines.
  http: [ip: {127, 0, 0, 1}, port: String.to_integer(System.get_env("PORT") || "4000")],
  check_origin: false,
  code_reloader: true,
  debug_errors: true,
  secret_key_base: System.get_env("SECRET_KEY_BASE") || "development_secret_key_base_at_least_64_bytes_long_change_in_production",
  watchers: []

# Do not include metadata nor timestamps in development logs
config :logger, :console, format: "[$level] $message\n"

# Set a higher stacktrace during development. Avoid configuring such
# in production as building large stacktraces may be expensive.
config :phoenix, :stacktrace_depth, 20

# Initialize plugs at runtime for faster development compilation
config :phoenix, :plug_init_mode, :runtime

# Disable swoosh api client as it is only required for production adapters.
# config :swoosh, :api_client, false

# Development Guardian config
guardian_secret = System.get_env("GUARDIAN_SECRET_KEY") || "development_guardian_secret_key_change_in_production"
config :nesti_api, NestiApi.Guardian,
  secret_key: guardian_secret

# Development Cloak config
cloak_key = System.get_env("CLOAK_KEY") || "6P3UPdJPEF7lRZcHa8FJQ6C6yBp9i8FQ6C6yBp9i8Fg="
config :nesti_api, NestiApi.Vault,
  ciphers: [
    default: {Cloak.Ciphers.AES.GCM, tag: "AES.GCM.V1", key: Base.decode64!(cloak_key)}
  ]
