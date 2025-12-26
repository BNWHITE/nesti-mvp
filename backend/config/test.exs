import Config

# We don't run a server during test. If one is required,
# you can enable the server option below.
config :nesti_api, NestiApiWeb.Endpoint,
  http: [ip: {127, 0, 0, 1}, port: 4002],
  secret_key_base: "test_secret_key_base_at_least_64_bytes_long_for_testing_purposes_only",
  server: false

# Print only warnings and errors during test
config :logger, level: :warning

# Initialize plugs at runtime for faster test compilation
config :phoenix, :plug_init_mode, :runtime

# Configure your database
config :nesti_api, NestiApi.Repo,
  username: "postgres",
  password: "postgres",
  hostname: "localhost",
  database: "nesti_api_test#{System.get_env("MIX_TEST_PARTITION")}",
  pool: Ecto.Adapters.SQL.Sandbox,
  pool_size: System.schedulers_online() * 2

# Test Guardian config
config :nesti_api, NestiApi.Guardian,
  secret_key: "test_guardian_secret_key"

# Test Argon2 config - use lower cost for faster tests
config :argon2_elixir,
  t_cost: 1,
  m_cost: 8

# Test Cloak config
config :nesti_api, NestiApi.Vault,
  ciphers: [
    default: {Cloak.Ciphers.AES.GCM, tag: "AES.GCM.V1", key: Base.decode64!("6P3UPdJPEF7lRZcHa8FJQ6C6yBp9i8FQ6C6yBp9i8Fg=")}
  ]
