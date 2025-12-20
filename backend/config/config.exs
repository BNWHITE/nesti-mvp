import Config

# General application configuration
config :nesti_api,
  ecto_repos: [NestiApi.Repo],
  generators: [timestamp_type: :utc_datetime]

# Configures the endpoint
config :nesti_api, NestiApiWeb.Endpoint,
  url: [host: "localhost"],
  adapter: Phoenix.Endpoint.Cowboy2Adapter,
  render_errors: [
    formats: [json: NestiApiWeb.ErrorJSON],
    layout: false
  ],
  pubsub_server: NestiApi.PubSub,
  live_view: [signing_salt: "default_signing_salt"]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

# Import environment specific config
import_config "#{config_env()}.exs"
